using Azure;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Application.Helper;
using HRMS.Shared.Application.Modules.MediaFeature;
using HRMS.Shared.Application.Services;
using HRMS.Shared.Domain.Enum;
using HotChocolate.Types;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.IO.Compression;
using System.Text.RegularExpressions;

namespace HRMS.Shared.Infrastructure.AzureStorage
{
    public class AzureStorage : IAzureStorage
    {
        private readonly BlobStorage _blobStorage;
        private readonly ILogger<AzureStorage> _logger;

        public AzureStorage(IConfiguration configuration, ILogger<AzureStorage> logger)
        {
            _blobStorage = configuration.ExtractKey<BlobStorage>(Key.BlobStorage) ?? throw new ArgumentNullException("Connection string not found.");
            _logger = logger;
        }

        public async Task<bool> BlobExistsAsync(string blobUrl)
        {
            var uri = new Uri(blobUrl);
            // Extract container and blob name from the URL path Path format: /<container>/<blob-name>
            var segments = uri.AbsolutePath.TrimStart('/').Split('/', 2);
            var containerName = segments[0];
            var blobName = segments.Length > 1 ? segments[1] : throw new ArgumentException("URL does not contain a blob path.", nameof(blobUrl));
            var blobClient = new BlobClient(_blobStorage.ConnectionString, containerName, blobName);
            return await blobClient.ExistsAsync();
        }

        public void CheckValidFileName(string folderName, string fileName, string? filePath = null)
        {
            // Pattern to match unsafe blob characters
            var unsafePattern = new Regex(@"[#\x00]");
            try
            {
                foreach (var segment in new[] { folderName, fileName, filePath })
                {
                    if (string.IsNullOrEmpty(segment)) continue;
                    var decoded = Uri.UnescapeDataString(segment);
                    if (decoded.Contains("..") || decoded.Contains('\0'))
                        throw new ArgumentException($"'{segment}' contains an invalid path-traversal sequence.");
                }

                ValidateName(folderName, "Folder name", unsafePattern);
                ValidateName(fileName, "File name", unsafePattern);
                ValidateName(filePath, "File path", unsafePattern);

                // Additional check: filename cannot end with period or space
                if (!string.IsNullOrEmpty(fileName) && (fileName.EndsWith(".") || fileName.EndsWith(" ")))
                {
                    throw new Exception("File name cannot end with a period or space");
                }
            }
            catch
            {
                if (!string.IsNullOrEmpty(filePath) && File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
                throw;
            }
        }

        public async Task CopyAsync(BlobContainerNames sourceContainerName, BlobContainerNames targetContainerName, string sourceFilePath, string targetFilePath)
        {
            BlobServiceClient serviceClient = new BlobServiceClient(_blobStorage.ConnectionString);

            BlobContainerClient sourceContainerClient = serviceClient.GetBlobContainerClient($"{sourceContainerName}".ToLower());
            await sourceContainerClient.CreateIfNotExistsAsync(PublicAccessType.None);

            BlobContainerClient targetContainerClient = serviceClient.GetBlobContainerClient($"{targetContainerName}".ToLower());
            await targetContainerClient.CreateIfNotExistsAsync(PublicAccessType.None);

            BlobClient sourceBlobClient = sourceContainerClient.GetBlobClient(sourceFilePath);
            BlobClient targetBlobClient = targetContainerClient.GetBlobClient(targetFilePath);
            if (!await sourceBlobClient.ExistsAsync())
            {
                _logger.LogWarning("Source blob '{SourceFilePath}' does not exist in container '{SourceContainerName}'.", sourceFilePath, sourceContainerName);
                return; // Exit the method gracefully
            }

            _logger.LogInformation("Sending copy blob request from '{SourceFilePath}' to '{TargetFilePath}'.", sourceFilePath, targetFilePath);
            var result = await targetBlobClient.StartCopyFromUriAsync(sourceBlobClient.Uri);
            _logger.LogInformation("Copy blob request sent.");

            var timeout = TimeSpan.FromMinutes(5);
            var deadline = DateTimeOffset.UtcNow.Add(timeout);
            bool isBlobCopiedSuccessfully = false;
            while (DateTimeOffset.UtcNow < deadline)
            {
                var targetBlobProperties = await targetBlobClient.GetPropertiesAsync();
                _logger.LogInformation("Current copy status = {CopyStatus}", targetBlobProperties.Value.CopyStatus);

                if (targetBlobProperties.Value.CopyStatus == CopyStatus.Pending)
                {
                    await Task.Delay(1000);
                }
                else
                {
                    isBlobCopiedSuccessfully = targetBlobProperties.Value.CopyStatus == CopyStatus.Success;
                    break;
                }
            }
            ;

            if (!isBlobCopiedSuccessfully)
            {
                throw new TimeoutException($"Blob copy from '{sourceFilePath}' to '{targetFilePath}' did not complete within {timeout.TotalMinutes} minutes.");
            }
        }

        public async Task<BlobResponseDto> DeleteAsync(BlobContainerNames storageContainerName, string folderName, string fileName)
        {
            // Create a new response object
            BlobResponseDto response = new();

            // Get a reference to the container
            BlobContainerClient container = new BlobContainerClient(_blobStorage.ConnectionString, $"{storageContainerName}".ToLower());

            try
            {
                // Get a reference to the blob to delete
                BlobClient client = container.GetBlobClient($"{folderName}/{fileName}");

                // Attempt to delete the blob
                var deleteResult = await client.DeleteIfExistsAsync();

                if (deleteResult)
                {
                    response.Status = $"File {fileName} deleted successfully.";
                    response.Error = false;
                }
                else
                {
                    response.Status = $"File {fileName} not found in the container.";
                    response.Error = true;
                }
            }
            catch (RequestFailedException ex)
            {
                _logger.LogError($"Unhandled Exception. ID: {ex.StackTrace} - Message: {ex.Message}");
                response.Status = $"An unexpected error occurred while processing the storage request.";
                response.Error = true;
            }

            return response;
        }

        public async Task<DownloadMediaResponse> DownloadAsync(BlobContainerNames storageContainerName, string blobFilename)
        {
            DownloadMediaResponse response = new();
            if (string.IsNullOrEmpty(blobFilename))
                return response;

            // Get a reference to a container named in appsettings.json
            BlobContainerClient client = new BlobContainerClient(_blobStorage.ConnectionString, $"{storageContainerName}".ToLower());

            try
            {
                // Get a reference to the blob uploaded earlier from the API in the container from
                // configuration settings
                BlobClient blobClient = client.GetBlobClient(blobFilename);

                // Check if the file exists in the container
                if (await blobClient.ExistsAsync())
                {
                    // Generate a SAS token for read access to the blob
                    var sasToken = GenerateSasToken(blobClient, 60);

                    // Construct the full URL with the SAS token
                    var blobUrlWithSas = $"{blobClient.Uri}?{sasToken}&c={DateTime.Now.Ticks}";

                    // Download the blob content using the SAS URL
                    var downloadResult = await blobClient.DownloadAsync();

                    // Check if download was successful
                    if (downloadResult != null && downloadResult.Value != null)
                    {
                        // Add data to variables in order to return a BlobDto
                        var blobContent = downloadResult.Value.Content;
                        var contentType = downloadResult.Value.Details.ContentType;
                        var contentLength = downloadResult.Value.Details.ContentLength;

                        // Set response properties
                        response.Content = blobContent;
                        response.FileName = blobFilename;
                        response.ContentType = contentType;
                        response.Uri = blobUrlWithSas; // Use the SAS URL here
                        response.FileSize = contentLength;
                        response.Error = false;
                        response.Status = $"File {blobFilename} downloaded successfully.";
                    }
                    else
                    {
                        // Handle case where download result is null or details are null
                        response.Error = true;
                        response.Status = $"Failed to download file {blobFilename}. Download result or details are null.";
                    }
                }
                else
                {
                    // Handle case where the blob does not exist
                    response.Error = true;
                    response.Status = $"File {blobFilename} does not exist in container {storageContainerName}.";
                }
            }
            catch (RequestFailedException ex) when (ex.ErrorCode == BlobErrorCode.BlobNotFound)
            {
                // Handle specific case where blob is not found
                _logger.LogError($"File {blobFilename} was not found. Error: {ex.Message}");
                response.Error = true;
                response.Status = $"File {blobFilename} was not found.";
            }
            catch (RequestFailedException ex)
            {
                // Handle other request failures
                _logger.LogError($"Failed to download file {blobFilename}. Error: {ex.Message}");
                response.Error = true;
                response.Status = $"Failed to download file {blobFilename}.";
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                _logger.LogError($"Unexpected error downloading file {blobFilename}. Error: {ex.Message}");
                response.Error = true;
                response.Status = $"Unexpected error downloading file {blobFilename}.";
            }

            // File does not exist, return null and handle that in requesting method
            return response;
        }

        public async Task<DownloadMediaResponse> DownloadBlobsAndCreateZipAsync(BlobContainerNames storageContainerName, List<string> blobFilenames, string zipBlobFilename)
        {
            var response = new DownloadMediaResponse();
            var client = new BlobContainerClient(_blobStorage.ConnectionString, $"{storageContainerName}".ToLower());

            // Create a memory stream to store the zip file in memory
            using (var zipStream = new MemoryStream())
            {
                using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
                {
                    foreach (var blobFilename in blobFilenames)
                    {
                        var downloadResponse = await DownloadAsync(storageContainerName, blobFilename);
                        if (downloadResponse.Error || downloadResponse.Content == null)
                        {
                            response.Error = true;
                            response.Status = $"Failed to download one or more files. {downloadResponse.Status}";
                            return response;
                        }
                        //to handle duplicate zip scenario (greptile feedback )
                        var entry = archive.CreateEntry(blobFilename);

                        using (var entryStream = entry.Open())
                        {
                            await downloadResponse.Content.CopyToAsync(entryStream);
                        }
                    }

                    // Finish writing the zip archive to the stream
                    archive.Dispose();
                }

                // Upload the zip file to Azure Blob Storage
                zipStream.Position = 0;
                BlobClient zipBlobClient = client.GetBlobClient(zipBlobFilename);
                await zipBlobClient.UploadAsync(zipStream, new BlobHttpHeaders { ContentType = "application/zip" });

                // Generate the URI for the zip file
                response.Uri = zipBlobClient.Uri.AbsoluteUri;
                response.FileName = zipBlobFilename;
                response.ContentType = "application/zip";
                response.Content = await zipBlobClient.OpenReadAsync();
                response.Error = false;
                response.Status = "Files downloaded, zipped, and uploaded successfully.";

                return response;
            }
        }

        public async Task<DownloadMediaV1Response> DownloadBlobsAndCreateZipV1Async(BlobContainerNames storageContainerName, List<string> blobFilenames, string zipBlobFilename)
        {
            var response = new DownloadMediaV1Response();
            var client = new BlobContainerClient(_blobStorage.ConnectionString, $"{storageContainerName}".ToLower());

            // Create a memory stream to store the zip file in memory
            using (var zipStream = new MemoryStream())
            {
                using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
                {
                    foreach (var blobFilename in blobFilenames)
                    {
                        var downloadResponse = await DownloadAsync(storageContainerName, blobFilename);
                        if (downloadResponse.Error || downloadResponse.Content == null)
                        {
                            response.Error = true;
                            response.Status = $"Failed to download one or more files. {downloadResponse.Status}";
                            return response;
                        }

                        var entry = archive.CreateEntry(blobFilename.Replace('\\', '/'));

                        using (var entryStream = entry.Open())
                        {
                            await downloadResponse.Content.CopyToAsync(entryStream);
                        }
                    }

                    // Finish writing the zip archive to the stream
                    archive.Dispose();
                }

                // Upload the zip file to Azure Blob Storage
                zipStream.Position = 0;
                BlobClient zipBlobClient = client.GetBlobClient(zipBlobFilename);
                await zipBlobClient.UploadAsync(zipStream, new BlobHttpHeaders { ContentType = "application/zip" });

                var content = string.Empty;
                await using (var stream = await zipBlobClient.OpenReadAsync())
                using (var memoryStream = new MemoryStream())
                {
                    await stream.CopyToAsync(memoryStream);
                    content = Convert.ToBase64String(memoryStream.ToArray());
                }

                // Generate the URI for the zip file
                response.Uri = zipBlobClient.Uri.AbsoluteUri;
                response.FileName = zipBlobFilename;
                response.ContentType = "application/zip";
                response.Content = content;
                response.Error = false;
                response.Status = "Files downloaded, zipped, and uploaded successfully.";

                return response;
            }
        }

        public async Task<DownloadMediaV1Response> DownloadBlobsAndCreateZipV1Async(List<string> storageContainerNames, List<string> blobFilenames, string zipBlobFilename)
        {
            var response = new DownloadMediaV1Response();
            var client = new BlobContainerClient(_blobStorage.ConnectionString, BlobContainerNames.download.ToString());

            // Create a memory stream to store the zip file in memory
            using (var zipStream = new MemoryStream())
            {
                using (var archive = new ZipArchive(zipStream, ZipArchiveMode.Create, true))
                {
                    for (int i = 0; i < storageContainerNames.Count; i++)
                    {
                        if (!Enum.TryParse<BlobContainerNames>(storageContainerNames[i], ignoreCase: true, out var containerName))
                        {
                            continue;
                        }

                        var downloadResponse = await DownloadAsync(containerName, blobFilenames[i]);
                        if (downloadResponse.Error || downloadResponse.Content == null)
                        {
                            response.Error = true;
                            response.Status = $"Failed to download one or more files. {downloadResponse.Status}";
                            return response;
                        }

                        var entry = archive.CreateEntry(blobFilenames[i].Replace('\\', '/'));

                        using (var entryStream = entry.Open())
                        {
                            await downloadResponse.Content.CopyToAsync(entryStream);
                        }
                    }

                    // Finish writing the zip archive to the stream
                    archive.Dispose();
                }

                // Upload the zip file to Azure Blob Storage
                zipStream.Position = 0;
                BlobClient zipBlobClient = client.GetBlobClient(zipBlobFilename);
                await zipBlobClient.UploadAsync(zipStream, new BlobHttpHeaders { ContentType = "application/zip" });

                var content = string.Empty;
                await using (var stream = await zipBlobClient.OpenReadAsync())
                using (var memoryStream = new MemoryStream())
                {
                    await stream.CopyToAsync(memoryStream);
                    content = Convert.ToBase64String(memoryStream.ToArray());
                }

                // Generate the URI for the zip file
                response.Uri = zipBlobClient.Uri.AbsoluteUri;
                response.FileName = zipBlobFilename;
                response.ContentType = "application/zip";
                response.Content = content;
                response.Error = false;
                response.Status = "Files downloaded, zipped, and uploaded successfully.";

                return response;
            }
        }

        public async Task<DownloadMediaV1Response> DownloadV1Async(BlobContainerNames storageContainerName, string blobFilename)
        {
            DownloadMediaV1Response response = new();
            if (string.IsNullOrEmpty(blobFilename))
                return response;

            // Get a reference to a container named in appsettings.json
            BlobContainerClient client = new BlobContainerClient(_blobStorage.ConnectionString, $"{storageContainerName}".ToLower());

            try
            {
                // Get a reference to the blob uploaded earlier from the API in the container from
                // configuration settings
                BlobClient blobClient = client.GetBlobClient(blobFilename);

                // Check if the file exists in the container
                if (await blobClient.ExistsAsync())
                {
                    BlobProperties properties = await blobClient.GetPropertiesAsync();

                    // Set Content-Disposition to "attachment" to force download
                    BlobHttpHeaders headers = new BlobHttpHeaders
                    {
                        ContentType = properties.ContentType,
                        ContentDisposition = "attachment"
                    };

                    // Apply the updated headers
                    await blobClient.SetHttpHeadersAsync(headers);

                    // Generate a SAS token for read access to the blob
                    var sasToken = GenerateSasToken(blobClient, 60);

                    // Construct the full URL with the SAS token
                    var blobUrlWithSas = $"{blobClient.Uri}?{sasToken}&c={DateTime.Now.Ticks}";

                    // Download the blob content using the SAS URL
                    var downloadResult = await blobClient.DownloadAsync();

                    // Check if download was successful
                    if (downloadResult != null && downloadResult.Value != null)
                    {
                        // Add data to variables in order to return a BlobDto
                        await using var blobContent = downloadResult.Value.Content;
                        var contentType = downloadResult.Value.Details.ContentType;
                        var contentLength = downloadResult.Value.Details.ContentLength;

                        var content = string.Empty;
                        using (var memoryStream = new MemoryStream())
                        {
                            await blobContent.CopyToAsync(memoryStream);
                            content = Convert.ToBase64String(memoryStream.ToArray());
                        }

                        // Set response properties
                        response.Content = content;
                        response.FileName = blobFilename;
                        response.ContentType = contentType;
                        response.Uri = blobUrlWithSas; // Use the SAS URL here
                        response.FileSize = contentLength;
                        response.Error = false;
                        response.Status = $"File {blobFilename} downloaded successfully.";
                    }
                    else
                    {
                        // Handle case where download result is null or details are null
                        response.Error = true;
                        response.Status = $"Failed to download file {blobFilename}. Download result or details are null.";
                    }
                }
                else
                {
                    // Handle case where the blob does not exist
                    response.Error = true;
                    response.Status = $"File {blobFilename} does not exist in container {storageContainerName}.";
                }
            }
            catch (RequestFailedException ex) when (ex.ErrorCode == BlobErrorCode.BlobNotFound)
            {
                // Handle specific case where blob is not found
                _logger.LogError($"File {blobFilename} was not found. Error: {ex.Message}");
                response.Error = true;
                response.Status = $"File {blobFilename} was not found.";
            }
            catch (RequestFailedException ex)
            {
                // Handle other request failures
                _logger.LogError($"Failed to download file {blobFilename}. Error: {ex.Message}");
                response.Error = true;
                response.Status = $"Failed to download file {blobFilename}.";
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                _logger.LogError($"Unexpected error downloading file {blobFilename}. Error: {ex.Message}");
                response.Error = true;
                response.Status = $"Unexpected error downloading file {blobFilename}.";
            }

            // File does not exist, return null and handle that in requesting method
            return response;
        }

        public async Task<string> GenerateUploadSasUrl(BlobContainerNames containerName, string blobPath, string contentType)
        {
            // Get a reference to a container named in appsettings.json and then create it
            BlobContainerClient containerClient = new BlobContainerClient(_blobStorage.ConnectionString, $"{containerName}".ToLower());

            // Create the container if it does not exist
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);

            var blobClient = containerClient.GetBlobClient(blobPath);
            var uploadPermissions = BlobSasPermissions.Write | BlobSasPermissions.Create;

            return $"{blobClient.Uri}?{GenerateSasToken(blobClient, 15, uploadPermissions)}";
        }

        public async Task<HashSet<string>> GetBlobNamesAsync(BlobContainerNames containerName, string folderPath)
        {
            var blobNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var blobServiceClient = new BlobServiceClient(_blobStorage.ConnectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName.ToString());

            // Ensure folder ends with /
            if (!string.IsNullOrWhiteSpace(folderPath) && !folderPath.EndsWith("/"))
                folderPath += "/";

            await foreach (BlobItem blob in containerClient.GetBlobsAsync(BlobTraits.None, BlobStates.None, prefix: folderPath, cancellationToken: CancellationToken.None))
            {
                blobNames.Add(blob.Name);
            }

            return blobNames;
        }

        public async Task<string> GetFileAsBase64Async(BlobContainerNames storageContainerName, string blobFilePath)
        {
            // Initialize BlobContainerClient using the connection string and container name
            var containerClient = new BlobContainerClient(_blobStorage.ConnectionString, $"{storageContainerName}".ToLower());

            // Get the blob client for the specific blob file
            var blobClient = containerClient.GetBlobClient(blobFilePath);

            // Check if the blob exists, and throw an exception if not
            if (!await blobClient.ExistsAsync())
            {
                throw new FileNotFoundException($"Blob {blobFilePath} not found in container {storageContainerName}");
            }

            // Create a memory stream to store the downloaded blob data
            using (var memoryStream = new MemoryStream())
            {
                // Download the blob to the memory stream
                await blobClient.DownloadToAsync(memoryStream);

                // Convert the memory stream to a base64 string
                return Convert.ToBase64String(memoryStream.ToArray());
            }
        }

        public async Task<bool> IsExistsAsync(BlobContainerNames containerName, string blobPath)
        {
            BlobContainerClient containerClient = new BlobContainerClient(_blobStorage.ConnectionString, $"{containerName}".ToLower());
            var blobClient = containerClient.GetBlobClient(blobPath);

            return await blobClient.ExistsAsync();
        }

        public async Task MigrateFolderAsync(BlobContainerNames sourceContainer, string sourceFolder, BlobContainerNames targetContainer, string targetFolder)
        {
            BlobServiceClient _blobServiceClient = new BlobServiceClient(_blobStorage.ConnectionString);
            var sourceContainerClient = _blobServiceClient.GetBlobContainerClient(sourceContainer.ToString());
            var targetContainerClient = _blobServiceClient.GetBlobContainerClient(targetContainer.ToString());

            // Ensure target container exists
            await targetContainerClient.CreateIfNotExistsAsync();

            // List all blobs inside source folder
            await foreach (var blobItem in sourceContainerClient.GetBlobsAsync(BlobTraits.None, BlobStates.None, prefix: $"{sourceFolder}/", cancellationToken: CancellationToken.None))
            {
                var sourceBlobClient = sourceContainerClient.GetBlobClient(blobItem.Name);

                // Construct the target blob name
                //!!!!! Greptile suggestions
                //string targetBlobName = blobItem.Name.Replace(sourceFolder, targetFolder);
                //var targetBlobClient = targetContainerClient.GetBlobClient(targetBlobName);

                //// Copy asynchronously
                //await targetBlobClient.StartCopyFromUriAsync(sourceBlobClient.Uri);

                string targetBlobName = targetFolder + blobItem.Name.Substring(sourceFolder.Length);
                var targetBlobClient = targetContainerClient.GetBlobClient(targetBlobName);
                // Copy and wait for completion before proceeding
                var copyOperation = await targetBlobClient.StartCopyFromUriAsync(sourceBlobClient.Uri);
                await copyOperation.WaitForCompletionAsync();
            }
        }

        public async Task SaveStreamAsFile(string filePath, Stream inputStream)
        {
            if (inputStream == null) return;

            using (var outputFileStream = new FileStream(filePath, FileMode.Create))
            {
                inputStream.Position = 0;
                await inputStream.CopyToAsync(outputFileStream);
            }
        }

        public async Task<BlobResponseDto> UploadAsync(BlobContainerNames storageContainerName, string folderName, string fileName, string filePath, string contentType)
        {
            CheckValidFileName(folderName, fileName, filePath);
            // Create new upload response object that we can return to the requesting method
            BlobResponseDto response = new();

            // Get a reference to a container named in appsettings.json and then create it
            BlobContainerClient container = new BlobContainerClient(_blobStorage.ConnectionString, $"{storageContainerName}".ToLower());

            // Create the container if it does not exist
            await container.CreateIfNotExistsAsync(PublicAccessType.None);

            try
            {
                // Get a reference to the blob just uploaded from the API in a container from
                // configuration settings
                BlobClient client = container.GetBlobClient($"{folderName}/{fileName}");

                var fileInfo = new FileInfo(filePath);
                // Open a stream for the file we want to upload

                await using (FileStream data = File.OpenRead(filePath))
                {
                    // Upload the file async
                    await client.UploadAsync(data, new BlobHttpHeaders { ContentType = contentType });
                }

                // Everything is OK and file got uploaded
                response.Status = $"File {filePath} Uploaded Successfully";
                response.Error = false;
                response.Blob.Uri = client.Uri.AbsoluteUri;
                response.Blob.Name = client.Name;
                response.Blob.Path = client.Name;
                response.Blob.ContentType = contentType;
                response.Blob.Size = fileInfo.Length;
            }
            // If the file already exists, we catch the exception and do not upload it
            catch (RequestFailedException ex)
                when (ex.ErrorCode == BlobErrorCode.BlobAlreadyExists)
            {
                _logger.LogError($"File with name {filePath} already exists in container. Set another name to store the file in the container: '{storageContainerName}.'");
                response.Status = $"File with name {filePath} already exists. Please use another name to store your file.";
                response.Error = true;
                return response;
            }
            // If we get an unexpected error, we catch it here and return the error message
            catch (RequestFailedException ex)
            {
                // Log error to console and create a new response we can return to the requesting method
                _logger.LogError($"Unhandled Exception. ID: {ex.StackTrace} - Message: {ex.Message}");
                response.Status = $"An unexpected error occurred while processing the storage request.";
                response.Error = true;
                return response;
            }

            // Delete local file after successful upload
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            // Return the BlobUploadResponse object
            return response;
        }

        public async Task<BlobResponseDto> UploadAsync(BlobContainerNames storageContainerName, string folderName, string fileName, IFormFile blob)
        {
            CheckValidFileName(folderName, fileName);
            // Create new upload response object that we can return to the requesting method
            BlobResponseDto response = new();

            // Get a reference to a container named in appsettings.json and then create it
            BlobContainerClient container = new BlobContainerClient(_blobStorage.ConnectionString, $"{storageContainerName}".ToLower());

            // Create the container if it does not exist
            await container.CreateIfNotExistsAsync(PublicAccessType.None);

            try
            {
                // Get a reference to the blob just uploaded from the API in a container from
                // configuration settings
                BlobClient client = container.GetBlobClient($"{folderName}/{fileName}");

                // Open a stream for the file we want to upload
                if (blob != null)
                {
                    await using (Stream? data = blob.OpenReadStream())
                    {
                        if (data.Position != 0)
                            data.Position = 0;
                        // Upload the file async
                        await client.UploadAsync(data, new BlobHttpHeaders { ContentType = blob.ContentType });
                    }

                    // Everything is OK and file got uploaded
                    response.Status = $"File {blob.FileName} Uploaded Successfully";
                    response.Error = false;
                    response.Blob.Uri = client.Uri.AbsoluteUri;
                    response.Blob.Name = blob.FileName;
                    response.Blob.Path = client.Name;
                    response.Blob.ContentType = blob.ContentType;
                    response.Blob.Size = blob.Length;
                }
            }
            // If the file already exists, we catch the exception and do not upload it
            catch (RequestFailedException ex)
                when (ex.ErrorCode == BlobErrorCode.BlobAlreadyExists)
            {
                _logger.LogError($"File with name {blob.FileName} already exists in container. Set another name to store the file in the container: '{storageContainerName}.'");
                response.Status = $"File with name {blob.FileName} already exists. Please use another name to store your file.";
                response.Error = true;
                return response;
            }
            // If we get an unexpected error, we catch it here and return the error message
            catch (RequestFailedException ex)
            {
                // Log error to console and create a new response we can return to the requesting method
                _logger.LogError($"Unhandled Exception. ID: {ex.StackTrace} - Message: {ex.Message}");
                response.Status = $"An unexpected error occurred while processing the storage request.";
                response.Error = true;
                return response;
            }

            // Return the BlobUploadResponse object
            return response;
        }

        public async Task<BlobResponseDto> UploadAsync(BlobContainerNames storageContainerName, string folderName, string fileName, IFile blob)
        {
            CheckValidFileName(folderName, fileName);
            // Create new upload response object that we can return to the requesting method
            BlobResponseDto response = new();

            // Get a reference to a container named in appsettings.json and then create it
            BlobContainerClient container = new BlobContainerClient(_blobStorage.ConnectionString, $"{storageContainerName}".ToLower());

            // Create the container if it does not exist
            await container.CreateIfNotExistsAsync(PublicAccessType.None);

            try
            {
                // Get a reference to the blob just uploaded from the API in a container from
                // configuration settings
                BlobClient client = container.GetBlobClient($"{folderName}/{fileName}");

                // Open a stream for the file we want to upload
                if (blob != null)
                {
                    await using (Stream? data = blob.OpenReadStream())
                    {
                        if (data.Position != 0)
                            data.Position = 0;
                        // Upload the file async
                        await client.UploadAsync(data, new BlobHttpHeaders { ContentType = blob.ContentType });
                    }

                    // Everything is OK and file got uploaded
                    response.Status = $"File {blob.Name} Uploaded Successfully";
                    response.Error = false;
                    response.Blob.Uri = client.Uri.AbsoluteUri;
                    response.Blob.Name = blob.Name;
                    response.Blob.Path = client.Name;
                    response.Blob.ContentType = blob.ContentType;
                    response.Blob.Size = blob.Length;
                }
            }
            // If the file already exists, we catch the exception and do not upload it
            catch (RequestFailedException ex)
                when (ex.ErrorCode == BlobErrorCode.BlobAlreadyExists)
            {
                _logger.LogError($"File with name {blob.Name} already exists in container. Set another name to store the file in the container: '{storageContainerName}.'");
                response.Status = $"File with name {blob.Name} already exists. Please use another name to store your file.";
                response.Error = true;
                return response;
            }
            // If we get an unexpected error, we catch it here and return the error message
            catch (RequestFailedException ex)
            {
                // Log error to console and create a new response we can return to the requesting method
                _logger.LogError($"Unhandled Exception. ID: {ex.StackTrace} - Message: {ex.Message}");
                response.Status = $"An unexpected error occurred while processing the storage request.";
                response.Error = true;
                return response;
            }

            // Return the BlobUploadResponse object
            return response;
        }

        public async Task<BlobResponseDto> UploadAsync(BlobContainerNames storageContainerName, string folderName, string fileName, byte[] fileBytes, string contentType)
        {
            CheckValidFileName(folderName, fileName);

            BlobResponseDto response = new();

            // Get a reference to the container
            BlobContainerClient container = new BlobContainerClient(
                _blobStorage.ConnectionString,
                storageContainerName.ToString().ToLower());

            await container.CreateIfNotExistsAsync(PublicAccessType.None);

            try
            {
                // Full path → folder/subfolder/filename
                BlobClient client = container.GetBlobClient($"{folderName}/{fileName}");

                await using (var stream = new MemoryStream(fileBytes))
                {
                    if (stream.Position != 0)
                        stream.Position = 0;

                    // ✅ Correct: use overload with only stream + overwrite
                    await client.UploadAsync(stream, overwrite: true);
                }

                // Set the content type after upload
                await client.SetHttpHeadersAsync(new BlobHttpHeaders
                {
                    ContentType = contentType
                });

                // Prepare response
                response.Status = $"File {fileName} uploaded/replaced successfully";
                response.Error = false;
                response.Blob.Uri = client.Uri.AbsoluteUri;
                response.Blob.Name = fileName;
                response.Blob.Path = client.Name;
                response.Blob.ContentType = contentType;
                response.Blob.Size = fileBytes.Length;
            }
            catch (RequestFailedException ex)
            {
                _logger.LogError($"Upload failed: {ex.Message}");
                response.Status = $"Error: {ex.Message}";
                response.Error = true;
            }

            return response;
        }

        private string GenerateSasToken(BlobClient blobClient, int minute, BlobSasPermissions permissions = BlobSasPermissions.Read)
        {
            // Set the expiration time for the SAS token (e.g., 1 hour)
            DateTimeOffset expiryTime = DateTimeOffset.UtcNow.AddMinutes(minute);

            // Define the permissions for the SAS token (read access)
            BlobSasBuilder sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = blobClient.BlobContainerName,
                BlobName = blobClient.Name,
                Resource = "b", // "b" for blob
                ExpiresOn = expiryTime
            };

            // Set read permissions
            sasBuilder.SetPermissions(permissions);

            // Generate the SAS token using the storage account key (replace with your storage
            // account credentials)
            var storageAccountKey = _blobStorage.AccountKey;
            var storageCredential = new StorageSharedKeyCredential(_blobStorage.AccountName, storageAccountKey);
            string sasToken = sasBuilder.ToSasQueryParameters(storageCredential).ToString();

            return sasToken;
        }

        private void ValidateName(string? value, string fieldName, Regex unsafePattern)
        {
            if (string.IsNullOrEmpty(value)) return;

            var match = unsafePattern.Match(value);
            if (match.Success)
            {
                throw new Exception($"{fieldName} contains invalid character: '{match.Value}'");
            }
        }
    }
}
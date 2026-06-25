using AutoMapper;
using HRMS.Core.Telemetry.Exceptions;
using HRMS.Shared.Application.Constants;
using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Application.Extensions;
using HRMS.Shared.Application.Helper;
using HRMS.Shared.Application.Services;
using HRMS.Shared.Domain.Enum;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Globalization;
using Path = System.IO.Path;

namespace HRMS.Shared.Application.Modules.MediaFeature
{
    public sealed class DownloadMediaHandler : IRequestHandler<DownloadMediaRequest, BaseResponse<DownloadMediaResponse>>
    {
        private readonly IAzureStorage _azureStorage;
        private readonly string _blobUrl;
        private readonly IConfiguration _configuration;

        public DownloadMediaHandler(IAzureStorage azureStorage, IConfiguration configuration)
        {
            _azureStorage = azureStorage;
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _blobUrl = configuration.ExtractKey<BlobStorage>(Key.BlobStorage).Url ?? string.Empty;
        }

        public async Task<BaseResponse<DownloadMediaResponse>> Handle(DownloadMediaRequest downloadMediaRequest, CancellationToken cancellationToken)
        {
            if (downloadMediaRequest == null || downloadMediaRequest.RequestParam == null || string.IsNullOrEmpty(downloadMediaRequest.RequestParam.FilePath))
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var downloadMediaDto = downloadMediaRequest.RequestParam;
            var response = new BaseResponse<DownloadMediaResponse>();
            var filePath = $"{downloadMediaDto.FilePath}";
            if (!string.IsNullOrEmpty(downloadMediaDto.SubFolderName))
                filePath = string.Format("{0}/{1}", downloadMediaDto.SubFolderName, filePath);

            if (!string.IsNullOrEmpty(downloadMediaDto.FolderName))
                filePath = string.Format("{0}/{1}", downloadMediaDto.FolderName, filePath);

            response.Data = await _azureStorage.DownloadAsync(downloadMediaDto.ContainerName, filePath);
            if (response.Data.Error && !string.IsNullOrEmpty(response.Data.Status))
                throw new BadRequestException(response.Data.Status);

            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK;
            response.Message = response.Data.Status;

            return response;
        }
    }

    public sealed class DownloadMediaV1Handler : IRequestHandler<DownloadMediaV1Request, BaseResponse<DownloadMediaV1Response>>
    {
        private readonly IAzureStorage _azureStorage;
        private readonly string _blobUrl;
        private readonly IConfiguration _configuration;

        public DownloadMediaV1Handler(IAzureStorage azureStorage, IConfiguration configuration)
        {
            _azureStorage = azureStorage;
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _blobUrl = configuration.ExtractKey<BlobStorage>(Key.BlobStorage).Url ?? string.Empty;
        }

        public async Task<BaseResponse<DownloadMediaV1Response>> Handle(DownloadMediaV1Request downloadMediaRequest, CancellationToken cancellationToken)
        {
            if (downloadMediaRequest == null || downloadMediaRequest.RequestParam == null || string.IsNullOrEmpty(downloadMediaRequest.RequestParam.FilePath))
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var downloadMediaDto = downloadMediaRequest.RequestParam;
            var response = new BaseResponse<DownloadMediaV1Response>();
            var filePath = $"{downloadMediaDto.FilePath}";
            if (!string.IsNullOrEmpty(downloadMediaDto.SubFolderName))
                filePath = string.Format("{0}/{1}", downloadMediaDto.SubFolderName, filePath);

            if (!string.IsNullOrEmpty(downloadMediaDto.FolderName))
                filePath = string.Format("{0}/{1}", downloadMediaDto.FolderName, filePath);

            response.Data = await _azureStorage.DownloadV1Async(downloadMediaDto.ContainerName, filePath);
            if (response.Data.Error && !string.IsNullOrEmpty(response.Data.Status))
                throw new BadRequestException(response.Data.Status);

            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK; ;
            response.Message = response.Data.Status;

            return response;
        }
    }

    public sealed class DownloadMultipleMediaHandler : IRequestHandler<DownloadMultipleMediaRequest, BaseResponse<DownloadMultipleMediaResponse>>
    {
        private readonly IAzureStorage _azureStorage;
        private readonly IMapper _mapper;

        public DownloadMultipleMediaHandler(IAzureStorage azureStorage, IMapper mapper)
        {
            _azureStorage = azureStorage;
            _mapper = mapper;
        }

        public async Task<BaseResponse<DownloadMultipleMediaResponse>> Handle(DownloadMultipleMediaRequest downloadMediaRequest, CancellationToken cancellationToken)
        {
            if (downloadMediaRequest == null || downloadMediaRequest.RequestParam == null || string.IsNullOrEmpty(downloadMediaRequest.RequestParam.FilePath))
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var downloadMediaDto = downloadMediaRequest.RequestParam;
            var response = new BaseResponse<DownloadMultipleMediaResponse>();
            var blobFileNames = new List<string>();

            // Parse all values into lists
            var containerNames = downloadMediaDto.ContainerName?.Split(",", StringSplitOptions.RemoveEmptyEntries).Select(c => c.Trim()).ToList() ?? new();
            var folders = downloadMediaDto.FolderName?.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(f => f.Trim()).ToList() ?? new();
            var subFolders = downloadMediaDto.SubFolderName?.Split(',', StringSplitOptions.None).Select(s => s?.Trim()).ToList() ?? new();
            var fileNames = downloadMediaDto.FilePath?.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(f => f.Trim()).ToList() ?? new();

            // Safety check
            if (folders.Count != fileNames.Count || subFolders.Count != fileNames.Count || containerNames.Count != fileNames.Count)
                throw new BadRequestException("Mismatch between container, folder, subfolder, and file path counts.");

            // Build file paths
            for (int i = 0; i < fileNames.Count; i++)
            {
                var folder = folders[i];
                var subfolder = subFolders[i];
                var file = fileNames[i];

                string fullPath = (!string.IsNullOrEmpty(folder) && folder.ToLower() != "null")
                            ? (!string.IsNullOrEmpty(subfolder) && subfolder.ToLower() != "null")
                                ? $"{folder}/{subfolder}/{file}"
                                : $"{folder}/{file}"
                    : $"{file}";

                blobFileNames.Add(fullPath);
            }

            // ZIP file
            var zipFileName = $"zip_{DateTime.UtcNow:yyyyMMddHHmmssfff}.zip";
            // Put in first folder, or current directory if empty
            var zipFilePath = folders.Count > 0 && folders.Any(x => !string.IsNullOrEmpty(x) && x.ToLower() != "null") ? $"{folders.FirstOrDefault(x => !string.IsNullOrEmpty(x) && x.ToLower() != "null")}/{zipFileName}" : zipFileName;

            // Download and zip
            var downloadedZip = await _azureStorage.DownloadBlobsAndCreateZipV1Async(containerNames, blobFileNames, zipFilePath);

            response.Data = _mapper.Map<DownloadMultipleMediaResponse>(downloadedZip);

            if (response.Data.Error && !string.IsNullOrEmpty(response.Data.Status))
                throw new BadRequestException(response.Data.Status);

            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK; ;
            response.Message = response.Data.Status;

            return response;
        }
    }

    public sealed class DownloadZipMediaHandler : IRequestHandler<DownloadZipMediaRequest, BaseResponse<DownloadMediaResponse>>
    {
        private readonly IAzureStorage _azureStorage;

        public DownloadZipMediaHandler(IAzureStorage azureStorage)
        {
            _azureStorage = azureStorage;
        }

        public async Task<BaseResponse<DownloadMediaResponse>> Handle(DownloadZipMediaRequest downloadMediaRequest, CancellationToken cancellationToken)
        {
            if (downloadMediaRequest == null || downloadMediaRequest.RequestParam == null || string.IsNullOrEmpty(downloadMediaRequest.RequestParam.FilePath))
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var downloadMediaDto = downloadMediaRequest.RequestParam;
            var response = new BaseResponse<DownloadMediaResponse>();
            var blobFileNames = new List<string>();

            var folder = string.Empty;
            if (!string.IsNullOrEmpty(downloadMediaDto.SubFolderName))
                folder = string.Format("{0}", downloadMediaDto.SubFolderName);

            if (!string.IsNullOrEmpty(downloadMediaDto.FolderName))
                folder = string.IsNullOrEmpty(folder) ? string.Format("{0}", downloadMediaDto.FolderName) : string.Format("{0}/{1}", downloadMediaDto.FolderName, folder);

            foreach (var file in downloadMediaDto.FilePath.Split(','))
            {
                var filePath = string.IsNullOrEmpty(folder) ? $"{file}" : $"{folder}/{file}";
                blobFileNames.Add(filePath);
            }

            var zipFileName = $"test_{DateTime.UtcNow.ToString("yyyyMMddHHmmssfff")}.zip";
            var zipFilePath = string.IsNullOrEmpty(folder) ? $"{zipFileName}" : $"{folder}/{zipFileName}";

            response.Data = await _azureStorage.DownloadBlobsAndCreateZipAsync(downloadMediaDto.ContainerName, blobFileNames, zipFilePath);
            if (response.Data.Error && !string.IsNullOrEmpty(response.Data.Status))
                throw new BadRequestException(response.Data.Status);

            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK; ;
            response.Message = response.Data.Status;

            return response;
        }
    }

    public sealed class DownloadZipMediaV1Handler : IRequestHandler<DownloadZipMediaV1Request, BaseResponse<DownloadMediaV1Response>>
    {
        private readonly IAzureStorage _azureStorage;

        public DownloadZipMediaV1Handler(IAzureStorage azureStorage)
        {
            _azureStorage = azureStorage;
        }

        public async Task<BaseResponse<DownloadMediaV1Response>> Handle(DownloadZipMediaV1Request downloadMediaRequest, CancellationToken cancellationToken)
        {
            if (downloadMediaRequest == null || downloadMediaRequest.RequestParam == null || string.IsNullOrEmpty(downloadMediaRequest.RequestParam.FilePath))
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var downloadMediaDto = downloadMediaRequest.RequestParam;
            var response = new BaseResponse<DownloadMediaV1Response>();
            var blobFileNames = new List<string>();

            var folder = string.Empty;
            if (!string.IsNullOrEmpty(downloadMediaDto.SubFolderName))
                folder = string.Format("{0}", downloadMediaDto.SubFolderName);

            if (!string.IsNullOrEmpty(downloadMediaDto.FolderName))
                folder = string.IsNullOrEmpty(folder) ? string.Format("{0}", downloadMediaDto.FolderName) : string.Format("{0}/{1}", downloadMediaDto.FolderName, folder);

            foreach (var file in downloadMediaDto.FilePath.Split(','))
            {
                var filePath = string.IsNullOrEmpty(folder) ? $"{file}" : $"{folder}/{file}";
                blobFileNames.Add(filePath);
            }

            var zipFileName = $"zip_{DateTime.UtcNow.ToString("yyyyMMddHHmmssfff")}.zip";
            var zipFilePath = string.IsNullOrEmpty(folder) ? $"{zipFileName}" : $"{folder}/{zipFileName}";

            response.Data = await _azureStorage.DownloadBlobsAndCreateZipV1Async(downloadMediaDto.ContainerName, blobFileNames, zipFilePath);
            if (response.Data.Error && !string.IsNullOrEmpty(response.Data.Status))
                throw new BadRequestException(response.Data.Status);

            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK; ;
            response.Message = response.Data.Status;

            return response;
        }
    }

    public sealed class GenerateUploadUrlHandler : IRequestHandler<UploadMediaV2Request, BaseResponse<UploadMediaV2Response>>
    {
        private readonly IAzureStorage _azureStorage;
        private readonly string _blobBaseUrl;
        private readonly IConfiguration _configuration;
        private readonly ClaimsPrincipalExtensions _userInfo;

        public GenerateUploadUrlHandler(IAzureStorage azureStorage, IConfiguration configuration, ClaimsPrincipalExtensions userInfo)
        {
            _azureStorage = azureStorage;
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _blobBaseUrl = configuration.ExtractKey<BlobStorage>(Key.BlobStorage).Url ?? string.Empty;
            _userInfo = userInfo;
        }

        public async Task<BaseResponse<UploadMediaV2Response>> Handle(UploadMediaV2Request request, CancellationToken cancellationToken)
        {
            if (request?.RequestParam?.Documents == null || !request.RequestParam.Documents.Any())
                throw new BadRequestException(Messaging.InvalidRequest);

            var documents = request.RequestParam.Documents;
            //long maxFileSize = 50 * 1024 * 1024;

            // ✅ Phase 1: Validate all documents BEFORE generating URLs
            foreach (var doc in documents)
            {
                if (string.IsNullOrWhiteSpace(doc.FileName))
                    throw new BadRequestException("File name is required.");

                if (!doc.ContainerName.HasValue)
                    throw new BadRequestException("Container name is required.");

                //if (string.IsNullOrWhiteSpace(doc.ContentType))
                //{
                //doc.ContentType
                //throw new BadRequestException($"Missing content type for file: {doc.FileName}");
                //}

                if (doc.FileSize <= 0)
                    throw new BadRequestException($"File size must be greater than 0 for file: {doc.FileName}");

                //if (doc.FileSize > maxFileSize)
                //{
                //    var readableSize = doc.FileSize >= 1024 * 1024
                //        ? $"{doc.FileSize / (1024.0 * 1024.0):0.##} MB"
                //        : $"{doc.FileSize / 1024.0:0.##} KB";

                //    throw new BadRequestException($"File '{doc.FileName}' exceeds the max size of 50 MB. Your file is {readableSize}.");
                //}

                // Optional: validate extension
                //var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".docx" };
                //var extension = Path.GetExtension(doc.FileName).ToLowerInvariant();
                //if (!allowedExtensions.Contains(extension))
                //    throw new BadRequestException($"File type not allowed for file: {doc.FileName}");
            }

            // ✅ Phase 2: Generate URLs for all documents after successful validation
            var result = new List<MediaItem>();
            foreach (var doc in documents)
            {
                var containerName = doc.ContainerName ?? throw new BadRequestException("Container name is required.");
                var contentType = doc.ContentType ?? "application/octet-stream";
                var fileName = doc.FileName ?? throw new BadRequestException("File name is required.");
                var extension = Path.GetExtension(fileName);
                var safeFileName = Path.GetFileNameWithoutExtension(fileName);
                var finalFileName = request.RequestParam.IsSameFileNameAndPath == true ? fileName : $"{safeFileName}_{DateTime.UtcNow:yyyyMMddHHmmssfff}{extension}";

                var folder = doc.FolderName;
                if (!string.IsNullOrEmpty(doc.SubFolderName))
                    folder = $"{folder}/{doc.SubFolderName}";

                var blobPath = string.IsNullOrEmpty(folder)
                    ? finalFileName
                    : $"{folder}/{finalFileName}";

                var sasUrl = await _azureStorage.GenerateUploadSasUrl(
                    containerName,
                    blobPath,
                    contentType
                );

                result.Add(new MediaItem
                {
                    FileName = fileName,
                    Uri = sasUrl,
                    FilePath = finalFileName,
                    ContentType = contentType,
                    FileSize = doc.FileSize,
                    FileExtension = extension,
                    ContainerName = containerName,
                    FolderName = doc.FolderName,
                    MediaId = Guid.NewGuid().ToString(),
                    MediaType = doc.MediaType,
                    Status = Status.Active,
                    SubFolderName = doc.SubFolderName,
                    ThumbnailPath = doc.ThumbnailPath,
                    ThumbnailUri = doc.ThumbnailUri,
                });
            }

            return new BaseResponse<UploadMediaV2Response>

            {
                Data = new UploadMediaV2Response { Medias = result, },
                Success = true,
                StatusCode = StatusCodes.Status200OK,
                Message = string.Format(Messaging.UploadFile)
            };
        }
    }

    public sealed class PreviewMediaHandler : IRequestHandler<PreviewMediaRequest, BaseResponse<PreviewMediaResponse>>
    {
        private readonly IAzureStorage _azureStorage;

        public PreviewMediaHandler(IAzureStorage azureStorage)
        {
            _azureStorage = azureStorage;
        }

        public async Task<BaseResponse<PreviewMediaResponse>> Handle(PreviewMediaRequest downloadMediaRequest, CancellationToken cancellationToken)
        {
            if (downloadMediaRequest == null || downloadMediaRequest.RequestParam == null || string.IsNullOrEmpty(downloadMediaRequest.RequestParam.FilePath))
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var downloadMediaDto = downloadMediaRequest.RequestParam;
            var response = new BaseResponse<PreviewMediaResponse>();
            var filePath = $"{downloadMediaDto.FilePath}";
            if (!string.IsNullOrEmpty(downloadMediaDto.SubFolderName))
                filePath = string.Format("{0}/{1}", downloadMediaDto.SubFolderName, filePath);

            if (!string.IsNullOrEmpty(downloadMediaDto.FolderName))
                filePath = string.Format("{0}/{1}", downloadMediaDto.FolderName, filePath);

            var downloadMediaResponse = await _azureStorage.DownloadAsync(downloadMediaDto.ContainerName, filePath);

            if (downloadMediaResponse.Error && !string.IsNullOrEmpty(downloadMediaResponse.Status))
                throw new BadRequestException(downloadMediaResponse.Status);

            var previewMediaResponse = new PreviewMediaResponse
            {
                ContentType = downloadMediaResponse.ContentType,
                FileExtension = downloadMediaResponse.FileExtension,
                FileName = downloadMediaResponse.FileName,
                FilePath = downloadMediaResponse.FilePath,
                FileSize = downloadMediaResponse.FileSize,
                MediaType = downloadMediaResponse.MediaType,
                Uri = downloadMediaResponse.Uri
            };
            response.Data = previewMediaResponse;
            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK; ;
            response.Message = downloadMediaResponse.Status;

            return response;
        }
    }

    public sealed class UploadMediaHandler : IRequestHandler<UploadMediaRequest, BaseResponse<UploadMediaResponse>>
    {
        private readonly IAzureStorage _azureStorage;
        private readonly string _blobUrl;
        private readonly IConfiguration _configuration;
        private readonly IHeicConversionService _heicConversion;
        private readonly ClaimsPrincipalExtensions _userInfo;

        public UploadMediaHandler(IAzureStorage azureStorage, IConfiguration configuration, ClaimsPrincipalExtensions userInfo, IHeicConversionService heicConversion)
        {
            _azureStorage = azureStorage;
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _blobUrl = configuration.ExtractKey<BlobStorage>(Key.BlobStorage).Url ?? string.Empty;
            _userInfo = userInfo;
            _heicConversion = heicConversion ?? throw new ArgumentNullException(nameof(heicConversion));
        }

        public async Task<BaseResponse<UploadMediaResponse>> Handle(UploadMediaRequest uploadMediaRequest, CancellationToken cancellationToken)
        {
            if (uploadMediaRequest == null || uploadMediaRequest.RequestParam == null || uploadMediaRequest.RequestParam.FormFile == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var response = new BaseResponse<UploadMediaResponse>();

            var uploadMediaDto = uploadMediaRequest.RequestParam;

            // check for max file size
            long MaxFileSizeInBytes = 50 * 1024 * 1024; // 50 MB

            var fileSize = uploadMediaDto.FormFile.Length;

            if (fileSize > MaxFileSizeInBytes)
            {
                var humanReadableSize = "";
                if (fileSize >= 1024 * 1024) //MB
                    humanReadableSize = $"{(fileSize / (1024.0 * 1024.0)).ToString("0.##", CultureInfo.InvariantCulture)} MB";
                else if (fileSize >= 1024) //KB
                    humanReadableSize = $"{(fileSize / 1024.0).ToString("0.##", CultureInfo.InvariantCulture)} KB";
                else
                    humanReadableSize = $"{fileSize} bytes";

                throw new BadRequestException($"The uploaded file exceeds the maximum allowed size of 50 MB. Your file is {fileSize}.");
            }

            var folderName = $"{uploadMediaDto.FolderName}";
            if (!string.IsNullOrEmpty(uploadMediaDto.SubFolderName))
                folderName = string.Format("{0}/{1}", folderName, uploadMediaDto.SubFolderName);

            var file = uploadMediaDto.FormFile;
            var containerName = uploadMediaDto.ContainerName;

            string filePath;
            string contentTypeToUse;
            string fileNameForDisplay;
            using (var sourceStream = new MemoryStream())
            {
                await file.CopyToAsync(sourceStream);
                sourceStream.Position = 0;
                using (var conversion = await _heicConversion.ConvertToJpegIfHeicAsync(sourceStream, file.FileName, file.ContentType))
                {
                    if (conversion != null)
                    {
                        filePath = $"{Path.GetFileNameWithoutExtension(conversion.FileName)}_{DateTime.UtcNow:yyyyMMddHHmmssfff}.jpg";
                        contentTypeToUse = conversion.ContentType;
                        fileNameForDisplay = conversion.FileName;
                        var tempPath = Path.Combine(Path.GetTempPath(), filePath);
                        try
                        {
                            await SaveStreamAsFile(Path.GetTempPath(), conversion.JpegStream, filePath);
                            await _azureStorage.UploadAsync(containerName, folderName, filePath, tempPath, contentTypeToUse);
                        }
                        finally
                        {
                            if (File.Exists(tempPath)) File.Delete(tempPath);
                        }
                    }
                    else
                    {
                        filePath = $"{Path.GetFileNameWithoutExtension(file.FileName)}_{DateTime.UtcNow:yyyyMMddHHmmssfff}{Path.GetExtension(file.FileName)}";
                        contentTypeToUse = file.ContentType ?? "application/octet-stream";
                        fileNameForDisplay = file.FileName;
                        await _azureStorage.UploadAsync(containerName, folderName, filePath, file);
                    }
                }
            }

            var date = DateTime.UtcNow;
            var media = new MediaItem
            {
                FileExtension = Path.GetExtension(filePath),
                FileName = fileNameForDisplay,
                FilePath = filePath,
                FileSize = file.Length,
                ContentType = contentTypeToUse,
                Uri = string.IsNullOrEmpty(folderName) ? string.Format("{0}{1}/{2}", _blobUrl, containerName, filePath) : string.Format("{0}{1}/{2}/{3}", _blobUrl, containerName, folderName, filePath),
                ContainerName = containerName,
                FolderName = uploadMediaDto.FolderName,
                SubFolderName = uploadMediaDto.SubFolderName,
                MediaId = Guid.NewGuid().ToString(),
                UserContext = _userInfo == null ? null : new UserBaseItem
                {
                    CreatedByUserId = _userInfo.UserProfileId,
                    CreatedOn = date,
                    CreatedByUserName = _userInfo.Name,
                    ModifiedByUserId = _userInfo.UserProfileId,
                    ModifiedOn = date,
                    ModifiedByUserName = _userInfo.Name
                }
            };
            var blobUrl = $"{_blobUrl}{media.Uri}";
            media.setMediaType();

            response.Data = new UploadMediaResponse { Media = media };
            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK;
            response.Message = string.Format(Messaging.UploadFile);

            return response;
        }

        public async ValueTask SaveStreamAsFile(string filePath, Stream inputStream, string fileName)
        {
            if (inputStream != null)
            {
                string path = Path.Combine(filePath, fileName);
                using (FileStream outputFileStream = new FileStream(path, FileMode.Create))
                {
                    inputStream.Position = 0;
                    await inputStream.CopyToAsync(outputFileStream).ConfigureAwait(false);
                }
            }
        }

        public async ValueTask UploadFileInBlob(BlobContainerNames containerName, string folderName, string fileName, IFormFile blob)
        {
            var filePath = Path.Combine(Path.GetTempPath(), fileName);
            try
            {
                // Create a MemoryStream to hold the content of the IFormFile
                using (var stream = new MemoryStream())
                {
                    await blob.CopyToAsync(stream); // Copy the content of IFormFile to MemoryStream
                    stream.Position = 0; // Reset the position to beginning

                    await SaveStreamAsFile(Path.GetTempPath(), stream, fileName);

                    await _azureStorage.UploadAsync(containerName, folderName, fileName, filePath, blob.ContentType ?? "application/octet-stream");
                }
            }
            //catch (Exception ex)
            //{
            //    // Handle exceptions or log them appropriately
            //    Console.WriteLine($"Error uploading file: {ex.Message}");
            //    throw; // Rethrow the exception to propagate it further if needed
            //}
            finally
            {
                // Ensure the temporary file is deleted
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
        }

        //if (uploadMediaRequest.FormFile.Length == 0)
        //    throw new BadRequestException("Uploaded file is empty.");

        //if (!Path.GetExtension(uploadMediaRequest.FormFile.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
        //    throw new BadRequestException("Invalid file format. Only .xlsx files are allowed.");
    }

    public sealed class UploadMediaV1Handler : IRequestHandler<UploadMediaV1Request, BaseResponse<UploadMediaResponse>>
    {
        private readonly IAzureStorage _azureStorage;
        private readonly string _blobUrl;
        private readonly IConfiguration _configuration;
        private readonly string _currentBlobUrl;
        private readonly IHeicConversionService _heicConversion;
        private readonly ClaimsPrincipalExtensions _userInfo;

        public UploadMediaV1Handler(IAzureStorage azureStorage, IConfiguration configuration, ClaimsPrincipalExtensions userInfo, IHeicConversionService heicConversion)
        {
            _azureStorage = azureStorage;
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _blobUrl = configuration.ExtractKey<BlobStorage>(Key.BlobStorage).Url ?? string.Empty;
            _currentBlobUrl = _blobUrl;
            _userInfo = userInfo;
            _heicConversion = heicConversion ?? throw new ArgumentNullException(nameof(heicConversion));
        }

        public async Task<BaseResponse<UploadMediaResponse>> Handle(UploadMediaV1Request uploadMediaRequest, CancellationToken cancellationToken)
        {
            if (uploadMediaRequest == null || uploadMediaRequest.RequestParam == null || uploadMediaRequest.RequestParam.FormFile == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var response = new BaseResponse<UploadMediaResponse>();

            var uploadMediaDto = uploadMediaRequest.RequestParam;

            // check for max file size
            long MaxFileSizeInBytes = 50 * 1024 * 1024; // 50 MB

            var fileSize = uploadMediaDto.FormFile.Length;

            if (fileSize > MaxFileSizeInBytes)
            {
                var humanReadableSize = "";
                if (fileSize >= 1024 * 1024) //MB
                    humanReadableSize = $"{((double)fileSize / (1024.0 * 1024.0)).ToString("0.##", CultureInfo.InvariantCulture)} MB";
                else if (fileSize >= 1024) //KB
                    humanReadableSize = $"{((double)fileSize / 1024.0).ToString("0.##", CultureInfo.InvariantCulture)} KB";
                else
                    humanReadableSize = $"{fileSize} bytes";

                throw new BadRequestException($"The uploaded file exceeds the maximum allowed size of 50 MB. Your file is {fileSize}.");
            }

            var folderName = $"{uploadMediaDto.FolderName}";
            if (!string.IsNullOrEmpty(uploadMediaDto.SubFolderName))
                folderName = string.Format("{0}/{1}", folderName, uploadMediaDto.SubFolderName);

            var file = uploadMediaDto.FormFile;
            var containerName = uploadMediaDto.ContainerName;

            string filePath;
            string contentTypeToUse;
            string fileNameForDisplay;
            using (var sourceStream = new MemoryStream())
            {
                await file.CopyToAsync(sourceStream);
                sourceStream.Position = 0;
                using (var conversion = await _heicConversion.ConvertToJpegIfHeicAsync(sourceStream, file.Name ?? "file", file.ContentType))
                {
                    if (conversion != null)
                    {
                        filePath = $"{Path.GetFileNameWithoutExtension(conversion.FileName)}_{DateTime.UtcNow:yyyyMMddHHmmssfff}.jpg";
                        contentTypeToUse = conversion.ContentType;
                        fileNameForDisplay = conversion.FileName;
                        var tempPath = Path.Combine(Path.GetTempPath(), filePath);
                        try
                        {
                            await SaveStreamAsFile(Path.GetTempPath(), conversion.JpegStream, filePath);

                            await _azureStorage.UploadAsync(containerName, folderName, filePath, tempPath, contentTypeToUse);
                        }
                        finally
                        {
                            if (File.Exists(tempPath)) File.Delete(tempPath);
                        }
                    }
                    else
                    {
                        filePath = $"{Path.GetFileNameWithoutExtension(file.Name)}_{DateTime.UtcNow:yyyyMMddHHmmssfff}{Path.GetExtension(file.Name)}";
                        contentTypeToUse = file.ContentType ?? "application/octet-stream";
                        fileNameForDisplay = file.Name ?? "file";

                        await _azureStorage.UploadAsync(containerName, folderName, filePath, file);
                    }
                }
            }

            var date = DateTime.UtcNow;
            var media = new MediaItem
            {
                FileExtension = Path.GetExtension(filePath),
                FileName = fileNameForDisplay,
                FilePath = filePath,
                FileSize = file.Length,
                ContentType = contentTypeToUse,
                Uri = string.IsNullOrEmpty(folderName) ? string.Format("{0}{1}/{2}", uploadMediaRequest.RequestParam.Platform == PlatForm.Current ? _currentBlobUrl : _blobUrl, containerName, filePath) : string.Format("{0}{1}/{2}/{3}", uploadMediaRequest.RequestParam.Platform == PlatForm.Current ? _currentBlobUrl : _blobUrl, containerName, folderName, filePath),
                ContainerName = containerName,
                FolderName = uploadMediaDto.FolderName,
                SubFolderName = uploadMediaDto.SubFolderName,
                MediaId = Guid.NewGuid().ToString(),
                UserContext = _userInfo == null ? null : new UserBaseItem
                {
                    CreatedByUserId = _userInfo.UserProfileId,
                    CreatedOn = date,
                    CreatedByUserName = _userInfo.Name,
                    ModifiedByUserId = _userInfo.UserProfileId,
                    ModifiedOn = date,
                    ModifiedByUserName = _userInfo.Name
                }
            };
            var blobUrl = $"{_blobUrl}{media.Uri}";
            media.setMediaType();

            response.Data = new UploadMediaResponse { Media = media };
            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK;
            response.Message = string.Format(Messaging.UploadFile);

            return response;
        }

        public async ValueTask UploadFileInBlob(BlobContainerNames containerName, string folderName, string fileName, IFile blob)
        {
            var filePath = Path.Combine(Path.GetTempPath(), fileName);
            try
            {
                // Create a MemoryStream to hold the content of the IFormFile
                using (var stream = new MemoryStream())
                {
                    await blob.CopyToAsync(stream); // Copy the content of IFormFile to MemoryStream
                    stream.Position = 0; // Reset the position to beginning

                    await SaveStreamAsFile(Path.GetTempPath(), stream, fileName);

                    await _azureStorage.UploadAsync(containerName, folderName, fileName, filePath, blob.ContentType ?? "application/octet-stream");
                }
            }
            //catch (Exception ex)
            //{
            //    // Handle exceptions or log them appropriately
            //    Console.WriteLine($"Error uploading file: {ex.Message}");
            //    throw; // Rethrow the exception to propagate it further if needed
            //}
            finally
            {
                // Ensure the temporary file is deleted
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
        }

        private async ValueTask SaveStreamAsFile(string filePath, Stream inputStream, string fileName)
        {
            if (inputStream != null)
            {
                string path = Path.Combine(filePath, fileName);
                using (FileStream outputFileStream = new FileStream(path, FileMode.Create))
                {
                    inputStream.Position = 0;
                    await inputStream.CopyToAsync(outputFileStream).ConfigureAwait(false);
                }
            }
        }

        //if (uploadMediaRequest.FormFile.Length == 0)
        //    throw new BadRequestException("Uploaded file is empty.");

        //if (!Path.GetExtension(uploadMediaRequest.FormFile.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
        //    throw new BadRequestException("Invalid file format. Only .xlsx files are allowed.");
    }
}
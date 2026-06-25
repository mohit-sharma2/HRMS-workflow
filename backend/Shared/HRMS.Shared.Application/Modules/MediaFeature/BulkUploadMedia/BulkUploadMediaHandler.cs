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

namespace HRMS.Shared.Application.Modules.MediaFeature.BulkUploadMedia
{
    public sealed class BulkUploadMediaHandler : IRequestHandler<BulkUploadMediaRequest, BaseResponse<BulkUploadMediaResponse>>
    {
        private readonly IAzureStorage _azureStorage;
        private readonly string _blobUrl;
        private readonly IConfiguration _configuration;
        private readonly IHeicConversionService _heicConversion;
        private readonly ClaimsPrincipalExtensions _userInfo;

        public BulkUploadMediaHandler(IAzureStorage azureStorage, IConfiguration configuration, ClaimsPrincipalExtensions userInfo, IHeicConversionService heicConversion)
        {
            _azureStorage = azureStorage;
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _blobUrl = configuration.ExtractKey<BlobStorage>(Key.BlobStorage).Url ?? string.Empty;
            _userInfo = userInfo;
            _heicConversion = heicConversion ?? throw new ArgumentNullException(nameof(heicConversion));
        }

        public async Task<BaseResponse<BulkUploadMediaResponse>> Handle(BulkUploadMediaRequest bulkUploadMediaRequest, CancellationToken cancellationToken)
        {
            if (bulkUploadMediaRequest == null || bulkUploadMediaRequest.RequestParam == null || bulkUploadMediaRequest.RequestParam.FormFiles == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));
            var response = new BaseResponse<BulkUploadMediaResponse>();

            var bulkUploadMediaDto = bulkUploadMediaRequest.RequestParam;
            var folderName = $"{bulkUploadMediaDto.FolderName}";
            if (!string.IsNullOrEmpty(bulkUploadMediaDto.SubFolderName))
                folderName = string.Format("{0}/{1}", folderName, bulkUploadMediaDto.SubFolderName);

            var files = bulkUploadMediaDto.FormFiles;
            var containerName = bulkUploadMediaDto.ContainerName;
            var medias = new List<MediaItem>();

            // check for max file size
            foreach (var file in files)
            {
                long MaxFileSizeInBytes = 50 * 1024 * 1024; // 50 MB

                var fileSize = file.Length;

                if (fileSize > MaxFileSizeInBytes)
                {
                    var humanReadableSize = "";
                    if (fileSize >= 1024 * 1024) //MB
                        humanReadableSize = $"{(fileSize / (1024.0 * 1024.0)).ToString("0.##", CultureInfo.InvariantCulture)} MB";
                    else if (fileSize >= 1024) //KB
                        humanReadableSize = $"{(fileSize / 1024.0).ToString("0.##", CultureInfo.InvariantCulture)} KB";
                    else
                        humanReadableSize = $"{fileSize} bytes";

                    throw new BadRequestException($"The uploaded file exceeds the maximum allowed size of 50 MB. Your file is {humanReadableSize}.");
                }
            }

            var date = DateTime.UtcNow;
            foreach (var file in files)
            {
                using var sourceStream = new MemoryStream();
                await file.CopyToAsync(sourceStream);
                sourceStream.Position = 0;

                string filePath;
                string contentTypeToUse;
                string fileNameForDisplay;
                Stream streamToUpload;
                bool disposeStreamAfterUpload = false;
                using (var conversion = await _heicConversion.ConvertToJpegIfHeicAsync(sourceStream, file.FileName ?? file.Name ?? "file", file.ContentType))
                {
                    if (conversion != null)
                    {
                        filePath = $"{Path.GetFileNameWithoutExtension(conversion.FileName)}_{DateTime.UtcNow:yyyyMMddHHmmssfff}.jpg";
                        contentTypeToUse = conversion.ContentType;
                        fileNameForDisplay = conversion.FileName;
                        var jpegCopy = new MemoryStream();
                        await conversion.JpegStream.CopyToAsync(jpegCopy);
                        jpegCopy.Position = 0;
                        streamToUpload = jpegCopy;
                        disposeStreamAfterUpload = true;
                    }
                    else
                    {
                        var ext = Path.GetExtension(file.FileName ?? file.Name);
                        filePath = $"{Path.GetFileNameWithoutExtension(file.FileName ?? file.Name)}_{DateTime.UtcNow:yyyyMMddHHmmssfff}{ext}";
                        contentTypeToUse = file.ContentType ?? "application/octet-stream";
                        fileNameForDisplay = file.FileName ?? file.Name ?? "file";
                        streamToUpload = sourceStream;
                    }
                }

                try
                {
                    var media = new MediaItem
                    {
                        FileExtension = Path.GetExtension(filePath),
                        FileName = fileNameForDisplay,
                        FilePath = filePath,
                        FileSize = file.Length,
                        ContentType = contentTypeToUse,
                        Uri = string.IsNullOrEmpty(folderName) ? string.Format("{0}{1}/{2}", _blobUrl, containerName, filePath) : string.Format("{0}{1}/{2}/{3}", _blobUrl, containerName, folderName, filePath),
                        ContainerName = containerName,
                        FolderName = bulkUploadMediaDto.FolderName,
                        SubFolderName = bulkUploadMediaDto.SubFolderName,
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
                    media.setMediaType();
                    medias.Add(media);

                    await UploadFileInBlob(containerName, folderName, filePath, streamToUpload, contentTypeToUse);
                }
                finally
                {
                    if (disposeStreamAfterUpload)
                        await streamToUpload.DisposeAsync();
                }
            }

            response.Data = new BulkUploadMediaResponse { Medias = medias };
            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK; ;
            response.Message = string.Format(Messaging.UploadFile);

            return response;
        }

        public async ValueTask UploadFileInBlob(BlobContainerNames containerName, string folderName, string fileName, IFormFile blob)
        {
            using var stream = new MemoryStream();
            await blob.CopyToAsync(stream);
            stream.Position = 0;
            await UploadFileInBlob(containerName, folderName, fileName, stream, blob.ContentType ?? "application/octet-stream");
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

        private async ValueTask UploadFileInBlob(BlobContainerNames containerName, string folderName, string fileName, Stream stream, string contentType)
        {
            var filePath = Path.Combine(Path.GetTempPath(), fileName);
            try
            {
                stream.Position = 0;
                await SaveStreamAsFile(Path.GetTempPath(), stream, fileName);
                await _azureStorage.UploadAsync(containerName, folderName, fileName, filePath, contentType);
            }
            finally
            {
                if (File.Exists(filePath))
                    File.Delete(filePath);
            }
        }
    }

    public sealed class BulkUploadMediaV1Handler : IRequestHandler<BulkUploadMediaV1Request, BaseResponse<BulkUploadMediaResponse>>
    {
        private readonly IAzureStorage _azureStorage;
        private readonly string _blobUrl;
        private readonly IConfiguration _configuration;
        private readonly string _currentBlobUrl;
        private readonly IHeicConversionService _heicConversion;
        private readonly ClaimsPrincipalExtensions _userInfo;

        public BulkUploadMediaV1Handler(IAzureStorage azureStorage, IConfiguration configuration, ClaimsPrincipalExtensions userInfo, IHeicConversionService heicConversion)
        {
            _azureStorage = azureStorage;
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _blobUrl = configuration.ExtractKey<BlobStorage>(Key.BlobStorage).Url ?? string.Empty;
            _currentBlobUrl = _blobUrl;
            _userInfo = userInfo;
            _heicConversion = heicConversion ?? throw new ArgumentNullException(nameof(heicConversion));
        }

        public async Task<BaseResponse<BulkUploadMediaResponse>> Handle(BulkUploadMediaV1Request bulkUploadMediaRequest, CancellationToken cancellationToken)
        {
            if (bulkUploadMediaRequest == null || bulkUploadMediaRequest.RequestParam == null || bulkUploadMediaRequest.RequestParam.FormFiles == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));
            var response = new BaseResponse<BulkUploadMediaResponse>();

            var bulkUploadMediaDto = bulkUploadMediaRequest.RequestParam;
            var folderName = $"{bulkUploadMediaDto.FolderName}";
            if (!string.IsNullOrEmpty(bulkUploadMediaDto.SubFolderName))
                folderName = string.IsNullOrEmpty(folderName) ? string.Format("{0}", bulkUploadMediaDto.SubFolderName) : string.Format("{0}/{1}", folderName, bulkUploadMediaDto.SubFolderName);

            var files = bulkUploadMediaDto.FormFiles;
            var containerName = bulkUploadMediaDto.ContainerName;
            var medias = new List<MediaItem>();

            // check for max file size
            foreach (var file in files)
            {
                long MaxFileSizeInBytes = 50 * 1024 * 1024; // 50 MB

                var fileSize = file.Length;

                if (fileSize > MaxFileSizeInBytes)
                {
                    var humanReadableSize = "";
                    if (fileSize >= 1024 * 1024) //MB
                        humanReadableSize = $"{((double)fileSize / (1024.0 * 1024.0)).ToString("0.##", CultureInfo.InvariantCulture)} MB";
                    else if (fileSize >= 1024) //KB
                        humanReadableSize = $"{((double)fileSize / 1024.0).ToString("0.##", CultureInfo.InvariantCulture)} KB";
                    else
                        humanReadableSize = $"{fileSize} bytes";

                    throw new BadRequestException($"The uploaded file exceeds the maximum allowed size of 50 MB. Your file is {humanReadableSize}.");
                }
            }

            var date = DateTime.UtcNow;
            foreach (var file in files)
            {
                using var sourceStream = new MemoryStream();
                await file.CopyToAsync(sourceStream);
                sourceStream.Position = 0;

                string filePath;
                string contentTypeToUse;
                string fileNameForDisplay;
                Stream streamToUpload;
                bool disposeStreamAfterUpload = false;
                using (var conversion = await _heicConversion.ConvertToJpegIfHeicAsync(sourceStream, file.Name ?? "file", file.ContentType))
                {
                    if (conversion != null)
                    {
                        filePath = $"{Path.GetFileNameWithoutExtension(conversion.FileName)}_{DateTime.UtcNow:yyyyMMddHHmmssfff}.jpg";
                        contentTypeToUse = conversion.ContentType;
                        fileNameForDisplay = conversion.FileName;
                        var jpegCopy = new MemoryStream();
                        await conversion.JpegStream.CopyToAsync(jpegCopy);
                        jpegCopy.Position = 0;
                        streamToUpload = jpegCopy;
                        disposeStreamAfterUpload = true;
                    }
                    else
                    {
                        var ext = Path.GetExtension(file.Name);
                        filePath = $"{Path.GetFileNameWithoutExtension(file.Name)}_{DateTime.UtcNow:yyyyMMddHHmmssfff}{ext}";
                        contentTypeToUse = file.ContentType ?? "application/octet-stream";
                        fileNameForDisplay = file.Name ?? "file";
                        streamToUpload = sourceStream;
                    }
                }

                try
                {
                    var media = new MediaItem
                    {
                        FileExtension = Path.GetExtension(filePath).ToLower(),
                        FileName = fileNameForDisplay,
                        FilePath = filePath,
                        FileSize = file.Length,
                        ContentType = contentTypeToUse,
                        Uri = string.IsNullOrEmpty(folderName)
                        ? $"{(bulkUploadMediaRequest.RequestParam.Platform == PlatForm.Current ? _currentBlobUrl : _blobUrl)}{containerName}/{filePath}"
                        : $"{(bulkUploadMediaRequest.RequestParam.Platform == PlatForm.Current ? _currentBlobUrl : _blobUrl)}{containerName}/{folderName}/{filePath}",
                        ContainerName = containerName,
                        FolderName = bulkUploadMediaDto.FolderName,
                        SubFolderName = bulkUploadMediaDto.SubFolderName,
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
                    media.setMediaType();
                    medias.Add(media);

                    await UploadFileInBlob(containerName, folderName, filePath, streamToUpload, contentTypeToUse, bulkUploadMediaRequest.RequestParam.Platform);
                }
                finally
                {
                    if (disposeStreamAfterUpload)
                        await streamToUpload.DisposeAsync();
                }
            }

            response.Data = new BulkUploadMediaResponse { Medias = medias };
            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK; ;
            response.Message = string.Format(Messaging.UploadFile);

            return response;
        }

        public async ValueTask UploadFileInBlob(BlobContainerNames containerName, string folderName, string fileName, IFile blob, PlatForm? platform)
        {
            using var stream = new MemoryStream();
            await blob.CopyToAsync(stream);
            stream.Position = 0;
            await UploadFileInBlob(containerName, folderName, fileName, stream, blob.ContentType ?? "application/octet-stream", platform);
        }

        private async ValueTask SaveStreamAsFile(string filePath, Stream inputStream, string fileName)
        {
            if (inputStream != null)
            {
                string path = System.IO.Path.Combine(filePath, fileName);
                using (FileStream outputFileStream = new FileStream(path, FileMode.Create))
                {
                    inputStream.Position = 0;
                    await inputStream.CopyToAsync(outputFileStream).ConfigureAwait(false);
                }
            }
        }

        private async ValueTask UploadFileInBlob(BlobContainerNames containerName, string folderName, string fileName, Stream stream, string contentType, PlatForm? platform)
        {
            var filePath = Path.Combine(Path.GetTempPath(), fileName);
            try
            {
                stream.Position = 0;
                await SaveStreamAsFile(Path.GetTempPath(), stream, fileName);

                await _azureStorage.UploadAsync(containerName, folderName, fileName, filePath, contentType);
            }
            finally
            {
                if (File.Exists(filePath))
                    File.Delete(filePath);
            }
        }
    }
}
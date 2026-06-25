using HRMS.Shared.Application.Modules.MediaFeature;
using HRMS.Shared.Application.Services;
using HRMS.Shared.Domain.Enum;

namespace HRMS.Shared.Application.BulkUpload
{
    public abstract class GenericExportBulkUploadHandler<TRequest, TResponse>
    {
        private const BlobContainerNames ContainerName = BlobContainerNames.bulkupload;
        private readonly IAzureStorage _azureStorage;
        private readonly IBulkUploadMasterDataCache _masterDataCache;

        public GenericExportBulkUploadHandler(IBulkUploadMasterDataCache masterDataCache, IAzureStorage azureStorage)
        {
            _masterDataCache = masterDataCache;
            _azureStorage = azureStorage;
        }

        protected void SetMasterDataCache<T>(T masterData, string entityName)
        {
            var cachedKey = $"export_{entityName}";
            var expirationTime = TimeSpan.FromDays(1);
            _masterDataCache.Set<T>(cachedKey, masterData, expirationTime);
        }

        protected async Task<MediaItem> UploadFileAsync(byte[] bytes, string entityName)
        {
            var extension = FileTypeMapper.GetExtension(FileType.Xlsx);
            var contentType = FileTypeMapper.GetContentType(FileType.Xlsx);

            var folderName = entityName;
            var fileName = $"export_{entityName}_{DateTime.UtcNow:yyyyMMddHHmmssfff}{extension}";

            var blobResponse = await _azureStorage.UploadAsync(ContainerName, folderName, fileName, bytes, contentType);

            var media = new MediaItem
            {
                MediaId = Guid.NewGuid().ToString(),
                ContentType = contentType,
                ContainerName = ContainerName,
                FileExtension = extension,
                FileName = fileName,
                FilePath = blobResponse.Blob.Path,
                FolderName = folderName,
                FileSize = blobResponse.Blob.Size,
                Uri = blobResponse.Blob.Uri
            };
            media.setMediaType();
            return media;
        }
    }
}
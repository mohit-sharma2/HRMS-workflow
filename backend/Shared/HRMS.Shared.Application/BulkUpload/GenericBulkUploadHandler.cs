using HRMS.Shared.Application.Modules.MediaFeature;
using HRMS.Shared.Application.Services;

namespace HRMS.Shared.Application.BulkUpload
{
    public abstract class GenericBulkUploadHandler<TRequest, TResponse>
    {
        protected readonly IAzureStorage _azureStorage;
        protected readonly IBulkUploadMasterDataCache _masterDataCache;

        protected GenericBulkUploadHandler(IBulkUploadMasterDataCache masterDataCache, IAzureStorage azureStorage)
        {
            _masterDataCache = masterDataCache;
            _azureStorage = azureStorage;
        }

        protected async Task<byte[]> GetFileBytesAsync(MediaDto file)
        {
            var filePath = !string.IsNullOrEmpty(file.FolderName) ?
                            $"{file.FolderName}/{file.FilePath!}" :
                            file.FilePath!;
            var base64 = await _azureStorage.GetFileAsBase64Async(file.ContainerName!.Value, filePath!);
            var fileBytes = Convert.FromBase64String(base64);
            return fileBytes;
        }

        protected T? GetMasterDataCache<T>(string entityName)
        {
            var cacheKey = $"export_{entityName}";
            return _masterDataCache.TryGetValue<T>(cacheKey!, out var value) ? value : default(T);
        }
    }
}
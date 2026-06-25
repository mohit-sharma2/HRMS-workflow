namespace HRMS.Shared.Application.BulkUpload
{
    public interface IBulkUploadMasterDataCache
    {
        bool Exists(string key);

        void Remove(string key);

        void Set<T>(string key, T value, TimeSpan? expiration);

        bool TryGetValue<T>(string key, out T? value);
    }
}
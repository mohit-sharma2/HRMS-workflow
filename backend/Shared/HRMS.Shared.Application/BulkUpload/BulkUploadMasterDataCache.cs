using Microsoft.Extensions.Caching.Memory;

namespace HRMS.Shared.Application.BulkUpload
{
    public class BulkUploadMasterDataCache : IBulkUploadMasterDataCache
    {
        private readonly IMemoryCache _memoryCache;

        public BulkUploadMasterDataCache(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        public bool Exists(string key)
        {
            return _memoryCache.TryGetValue(key, out _);
        }

        public void Remove(string key)
        {
            _memoryCache.Remove(key);
        }

        public void Set<T>(string key, T value, TimeSpan? expiration)
        {
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration
            };

            _memoryCache.Set(key, value, cacheOptions);
        }

        public bool TryGetValue<T>(string key, out T? value)
        {
            return _memoryCache.TryGetValue(key, out value);
        }
    }
}
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;

namespace HRMS.Shared.Application.Helper
{
    public class UserClaimCache
    {
        private readonly IMemoryCache _memoryCache;

        public UserClaimCache(IMemoryCache mCache)
        {
            _memoryCache = mCache;
        }

        public async Task<IEnumerable<Claim>> GetUserClaims(string id)
        {
            if (_memoryCache.TryGetValue(id, out IEnumerable<Claim>? result))
            {
                return result ?? Enumerable.Empty<Claim>();
            }

            return Enumerable.Empty<Claim>();
        }

        /// <summary>
        /// Removes cached claims for the user (e.g. on logout).
        /// </summary>
        public void RemoveUserClaims(string id)
        {
            _memoryCache.Remove(id);
        }

        public void SetUserClaims(string id, IEnumerable<Claim> claims)
        {
            var options = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(4)
            };

            _memoryCache.Set(id, claims, options);
        }
    }
}
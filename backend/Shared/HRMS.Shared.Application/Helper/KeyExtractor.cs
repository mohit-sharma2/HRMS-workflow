using HRMS.Core.KeyVault.Helper;
using HRMS.Shared.Domain.Enum;
using Microsoft.Extensions.Configuration;

namespace HRMS.Shared.Application.Helper
{
    public static class KeyExtractor
    {
        public static T ExtractKey<T>(this IConfiguration configuration, Key keyInternal)
        {
            return configuration.ExtractKey<T>(keyInternal.ToString());
        }
    }
}
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace HRMS.Core.KeyVault.Helper
{
    public static class KeyExtractor
    {
        public static T ExtractKey<T>(this IConfiguration _configuration, string keyInternal)
        {
            var env = _configuration.GetSection("Env").Value;
            var keyValue = _configuration[$"Keys-{env}"];
            if (string.IsNullOrWhiteSpace(keyValue))
                return default!;

            var keyObject = JObject.Parse(keyValue);
            var token = keyObject[keyInternal];
            if (token == null)
                return default!;

            var result = token.ToString();
            return JsonConvert.DeserializeObject<T>(result) ?? default!;
        }
    }
}
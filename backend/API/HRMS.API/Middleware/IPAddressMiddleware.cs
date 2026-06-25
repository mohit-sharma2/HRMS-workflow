using HRMS.Shared.Application.Helper;
using HRMS.Shared.Domain.Enum;
using System.Security.Authentication;

namespace HRMS.API.Middleware
{
    public class IPAddressMiddleware
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly List<string> _ipAddresses;
        private readonly RequestDelegate _next;

        public IPAddressMiddleware(RequestDelegate next, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _next = next;
            _httpClientFactory = httpClientFactory;
            _ipAddresses = configuration.ExtractKey<List<string>>(Key.LocalIpAllowed) ?? new List<string>();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Host.Host.Contains("localhost", StringComparison.OrdinalIgnoreCase))
            {
                string currentIp;
                try
                {
                    var httpClient = _httpClientFactory.CreateClient();
                    currentIp = await httpClient.GetStringAsync("https://api.ipify.org");
                }
                catch
                {
                    // Fail closed: if we can't determine the caller's IP, deny access.
                    throw new AuthenticationException("User is not authorized. Unable to determine caller IP.");
                }

                if (string.IsNullOrWhiteSpace(currentIp) || !IsValidIpAddress(currentIp))
                    throw new AuthenticationException($"User is not authorized. Illegal access detected from IP {currentIp}");
            }

            await _next.Invoke(context);
        }

        //private bool IsValidIpAddress(string ipAddress) => _ipAddresses.Contains(ipAddress);
        private bool IsValidIpAddress(string currentIp)
        {
            var currentIpSubList = currentIp.Split('.');

            if (currentIpSubList.Length != 4)
                return false;

            var index3 = currentIpSubList[2];
            var index2 = currentIpSubList[1];
            var index1 = currentIpSubList[0];

            var tempAddress = $"{index1}.{index2}.{index3}.*";
            var splitIp = _ipAddresses.Contains(tempAddress);

            if (!splitIp)
            {
                tempAddress = $"{index1}.{index2}.*.*";
                splitIp = _ipAddresses.Contains(tempAddress);
            }

            if (!splitIp)
            {
                tempAddress = $"{index1}.*.*.*";
                splitIp = _ipAddresses.Contains(tempAddress);
            }

            if (!splitIp)
            {
                tempAddress = $"*.*.*.*";
                splitIp = _ipAddresses.Contains(tempAddress);
            }

            if (_ipAddresses.Contains(currentIp) || splitIp)
                splitIp = true;

            return splitIp;
        }
    }
}
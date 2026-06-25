using HRMS.Shared.Domain.Enum;
using System.Security.Authentication;

namespace HRMS.API.Middleware
{
    public class LocalAPIMiddleware
    {
        private readonly string _env;
        private readonly bool _isProdVault = false;
        private readonly RequestDelegate _next;

        public LocalAPIMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _env = (configuration.GetValue<string>("Env") ?? string.Empty).ToLower();
            _isProdVault = $"{Key.Keys}-{_env}".ToLower().Equals("keys-prod");
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Host.Host.Contains("localhost", StringComparison.OrdinalIgnoreCase))
            {
                // Don't allow when prod key vault
                if (_isProdVault)
                    throw new AuthenticationException("User is not authorized.");

                // Don't allow when prod env
                if (_env.Contains("prod"))
                    throw new AuthenticationException("User is not authorized.");

                // Don't allow when env is different then dev and prod
                if (!_env.Contains("dev") && !_env.Contains("prod") && !_env.Contains("qa") && !_env.Contains("stage"))
                    throw new AuthenticationException("User is not authorized.");
            }

            await _next.Invoke(context);
        }
    }
}
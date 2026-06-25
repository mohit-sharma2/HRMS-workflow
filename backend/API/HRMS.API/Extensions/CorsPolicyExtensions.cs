namespace HRMS.API.Extensions
{
    public static class CorsPolicyExtensions
    {
        public static void ConfigureCorsPolicy(this IServiceCollection services, IConfiguration configuration)
        {
            var allowedOrigins = configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>()?
                .Where(origin => !string.IsNullOrWhiteSpace(origin))
                .ToArray() ?? [];

            services.AddCors(opt =>
            {
                opt.AddDefaultPolicy(builder =>
                {
                    if (allowedOrigins.Length > 0)
                    {
                        builder.WithOrigins(allowedOrigins)
                            .AllowAnyMethod()
                            .AllowAnyHeader()
                            .AllowCredentials();
                    }
                });
            });
        }
    }
}
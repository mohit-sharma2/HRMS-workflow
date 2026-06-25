using HRMS.Core.Postgres.Common;
using HRMS.Core.Postgres.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HRMS.Core.Postgres.Extensions
{
    public static class PostgresServiceExtensions
    {
        public static IServiceCollection AddPostgresDb(this IServiceCollection services, IConfiguration configuration)
        {
            var settings = configuration.GetSection("ConnectionStrings:Postgres").Get<PostgresDbSettings>()
                ?? throw new InvalidOperationException("PostgreSQL configuration is missing.");

            if (string.IsNullOrWhiteSpace(settings.ConnectionString))
                throw new InvalidOperationException("PostgreSQL connection string is not configured.");

            services.AddSingleton(settings);

            services.AddDbContext<PostgresDbContext>(options =>
            {
                options.UseNpgsql(settings.ConnectionString);
            });

            return services;
        }
    }
}

using HRMS.Core.Postgres.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HRMS.Core.Postgres
{
    public static class IApplicationBuilderExtensions
    {
        public static void EnsurePostgresDbIsCreated(this IApplicationBuilder builder)
        {
            using var serviceScope = builder.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope();
            var context = serviceScope.ServiceProvider.GetRequiredService<PostgresDbContext>();
            context.Database.EnsureCreated();
        }
    }
}

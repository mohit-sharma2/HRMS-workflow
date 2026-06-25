using HRMS.Core.Postgres.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TodoFeature.Application.Repository;

namespace TodoFeature.Infrastructure
{
    public static class ConfigureServiceExtension
    {
        public static IServiceCollection AddTodoDependency(this IServiceCollection services, IConfiguration configuration)
        {
            services.TryAddEnumerable(ServiceDescriptor.Scoped<IPostgresEntityConfigurator, TodoEntityConfigurator>());
            services.AddScoped<ITodoRepository, TodoRepository>();
            return services;
        }
    }
}

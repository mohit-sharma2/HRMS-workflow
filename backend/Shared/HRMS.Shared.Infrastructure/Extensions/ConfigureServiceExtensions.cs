using FluentValidation;
using HRMS.Core.Postgres.Extensions;
using HRMS.Core.Telemetry.Extensions;
using HRMS.Shared.Application.Behaviour;
using HRMS.Shared.Application.Extensions;
using HRMS.Shared.Application.Helper;
using HRMS.Shared.Application.Mapper;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace HRMS.Shared.Infrastructure.Extensions
{
    public static class ConfigureServiceExtensions
    {
        public static void AddInjectionApplication(this IServiceCollection services, IConfiguration configuration, Assembly[] assemblies)
        {
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssemblies(assemblies);
            });
            services.AddAutoMapper(cfg =>
            {
                cfg.AddMaps(assemblies);
            });
            services.AddValidatorsFromAssemblies(assemblies);
            services.AddTransient(typeof(BaseEntityAuditAction<,>));
            services.AddSingleton<ClaimsPrincipalExtensions>();
            services.AddSingleton<UserClaimCache>();
            services.AddTelemetryService();
            services.AddHttpContextAccessor();
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));

            services.AddMemoryCache();
        }

        public static void AddInjectionPostgres(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddPostgresDb(configuration);
        }
    }
}

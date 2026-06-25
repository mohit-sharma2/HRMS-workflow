using HRMS.Core.Postgres.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using RecruitmentFeature.Application.Repository;

namespace RecruitmentFeature.Infrastructure
{
    public static class ConfigureServiceExtension
    {
        public static IServiceCollection AddRecruitmentDependency(this IServiceCollection services, IConfiguration configuration)
        {
            services.TryAddEnumerable(ServiceDescriptor.Scoped<IPostgresEntityConfigurator, JobPostingEntityConfigurator>());
            services.TryAddEnumerable(ServiceDescriptor.Scoped<IPostgresEntityConfigurator, CandidateEntityConfigurator>());
            services.AddScoped<IJobPostingRepository, JobPostingRepository>();
            services.AddScoped<ICandidateRepository, CandidateRepository>();
            return services;
        }
    }
}

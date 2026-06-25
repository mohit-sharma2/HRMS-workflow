using RecruitmentFeature.Infrastructure;
using TodoFeature.Infrastructure;

namespace HRMS.API.RegisterDependencies
{
    public static class RepositoryRegistration
    {
        public static IServiceCollection AddModulesDependencyInjection(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddTodoDependency(configuration);
            services.AddRecruitmentDependency(configuration);
            return services;
        }
    }
}

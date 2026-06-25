using HRMS.Shared.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace HRMS.Shared.Infrastructure.AzureStorage
{
    public static class ConfigureServiceExtensions
    {
        public static void AddInjectionAzureStorage(this IServiceCollection services)

        {
            services.AddScoped<IAzureStorage, AzureStorage>();
            services.AddScoped<IHeicConversionService, HeicConversionService>();
        }
    }
}
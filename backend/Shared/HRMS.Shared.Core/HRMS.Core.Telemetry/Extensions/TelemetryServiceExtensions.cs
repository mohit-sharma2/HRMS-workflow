using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace HRMS.Core.Telemetry.Extensions
{
    /// <summary>
    /// Extension methods for registering TelemetryService in dependency injection
    /// </summary>
    public static class TelemetryServiceExtensions
    {
        /// <summary>
        /// Adds TelemetryService as a singleton to the service collection.
        /// Also ensures a TelemetryClient is always available, even when
        /// AddApplicationInsightsTelemetry() was not called (e.g. no connection
        /// string configured in local development), by falling back to an
        /// inactive TelemetryClient so DI resolution never fails.
        /// </summary>
        /// <param name="services">The service collection</param>
        /// <returns>The service collection for chaining</returns>
        public static IServiceCollection AddTelemetryService(this IServiceCollection services)
        {
            // Only register a fallback TelemetryClient if one isn't already
            // registered by AddApplicationInsightsTelemetry().
            services.TryAddSingleton(provider =>
            {
                var configuration = TelemetryConfiguration.CreateDefault();
                configuration.DisableTelemetry = true; // no-op, won't send anything
                return new TelemetryClient(configuration);
            });

            services.AddSingleton<ITelemetryService, TelemetryService>();
            return services;
        }
    }
}

// using Microsoft.Extensions.DependencyInjection;

// namespace HRMS.Core.Telemetry.Extensions
// {
//     /// <summary>
//     /// Extension methods for registering TelemetryService in dependency injection
//     /// </summary>
//     public static class TelemetryServiceExtensions
//     {
//         /// <summary>
//         /// Adds TelemetryService as a singleton to the service collection
//         /// </summary>
//         /// <param name="services">The service collection</param>
//         /// <returns>The service collection for chaining</returns>
//         public static IServiceCollection AddTelemetryService(this IServiceCollection services)
//         {
//             services.AddSingleton<ITelemetryService, TelemetryService>();
//             return services;
//         }
//     }
// }
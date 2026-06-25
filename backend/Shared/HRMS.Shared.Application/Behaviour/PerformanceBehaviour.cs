using HRMS.Core.Telemetry;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace HRMS.Shared.Application.Behaviour
{
    public class PerformanceBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : IRequest<TResponse>
    {
        private readonly ILogger<TRequest> _logger;
        private readonly IServiceProvider _serviceProvider;

        public PerformanceBehaviour(ILogger<TRequest> logger, IServiceProvider serviceProvider)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _serviceProvider = serviceProvider;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var telemetryService = scope.ServiceProvider.GetRequiredService<ITelemetryService>();

            var response1 = await telemetryService.TrackAsync(async () =>
            {
                var response = await next();
                return response;
            }, $"PerformanceBehaviour_{nameof(Handle)}", request);
            return response1;
        }
    }
}
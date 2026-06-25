using HRMS.Core.Telemetry;
using HRMS.Core.Telemetry.Exceptions;
using HotChocolate;
using HotChocolate.Execution;
using Microsoft.Data.SqlClient;
using System.Diagnostics;
using System.Net;
using System.Security.Authentication;

namespace HRMS.API.Middleware
{
    public class GraphQLErrorFilter : IErrorFilter
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<GraphQLErrorFilter> _logger;

        public GraphQLErrorFilter(
            IHttpContextAccessor httpContextAccessor,
            ILogger<GraphQLErrorFilter> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public IError OnError(IError error)
        {
            // HotChocolate validation/parsing errors often do not carry an Exception. Preserve the
            // GraphQL error message without reclassifying those request errors as HttpRequestException.
            var exception = error.Exception ?? new Exception(error.Message ?? "Server error");

            var statusCode = GetStatusCode(error, exception);

            var httpContext = _httpContextAccessor.HttpContext;

            if (httpContext != null)
            {
                // Store GraphQL status code for telemetry (so we use GraphQL status instead of HTTP 200)
                httpContext.Items["GraphQL_StatusCode"] = statusCode;

                try
                {
                    var stopwatch = Stopwatch.StartNew();
                    var requestId = Guid.NewGuid().ToString();
                    var startTime = DateTime.UtcNow;

                    // Add request ID to headers for correlation
                    //httpContext.Response.Headers.Add("X-Request-ID", requestId);

                    // Resolve ITelemetryService from the request scope with error handling
                    ITelemetryService? telemetryService = null;
                    try
                    {
                        telemetryService = httpContext.RequestServices
                            .GetRequiredService<ITelemetryService>();
                    }
                    catch (Exception serviceEx)
                    {
                        Console.WriteLine($"Failed to resolve ITelemetryServicetest in GraphQLErrorFilter: {serviceEx.Message}");
                    }

                    stopwatch.Stop();

                    string responseJson = "{\"error\":\"An error occurred processing the request\"}";
                    try
                    {
                        if (telemetryService != null)
                        {
                            responseJson = telemetryService.HandleExceptionResponseAsync(httpContext, exception);
                        }
                    }
                    catch (Exception telemetryEx)
                    {
                        Console.WriteLine($"Error in telemetry service HandleExceptionResponseAsync: {telemetryEx.Message}");
                        responseJson = $"{{\"error\":\"{exception.Message}\"}}";
                    }

                    // Get request body from Items (stored by ExceptionMiddleware for GraphQL requests)
                    var requestBody = httpContext.Items.TryGetValue("Request_Body", out var bodyObj) && bodyObj is string body
                        ? body
                        : "[Request body not captured]";

                    // Log the comprehensive request and exception details (fire and forget - don't
                    // block GraphQL response)
                    // CRITICAL: Using .GetAwaiter().GetResult() was blocking the thread and causing
                    // high CPU Now using fire-and-forget to avoid blocking
                    try
                    {
                        RequestDiagnosticsHelper.LogExceptionDetailsAsync(httpContext, responseJson, exception, stopwatch.ElapsedMilliseconds, requestId, startTime, requestBody, _logger);
                    }
                    catch (Exception logEx)
                    {
                        _logger.LogError(logEx, "Error in LogExceptionDetailsAsync");
                    }
                }
                catch (Exception ex)
                {
                    // If error logging fails, don't break GraphQL error handling
                    _logger.LogError(ex, "Critical error in GraphQLErrorFilter.OnError");
                }
            }

            // Prefer the actual exception message over HotChocolate's generic "Unexpected Execution Error"
            var displayMessage = GetDisplayMessage(error, exception);

            var extensions = new Dictionary<string, object?>
            {
                ["statusCode"] = statusCode,
                ["message"] = displayMessage,
                ["code"] = error.Code
            };

            try
            {
                return error.WithMessage(displayMessage).WithExtensions(extensions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating error extensions");
                // Return error without extensions if that fails
                return error;
            }
        }

        private static string GetDisplayMessage(IError error, Exception exception)
        {
            var errorMsg = error.Message;
            var exceptionMsg = exception?.Message;
            // When HotChocolate wraps a resolver exception, it sets error.Message to "Unexpected
            // Execution Error"
            if (string.Equals(errorMsg, "Unexpected Execution Error", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(exceptionMsg))
                return exceptionMsg;
            return !string.IsNullOrWhiteSpace(errorMsg) ? errorMsg : (exceptionMsg ?? "An error occurred");
        }

        private static int GetStatusCode(IError error, Exception exception)
        {
            // GraphQL validation/parsing errors (e.g. DateTime parse, invalid literal) -> 422 Unprocessable Entity
            if (error.Code == "AUTH_NOT_AUTHENTICATED")
                return StatusCodes.Status401Unauthorized;

            if (error.Code == "AUTH_NOT_AUTHORIZED")
                return StatusCodes.Status403Forbidden;

            if (error.Exception == null)
                return StatusCodes.Status422UnprocessableEntity;

            return exception switch
            {
                HttpRequestException httpEx when httpEx.StatusCode.HasValue => (int)httpEx.StatusCode.Value,
                HttpRequestException httpEx when httpEx.Data["StatusCode"] is HttpStatusCode sc => (int)sc,

                AuthenticationException => StatusCodes.Status401Unauthorized,
                BadRequestException => StatusCodes.Status400BadRequest,
                NotFoundException => StatusCodes.Status404NotFound,
                ForbiddenException => StatusCodes.Status403Forbidden,
                ValidationException => StatusCodes.Status422UnprocessableEntity,
                SqlException e when e.Number == 50000 => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status500InternalServerError
            };
        }

    }
}

using HRMS.Core.Telemetry.Exceptions;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Security.Authentication;
using System.Text;
using ApplicationException = HRMS.Core.Telemetry.Exceptions.ApplicationException;

namespace HRMS.Core.Telemetry
{
    public class TelemetryService : ITelemetryService
    {
        private const double DatabaseOperationSamplingRate = 0.2;
        private const int HighRuThreshold = 50;

        // Track all operations with RUs > 50
        private const int MaxPropertiesPerEvent = 10;

        // Sample 20% of successful DB operations
        private const int SlowOperationThresholdMs = 2000;

        // Cost optimization thresholds - can be configured
        private const double SuccessRequestSamplingRate = 0.1;

        private readonly ILogger<TelemetryService> _logger;
        private readonly Random _random = new Random();
        private readonly TelemetryClient _telemetryClient;
        // Sample 10% of successful requests Track all operations slower than 2s Limit properties to
        // reduce data size

        /// <summary>
        /// Dont Create obejct directly and should be singleton only
        /// </summary>
        /// <param name="instrumentationKey"></param>
        public TelemetryService(TelemetryClient telemetryClient, ILogger<TelemetryService> logger)
        {
#pragma warning disable CS0618 // Type or member is obsolete
            _telemetryClient = telemetryClient;

            //{
            //    InstrumentationKey = _configuration.ExtractKey<ApplicationInsights>("ApplicationInsights").InstrumentationKey,
            //};
#pragma warning restore CS0618 // Type or member is obsolete
            _logger = logger;
        }

        public string HandleExceptionResponseAsync(HttpContext httpContext, Exception exception)
        {
            var statusCode = GetStatusCode(exception);
            var response = new
            {
                title = GetTitle(exception),
                statuscode = statusCode,
                message = exception.Message,
                detail = exception.StackTrace,
                errors = GetErrors(exception)
            };
            httpContext.Response.ContentType = "application/json";
            httpContext.Response.StatusCode = statusCode;

            var settings = new JsonSerializerSettings
            {
                ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver()
            };

            string responseJson = JsonConvert.SerializeObject(response, settings);

            return responseJson;
        }

        /// <summary>
        /// Tracks the execution of an async method with telemetry and logging.
        /// </summary>
        /// <typeparam name="TResponse">The type of the response.</typeparam>
        /// <param name="action">The async method to execute.</param>
        /// <param name="methodName">The name of the method being tracked.</param>
        /// <param name="properties">Optional properties for telemetry tracking.</param>
        /// <returns>The response from the executed method.</returns>
        public void LogAsync(string log)
        {
            LogAsync("LogAsync", new Dictionary<string, string>() { { "Message", log } });
        }

        public void LogAsync<TRequest>(TRequest request)
        {
            var properties = new Dictionary<string, string>();
            properties["RequestBody"] = JsonConvert.SerializeObject(request);

            LogAsync(typeof(TRequest).Name, properties);
        }

        public void LogAsync(string log, IDictionary<string, string> properties)
        {
            _telemetryClient.TrackTrace(log, properties);
        }

        public async Task<TResponse> TrackAsync<TRequest, TResponse>(
                                                       Func<Task<TResponse>> action,
                       string methodName,
                       TRequest request,
                       IDictionary<string, string>? additionalProperties = null)
        {
            var properties = BuildTelemetryProperties(methodName, additionalProperties);

            try
            {
                _logger.LogInformation($"Starting execution of method: {methodName}");
                var stopwatch = Stopwatch.StartNew();

                // Execute the method
                var response = await action();

                stopwatch.Stop();
                var elapsedMilliseconds = stopwatch.ElapsedMilliseconds;
                if (elapsedMilliseconds > 2000) // Logging threshold for long-running methods
                {
                    var requestName = typeof(TRequest).Name;
                    _logger.LogWarning("Long Running Method Detected: {name} ({elapsedMilliseconds} ms) {@request}",
                        requestName,
                        elapsedMilliseconds,
                        JsonConvert.SerializeObject(request));
                }

                // Log success
                _logger.LogInformation($"Completed execution of method: {methodName} in {elapsedMilliseconds}ms");
                properties["DurationInMilliseconds"] = elapsedMilliseconds.ToString();

                // Track telemetry - only for slow methods (>2s) or sample successful ones to reduce costs
                var isSlow = elapsedMilliseconds > SlowOperationThresholdMs;
                if (ShouldTrackTelemetry(isError: false, isSlow, isHighCost: false, SuccessRequestSamplingRate))
                {
                    var limitedProperties = LimitProperties(properties);
                    _telemetryClient.TrackEvent($"{methodName}_Completed", limitedProperties);

                    // Only track metrics for slow operations to reduce costs
                    if (isSlow)
                    {
                        _telemetryClient.TrackMetric($"{methodName}_ExecutionTime", elapsedMilliseconds);
                    }
                }

                return response;
            }
            catch (Exception ex)
            {
                // Log and track exception
                _logger.LogError(ex, "An error occurred in method: {MethodName}", methodName);
                properties["ExceptionMessage"] = ex.Message;
                properties["StackTrace"] = ex.StackTrace ?? string.Empty;

                TrackException(ex, properties);

                throw; // Rethrow the exception to preserve the stack trace
            }
        }

        public async Task TrackAsync(
                      Func<Task> action,
                      string methodName,
                      HttpContext httpContext,
                      IDictionary<string, string>? additionalProperties = null)
        {
            var requestTelemetry = new RequestTelemetry
            {
                Name = $"{httpContext.Request.Method} {httpContext.Request.Path}",
                Timestamp = DateTimeOffset.UtcNow,
                Url = new Uri(httpContext.Request.GetDisplayUrl())
            };

            // Add HTTP method as a custom property instead of using obsolete HttpMethod property
            var properties = BuildTelemetryProperties(methodName, additionalProperties);
            properties["HttpMethod"] = httpContext.Request.Method;
            properties["Browser"] = httpContext.Request.Headers["User-Agent"].ToString();
            properties["User"] = httpContext.User?.Identity?.Name ?? "Anonymous";
            properties["IpAddress"] = httpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
            _logger.LogInformation($"Starting execution of method: {methodName}");
            var stopwatch = Stopwatch.StartNew();
            try
            {
                var requestBody = await ReadRequestBodyAsync(httpContext);
                var originalResponseBody = httpContext.Response.Body;

                //using var responseMemoryStream = new MemoryStream();
                //context.Response.Body = responseMemoryStream;

                // Execute the method
                await action();

                stopwatch.Stop();
                var elapsedMilliseconds = stopwatch.ElapsedMilliseconds;
                if (elapsedMilliseconds > 2000) // Logging threshold for long-running methods
                {
                    var requestName = httpContext.Request.Method;
                    _logger.LogWarning("Long Running Method Detected: {name} ({elapsedMilliseconds} ms) {@request}",
                        requestName,
                        elapsedMilliseconds,
                        requestBody);
                }

                // Log success
                _logger.LogInformation($"Completed execution of method: {methodName} in {elapsedMilliseconds}ms");

                requestTelemetry.Duration = stopwatch.Elapsed;
                requestTelemetry.ResponseCode = httpContext.Response.StatusCode.ToString();
                requestTelemetry.Success = httpContext.Response.StatusCode < 400;

                //var responseBody = await ReadResponseBodyAsync(responseMemoryStream);
                //context.Response.Body = originalResponseBody;

                // Limit body size to reduce costs (max 1KB)
                const int maxBodySize = 1024;
                var truncatedRequestBody = requestBody?.Length > maxBodySize
                    ? requestBody.Substring(0, maxBodySize) + "...[truncated]"
                    : requestBody;

                // Only include request body for errors to reduce costs
                if (httpContext.Response.StatusCode >= 400)
                {
                    properties["RequestBody"] = truncatedRequestBody ?? string.Empty;
                }

                properties["DurationInMilliseconds"] = elapsedMilliseconds.ToString();

                // Cost optimization: Sample successful requests, always track errors and slow requests
                var isError = httpContext.Response.StatusCode >= 400;
                var isSlow = elapsedMilliseconds > SlowOperationThresholdMs;

                // Always track request telemetry for errors and slow requests, sample successful ones
                if (isError || isSlow || ShouldTrackTelemetry(isError: false, isSlow: false, isHighCost: false, SuccessRequestSamplingRate))
                {
                    _telemetryClient.TrackRequest(requestTelemetry);
                }

                // Only track trace and event for errors, slow requests, or sampled successful ones
                if (isError || isSlow || ShouldTrackTelemetry(isError: false, isSlow: false, isHighCost: false, SuccessRequestSamplingRate))
                {
                    var limitedProperties = LimitProperties(properties);
                    _telemetryClient.TrackTrace($"Request completed: {httpContext.Request.Path}",
                        isError ? SeverityLevel.Warning : SeverityLevel.Information,
                        limitedProperties);
                    _telemetryClient.TrackEvent($"{methodName}_Completed", limitedProperties);
                }

                // Only track metrics for slow requests to reduce costs
                if (isSlow)
                {
                    _telemetryClient.TrackMetric($"{methodName}_ExecutionTime", elapsedMilliseconds);
                }
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                requestTelemetry.Duration = stopwatch.Elapsed;
                _telemetryClient.TrackRequest(requestTelemetry);

                // Log and track exception
                _logger.LogError(ex, "An error occurred in method: {MethodName}", methodName);
                _logger.LogError(ex, ex.Message);

                var responseJson = HandleExceptionResponseAsync(httpContext, ex);
                properties["ExceptionMessage"] = ex.Message;
                properties["StackTrace"] = ex.StackTrace ?? string.Empty;
                properties["RequestBody"] = await ReadRequestBodyAsync(httpContext);
                properties["ResponseBody"] = responseJson;
                properties["RequestPath"] = httpContext.Request.Path;
                properties["RequestMethod"] = httpContext.Request.Method;

                TrackException(ex, properties);
                throw; // Rethrow the exception to preserve the stack trace
            }
        }

        public void TrackBatchOperation(
            string operationName,
            string containerName,
            int totalItems,
            int successfulItems,
            int failedItems,
            TimeSpan duration,
            double averageRate,
            IDictionary<string, string>? additionalProperties = null)
        {
            var properties = BuildDatabaseTelemetryProperties(operationName, containerName, additionalProperties);
            properties["TotalItems"] = totalItems.ToString();
            properties["SuccessfulItems"] = successfulItems.ToString();
            properties["FailedItems"] = failedItems.ToString();
            properties["DurationInMilliseconds"] = duration.TotalMilliseconds.ToString("F2");
            properties["AverageRate"] = averageRate.ToString("F2");
            properties["SuccessRate"] = totalItems > 0 ? ((double)successfulItems / totalItems * 100).ToString("F2") : "0";
            properties["FailureRate"] = totalItems > 0 ? ((double)failedItems / totalItems * 100).ToString("F2") : "0";

            _logger.LogInformation("Batch operation - Operation: {OperationName}, Container: {ContainerName}, Total: {TotalItems}, Success: {SuccessfulItems}, Failed: {FailedItems}, Duration: {Duration}ms, Rate: {AverageRate}/s",
                operationName, containerName, totalItems, successfulItems, failedItems, duration.TotalMilliseconds, averageRate);

            // Cost optimization: Always track failures, sample successful batch operations
            var isError = failedItems > 0;
            var isSlow = duration.TotalMilliseconds > SlowOperationThresholdMs;
            var isLargeBatch = totalItems > 100; // Track large batches

            if (ShouldTrackTelemetry(isError, isSlow, isLargeBatch, DatabaseOperationSamplingRate))
            {
                var limitedProperties = LimitProperties(properties);

                // Only track key metrics to reduce costs - aggregate instead of individual metrics
                if (isError || isSlow || isLargeBatch)
                {
                    // Track only essential metrics for important operations
                    _telemetryClient.TrackMetric($"Database_Batch_{operationName}_TotalItems", totalItems);
                    _telemetryClient.TrackMetric($"Database_Batch_{operationName}_SuccessRate", totalItems > 0 ? (double)successfulItems / totalItems * 100 : 0);
                    _telemetryClient.TrackMetric($"Database_Batch_{operationName}_Duration", duration.TotalMilliseconds);
                }

                // Track event with detailed properties
                _telemetryClient.TrackEvent($"Database_Batch_{operationName}_Completed", limitedProperties);
            }
        }

        public void TrackDatabaseMetrics(
                    string operationName,
                    string containerName,
                    double requestUnits,
                    TimeSpan duration,
                    int itemCount = 0,
                    string? partitionKey = null,
                    IDictionary<string, string>? additionalProperties = null)
        {
            var properties = BuildDatabaseTelemetryProperties(operationName, containerName, additionalProperties);
            properties["RequestUnits"] = requestUnits.ToString("F2");
            properties["DurationInMilliseconds"] = duration.TotalMilliseconds.ToString("F2");
            properties["ItemCount"] = itemCount.ToString();
            properties["PartitionKey"] = partitionKey ?? "N/A";
            properties["RUsPerSecond"] = (requestUnits / duration.TotalSeconds).ToString("F2");
            properties["RUsPerItem"] = itemCount > 0 ? (requestUnits / itemCount).ToString("F2") : "N/A";

            _logger.LogInformation("Database metrics - Operation: {OperationName}, Container: {ContainerName}, RUs: {RequestUnits}, Duration: {Duration}ms, Items: {ItemCount}",
                operationName, containerName, requestUnits, duration.TotalMilliseconds, itemCount);

            // Cost optimization: Track high-RU operations and slow operations, sample others
            var isHighCost = requestUnits > HighRuThreshold;
            var isSlow = duration.TotalMilliseconds > SlowOperationThresholdMs;

            if (ShouldTrackTelemetry(isError: false, isSlow, isHighCost, DatabaseOperationSamplingRate))
            {
                var limitedProperties = LimitProperties(properties);

                // Only track essential metrics for important operations to reduce costs
                if (isHighCost || isSlow)
                {
                    _telemetryClient.TrackMetric($"Database_{operationName}_RequestUnits", requestUnits);
                    _telemetryClient.TrackMetric($"Database_{operationName}_Duration", duration.TotalMilliseconds);

                    if (itemCount > 0)
                    {
                        _telemetryClient.TrackMetric($"Database_{operationName}_RUsPerItem", requestUnits / itemCount);
                    }
                }

                // Track event with detailed properties
                _telemetryClient.TrackEvent($"Database_{operationName}_Metrics", limitedProperties);
            }
        }

        // Database-specific telemetry methods implementation
        public async Task<TResponse> TrackDatabaseOperationAsync<TRequest, TResponse>(
            Func<Task<TResponse>> operation,
            string operationName,
            string containerName,
            TRequest request,
            IDictionary<string, string>? additionalProperties = null)
        {
            var properties = BuildDatabaseTelemetryProperties(operationName, containerName, additionalProperties);
            properties["RequestType"] = typeof(TRequest).Name;
            properties["ResponseType"] = typeof(TResponse).Name;
            properties["RequestData"] = JsonConvert.SerializeObject(request);

            try
            {
                _logger.LogInformation("Starting database operation: {OperationName} on container: {ContainerName}", operationName, containerName);
                var stopwatch = Stopwatch.StartNew();

                // Execute the database operation
                var response = await operation();

                stopwatch.Stop();
                var elapsedMilliseconds = stopwatch.ElapsedMilliseconds;

                // Log success
                _logger.LogInformation("Completed database operation: {OperationName} on container: {ContainerName} in {ElapsedMilliseconds}ms",
                    operationName, containerName, elapsedMilliseconds);

                properties["DurationInMilliseconds"] = elapsedMilliseconds.ToString();
                properties["Status"] = "Success";

                // Cost optimization: Sample successful database operations
                var isSlow = elapsedMilliseconds > SlowOperationThresholdMs;
                if (ShouldTrackTelemetry(isError: false, isSlow, isHighCost: false, DatabaseOperationSamplingRate))
                {
                    var limitedProperties = LimitProperties(properties);
                    _telemetryClient.TrackEvent($"Database_{operationName}_Completed", limitedProperties);

                    // Only track metrics for slow operations to reduce costs
                    if (isSlow)
                    {
                        _telemetryClient.TrackMetric($"Database_{operationName}_ExecutionTime", elapsedMilliseconds);
                        _telemetryClient.TrackMetric($"Database_{containerName}_OperationTime", elapsedMilliseconds);
                    }
                }

                return response;
            }
            catch (Exception ex)
            {
                // Log and track exception
                _logger.LogError(ex, "Database operation failed: {OperationName} on container: {ContainerName}", operationName, containerName);
                properties["ExceptionMessage"] = ex.Message;
                properties["StackTrace"] = ex.StackTrace ?? string.Empty;
                properties["Status"] = "Failed";

                TrackException(ex, properties);
                throw;
            }
        }

        public async Task TrackDatabaseOperationAsync(
                    Func<Task> operation,
                    string operationName,
                    string containerName,
                    IDictionary<string, string>? additionalProperties = null)
        {
            var properties = BuildDatabaseTelemetryProperties(operationName, containerName, additionalProperties);

            try
            {
                _logger.LogInformation("Starting database operation: {OperationName} on container: {ContainerName}", operationName, containerName);
                var stopwatch = Stopwatch.StartNew();

                // Execute the database operation
                await operation();

                stopwatch.Stop();
                var elapsedMilliseconds = stopwatch.ElapsedMilliseconds;

                // Log success
                _logger.LogInformation("Completed database operation: {OperationName} on container: {ContainerName} in {ElapsedMilliseconds}ms",
                    operationName, containerName, elapsedMilliseconds);

                properties["DurationInMilliseconds"] = elapsedMilliseconds.ToString();
                properties["Status"] = "Success";

                // Cost optimization: Sample successful database operations
                var isSlow = elapsedMilliseconds > SlowOperationThresholdMs;
                if (ShouldTrackTelemetry(isError: false, isSlow, isHighCost: false, DatabaseOperationSamplingRate))
                {
                    var limitedProperties = LimitProperties(properties);
                    _telemetryClient.TrackEvent($"Database_{operationName}_Completed", limitedProperties);

                    // Only track metrics for slow operations to reduce costs
                    if (isSlow)
                    {
                        _telemetryClient.TrackMetric($"Database_{operationName}_ExecutionTime", elapsedMilliseconds);
                        _telemetryClient.TrackMetric($"Database_{containerName}_OperationTime", elapsedMilliseconds);
                    }
                }
            }
            catch (Exception ex)
            {
                // Log and track exception
                _logger.LogError(ex, "Database operation failed: {OperationName} on container: {ContainerName}", operationName, containerName);
                properties["ExceptionMessage"] = ex.Message;
                properties["StackTrace"] = ex.StackTrace ?? string.Empty;
                properties["Status"] = "Failed";

                TrackException(ex, properties);
                throw;
            }
        }

        public void TrackDatabaseQuery(
                    string queryText,
                    string containerName,
                    double requestUnits,
                    TimeSpan duration,
                    int resultCount,
                    string? partitionKey = null,
                    IDictionary<string, string>? additionalProperties = null)
        {
            var properties = BuildDatabaseTelemetryProperties("Query", containerName, additionalProperties);
            properties["QueryText"] = queryText.Length > 1000 ? queryText.Substring(0, 1000) + "..." : queryText;
            properties["RequestUnits"] = requestUnits.ToString("F2");
            properties["DurationInMilliseconds"] = duration.TotalMilliseconds.ToString("F2");
            properties["ResultCount"] = resultCount.ToString();
            properties["PartitionKey"] = partitionKey ?? "N/A";
            properties["RUsPerSecond"] = (requestUnits / duration.TotalSeconds).ToString("F2");
            properties["RUsPerResult"] = resultCount > 0 ? (requestUnits / resultCount).ToString("F2") : "N/A";

            _logger.LogInformation("Database query - Container: {ContainerName}, RUs: {RequestUnits}, Duration: {Duration}ms, Results: {ResultCount}, Partition: {PartitionKey}",
                containerName, requestUnits, duration.TotalMilliseconds, resultCount, partitionKey ?? "N/A");

            // Cost optimization: Track high-RU queries and slow queries, sample others
            var isHighCost = requestUnits > HighRuThreshold;
            var isSlow = duration.TotalMilliseconds > SlowOperationThresholdMs;

            if (ShouldTrackTelemetry(isError: false, isSlow, isHighCost, DatabaseOperationSamplingRate))
            {
                var limitedProperties = LimitProperties(properties);

                // Only track essential metrics for important queries to reduce costs
                if (isHighCost || isSlow)
                {
                    _telemetryClient.TrackMetric($"Database_Query_RequestUnits", requestUnits);
                    _telemetryClient.TrackMetric($"Database_Query_Duration", duration.TotalMilliseconds);

                    if (resultCount > 0)
                    {
                        _telemetryClient.TrackMetric($"Database_Query_RUsPerResult", requestUnits / resultCount);
                    }
                }

                // Track event with detailed properties
                _telemetryClient.TrackEvent("Database_Query_Executed", limitedProperties);
            }
        }

        public void TrackException(Exception exception, IDictionary<string, string>? additionalProperties = null)
        {
            var properties = BuildTelemetryProperties("Exception", additionalProperties);

            _logger.LogError(exception, "Exception tracked: {ExceptionMessage}", exception.Message);
            _telemetryClient.TrackException(exception, properties);
        }

        private static IDictionary<string, string> BuildDatabaseTelemetryProperties(string operationName, string containerName, IDictionary<string, string>? additionalProperties = null)
        {
            var properties = new Dictionary<string, string>
            {
                { "OperationName", operationName },
                { "ContainerName", containerName },
                { "DatabaseType", "PostgreSQL" },
                { "Timestamp", DateTimeOffset.UtcNow.ToString("O") }
            };

            if (additionalProperties != null)
            {
                foreach (var property in additionalProperties)
                {
                    // Avoid overwriting existing keys
                    if (!properties.ContainsKey(property.Key))
                    {
                        properties[property.Key] = property.Value;
                    }
                }
            }

            return properties;
        }

        private static IDictionary<string, string> BuildTelemetryProperties(string methodName, IDictionary<string, string>? additionalProperties = null)
        {
            var properties = new Dictionary<string, string>
            {
                { "MethodName", methodName }
            };

            if (additionalProperties != null)
            {
                foreach (var property in additionalProperties)
                {
                    // Avoid overwriting existing keys
                    if (!properties.ContainsKey(property.Key))
                    {
                        properties[property.Key] = property.Value;
                    }
                }
            }

            return properties;
        }

        private static IReadOnlyDictionary<string, string[]> GetErrors(Exception exception)
        {
            IReadOnlyDictionary<string, string[]>? errors = null;
            if (exception is ValidationException validationException)
            {
                errors = validationException.ErrorsDictionary;
            }
            return errors ?? new Dictionary<string, string[]>();
        }

        private static int GetStatusCode(Exception exception) =>
                    exception switch
                    {
                        AuthenticationException => StatusCodes.Status401Unauthorized,
                        BadRequestException => StatusCodes.Status400BadRequest,
                        NotFoundException => StatusCodes.Status404NotFound,
                        ForbiddenException => StatusCodes.Status403Forbidden,
                        ValidationException => StatusCodes.Status422UnprocessableEntity,
                        SqlException e when e.Number == 50000 => StatusCodes.Status400BadRequest,
                        _ => StatusCodes.Status500InternalServerError
                    };

        private static string GetTitle(Exception exception) =>
                    exception switch
                    {
                        ApplicationException applicationException => applicationException.Title,
                        _ => "Server Error"
                    };

        /// <summary>
        /// Limits the number of properties to reduce telemetry data size
        /// </summary>
        private IDictionary<string, string> LimitProperties(IDictionary<string, string> properties)
        {
            if (properties.Count <= MaxPropertiesPerEvent)
                return properties;

            // Keep most important properties and limit to MaxPropertiesPerEvent
            var limited = new Dictionary<string, string>();
            var importantKeys = new[] { "MethodName", "OperationName", "ContainerName", "ExceptionMessage", "Status", "DurationInMilliseconds" };

            // Add important properties first
            foreach (var key in importantKeys)
            {
                if (properties.ContainsKey(key))
                    limited[key] = properties[key];
            }

            // Add remaining properties up to limit
            foreach (var kvp in properties)
            {
                if (limited.Count >= MaxPropertiesPerEvent)
                    break;
                if (!limited.ContainsKey(kvp.Key))
                    limited[kvp.Key] = kvp.Value;
            }

            return limited;
        }

        private async Task<string> ReadRequestBodyAsync(HttpContext context)
        {
            var body = string.Empty;
            const int maxBodySize = 1024; // 1KB limit to reduce telemetry costs

            // Skip body reading for GET requests and health checks
            if (context == null || context.Request == null ||
                context.Request.Method == "GET" ||
                context.Request.Path.StartsWithSegments("/health", StringComparison.OrdinalIgnoreCase))
            {
                return body;
            }

            if (context.Request.ContentType != null && !context.Request.ContentType.Contains("multipart/form-data"))
            {
                // Allow the request body to be read multiple times
                context.Request.EnableBuffering();

                // Read the request body
                using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true, bufferSize: 1024);
                body = await reader.ReadToEndAsync();

                // Truncate large bodies to reduce telemetry costs
                if (body.Length > maxBodySize)
                {
                    body = body.Substring(0, maxBodySize) + "...[truncated]";
                }

                // Reset position so other middlewares/controllers can read the body
                context.Request.Body.Position = 0;
            }

            return body;
        }

        /// <summary>
        /// Determines if telemetry should be tracked based on sampling rate and conditions Always
        /// tracks errors, slow operations, and high-cost operations
        /// </summary>
        private bool ShouldTrackTelemetry(bool isError, bool isSlow, bool isHighCost, double samplingRate)
        {
            // Always track errors, slow operations, and high-cost operations
            if (isError || isSlow || isHighCost)
                return true;

            // Sample successful operations based on sampling rate
            return _random.NextDouble() < samplingRate;
        }

        public class ApplicationInsights
        {
            public string? InstrumentationKey { get; set; }
        }
    }
}
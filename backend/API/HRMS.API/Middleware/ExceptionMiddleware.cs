using HRMS.API.Telemetry;
using HRMS.Core.Telemetry;
using Microsoft.ApplicationInsights.DataContracts;
using System.Diagnostics;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace HRMS.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly IHostEnvironment _hostEnvironment;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly RequestDelegate _next;
        private readonly IServiceProvider _serviceProvider;

        public ExceptionMiddleware(
            RequestDelegate next,
            ILogger<ExceptionMiddleware> logger,
            IHostEnvironment hostEnvironment,
            IServiceProvider serviceProvider)
        {
            _next = next;
            _logger = logger;
            _hostEnvironment = hostEnvironment;
            _serviceProvider = serviceProvider;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            // Enable buffering so request body can be read multiple times (for error logging)
            httpContext.Request.EnableBuffering();

            // Clear previous request's GraphQL operation so it doesn't leak; also allows current
            // request's telemetry to be enriched before we overwrite it on the next request.
            GraphQLOperationContext.CurrentOperationName = null;

            var stopwatch = Stopwatch.StartNew();
            var requestId = Guid.NewGuid().ToString();
            var startTime = DateTime.UtcNow;

            // Add request ID to headers for correlation
            httpContext.Response.Headers["X-Request-ID"] = requestId;

            // Extract GraphQL operation name for telemetry tracking
            await ExtractGraphQLOperationNameAsync(httpContext);

            using var scope = _serviceProvider.CreateScope();
            var telemetryService = scope.ServiceProvider.GetRequiredService<ITelemetryService>();

            try
            {
                bool pipelineExecuted = false;
                try
                {
                    await telemetryService.TrackAsync(async () =>
                    {
                        pipelineExecuted = true;
                        await _next(httpContext);
                    }, $"{nameof(ExceptionMiddleware)}_{nameof(InvokeAsync)}", httpContext);
                }
                catch (Exception ex) when (!pipelineExecuted)
                {
                    // If telemetry tracking fails, still process the request
                    _logger.LogWarning(ex, "Error in telemetry tracking, continuing with request processing");
                    await _next(httpContext);
                }

                stopwatch.Stop();

                // Skip logging for health checks and static endpoints to reduce CPU usage
                var pathCheck = httpContext.Request.Path.Value?.ToLowerInvariant() ?? "";
                if (pathCheck.Contains("/health") || pathCheck.Contains("/ping") || pathCheck.Contains("/status") ||
                    pathCheck.StartsWith("/swagger") || pathCheck.StartsWith("/voyager"))
                {
                    return; // Skip logging for these endpoints
                }

                // Fire and forget - don't block request pipeline Capture all HttpContext data
                // synchronously before it's disposed
                var path = httpContext.Request.Path.Value ?? "";
                var method = httpContext.Request.Method;
                var statusCode = httpContext.Response.StatusCode;
                var durationMs = stopwatch.ElapsedMilliseconds;
                var userId = httpContext.User?.FindFirst("id")?.Value;
                var userName = httpContext.User?.FindFirst(ClaimTypes.Name)?.Value;
                var userEmail = httpContext.User?.FindFirst(ClaimTypes.Email)?.Value;
                var userAgent = httpContext.Request.Headers["User-Agent"].ToString();
                var referer = httpContext.Request.Headers["Referer"].ToString();
                var queryString = httpContext.Request.QueryString.ToString();
                var contentType = httpContext.Request.ContentType;
                var contentLength = httpContext.Request.ContentLength;
                var requestUrl = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}{httpContext.Request.Path}{httpContext.Request.QueryString}";
                var ipAddress = RequestDiagnosticsHelper.GetClientIpAddress(httpContext);

                //// Format request JSON synchronously (request body is not captured for successful requests to reduce overhead)
                //string requestJson;
                //try
                //{
                //    requestJson = System.Text.Json.JsonSerializer.Serialize(new
                //    {
                //        method = method,
                //        path = path,
                //        queryString = queryString,
                //        contentType = contentType,
                //        contentLength = contentLength
                //    });
                //}
                //catch
                //{
                //    requestJson = $"{{\"method\":\"{method}\",\"path\":\"{path}\"}}";
                //}

                // Request body is not captured for successful requests (only for errors) This
                // reduces overhead and avoids issues with disposed HttpContext var requestBody =
                // "[Request body not captured for successful requests]";

                string requestJson = await RequestDiagnosticsHelper.FormatRequestAsync(httpContext);
                var requestBody = await RequestDiagnosticsHelper.ReadRequestBodyAsync(httpContext);

                _ = Task.Run(async () =>
                {
                    try
                    {
                        await LogSuccessfulRequestAsyncInternal(requestJson, requestBody, path, method, statusCode, durationMs, requestId, startTime,
                            userId, userName, userEmail, userAgent, referer, queryString, contentType, contentLength, requestUrl, ipAddress);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to log slow request {RequestId}", requestId);
                    }
                });
            }
            catch (Exception ex)
            {
                stopwatch.Stop();

                try
                {
                    var responseJson = telemetryService.HandleExceptionResponseAsync(httpContext, ex);

                    // Capture context data before HttpContext might be disposed
                    var path = httpContext.Request.Path.Value ?? "";
                    var method = httpContext.Request.Method;
                    var statusCode = httpContext.Response.StatusCode;
                    var durationMs = stopwatch.ElapsedMilliseconds;

                    // Capture request body for error logging (from Items for GraphQL, or read from stream)
                    var requestBody = await GetRequestBodyForErrorLoggingAsync(httpContext);

                    // Log the comprehensive request and exception details (fire and forget)
                    RequestDiagnosticsHelper.LogExceptionDetailsAsync(httpContext, responseJson, ex, durationMs, requestId, startTime, requestBody, _logger);

                    try
                    {
                        await httpContext.Response.WriteAsync(responseJson);
                    }
                    catch (Exception writeEx)
                    {
                        _logger.LogError(writeEx, "Failed to write exception response to client for request {RequestId}", requestId);
                        // Response may have already started or connection closed
                    }
                }
                catch (Exception handlerEx)
                {
                    _logger.LogError(handlerEx, "Critical error in exception handler for request {RequestId}. Original exception: {OriginalException}", requestId, ex.Message);

                    // Last resort - try to send a basic error response
                    try
                    {
                        if (!httpContext.Response.HasStarted)
                        {
                            httpContext.Response.StatusCode = 500;
                            await httpContext.Response.WriteAsync("{\"error\":\"An internal server error occurred\"}");
                        }
                    }
                    catch
                    {
                        // If we can't even write a response, log and continue
                        _logger.LogError("Unable to send error response to client");
                    }
                }
            }
        }

        /// <summary>
        /// Extracts the leaf field name (e.g. createServiceRequest) from nested structures like:
        /// mutation ServiceRequestMutation { serviceRequestMutation { createServiceRequest(...) {
        /// ... } } } Uses the last field with arguments - the actual resolver being called.
        /// </summary>
        private static string? ExtractLeafFieldNameFromQuery(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return null;

            string? lastFieldWithArgs = null;
            for (var i = 0; i < query.Length; i++)
            {
                if (!char.IsLetter(query[i]) && query[i] != '_')
                    continue;

                var start = i;
                while (i < query.Length && (char.IsLetterOrDigit(query[i]) || query[i] == '_'))
                    i++;

                var name = query.Substring(start, i - start);
                // Skip whitespace
                while (i < query.Length && char.IsWhiteSpace(query[i]))
                    i++;
                if (i < query.Length && query[i] == '(')
                    lastFieldWithArgs = name;
            }

            return lastFieldWithArgs;
        }

        /// <summary>
        /// Gets the request body for error logging. Uses stored body from Items (GraphQL) or reads
        /// from stream.
        /// </summary>
        private static async Task<string> GetRequestBodyForErrorLoggingAsync(HttpContext context)
        {
            try
            {
                if (context.Items.TryGetValue("Request_Body", out var stored) && stored is string body)
                    return body;

                if (context.Request.ContentLength is null or 0)
                    return string.Empty;

                if (context.Request.ContentType?.Contains("multipart/form-data", StringComparison.OrdinalIgnoreCase) == true)
                    return "[Multipart form data - not captured]";

                context.Request.EnableBuffering();
                context.Request.Body.Position = 0;

                const int maxSize = 10240;
                var buffer = new byte[Math.Min(context.Request.ContentLength ?? 0, maxSize)];
                var bytesRead = await context.Request.Body.ReadAsync(buffer.AsMemory(0, buffer.Length));
                var result = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                context.Request.Body.Position = 0;

                return bytesRead >= maxSize ? result + "... [TRUNCATED]" : result;
            }
            catch (Exception)
            {
                return "[Request body could not be read]";
            }
        }

        /// <summary>
        /// Extracts the GraphQL operation name from the request body and stores it in
        /// HttpContext.Items, GraphQLOperationContext (AsyncLocal), Activity tags, and
        /// RequestTelemetry so Application Insights shows the operation name (e.g. "GraphQL:
        /// ServiceRequestMutation") instead of "POST /graphql".
        /// </summary>
        private async Task ExtractGraphQLOperationNameAsync(HttpContext context)
        {
            // Only process GraphQL POST requests with JSON body
            if (!context.Request.Path.StartsWithSegments("/graphql", StringComparison.OrdinalIgnoreCase) ||
                context.Request.Method != "POST" ||
                string.IsNullOrEmpty(context.Request.ContentType) ||
                !context.Request.ContentType.Contains("json", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            try
            {
                // Enable buffering so the body can be read multiple times
                context.Request.EnableBuffering();

                // Read the request body
                using var reader = new StreamReader(
                    context.Request.Body,
                    encoding: Encoding.UTF8,
                    detectEncodingFromByteOrderMarks: false,
                    bufferSize: 4096,
                    leaveOpen: true);

                var body = await reader.ReadToEndAsync();

                // Reset the stream position for downstream middleware
                context.Request.Body.Position = 0;

                // Store request body for error logging (truncated to 10KB to limit storage)
                const int maxBodySize = 10240;
                context.Items["Request_Body"] = body.Length > maxBodySize
                    ? body.Substring(0, maxBodySize) + "... [TRUNCATED]"
                    : body;

                // Extract the operation name from the JSON payload
                var operationName = ExtractOperationName(body);

                if (!string.IsNullOrWhiteSpace(operationName))
                {
                    // Store in HttpContext.Items for use within request pipeline
                    context.Items["GraphQL_OperationName"] = operationName;
                    // Store in AsyncLocal so GraphQLTelemetryInitializer can read it when SDK sends telemetry
                    GraphQLOperationContext.CurrentOperationName = operationName;

                    // Add to Activity.Current and RequestTelemetry for Application Insights
                    var currentActivity = System.Diagnostics.Activity.Current;
                    if (currentActivity != null)
                    {
                        currentActivity.SetTag("GraphQLOperation", operationName);
                        currentActivity.DisplayName = $"GraphQL: {operationName}";
                    }

                    var requestTelemetry = context.Features.Get<RequestTelemetry>();
                    if (requestTelemetry != null)
                    {
                        requestTelemetry.Properties["GraphQLOperation"] = operationName;
                        requestTelemetry.Name = $"GraphQL: {operationName}";
                    }

                    // Store query type (query/mutation) if we can detect it
                    var queryType = ExtractQueryType(body);
                    if (!string.IsNullOrWhiteSpace(queryType))
                    {
                        context.Items["GraphQL_QueryType"] = queryType;
                        currentActivity?.SetTag("GraphQLQueryType", queryType);
                        if (requestTelemetry != null)
                        {
                            requestTelemetry.Properties["GraphQLQueryType"] = queryType;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to extract GraphQL operation name from request body");
            }
        }

        private string? ExtractOperationName(string body)
        {
            if (string.IsNullOrWhiteSpace(body))
                return null;

            try
            {
                using var document = JsonDocument.Parse(body);
                var root = document.RootElement;

                // Prefer leaf field from query (e.g. createServiceRequest) over operationName (e.g. ServiceRequestMutation)
                if (root.TryGetProperty("query", out var queryElement))
                {
                    var query = queryElement.GetString();
                    if (!string.IsNullOrWhiteSpace(query))
                    {
                        var name = ExtractOperationNameFromQuery(query);
                        if (!string.IsNullOrWhiteSpace(name))
                            return name;
                    }
                }

                // Fallback: use operationName from request if provided
                if (root.TryGetProperty("operationName", out var operationNameElement))
                {
                    var operationName = operationNameElement.GetString();
                    if (!string.IsNullOrWhiteSpace(operationName))
                        return operationName;
                }

                return null;
            }
            catch (JsonException)
            {
                return null;
            }
        }

        private string? ExtractOperationNameFromQuery(string query)
        {
            // Prefer the leaf mutation/query field (e.g. createServiceRequest) over the operation
            // name (e.g. ServiceRequestMutation) for more meaningful telemetry.
            var leafField = ExtractLeafFieldNameFromQuery(query);
            if (!string.IsNullOrWhiteSpace(leafField))
                return leafField;

            // Fallback: extract operation name for patterns like "query GetUsers { ... }" or
            // "mutation CreateUser { ... }"
            var trimmed = query.Trim();
            var patterns = new[] { "query ", "mutation ", "subscription " };

            foreach (var pattern in patterns)
            {
                var index = trimmed.IndexOf(pattern, StringComparison.OrdinalIgnoreCase);
                if (index >= 0)
                {
                    var afterPattern = trimmed.Substring(index + pattern.Length).TrimStart();
                    var endIndex = afterPattern.IndexOfAny(new[] { '(', '{', ' ', '\n', '\r' });
                    if (endIndex > 0)
                    {
                        var name = afterPattern.Substring(0, endIndex).Trim();
                        if (!string.IsNullOrWhiteSpace(name) && char.IsLetter(name[0]))
                            return name;
                    }
                    else if (afterPattern.Length > 0 && char.IsLetter(afterPattern[0]))
                    {
                        var name = new string(afterPattern.TakeWhile(c => char.IsLetterOrDigit(c) || c == '_').ToArray());
                        if (!string.IsNullOrWhiteSpace(name))
                            return name;
                    }
                }
            }

            return null;
        }

        private string? ExtractQueryType(string body)
        {
            if (string.IsNullOrWhiteSpace(body))
                return null;

            try
            {
                using var document = JsonDocument.Parse(body);
                var root = document.RootElement;

                if (root.TryGetProperty("query", out var queryElement))
                {
                    var query = queryElement.GetString();
                    if (!string.IsNullOrWhiteSpace(query))
                    {
                        var trimmed = query.Trim();
                        if (trimmed.StartsWith("mutation", StringComparison.OrdinalIgnoreCase))
                            return "mutation";
                        if (trimmed.StartsWith("subscription", StringComparison.OrdinalIgnoreCase))
                            return "subscription";
                        // Default to query (including anonymous queries that start with '{')
                        return "query";
                    }
                }

                return null;
            }
            catch (JsonException)
            {
                return null;
            }
        }

        private async Task LogSuccessfulRequestAsyncInternal(string requestJson, string requestBody, string path, string method, int statusCode, long durationMs, string requestId, DateTime startTime,
            string? userId, string? userName, string? userEmail, string userAgent, string referer, string queryString, string? contentType, long? contentLength, string requestUrl, string ipAddress)
        {
            try
            {
                //var logEntry = new RequestResponseLog
                //{
                //    Id = requestId,
                //    RequestName = path,
                //    Request = requestJson,
                //    RequestBody = requestBody,
                //    Response = $"{{\"statusCode\": {statusCode}, \"message\": \"Success\"}}",
                //    ExceptionMessage = null,
                //    CreatedAt = startTime,
                //    IpAddress = ipAddress,
                //    HttpMethod = method,
                //    StatusCode = statusCode,
                //    DurationMs = durationMs,
                //    UserId = userId,
                //    UserName = userName,
                //    UserEmail = userEmail,
                //    CorrelationId = requestId,
                //    UserAgent = userAgent,
                //    Referer = referer,
                //    RequestUrl = requestUrl,
                //    QueryString = queryString,
                //    ContentType = contentType,
                //    ContentLength = contentLength,
                //    IsException = false
                //};

                //using (var scope = _serviceProvider.CreateScope())
                //{
                //    var requestResponseRepository = scope.ServiceProvider.GetRequiredService<IRequestResponseRepository>();
                //    await requestResponseRepository.AddItemAsync(logEntry);
                //}
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log successful request {RequestId}", requestId);
            }
        }
    }
}
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace HRMS.API.Middleware
{
    internal static class RequestDiagnosticsHelper
    {
        private static readonly HashSet<string> SensitiveHeaders =
            [
                "Authorization",
                "Cookie",
                "Set-Cookie",
                "X-Api-Key",
                "X-Auth-Token",
                "Proxy-Authorization"
            ];

        public static async Task<string> FormatRequestAsync(HttpContext context)
        {
            try
            {
                context.Request.EnableBuffering();

                var requestData = new Dictionary<string, object>
                {
                    ["method"] = context.Request.Method,
                    ["url"] = $"{context.Request.Scheme}://{context.Request.Host}{context.Request.Path}{context.Request.QueryString}",
                    ["path"] = context.Request.Path,
                    ["queryString"] = context.Request.QueryString.ToString(),
                    ["headers"] = context.Request.Headers
                                    .ToDictionary(
                                        h => h.Key,
                                        h => SensitiveHeaders.Contains(h.Key)
                                            ? "[REDACTED]"
                                            : h.Value.ToString())
                    ["contentType"] = context.Request.ContentType ?? string.Empty,
                    ["contentLength"] = context.Request.ContentLength.GetValueOrDefault(),
                    ["userAgent"] = context.Request.Headers["User-Agent"].ToString(),
                    ["referer"] = context.Request.Headers["Referer"].ToString(),
                    ["correlationId"] = context.Request.Headers["X-Correlation-ID"].ToString(),
                    ["timestamp"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss.fff")
                };

                if (context.User?.Identity?.IsAuthenticated == true)
                {
                    requestData["user"] = new
                    {
                        userId = context.User.FindFirst("id")?.Value,
                        userName = context.User.FindFirst(ClaimTypes.Name)?.Value,
                        email = context.User.FindFirst(ClaimTypes.Email)?.Value,
                        roles = context.User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToArray()
                    };
                }

                if (context.Request.HasFormContentType)
                {
                    await AddFormDataAsync(context, requestData);
                }
                else if (context.Request.ContentLength > 0)
                {
                    await AddRequestBodyAsync(context, requestData);
                }

                return JsonSerializer.Serialize(requestData, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = false
                });
            }
            catch (Exception ex)
            {
                return JsonSerializer.Serialize(new
                {
                    error = $"Failed to format request: {ex.Message}",
                    method = context.Request.Method,
                    path = context.Request.Path.ToString(),
                    timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss.fff")
                }, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = false
                });
            }
        }

        public static string GetClientIpAddress(HttpContext context)
        {
            //var forwardedHeader = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            //if (!string.IsNullOrEmpty(forwardedHeader))
            //{
            //    return forwardedHeader.Split(',')[0].Trim();
            //}

            //var realIpHeader = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            //if (!string.IsNullOrEmpty(realIpHeader))
            //{
            //    return realIpHeader;
            //}

            return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        public static void LogExceptionDetailsAsync(
            HttpContext httpContext,
            string responseJson,
            Exception exception,
            long durationMs,
            string requestId,
            DateTime startTime,
            string requestBody,
            ILogger logger)
        {
            var request = CaptureRequestContext(httpContext, requestId);

            _ = Task.Run(async () =>
            {
                try
                {
                    await LogExceptionDetailsInternalAsync(exception, durationMs, requestId, request, logger);
                }
                catch (Exception logEx)
                {
                    logger.LogError(logEx, "Failed to log exception details for request {RequestId}", requestId);
                }
            });
        }

        public static async Task<string> ReadRequestBodyAsync(HttpContext context)
        {
            try
            {
                context.Request.EnableBuffering();

                var maxSize = Math.Min(context.Request.ContentLength ?? 0, 10240);
                if (maxSize <= 0)
                {
                    return string.Empty;
                }

                using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
                var buffer = new char[maxSize];
                var bytesRead = await reader.ReadAsync(buffer.AsMemory(0, (int)maxSize));
                var body = new string(buffer, 0, bytesRead);

                context.Request.Body.Position = 0;

                if (body.Length > 5000)
                {
                    body = body.Substring(0, 5000) + "... [TRUNCATED]";
                }

                return body;
            }
            catch (Exception ex)
            {
                return $"[Error reading request body: {ex.Message}]";
            }
        }

        private static async Task AddFormDataAsync(HttpContext context, IDictionary<string, object> requestData)
        {
            try
            {
                var formOptions = new Microsoft.AspNetCore.Http.Features.FormOptions
                {
                    MultipartBodyLengthLimit = 100 * 1024 * 1024,
                    ValueLengthLimit = 50 * 1024 * 1024,
                    KeyLengthLimit = 1024,
                    MultipartHeadersLengthLimit = 16384,
                    MultipartBoundaryLengthLimit = 128,
                    BufferBody = false
                };

                var form = await context.Request.ReadFormAsync(formOptions);
                var formData = new Dictionary<string, object>();

                foreach (var field in form)
                {
                    formData[field.Key] = field.Value.ToString();
                }

                foreach (var file in form.Files)
                {
                    formData[file.Name] = CreateFileMetadata(file);
                }

                requestData["formData"] = formData;
            }
            catch (InvalidDataException ex) when (ex.Message.Contains("Multipart body length limit"))
            {
                requestData["formData"] = new
                {
                    error = "Multipart body length limit exceeded - form data too large to process",
                    formFieldsCount = "Unable to determine - form too large",
                    filesCount = "Unable to determine - form too large"
                };
            }
            catch (IOException ex) when (ex.Message.Contains("not enough space on the disk"))
            {
                requestData["formData"] = new
                {
                    error = "Insufficient disk space on server - upload size too large for current environment",
                    recommendation = "Please reduce file size or contact administrator",
                    formFieldsCount = "Unable to determine - disk space issue",
                    filesCount = "Unable to determine - disk space issue"
                };
            }
            catch (Exception ex)
            {
                requestData["formData"] = new
                {
                    error = $"Error reading form data: {ex.Message}",
                    errorType = ex.GetType().Name
                };
            }
        }

        private static async Task AddRequestBodyAsync(HttpContext context, IDictionary<string, object> requestData)
        {
            try
            {
                var buffer = new byte[Math.Min(context.Request.ContentLength ?? 0, 10240)];
                var bytesRead = await context.Request.Body.ReadAsync(buffer.AsMemory(0, buffer.Length));
                var requestBody = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                context.Request.Body.Position = 0;

                if (requestBody.Length > 5000)
                {
                    requestBody = requestBody.Substring(0, 5000) + "... [TRUNCATED]";
                }

                requestData["body"] = requestBody;
            }
            catch (Exception ex)
            {
                requestData["body"] = $"[Error reading body: {ex.Message}]";
            }
        }

        private static RequestLogContext CaptureRequestContext(HttpContext httpContext, string requestId)
        {
            return new RequestLogContext(
                Path: httpContext.Request.Path.Value ?? "",
                Method: httpContext.Request.Method,
                UserId: httpContext.User?.FindFirst("id")?.Value,
                CorrelationId: requestId);
        }

        private static object CreateFileMetadata(IFormFile file)
        {
            return new
            {
                fileName = file.FileName,
                contentType = file.ContentType,
                length = file.Length
            };
        }

        private static Task LogExceptionDetailsInternalAsync(
                    Exception exception,
            long durationMs,
            string requestId,
            RequestLogContext request,
            ILogger logger)
        {
            try
            {
                logger.LogError(exception,
                    "Request failed - Method: {Method}, Path: {Path}, Duration: {Duration}ms, RequestId: {RequestId}, User: {User}",
                    request.Method,
                    request.Path,
                    durationMs,
                    requestId,
                    request.UserId ?? "Anonymous");
            }
            catch (Exception logEx)
            {
                logger.LogError(logEx, "Failed to log exception details for request {RequestId}", requestId);
            }

            return Task.CompletedTask;
        }

        private sealed record RequestLogContext(
            string Path,
            string Method,
            string? UserId,
            string CorrelationId);
    }
}
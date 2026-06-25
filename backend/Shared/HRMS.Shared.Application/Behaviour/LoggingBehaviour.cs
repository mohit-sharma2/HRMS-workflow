using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Net.Http.Headers;
using System.Text.Json;

namespace HRMS.Shared.Application.Behaviour
{
    public class LoggingBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : IRequest<TResponse>
    {
        private static readonly HashSet<string> _sensitiveHeaders = new(StringComparer.OrdinalIgnoreCase)
        {
            "Authorization",
            "Cookie",
            "Set-Cookie",
            "X-Api-Key",
            "X-Auth-Token",
            "Proxy-Authorization",
        };

        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<LoggingBehaviour<TRequest, TResponse>> _logger;
        private readonly IServiceProvider _serviceProvider;  // Inject the service provider for scoped service resolution

        public LoggingBehaviour(ILogger<LoggingBehaviour<TRequest, TResponse>> logger,
                                IServiceProvider serviceProvider,
                                IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            // Log Request
            string requestJson = await FormatRequestAsync();
            _logger.LogInformation("HRMS Architecture Request Handling: { name } {@request }", typeof(TRequest).Name, requestJson);

            // Execute the next handler in the pipeline
            var response = await next();

            // Log Response
            //string responseJson = await FormatResponseAsync(response);
            //_logger.LogInformation("PropVivo Architecture Response Handling: { name } {@response }", typeof(TResponse).Name, responseJson);

            // Store request and response logs into the database (Cosmos DB)
            //await StoreLogInDatabaseAsync(typeof(TRequest).Name, requestJson, null);

            return response;
        }

        // Method to handle multipart or regular requests
        private async Task<string> FormatRequestAsync()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null)
                return string.Empty;

            context.Request.EnableBuffering();  // Enable re-reading the request body
            var formData = new Dictionary<string, object>();

            if (context.Request.HasFormContentType)
            {
                var form = await context.Request.ReadFormAsync();
                foreach (var field in form)
                {
                    formData[field.Key] = field.Value.ToString();
                }

                // Handle file uploads
                foreach (var file in form.Files)
                {
                    formData[file.Name] = new
                    {
                        fileName = file.FileName,
                        contentType = file.ContentType,
                        length = file.Length
                    };
                }
            }
            else
            {
                const int MaxLogBodyBytes = 64 * 1024; // 64 KB cap for logging
                var contentLength = (int)Math.Min(context.Request.ContentLength ?? 0, MaxLogBodyBytes);
                var buffer = new byte[contentLength];
                if (buffer.Length > 0)
                    await context.Request.Body.ReadExactlyAsync(buffer);
                var requestBody = System.Text.Encoding.UTF8.GetString(buffer);
                context.Request.Body.Position = 0;  // Reset the stream position to allow further reading

                formData["body"] = new
                {
                    method = context.Request.Method,
                    url = context.Request.Path,
                    headers = context.Request.Headers.ToDictionary(
                        h => h.Key,
                        h => _sensitiveHeaders.Contains(h.Key) ? "[REDACTED]" : h.Value.ToString()),
                    body = requestBody
                };
            }

            // Serialize the formData dictionary to JSON
            return JsonSerializer.Serialize(formData, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        }

        // Method to handle multipart or regular responses
        private async Task<string> FormatResponseAsync(TResponse response)
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null)
                return JsonSerializer.Serialize(response);

            var contentType = context.Response.ContentType;

            if (contentType != null && contentType.Contains("multipart/form-data", StringComparison.OrdinalIgnoreCase))
            {
                // Handle multipart form-data response here as necessary
                var boundary = GetBoundary(contentType);
                var formData = new Dictionary<string, object>();

                if (!string.IsNullOrEmpty(boundary))
                {
                    using (var stream = new MemoryStream())
                    {
                        await context.Response.Body.CopyToAsync(stream);
                        var reader = new MultipartReader(boundary, stream);
                        MultipartSection? section;
                        while ((section = await reader.ReadNextSectionAsync()) != null)
                        {
                            if (ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var contentDisposition))
                            {
                                if (!string.IsNullOrEmpty(contentDisposition.FileName.ToString()))
                                {
                                    formData[contentDisposition.Name.ToString() ?? string.Empty] = new
                                    {
                                        fileName = contentDisposition.FileName.Value,
                                        contentType = section.ContentType,
                                        length = section.Body.Length
                                    };
                                }
                                else
                                {
                                    using (var sr = new StreamReader(section.Body))
                                    {
                                        formData[contentDisposition.Name.ToString() ?? string.Empty] = await sr.ReadToEndAsync();
                                    }
                                }
                            }
                        }
                    }

                    // Serialize and return as JSON
                    return JsonSerializer.Serialize(formData, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
                }
            }

            // Handle non-multipart response (e.g., JSON or plain text)
            return JsonSerializer.Serialize(response);
        }

        // Helper method to extract boundary from content-type header
        private string? GetBoundary(string contentType)
        {
            var elements = contentType.Split(' ');
            var boundaryElement = elements.FirstOrDefault(e => e.StartsWith("boundary="));
            return boundaryElement?.Substring("boundary=".Length).Trim('"');
        }

        // Store log entry in database
        //private async Task StoreLogInDatabaseAsync(string requestName, string requestJson, string responseJson)
        //{
        //    var logEntry = new RequestResponseLog
        //    {
        //        Id = Guid.NewGuid().ToString(),
        //        RequestName = requestName,
        //        Request = requestJson,
        //        Response = responseJson,
        //        CreatedAt = DateTime.UtcNow,
        //        IpAddress = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress.ToString()
        //    };

        //    // Resolve the scoped service within the method, not in the constructor
        //    using (var scope = _serviceProvider.CreateScope())
        //    {
        //        var requestResponseRepository = scope.ServiceProvider.GetRequiredService<IRequestResponseRepository>();
        //        await requestResponseRepository.AddItemAsync(logEntry);
        //    }
        //}
    }
}
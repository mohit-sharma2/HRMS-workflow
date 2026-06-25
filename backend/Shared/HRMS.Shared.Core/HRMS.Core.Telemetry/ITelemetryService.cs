using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace HRMS.Core.Telemetry
{
    public interface ITelemetryService
    {
        string HandleExceptionResponseAsync(HttpContext httpContext, Exception exception);

        void LogAsync(string log);

        void LogAsync<TRequest>(TRequest request);

        void LogAsync(string log, IDictionary<string, string> properties);

        Task<TResponse> TrackAsync<TRequest, TResponse>(
                                       Func<Task<TResponse>> action,
               string methodName,
               TRequest request,
               IDictionary<string, string>? properties = null);

        Task TrackAsync(
              Func<Task> action,
              string methodName,
              HttpContext request,
              IDictionary<string, string>? properties = null);

        void TrackBatchOperation(
            string operationName,
            string containerName,
            int totalItems,
            int successfulItems,
            int failedItems,
            TimeSpan duration,
            double averageRate,
            IDictionary<string, string>? additionalProperties = null);

        void TrackDatabaseMetrics(
            string operationName,
            string containerName,
            double requestUnits,
            TimeSpan duration,
            int itemCount = 0,
            string? partitionKey = null,
            IDictionary<string, string>? additionalProperties = null);

        // Database-specific telemetry methods
        Task<TResponse> TrackDatabaseOperationAsync<TRequest, TResponse>(
            Func<Task<TResponse>> operation,
            string operationName,
            string containerName,
            TRequest request,
            IDictionary<string, string>? additionalProperties = null);

        Task TrackDatabaseOperationAsync(
            Func<Task> operation,
            string operationName,
            string containerName,
            IDictionary<string, string>? additionalProperties = null);

        void TrackDatabaseQuery(
            string queryText,
            string containerName,
            double requestUnits,
            TimeSpan duration,
            int resultCount,
            string? partitionKey = null,
            IDictionary<string, string>? additionalProperties = null);

        void TrackException(Exception ex, IDictionary<string, string>? properties = null);
    }
}
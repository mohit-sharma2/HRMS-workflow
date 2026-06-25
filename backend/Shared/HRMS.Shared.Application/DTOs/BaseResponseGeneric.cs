using Newtonsoft.Json;

namespace HRMS.Shared.Application.DTOs
{
    public class BaseReponseGeneric<T>
    {
        [JsonProperty("data")]
        public T? Data { get; set; }

        [JsonProperty("message")]
        public string? Message { get; set; }

        [JsonProperty("statuscode")]
        public int StatusCode { get; set; }

        [JsonProperty("success")]
        public bool Success { get; set; }
    }

    /// <summary>
    /// Common error payload for WebSocket error responses (e.g. WebSocketExceptionRunner,
    /// HandleMessagesRepository). Used with WebSocketBaseResponseGeneric&lt;Error&gt; when
    /// ResponseType is Error.
    /// </summary>
    public class Error
    {
        [JsonProperty("errorCode")]
        public string? ErrorCode { get; set; }

        [JsonProperty("errorDetails")]
        public string? ErrorDetails { get; set; }

        /// <summary>
        /// Stable identifier for the error kind (e.g. ArgumentNull, Validation, NotFound). Use this
        /// to distinguish errors that share the same HTTP status (e.g. multiple 400 types).
        /// </summary>
        [JsonProperty("errorType")]
        public string? ErrorType { get; set; }
    }

    public class Property<T>
    {
        public string? Value { get; set; }

        public T? ValueId { get; set; }
    }
}
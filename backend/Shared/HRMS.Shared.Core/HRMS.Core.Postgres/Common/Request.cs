using Newtonsoft.Json;

namespace HRMS.Core.Postgres.Common
{
    public class ExecutionContext
    {
        public string? SessionId { get; set; }

        public string? TrackingId { get; set; }

        public Uri? Uri { get; set; }

        public string? UserId { get; set; }
    }

    public class ExecutionRequest
    {
        public ExecutionContext? ExecutionContext { get; set; }
        public string? RequestSubType { get; set; }
        public string? RequestType { get; set; }
    }

    public class OrderByCriteria
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string? Order { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string? OrderBy { get; set; }
    }

    public class PageCriteria
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public bool EnablePage { get; set; } = true;

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public int PageSize { get; set; } = 10;

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public int Skip { get; set; }
    }

    public class Request : ExecutionRequest
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public OrderByCriteria? OrderByCriteria { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public PageCriteria? PageCriteria { get; set; }
    }
}

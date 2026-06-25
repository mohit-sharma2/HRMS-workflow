namespace HRMS.Shared.Application.DTOs
{
    public class AdobeConfig
    {
        public string? ApiUrl { get; set; }
        public string? ClientId { get; set; }
        public string? ClientSecret { get; set; }
    }

    public class BlobStorage
    {
        public string? AccountKey { get; set; }
        public string? AccountName { get; set; }
        public string? ConnectionString { get; set; }
        public string CountTable { get; set; } = "NotificationCount";
        public string? DefaultEndpointsProtocol { get; set; }
        public string? EndpointSuffix { get; set; }
        public string TableName { get; set; } = "NotificationAlerts";
        public string? Url { get; set; }
    }

    public class JWT
    {
        public string? Issuer { get; set; }
        public string? Key { get; set; }
    }
}
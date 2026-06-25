namespace HRMS.Core.HttpHelper.Services.Constant
{
    public static class HttpClientConstants
    {
        public static class HeaderKey
        {
            public const string ApiKey = "x-api-key";
            public const string Authorization = "Authorization";
            public const string ClientId = "client_id";
            public const string ClientSecret = "client_secret";
        }

        public static class MediaType
        {
            public const string MEDIA_TYPE_JSON = "application/json";
            public const string MEDIA_TYPE_OCTET_STREAM = "application/octet-stream";
            public const string MEDIA_TYPE_X_WWW_FORM_URLENCODED = "application/x-www-form-urlencoded";
        }
    }
}
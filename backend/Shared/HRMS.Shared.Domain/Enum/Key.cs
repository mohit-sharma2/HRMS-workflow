using HotChocolate;

namespace HRMS.Shared.Domain.Enum
{
    public enum Key
    {
        [GraphQLName("Keys")]
        Keys,

        [GraphQLName("BlobStorage")]
        BlobStorage,

        [GraphQLName("LocalIpAllowed")]
        LocalIpAllowed,

        [GraphQLName("Redis")]
        Redis,

        [GraphQLName("Jwt")]
        Jwt,

        [GraphQLName("Adobe")]
        Adobe,

        [GraphQLName("ApplicationInsights")]
        ApplicationInsights,
    }
}
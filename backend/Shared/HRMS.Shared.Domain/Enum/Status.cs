using HotChocolate;

namespace HRMS.Shared.Domain.Enum
{
    public enum Status
    {
        [GraphQLName("Active")]
        Active,

        [GraphQLName("Inactive")]
        Inactive,

        [GraphQLName("Deleted")]
        Deleted
    }
}
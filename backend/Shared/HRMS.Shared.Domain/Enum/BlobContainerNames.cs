using HotChocolate;

namespace HRMS.Shared.Domain.Enum
{
    public enum BlobContainerNames
    {
        [GraphQLName("Users")]
        users,

        [GraphQLName("Download")]
        download,

        [GraphQLName("CountryFlag")]
        countryflag,

        [GraphQLName("BulkUpload")]
        bulkupload
    }
}
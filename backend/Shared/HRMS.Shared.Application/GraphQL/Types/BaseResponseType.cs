using HRMS.Shared.Application.DTOs;

namespace HRMS.Shared.Application.GraphQL.Types
{
    public class BaseResponseType<T> : ObjectType<BaseResponse<T>>
    {
        protected override void Configure(IObjectTypeDescriptor<BaseResponse<T>> descriptor)
        {
            descriptor.Description("Standard API response wrapper");

            descriptor.Field(r => r.Success)
                .Description("Whether the operation was successful");

            descriptor.Field(r => r.Message)
                .Description("Response message");

            descriptor.Field(r => r.Data)
                .Description("The response data");

            descriptor.Field(r => r.StatusCode)
               .Description("Response code");
        }
    }
}
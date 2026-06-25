using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Application.Modules.MediaFeature;
using HRMS.Shared.Application.Modules.MediaFeature.BulkUploadMedia;
using MediatR;

namespace HRMS.Shared.Application.GraphQL
{
    [ExtendObjectType(typeof(Mutation))]
    public class MediaMutation
    {
        public MediaMutation()
        {
        }

        [GraphQLName("bulkUpload")]
        public async Task<BaseResponse<BulkUploadMediaResponse>> BulkUploadMediaAsync(BulkUploadMediaV1Request request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("GenerateUploadUrl")]
        public async Task<BaseResponse<UploadMediaV2Response>> GenerateUploadUrlAsync(UploadMediaV2Request request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("Upload")]
        public async Task<BaseResponse<UploadMediaResponse>> UploadMediaAsync(UploadMediaV1Request request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }
    }
}
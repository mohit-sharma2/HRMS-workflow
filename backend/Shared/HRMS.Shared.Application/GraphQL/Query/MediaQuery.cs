using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Application.Modules.MediaFeature;
using MediatR;

namespace HRMS.Shared.Application.GraphQL
{
    [ExtendObjectType(typeof(Query))]
    public class MediaQuery
    {
        [GraphQLName("downloadMultipleMedia")]
        public async Task<BaseResponse<DownloadMultipleMediaResponse>> DownloadMultipleMediaAsync(DownloadMultipleMediaRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("downloadV1")]
        public async Task<BaseResponse<DownloadMediaV1Response>> DownloadV1Async(DownloadMediaV1Request request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("downloadZip")]
        public async Task<BaseResponse<DownloadMediaV1Response>> DownloadZip(DownloadZipMediaV1Request request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("preview")]
        public async Task<BaseResponse<PreviewMediaResponse>> PreviewAsync(PreviewMediaRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }
    }
}
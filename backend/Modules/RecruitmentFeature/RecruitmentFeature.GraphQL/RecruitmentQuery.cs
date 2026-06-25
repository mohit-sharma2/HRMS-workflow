using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Application.GraphQL;
using HotChocolate;
using HotChocolate.Types;
using MediatR;
using RecruitmentFeature.Application.DTO;

namespace RecruitmentFeature.GraphQL
{
    [ExtendObjectType(typeof(Query))]
    public class RecruitmentQuery
    {
        [GraphQLName("getAllJobPostings")]
        public async Task<BaseResponsePagination<GetAllJobPostingsResponse>> GetAllJobPostingsAsync(
            GetAllJobPostingsRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("getAllCandidates")]
        public async Task<BaseResponsePagination<GetAllCandidatesResponse>> GetAllCandidatesAsync(
            GetAllCandidatesRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }
    }
}

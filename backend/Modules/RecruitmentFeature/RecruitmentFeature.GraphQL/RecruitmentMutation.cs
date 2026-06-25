using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Application.GraphQL;
using HotChocolate;
using HotChocolate.Types;
using MediatR;
using RecruitmentFeature.Application.DTO;

namespace RecruitmentFeature.GraphQL
{
    [ExtendObjectType(typeof(Mutation))]
    public class RecruitmentMutation
    {
        // ─── JobPosting ────────────────────────────────────────────────────────

        [GraphQLName("createJobPosting")]
        public async Task<BaseResponse<CreateJobPostingResponse>> CreateJobPostingAsync(
            CreateJobPostingRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("updateJobPosting")]
        public async Task<BaseResponse<UpdateJobPostingResponse>> UpdateJobPostingAsync(
            UpdateJobPostingRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("deleteJobPosting")]
        public async Task<BaseResponse<DeleteJobPostingResponse>> DeleteJobPostingAsync(
            DeleteJobPostingRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        // ─── Candidate ─────────────────────────────────────────────────────────

        [GraphQLName("createCandidate")]
        public async Task<BaseResponse<CreateCandidateResponse>> CreateCandidateAsync(
            CreateCandidateRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("updateCandidate")]
        public async Task<BaseResponse<UpdateCandidateResponse>> UpdateCandidateAsync(
            UpdateCandidateRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("updateCandidateStage")]
        public async Task<BaseResponse<UpdateCandidateResponse>> UpdateCandidateStageAsync(
            UpdateCandidateStageRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("deleteCandidate")]
        public async Task<BaseResponse<DeleteCandidateResponse>> DeleteCandidateAsync(
            DeleteCandidateRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }
    }
}

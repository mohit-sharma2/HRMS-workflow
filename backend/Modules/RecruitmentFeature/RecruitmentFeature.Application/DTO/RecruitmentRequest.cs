using HRMS.Core.Postgres.Common;
using HRMS.Shared.Application.DTOs;
using MediatR;

namespace RecruitmentFeature.Application.DTO
{
    // ─── JobPosting DTOs ───────────────────────────────────────────────────────

    public interface IJobPostingIdDto
    {
        string? JobPostingId { get; set; }
    }

    public interface IJobPostingPayloadDto
    {
        string? Title { get; set; }
        string? Department { get; set; }
        string? Location { get; set; }
        string? JobType { get; set; }
        string? ExperienceRequired { get; set; }
        string? SalaryRange { get; set; }
        string? Status { get; set; }
        string? Description { get; set; }
        DateTime? ClosingDate { get; set; }
    }

    public class CreateJobPostingDto : IJobPostingPayloadDto
    {
        public string? Title { get; set; }
        public string? Department { get; set; }
        public string? Location { get; set; }
        public string? JobType { get; set; }
        public string? ExperienceRequired { get; set; }
        public string? SalaryRange { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public DateTime? ClosingDate { get; set; }
    }

    public class CreateJobPostingRequest : ExecutionRequest, IRequest<BaseResponse<CreateJobPostingResponse>>
    {
        public CreateJobPostingDto? RequestParam { get; set; }
    }

    public class UpdateJobPostingDto : IJobPostingIdDto, IJobPostingPayloadDto
    {
        public string? JobPostingId { get; set; }
        public string? Title { get; set; }
        public string? Department { get; set; }
        public string? Location { get; set; }
        public string? JobType { get; set; }
        public string? ExperienceRequired { get; set; }
        public string? SalaryRange { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public DateTime? ClosingDate { get; set; }
    }

    public class UpdateJobPostingRequest : ExecutionRequest, IRequest<BaseResponse<UpdateJobPostingResponse>>
    {
        public UpdateJobPostingDto? RequestParam { get; set; }
    }

    public class DeleteJobPostingDto : IJobPostingIdDto
    {
        public string? JobPostingId { get; set; }
    }

    public class DeleteJobPostingRequest : ExecutionRequest, IRequest<BaseResponse<DeleteJobPostingResponse>>
    {
        public DeleteJobPostingDto? RequestParam { get; set; }
    }

    public class GetAllJobPostingsDto
    {
        public string? JobPostingId { get; set; }
        public string? Department { get; set; }
        public string? Status { get; set; }
        public string? Keyword { get; set; }
    }

    public class GetAllJobPostingsRequest : Request, IRequest<BaseResponsePagination<GetAllJobPostingsResponse>>
    {
        public GetAllJobPostingsDto? RequestParam { get; set; }
    }

    // ─── Candidate DTOs ────────────────────────────────────────────────────────

    public interface ICandidateIdDto
    {
        string? CandidateId { get; set; }
    }

    public interface ICandidatePayloadDto
    {
        string? FullName { get; set; }
        string? Email { get; set; }
        string? Phone { get; set; }
        string? JobPostingId { get; set; }
        string? AppliedRole { get; set; }
        string? Status { get; set; }
        int Rating { get; set; }
        string? Skills { get; set; }
        string? ExperienceYears { get; set; }
        string? ExpectedSalary { get; set; }
        string? NoticePeriod { get; set; }
        string? ResumeUrl { get; set; }
        string? Notes { get; set; }
        DateTime? InterviewDate { get; set; }
    }

    public class CreateCandidateDto : ICandidatePayloadDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? JobPostingId { get; set; }
        public string? AppliedRole { get; set; }
        public string? Status { get; set; }
        public int Rating { get; set; }
        public string? Skills { get; set; }
        public string? ExperienceYears { get; set; }
        public string? ExpectedSalary { get; set; }
        public string? NoticePeriod { get; set; }
        public string? ResumeUrl { get; set; }
        public string? Notes { get; set; }
        public DateTime? InterviewDate { get; set; }
    }

    public class CreateCandidateRequest : ExecutionRequest, IRequest<BaseResponse<CreateCandidateResponse>>
    {
        public CreateCandidateDto? RequestParam { get; set; }
    }

    public class UpdateCandidateDto : ICandidateIdDto, ICandidatePayloadDto
    {
        public string? CandidateId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? JobPostingId { get; set; }
        public string? AppliedRole { get; set; }
        public string? Status { get; set; }
        public int Rating { get; set; }
        public string? Skills { get; set; }
        public string? ExperienceYears { get; set; }
        public string? ExpectedSalary { get; set; }
        public string? NoticePeriod { get; set; }
        public string? ResumeUrl { get; set; }
        public string? Notes { get; set; }
        public DateTime? InterviewDate { get; set; }
    }

    public class UpdateCandidateRequest : ExecutionRequest, IRequest<BaseResponse<UpdateCandidateResponse>>
    {
        public UpdateCandidateDto? RequestParam { get; set; }
    }

    public class DeleteCandidateDto : ICandidateIdDto
    {
        public string? CandidateId { get; set; }
    }

    public class DeleteCandidateRequest : ExecutionRequest, IRequest<BaseResponse<DeleteCandidateResponse>>
    {
        public DeleteCandidateDto? RequestParam { get; set; }
    }

    public class GetAllCandidatesDto
    {
        public string? CandidateId { get; set; }
        public string? JobPostingId { get; set; }
        public string? Status { get; set; }
        public string? Keyword { get; set; }
    }

    public class GetAllCandidatesRequest : Request, IRequest<BaseResponsePagination<GetAllCandidatesResponse>>
    {
        public GetAllCandidatesDto? RequestParam { get; set; }
    }

    // ─── Stage Update ──────────────────────────────────────────────────────────

    public class UpdateCandidateStageDto : ICandidateIdDto
    {
        public string? CandidateId { get; set; }
        public string? Status { get; set; }
        public DateTime? InterviewDate { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateCandidateStageRequest : ExecutionRequest, IRequest<BaseResponse<UpdateCandidateResponse>>
    {
        public UpdateCandidateStageDto? RequestParam { get; set; }
    }
}

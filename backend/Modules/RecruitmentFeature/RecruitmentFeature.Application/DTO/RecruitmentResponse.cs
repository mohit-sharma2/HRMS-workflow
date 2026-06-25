using HRMS.Shared.Application.DTOs;

namespace RecruitmentFeature.Application.DTO
{
    // ─── JobPosting Responses ──────────────────────────────────────────────────

    public class CreateJobPostingResponse
    {
        public string? JobPostingId { get; set; }
    }

    public class UpdateJobPostingResponse
    {
        public string? JobPostingId { get; set; }
    }

    public class DeleteJobPostingResponse
    {
        public string? JobPostingId { get; set; }
    }

    public class GetAllJobPostingsItem
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
        public DateTime? CreatedOn { get; set; }
        public int TotalCandidates { get; set; }
    }

    public class GetAllJobPostingsResponse
    {
        public List<GetAllJobPostingsItem>? JobPostings { get; set; }
    }

    // ─── Candidate Responses ───────────────────────────────────────────────────

    public class CreateCandidateResponse
    {
        public string? CandidateId { get; set; }
    }

    public class UpdateCandidateResponse
    {
        public string? CandidateId { get; set; }
    }

    public class DeleteCandidateResponse
    {
        public string? CandidateId { get; set; }
    }

    public class GetAllCandidatesItem
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
        public DateTime? CreatedOn { get; set; }
        public UserBaseItem? UserContext { get; set; }
    }

    public class GetAllCandidatesResponse
    {
        public List<GetAllCandidatesItem>? Candidates { get; set; }
    }
}

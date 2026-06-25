using HRMS.Core.Postgres.Common;
using HRMS.Shared.Domain.Entity;

namespace RecruitmentFeature.Domain
{
    public class Candidate : BaseEntity
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
        public UserBase? UserContext { get; set; }
    }
}

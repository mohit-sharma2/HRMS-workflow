using HRMS.Core.Postgres.Common;
using HRMS.Shared.Domain.Entity;

namespace RecruitmentFeature.Domain
{
    public class JobPosting : BaseEntity
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
        public UserBase? UserContext { get; set; }
        public string? CreatedByUserId { get; set; }
    }
}

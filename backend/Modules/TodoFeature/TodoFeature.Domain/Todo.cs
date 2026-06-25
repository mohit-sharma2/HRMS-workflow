using HRMS.Core.Postgres.Common;
using HRMS.Shared.Domain.Entity;

namespace TodoFeature.Domain
{
    public class Todo : BaseEntity
    {
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public string? Title { get; set; }
        public UserBase? UserContext { get; set; }
        public string? UserId { get; set; }
    }
}

namespace HRMS.Core.Postgres.Common
{
    public abstract class BaseEntity : DocumentBase
    {
        public string? CreatedByUserId { get; set; }

        public string? CreatedByUserName { get; set; }

        public DateTime? CreatedOn { get; set; }

        public virtual string Id { get; set; } = string.Empty;

        public string? ModifiedByUserId { get; set; }

        public string? ModifiedByUserName { get; set; }

        public DateTime? ModifiedOn { get; set; }

        public string? ProfilePicture { get; set; }
    }
}

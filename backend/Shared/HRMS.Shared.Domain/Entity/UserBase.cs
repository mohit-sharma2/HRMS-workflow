namespace HRMS.Shared.Domain.Entity
{
    public class UserBase
    {
        public string? CreatedByUserId { get; set; }
        public string? CreatedByUserName { get; set; }
        public DateTime? CreatedOn { get; set; }
        public string? ModifiedByUserId { get; set; }
        public string? ModifiedByUserName { get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string? ProfilePicture { get; set; }
    }
}
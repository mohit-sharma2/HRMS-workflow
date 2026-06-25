using HRMS.Shared.Domain.Entity;

namespace HRMS.Shared.Application.DTOs
{
    public class UserBaseItem : UserBase
    {
        public string? CustomProfilePicture { get; set; }
        public string? CustomUserName { get; set; }
    }
}
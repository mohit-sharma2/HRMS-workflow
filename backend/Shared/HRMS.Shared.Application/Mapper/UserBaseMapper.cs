using AutoMapper;
using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Domain.Entity;

namespace HRMS.Shared.Application.Mapper
{
    public sealed class UserBaseMapper : Profile
    {
        public UserBaseMapper()
        {
            CreateMap<UserBase, UserBaseItem>()
               .ForMember(dest => dest.ProfilePicture, opt => opt.MapFrom<ProfilePictureResolverByCreatedByUserId<UserBase, UserBaseItem>>());
        }
    }
}
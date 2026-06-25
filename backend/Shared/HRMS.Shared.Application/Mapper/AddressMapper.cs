using AutoMapper;
using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Domain.Entity;

namespace HRMS.Shared.Application.Mapper
{
    public class AddressMapper : Profile
    {
        public AddressMapper()
        {
            CreateMap<AddressDto, Address>();
            CreateMap<Address, AddressItem>();
        }
    }
}
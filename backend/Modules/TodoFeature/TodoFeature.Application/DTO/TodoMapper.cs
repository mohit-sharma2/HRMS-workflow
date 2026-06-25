using AutoMapper;
using TodoFeature.Domain;

namespace TodoFeature.Application.DTO
{
    public class CreateTodoMapper : Profile
    {
        public CreateTodoMapper()
        {
            CreateMap<CreateTodoDto, Todo>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(_ => Guid.NewGuid().ToString()))
                .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(_ => DateTime.UtcNow));
        }
    }

    public class UpdateTodoMapper : Profile
    {
        public UpdateTodoMapper()
        {
            CreateMap<UpdateTodoDto, Todo>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.TodoId))
                .ForMember(dest => dest.ModifiedOn, opt => opt.MapFrom(_ => DateTime.UtcNow));
        }
    }

    public sealed class GetAllTodoMapper : Profile
    {
        public GetAllTodoMapper()
        {
            CreateMap<Todo, GetAllTodosItem>()
                .ForMember(dest => dest.TodoId, opt => opt.MapFrom(src => src.Id));
        }
    }
}

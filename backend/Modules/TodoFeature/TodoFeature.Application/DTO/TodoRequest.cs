using HRMS.Core.Postgres.Common;
using HRMS.Shared.Application.DTOs;
using MediatR;

namespace TodoFeature.Application.DTO
{
    public interface ITodoIdDto
    {
        string? TodoId { get; set; }
    }

    public interface ITodoPayloadDto
    {
        string? Description { get; set; }
        DateTime? DueDate { get; set; }
        bool IsCompleted { get; set; }
        string? Title { get; set; }
        string? UserId { get; set; }
    }

    public class CreateTodoDto : ITodoPayloadDto
    {
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public string? Title { get; set; }
        public string? UserId { get; set; }
    }

    public class CreateTodoRequest : ExecutionRequest, IRequest<BaseResponse<CreateTodoResponse>>
    {
        public CreateTodoDto? RequestParam { get; set; }
    }

    public class UpdateTodoDto : ITodoIdDto, ITodoPayloadDto
    {
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public string? Title { get; set; }
        public string? TodoId { get; set; }
        public string? UserId { get; set; }
    }

    public class UpdateTodoRequest : ExecutionRequest, IRequest<BaseResponse<UpdateTodoResponse>>
    {
        public UpdateTodoDto? RequestParam { get; set; }
    }

    public class DeleteTodoDto : ITodoIdDto
    {
        public string? TodoId { get; set; }
    }

    public class DeleteTodoRequest : ExecutionRequest, IRequest<BaseResponse<DeleteTodoResponse>>
    {
        public DeleteTodoDto? RequestParam { get; set; }
    }

    public class GetAllTodosDto
    {
        public bool? IsCompleted { get; set; }
        public string? Keyword { get; set; }
        public string? TodoId { get; set; }
        public string? UserId { get; set; }
    }

    public class GetAllTodosRequest : Request, IRequest<BaseResponsePagination<GetAllTodosResponse>>
    {
        public GetAllTodosDto? RequestParam { get; set; }
    }
}

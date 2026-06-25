using HRMS.Shared.Application.DTOs;

namespace TodoFeature.Application.DTO
{
    public class CreateTodoResponse
    {
        public string? TodoId { get; set; }
    }

    public class UpdateTodoResponse
    {
        public string? TodoId { get; set; }
    }

    public class DeleteTodoResponse
    {
        public string? TodoId { get; set; }
    }

    public class GetAllTodosItem
    {
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public string? Title { get; set; }
        public string? TodoId { get; set; }
        public UserBaseItem? UserContext { get; set; }
        public string? UserId { get; set; }
    }

    public class GetAllTodosResponse
    {
        public List<GetAllTodosItem>? Todos { get; set; }
    }
}

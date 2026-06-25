using HRMS.Core.Postgres.Repositories;
using TodoFeature.Application.DTO;
using TodoFeature.Domain;

namespace TodoFeature.Application.Repository
{
    public interface ITodoRepository : IPostgresRepository<Todo>
    {
        Task<(IEnumerable<Todo> result, int count)> GetAllTodosWithCountAsync(GetAllTodosRequest request);

        Task<Todo?> GetTodoAsync(GetAllTodosRequest request);
    }
}

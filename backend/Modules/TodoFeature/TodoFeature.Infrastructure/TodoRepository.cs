using HRMS.Core.Postgres.Helper;
using HRMS.Core.Postgres.Data;
using HRMS.Core.Postgres.Interfaces;
using HRMS.Core.Postgres.Repositories;
using HRMS.Core.Telemetry;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq.Expressions;
using TodoFeature.Application.DTO;
using TodoFeature.Application.Repository;
using TodoFeature.Domain;

namespace TodoFeature.Infrastructure
{
    public class TodoEntityConfigurator : IPostgresEntityConfigurator
    {
        public void Configure(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Todo>(entity =>
            {
                entity.ToTable("Todo");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(128);
                entity.Property(e => e.DocumentType).IsRequired().HasMaxLength(128);
                entity.Property(e => e.Title).HasMaxLength(500);
                entity.HasIndex(e => e.DocumentType);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.IsCompleted);
                entity.OwnsOne(e => e.UserContext);
            });
        }
    }

    public class TodoRepository : PostgresDbRepository<Todo>, ITodoRepository
    {
        public TodoRepository(
            PostgresDbContext context,
            ILogger<TodoRepository> logger,
            ITelemetryService telemetryService,
            IHttpContextAccessor httpContextAccessor)
            : base(context, logger, telemetryService, httpContextAccessor)
        { }

        public override string TableName { get; } = nameof(Todo);

        public override string GenerateId(Todo entity) => Guid.NewGuid().ToString();

        public Expression<Func<Todo, bool>> GetAllTodosQuery(GetAllTodosRequest request)
        {
            Expression<Func<Todo, bool>> filter = x => x.DocumentType == nameof(Todo);

            if (request.RequestParam == null)
                return filter;

            var todoRequest = request.RequestParam;

            if (!string.IsNullOrEmpty(todoRequest.TodoId))
                filter = filter.And(x => x.Id == todoRequest.TodoId);

            if (!string.IsNullOrEmpty(todoRequest.UserId))
                filter = filter.And(x => x.UserId == todoRequest.UserId);

            if (todoRequest.IsCompleted.HasValue)
                filter = filter.And(x => x.IsCompleted == todoRequest.IsCompleted.Value);

            if (!string.IsNullOrEmpty(todoRequest.Keyword))
            {
                var keyword = todoRequest.Keyword.ToLower().Trim();
                Expression<Func<Todo, bool>> keywordFilter = n => false;

                Expression<Func<Todo, bool>> title = a => a.Title != null && a.Title.ToLower().Contains(keyword);
                Expression<Func<Todo, bool>> description = a => a.Description != null && a.Description.ToLower().Contains(keyword);

                keywordFilter = keywordFilter.Or(title).Or(description);
                filter = filter.And(keywordFilter);
            }

            return filter;
        }

        public async Task<(IEnumerable<Todo> result, int count)> GetAllTodosWithCountAsync(GetAllTodosRequest request)
        {
            var orderBy = request.OrderByCriteria != null ? OrderBy(request) : x => x.ModifiedOn;
            return await GetItemsWithCountAsync(GetAllTodosQuery(request), request, orderBy);
        }

        public async Task<Todo?> GetTodoAsync(GetAllTodosRequest request)
        {
            return await GetItemAsync(GetAllTodosQuery(request));
        }
    }
}

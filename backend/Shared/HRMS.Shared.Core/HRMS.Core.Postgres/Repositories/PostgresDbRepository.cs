using HRMS.Core.Postgres.Common;
using HRMS.Core.Postgres.Data;
using HRMS.Core.Postgres.Interfaces;
using HRMS.Core.Telemetry;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq.Expressions;
using System.Security.Claims;
using PostgresBaseEntity = HRMS.Core.Postgres.Common.BaseEntity;

namespace HRMS.Core.Postgres.Repositories
{
    public abstract class PostgresDbRepository<T> : IPostgresRepository<T>, ITableContext<T> where T : PostgresBaseEntity
    {
        protected readonly PostgresDbContext _context;
        protected readonly DbSet<T> _dbSet;
        protected readonly IHttpContextAccessor? _httpContextAccessor;
        protected readonly ILogger? _logger;
        protected readonly ITelemetryService? _telemetryService;

        protected PostgresDbRepository(
            PostgresDbContext context,
            ILogger logger,
            ITelemetryService telemetryService,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = _context.Set<T>();
            _logger = logger;
            _telemetryService = telemetryService;
            _httpContextAccessor = httpContextAccessor;
        }

        public abstract string TableName { get; }

        public abstract string GenerateId(T entity);

        public async Task<T> AddItemAsync(T item)
        {
            if (_telemetryService != null)
            {
                var sessionContext = GetSessionContext();

                return await _telemetryService.TrackDatabaseOperationAsync(
                    async () =>
                    {
                        await _dbSet.AddAsync(item);
                        await _context.SaveChangesAsync();

                        _telemetryService.TrackDatabaseMetrics(
                            "AddItem",
                            TableName,
                            0,
                            TimeSpan.Zero,
                            1,
                            item.Id,
                            sessionContext);

                        return item;
                    },
                    "AddItem",
                    TableName,
                    item,
                    new Dictionary<string, string>
                    {
                        { "ItemId", item.Id },
                        { "ItemType", typeof(T).Name }
                    }.Concat(sessionContext).ToDictionary(x => x.Key, x => x.Value));
            }

            await _dbSet.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<T> DeleteItemAsync(string id)
        {
            var item = await _dbSet.FindAsync(id)
                ?? throw new KeyNotFoundException($"Item with id '{id}' not found in {TableName}.");

            _dbSet.Remove(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<T?> GetItemAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.AsNoTracking().FirstOrDefaultAsync(predicate);
        }

        public async Task<(IEnumerable<T> data, int count)> GetItemsWithCountAsync<TPropType>(
            Expression<Func<T, bool>> predicate,
            Request request,
            Expression<Func<T, TPropType>>? orderBy = null)
        {
            IQueryable<T> query = _dbSet.AsNoTracking().Where(predicate);

            if (orderBy != null && request.OrderByCriteria != null)
            {
                query = request.OrderByCriteria.OrderBy == "Ascending"
                    ? query.OrderBy(orderBy)
                    : query.OrderByDescending(orderBy);
            }
            else if (orderBy != null)
            {
                query = query.OrderByDescending(orderBy);
            }

            var count = await query.CountAsync();

            if (request?.PageCriteria?.EnablePage ?? false)
            {
                query = query
                    .Skip(request.PageCriteria.Skip)
                    .Take(request.PageCriteria.PageSize);
            }

            var results = await query.ToListAsync();
            return (results.AsEnumerable(), count);
        }

        public async Task<T> UpdateItemAsync(string id, T item)
        {
            var existing = await _dbSet.FindAsync(id)
                ?? throw new KeyNotFoundException($"Item with id '{id}' not found in {TableName}.");

            item.Id = id;
            _context.Entry(existing).State = EntityState.Detached;
            _dbSet.Update(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public Expression<Func<T, object>>? OrderBy(Request request)
        {
            if (request?.OrderByCriteria != null && !string.IsNullOrEmpty(request.OrderByCriteria.Order))
                return Sort(request.OrderByCriteria.Order);

            return Sort(string.Empty);
        }

        protected Dictionary<string, string> GetSessionContext()
        {
            var context = new Dictionary<string, string>();

            if (_httpContextAccessor?.HttpContext?.User?.Identity?.IsAuthenticated == true)
            {
                var user = _httpContextAccessor.HttpContext.User;
                context["UserId"] = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Unknown";
                context["UserName"] = user.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown";
            }

            return context;
        }

        private static Expression<Func<T, object>>? Sort(string propertyName)
        {
            if (string.IsNullOrEmpty(propertyName))
                return null;

            var parameter = Expression.Parameter(typeof(T));
            var property = Expression.Property(parameter, propertyName);
            var propAsObject = Expression.Convert(property, typeof(object));

            return Expression.Lambda<Func<T, object>>(propAsObject, parameter);
        }
    }
}

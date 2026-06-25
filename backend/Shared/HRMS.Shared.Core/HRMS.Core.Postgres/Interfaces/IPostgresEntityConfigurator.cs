using HRMS.Core.Postgres.Common;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Core.Postgres.Interfaces
{
    public interface IPostgresEntityConfigurator
    {
        void Configure(ModelBuilder modelBuilder);
    }

    public interface ITableContext<T> where T : BaseEntity
    {
        string TableName { get; }

        string GenerateId(T entity);
    }
}

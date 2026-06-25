using HRMS.Core.Postgres.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Core.Postgres.Data
{
    public class PostgresDbContext : DbContext
    {
        private readonly IEnumerable<IPostgresEntityConfigurator> _configurators;

        public PostgresDbContext(
            DbContextOptions<PostgresDbContext> options,
            IEnumerable<IPostgresEntityConfigurator> configurators) : base(options)
        {
            _configurators = configurators;
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            foreach (var configurator in _configurators)
            {
                configurator.Configure(modelBuilder);
            }

            base.OnModelCreating(modelBuilder);
        }
    }
}

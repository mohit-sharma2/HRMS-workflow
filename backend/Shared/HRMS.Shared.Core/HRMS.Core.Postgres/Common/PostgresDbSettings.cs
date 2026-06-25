namespace HRMS.Core.Postgres.Common
{
    public class TableInfo
    {
        public string? Name { get; set; }

        public string? Schema { get; set; } = "public";
    }

    public class PostgresDbSettings
    {
        public string? ConnectionString { get; set; }

        public string? DatabaseName { get; set; }

        public List<TableInfo>? Tables { get; set; }
    }
}

namespace HRMS.API.Telemetry
{
    /// <summary>
    /// Stores the current GraphQL operation name so it can be read by the telemetry initializer
    /// when the Application Insights SDK sends request telemetry (HttpContext may be unavailable at
    /// that time).
    /// </summary>
    public static class GraphQLOperationContext
    {
        private static readonly AsyncLocal<string?> _currentOperationName = new();

        /// <summary>
        /// Gets or sets the current request's GraphQL operation name.
        /// </summary>
        public static string? CurrentOperationName
        {
            get => _currentOperationName.Value;
            set => _currentOperationName.Value = value;
        }
    }
}
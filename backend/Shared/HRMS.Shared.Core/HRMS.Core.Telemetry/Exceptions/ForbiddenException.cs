namespace HRMS.Core.Telemetry.Exceptions
{
    public sealed class ForbiddenException : ApplicationException
    {
        public ForbiddenException(string message)
            : base("Forbidden", message)
        {
        }
    }
}
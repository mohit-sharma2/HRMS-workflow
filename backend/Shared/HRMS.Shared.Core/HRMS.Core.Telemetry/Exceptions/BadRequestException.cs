namespace HRMS.Core.Telemetry.Exceptions
{
    public sealed class BadRequestException : ApplicationException
    {
        public BadRequestException(string message)
            : base("Bad Request", message)
        {
        }
    }
}
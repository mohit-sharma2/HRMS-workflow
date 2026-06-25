namespace HRMS.Core.Telemetry.Exceptions
{
    public sealed class ValidationException : ApplicationException
    {
        public ValidationException(IReadOnlyDictionary<string, string[]> errorsDictionary)
            : base("Validation Failure", FormatValidationMessage(errorsDictionary))
        {
            ErrorsDictionary = errorsDictionary;
        }

        public IReadOnlyDictionary<string, string[]> ErrorsDictionary { get; }

        private static string FormatValidationMessage(IReadOnlyDictionary<string, string[]> errorsDictionary)
        {
            if (errorsDictionary == null || !errorsDictionary.Any())
                return "One or more validation errors occurred";

            var errorMessages = new List<string>();

            foreach (var error in errorsDictionary)
            {
                if (error.Value != null && error.Value.Any())
                {
                    var fieldName = string.IsNullOrEmpty(error.Key) ? "Field" : error.Key;
                    var messages = string.Join(", ", error.Value);
                    errorMessages.Add($"{fieldName}: {messages}");
                }
            }

            return errorMessages.Any()
                ? $"Validation failed: {string.Join("; ", errorMessages)}"
                : "One or more validation errors occurred";
        }
    }
}
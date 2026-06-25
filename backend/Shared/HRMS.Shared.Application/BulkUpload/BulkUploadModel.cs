namespace HRMS.Shared.Application.BulkUpload
{
    public class ExportDropdown
    {
        public string? Value { get; set; }
        public string? ValueId { get; set; }
    }

    public class PreviewFieldResult
    {
        public string? ErrorMessage { get; set; }
        public string? FieldValue { get; set; }
    }
}
namespace HRMS.Shared.Application.Constants
{
    public sealed class BulkUploadMessages
    {
        public const string ConcurrentError = "Excel file contain concurrent error. For more details review the preview.";
        public const string DropdownValue = "Please select a value from the dropdown list.";
        public const string EmptyFile = "File must contain data.";
        public const string Export = "{0} has been exported successfully.";
        public const string HasColumn = "File must contain at least one column.";
        public const string HasRaw = "File must contain at least one data row (excluding header).";
        public const string HasWorksheet = "Excel file must contain at least one worksheet.";
        public const string Import = "{0} has been imported successfully.";
        public const string Preview = "{0} preview has been generated successfully.";
        public const string StatusExistence = "Status must be Active or Inactive.";
    }

    public sealed class MediaValidationMessages
    {
        public const string BlobFileInvalidChars = "Blob file name contains invalid characters.";
        public const string BlobFileLengthInvalid = "Blob file length must be greater than zero.";
        public const string ContainerNameInvalidChars = "Storage container name can only contain lowercase letters, numbers, and hyphens.";
        public const string ContainerNameInvalidFormat = "Storage container name must start with a letter or number and cannot contain consecutive hyphens.";
        public const string ContainerNameLength = "Storage container name must be between 3 and 63 characters.";
        public const string FilePathInvalidChars = "File path contains invalid characters.";
    }

    public sealed class Messaging
    {
        public const string AlphabetAndUnderscoreOnly = "{0} must contain only alphabetic characters and underscores, with no spaces or numbers.";
        public const string AlreadyExist = "{0} already exist.";
        public const string AlreadyMapped = "{0} is already mapped with other item so that you can not delete it.";
        public const string AtLeastOneIsRequired = "At least one {0} is required.";
        public const string AtLeastOneIsRequiredFor = "At least one {0} is required for {1}.";
        public const string CannotBeUpdated = "{0} cannot be updated.";
        public const string ConfigurationNotExist = "{0} is not enabled in geography for this {1}.";
        public const string Delete = "{0} has been deleted successfully.";
        public const string Duplicate = "Duplicate {0} found in worksheet.";
        public const string Edit = "{0} Name has been edited successfully.";
        public const string Insert = "{0} has been created successfully.";
        public const string Invalid = "Invalid {0}.";
        public const string InvalidRequest = "Invalid Request";
        public const string IsRequired = "{0} is required.";
        public const string LengthRange = "{0} must be between {1} and {2} characters.";
        public const string MaxLength = "{0} must not exceed {1} characters.";
        public const string MustBeActive = "{0} must be active.";
        public const string MustBeExist = "{0} must be exist in master data.";
        public const string MustBeOneOf = "{0} must be one of the defined {1}.";
        public const string MustBeUnique = "{0} must be unique.";
        public const string NoSpecialCharactersOrNumbers = "{0} must not contain special characters or numeric values.";
        public const string NotExist = "{0} not exist in {1}.";
        public const string NotFound = "{0} not found.";
        public const string NotRequired = "{0} is not required for {1}.";
        public const string Required = "{0} is required.";
        public const string Update = "{0} has been updated successfully.";
        public const string UploadFile = "File uploaded successfully";
        public const string UppercaseAlphanumericUnderscore = "{0} must contain only uppercase letters, digits, underscores, or spaces.";
        public const string UppercaseUnderscore = "{0} must contain only uppercase letters or underscores.";
    }
}
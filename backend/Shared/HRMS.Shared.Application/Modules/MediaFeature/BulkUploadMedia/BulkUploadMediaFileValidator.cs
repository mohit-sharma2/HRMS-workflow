using FluentValidation;
using HRMS.Shared.Application.Constants;

namespace HRMS.Shared.Application.Modules.MediaFeature
{
    public sealed class BulkUploadMediaFileValidationOptions
    {
        public string ContainerNameLabel { get; init; } = "Blob Container Name";
        public bool RequireNonEmptyContainerName { get; init; }
        public bool RequireNonEmptyStrings { get; init; }
        public bool RequireXlsxExtension { get; init; }
    }

    public class BulkUploadMediaFileValidator : AbstractValidator<MediaDto>
    {
        public BulkUploadMediaFileValidator(BulkUploadMediaFileValidationOptions? options = null)
        {
            options ??= new BulkUploadMediaFileValidationOptions();

            if (options.RequireNonEmptyStrings)
            {
                RuleFor(x => x.FilePath)
                    .NotEmpty().WithMessage(string.Format(Messaging.IsRequired, "File Path"));

                RuleFor(x => x.FileExtension)
                    .NotEmpty().WithMessage(string.Format(Messaging.IsRequired, "File Extension"));
            }
            else
            {
                RuleFor(x => x.FilePath)
                    .NotNull().WithMessage(string.Format(Messaging.IsRequired, "File Path"));

                RuleFor(x => x.FileExtension)
                    .NotNull().WithMessage(string.Format(Messaging.IsRequired, "File Extension"));
            }

            if (options.RequireNonEmptyContainerName)
            {
                RuleFor(x => x.ContainerName)
                    .NotEmpty().WithMessage(string.Format(Messaging.IsRequired, options.ContainerNameLabel));
            }
            else
            {
                RuleFor(x => x.ContainerName)
                    .NotNull().WithMessage(string.Format(Messaging.IsRequired, options.ContainerNameLabel));
            }

            if (options.RequireXlsxExtension)
            {
                RuleFor(x => x.FileExtension)
                    .Must(ext => ext == ".xlsx").WithMessage("File extension must be .xlsx");
            }
        }
    }
}
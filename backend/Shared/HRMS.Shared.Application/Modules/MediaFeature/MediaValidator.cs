using FluentValidation;
using HRMS.Shared.Application.Constants;
using Microsoft.AspNetCore.Http;
using Path = System.IO.Path;

namespace HRMS.Shared.Application.Modules.MediaFeature
{
    public class DownloadMediaValidator : AbstractValidator<DownloadMediaRequest>
    {
        public DownloadMediaValidator()
        {
            AddRuleForRequest();
            AddRuleForContainerName();
            AddRuleForFilePath();
        }

        private void AddRuleForContainerName()
        {
            When(x => x.RequestParam != null, () =>
            {
                RuleFor(x => x.RequestParam!.ContainerName.ToString().ToLower())
               .NotEmpty().WithMessage(string.Format(Messaging.IsRequired, "Container Name"))
               .Length(3, 63).WithMessage(MediaValidationMessages.ContainerNameLength)
               .Matches(@"^[a-z0-9-]+$").WithMessage(MediaValidationMessages.ContainerNameInvalidChars)
               .Must(BeValidContainerName).WithMessage(MediaValidationMessages.ContainerNameInvalidFormat);
            });
        }

        private void AddRuleForFilePath()
        {
            When(x => x.RequestParam != null, () =>
            {
                RuleFor(x => x.RequestParam!.FilePath)
                .NotNull()
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "File Path"))
                .Must(BeValidFileName).WithMessage(MediaValidationMessages.FilePathInvalidChars);
            });
        }

        private void AddRuleForRequest()
        {
            RuleFor(x => x)
                .NotNull()
                .NotEmpty()
                .WithMessage(string.Format(Messaging.InvalidRequest));
        }

        private bool BeValidContainerName(string containerName)
        {
            if (string.IsNullOrEmpty(containerName))
                return false;

            return !containerName.StartsWith('-') && !containerName.EndsWith('-') && !containerName.Contains("--");
        }

        private bool BeValidFileName(string? filePath)
        {
            char[] invalidFileNameChars = Path.GetInvalidFileNameChars();
            string fileName = filePath ?? string.Empty;

            // Ensure file name does not contain invalid characters and is not empty
            return !string.IsNullOrWhiteSpace(fileName) && fileName.All(c => !invalidFileNameChars.Contains(c));
        }
    }

    public class UploadMediaValidator : AbstractValidator<UploadMediaRequest>
    {
        public UploadMediaValidator()
        {
            AddRuleForFile();
            AddRuleForRequest();
            AddRuleForContainerName();
        }

        private void AddRuleForContainerName()
        {
            When(x => x.RequestParam != null, () =>
            {
                RuleFor(x => x.RequestParam!.ContainerName.ToString().ToLower())
               .NotEmpty().WithMessage(string.Format(Messaging.IsRequired, "Container Name"))
               .Length(3, 63).WithMessage(MediaValidationMessages.ContainerNameLength)
               .Matches(@"^[a-z0-9-]+$").WithMessage(MediaValidationMessages.ContainerNameInvalidChars)
               .Must(BeValidContainerName).WithMessage(MediaValidationMessages.ContainerNameInvalidFormat);
            });
        }

        private void AddRuleForFile()
        {
            When(x => x.RequestParam != null, () =>
            {
                RuleFor(x => x.RequestParam!.FormFile)
                .NotNull()
                .WithMessage(string.Format(Messaging.IsRequired, "Blob File"))
                .Must(BeValidFileName).WithMessage(MediaValidationMessages.BlobFileInvalidChars)
                .Must(file => file != null && file.Length > 0).WithMessage(MediaValidationMessages.BlobFileLengthInvalid);
            });
        }

        private void AddRuleForRequest()
        {
            RuleFor(x => x)
                .NotNull()
                .NotEmpty()
                .WithMessage(string.Format(Messaging.InvalidRequest));
        }

        private bool BeValidContainerName(string containerName)
        {
            if (string.IsNullOrEmpty(containerName))
                return false;

            return !containerName.StartsWith('-') && !containerName.EndsWith('-') && !containerName.Contains("--");
        }

        private bool BeValidFileName(IFormFile? file)
        {
            if (file == null) return false;

            char[] invalidFileNameChars = Path.GetInvalidFileNameChars();
            string fileName = file.FileName;

            // Ensure file name does not contain invalid characters and is not empty
            return !string.IsNullOrWhiteSpace(fileName) && fileName.All(c => !invalidFileNameChars.Contains(c));
        }
    }
}
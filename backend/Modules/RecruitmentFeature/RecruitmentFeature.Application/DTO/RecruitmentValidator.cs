using FluentValidation;
using HRMS.Shared.Application.Constants;
using HRMS.Shared.Application.Extensions;

namespace RecruitmentFeature.Application.DTO
{
    // ─── JobPosting Validators ─────────────────────────────────────────────────

    public class CreateJobPostingValidator : AbstractValidator<CreateJobPostingRequest>
    {
        public CreateJobPostingValidator()
        {
            this.ValidateRequiredRequestParam(
                x => x.RequestParam!,
                new JobPostingPayloadValidator<CreateJobPostingDto>());
        }
    }

    public class UpdateJobPostingValidator : AbstractValidator<UpdateJobPostingRequest>
    {
        public UpdateJobPostingValidator()
        {
            this.ValidateRequiredRequestParam(
                x => x.RequestParam!,
                new JobPostingUpdatePayloadValidator());
        }
    }

    public class DeleteJobPostingValidator : AbstractValidator<DeleteJobPostingRequest>
    {
        public DeleteJobPostingValidator()
        {
            this.ValidateRequiredRequestParam(
                x => x.RequestParam!,
                new JobPostingIdValidator<DeleteJobPostingDto>());
        }
    }

    internal class JobPostingPayloadValidator<T> : AbstractValidator<T>
        where T : IJobPostingPayloadDto
    {
        public JobPostingPayloadValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "Title"));

            RuleFor(x => x.Department)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "Department"));

            RuleFor(x => x.Location)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "Location"));
        }
    }

    internal class JobPostingUpdatePayloadValidator : AbstractValidator<UpdateJobPostingDto>
    {
        public JobPostingUpdatePayloadValidator()
        {
            RuleFor(x => x.JobPostingId)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "JobPostingId"));

            RuleFor(x => x.Title)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "Title"));

            RuleFor(x => x.Department)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "Department"));
        }
    }

    internal class JobPostingIdValidator<T> : AbstractValidator<T>
        where T : IJobPostingIdDto
    {
        public JobPostingIdValidator()
        {
            RuleFor(x => x.JobPostingId)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "JobPostingId"));
        }
    }

    // ─── Candidate Validators ──────────────────────────────────────────────────

    public class CreateCandidateValidator : AbstractValidator<CreateCandidateRequest>
    {
        public CreateCandidateValidator()
        {
            this.ValidateRequiredRequestParam(
                x => x.RequestParam!,
                new CandidatePayloadValidator<CreateCandidateDto>());
        }
    }

    public class UpdateCandidateValidator : AbstractValidator<UpdateCandidateRequest>
    {
        public UpdateCandidateValidator()
        {
            this.ValidateRequiredRequestParam(
                x => x.RequestParam!,
                new CandidateUpdatePayloadValidator());
        }
    }

    public class DeleteCandidateValidator : AbstractValidator<DeleteCandidateRequest>
    {
        public DeleteCandidateValidator()
        {
            this.ValidateRequiredRequestParam(
                x => x.RequestParam!,
                new CandidateIdValidator<DeleteCandidateDto>());
        }
    }

    public class UpdateCandidateStageValidator : AbstractValidator<UpdateCandidateStageRequest>
    {
        public UpdateCandidateStageValidator()
        {
            this.ValidateRequiredRequestParam(
                x => x.RequestParam!,
                new CandidateStageValidator());
        }
    }

    internal class CandidatePayloadValidator<T> : AbstractValidator<T>
        where T : ICandidatePayloadDto
    {
        public CandidatePayloadValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "FullName"));

            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "Email"))
                .EmailAddress()
                .WithMessage("Email must be a valid email address.");

            RuleFor(x => x.JobPostingId)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "JobPostingId"));
        }
    }

    internal class CandidateUpdatePayloadValidator : AbstractValidator<UpdateCandidateDto>
    {
        public CandidateUpdatePayloadValidator()
        {
            RuleFor(x => x.CandidateId)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "CandidateId"));

            RuleFor(x => x.FullName)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "FullName"));

            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "Email"))
                .EmailAddress()
                .WithMessage("Email must be a valid email address.");
        }
    }

    internal class CandidateIdValidator<T> : AbstractValidator<T>
        where T : ICandidateIdDto
    {
        public CandidateIdValidator()
        {
            RuleFor(x => x.CandidateId)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "CandidateId"));
        }
    }

    internal class CandidateStageValidator : AbstractValidator<UpdateCandidateStageDto>
    {
        public CandidateStageValidator()
        {
            RuleFor(x => x.CandidateId)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "CandidateId"));

            RuleFor(x => x.Status)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, "Status"))
                .Must(s => new[] { "New", "Shortlisted", "Interview Scheduled", "Offered", "Rejected" }.Contains(s))
                .WithMessage("Status must be one of: New, Shortlisted, Interview Scheduled, Offered, Rejected.");
        }
    }
}

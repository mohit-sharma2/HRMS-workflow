using FluentValidation;
using HRMS.Shared.Application.Constants;

namespace HRMS.Shared.Application.Validation
{
    public interface IKeywordSearchDto
    {
        string? Keyword { get; set; }
    }

    public class KeywordSearchValidator<TSearchDto> : AbstractValidator<TSearchDto>
        where TSearchDto : IKeywordSearchDto
    {
        public KeywordSearchValidator(int maxLength = 200, string fieldLabel = "Keyword")
        {
            When(x => !string.IsNullOrWhiteSpace(x.Keyword), () =>
            {
                RuleFor(x => x.Keyword)
                    .MaximumLength(maxLength)
                    .WithMessage(string.Format(Messaging.MaxLength, fieldLabel, maxLength));
            });
        }
    }
}
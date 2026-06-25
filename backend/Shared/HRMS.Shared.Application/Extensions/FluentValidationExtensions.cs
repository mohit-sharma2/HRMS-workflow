using System.Linq.Expressions;
using FluentValidation;
using HRMS.Shared.Application.Constants;
using HRMS.Shared.Application.Modules.MediaFeature;

namespace HRMS.Shared.Application.Extensions
{
    public static class FluentValidationExtensions
    {
        public static void ValidateOptionalRequestKeyword<TRequest, TParam>(
            this AbstractValidator<TRequest> validator,
            Expression<Func<TRequest, TParam>> requestParamExpression,
            Expression<Func<TParam, string?>> keywordExpression,
            int maxLength = 200,
            string fieldLabel = "Keyword")
            where TParam : class
        {
            var requestParamValidator = CreateKeywordValidator(keywordExpression, maxLength, fieldLabel);
            validator.ValidateOptionalRequestParam(requestParamExpression, requestParamValidator);
        }

        public static void ValidateOptionalRequestParam<TRequest, TParam>(
            this AbstractValidator<TRequest> validator,
            Expression<Func<TRequest, TParam>> requestParamExpression,
            params IValidator<TParam>[] childValidators)
            where TParam : class
        {
            var getRequestParam = requestParamExpression.Compile();

            validator.When(request => getRequestParam(request) != null, () =>
            {
                foreach (var childValidator in childValidators)
                {
                    validator.RuleFor(requestParamExpression)
                        .SetValidator(childValidator);
                }
            });
        }

        public static void ValidateRequiredMedia<TRequest>(
            this AbstractValidator<TRequest> validator,
            Expression<Func<TRequest, MediaDto?>> mediaExpression,
            string mediaLabel,
            BulkUploadMediaFileValidationOptions? mediaOptions = null)
        {
            validator.RuleFor(mediaExpression)
                .NotNull()
                .WithMessage(string.Format(Messaging.IsRequired, mediaLabel))
                .SetValidator(new BulkUploadMediaFileValidator(mediaOptions)!);
        }

        public static void ValidateRequiredRequestKeyword<TRequest, TParam>(
            this AbstractValidator<TRequest> validator,
            Expression<Func<TRequest, TParam>> requestParamExpression,
            Expression<Func<TParam, string?>> keywordExpression,
            int maxLength = 200,
            string fieldLabel = "Keyword")
            where TParam : class
        {
            var requestParamValidator = CreateKeywordValidator(keywordExpression, maxLength, fieldLabel);
            validator.ValidateRequiredRequestParam(requestParamExpression, requestParamValidator);
        }

        public static void ValidateRequiredRequestMedia<TRequest, TParam>(
            this AbstractValidator<TRequest> validator,
            Expression<Func<TRequest, TParam>> requestParamExpression,
            Expression<Func<TParam, MediaDto?>> mediaExpression,
            string mediaLabel,
            BulkUploadMediaFileValidationOptions? mediaOptions = null)
            where TParam : class
        {
            var requestParamValidator = new InlineValidator<TParam>();
            requestParamValidator.ValidateRequiredMedia(mediaExpression, mediaLabel, mediaOptions);

            validator.ValidateRequiredRequestParam(requestParamExpression, requestParamValidator);
        }

        public static void ValidateRequiredRequestParam<TRequest, TParam>(
                                                    this AbstractValidator<TRequest> validator,
            Expression<Func<TRequest, TParam>> requestParamExpression,
            params IValidator<TParam>[] childValidators)
            where TParam : class
        {
            var getRequestParam = requestParamExpression.Compile();

            validator.RuleFor(requestParamExpression)
                .NotNull()
                .WithMessage(Messaging.InvalidRequest);

            if (childValidators.Length == 0)
            {
                return;
            }

            validator.When(request => getRequestParam(request) != null, () =>
            {
                foreach (var childValidator in childValidators)
                {
                    validator.RuleFor(requestParamExpression)
                        .SetValidator(childValidator);
                }
            });
        }

        public static void ValidateRequiredRequestParam<TRequest, TParam>(
            this AbstractValidator<TRequest> validator,
            Expression<Func<TRequest, TParam>> requestParamExpression,
            Action configureRulesWhenPresent)
            where TParam : class
        {
            var getRequestParam = requestParamExpression.Compile();

            validator.RuleFor(requestParamExpression)
                .NotNull()
                .WithMessage(Messaging.InvalidRequest);

            validator.When(request => getRequestParam(request) != null, configureRulesWhenPresent);
        }

        private static InlineValidator<TParam> CreateKeywordValidator<TParam>(
            Expression<Func<TParam, string?>> keywordExpression,
            int maxLength,
            string fieldLabel)
        {
            var getKeyword = keywordExpression.Compile();
            var validator = new InlineValidator<TParam>();

            validator.When(param => !string.IsNullOrWhiteSpace(getKeyword(param)), () =>
            {
                validator.RuleFor(keywordExpression)
                    .MaximumLength(maxLength)
                    .WithMessage(string.Format(Messaging.MaxLength, fieldLabel, maxLength));
            });

            return validator;
        }
    }
}
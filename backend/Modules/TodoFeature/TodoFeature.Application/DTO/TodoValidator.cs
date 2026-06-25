using FluentValidation;
using HRMS.Shared.Application.Constants;
using HRMS.Shared.Application.Extensions;

namespace TodoFeature.Application.DTO
{
    public class CreateTodoValidator : AbstractValidator<CreateTodoRequest>
    {
        public CreateTodoValidator()
        {
            this.ValidateRequiredRequestParam(
                x => x.RequestParam!,
                new TodoPayloadValidator<CreateTodoDto>());
        }
    }

    public class UpdateTodoValidator : AbstractValidator<UpdateTodoRequest>
    {
        public UpdateTodoValidator()
        {
            this.ValidateRequiredRequestParam(
                x => x.RequestParam!,
                new TodoUpdatePayloadValidator());
        }
    }

    public class DeleteTodoValidator : AbstractValidator<DeleteTodoRequest>
    {
        public DeleteTodoValidator()
        {
            this.ValidateRequiredRequestParam(
                x => x.RequestParam!,
                new TodoIdValidator<DeleteTodoDto>());
        }
    }

    internal class TodoPayloadValidator<TTodoDto> : AbstractValidator<TTodoDto>
        where TTodoDto : ITodoPayloadDto
    {
        public TodoPayloadValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, nameof(CreateTodoDto.Title)));
        }
    }

    internal class TodoUpdatePayloadValidator : AbstractValidator<UpdateTodoDto>
    {
        public TodoUpdatePayloadValidator()
        {
            RuleFor(x => x.TodoId)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, nameof(UpdateTodoDto.TodoId)));

            RuleFor(x => x.Title)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, nameof(UpdateTodoDto.Title)));
        }
    }

    internal class TodoIdValidator<TTodoDto> : AbstractValidator<TTodoDto>
        where TTodoDto : ITodoIdDto
    {
        public TodoIdValidator()
        {
            RuleFor(x => x.TodoId)
                .NotEmpty()
                .WithMessage(string.Format(Messaging.IsRequired, nameof(ITodoIdDto.TodoId)));
        }
    }
}

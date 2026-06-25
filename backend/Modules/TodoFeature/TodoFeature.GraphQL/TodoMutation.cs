using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Application.GraphQL;
using HotChocolate;
using HotChocolate.Types;
using MediatR;
using TodoFeature.Application.DTO;

namespace TodoFeature.GraphQL
{
    [ExtendObjectType(typeof(Mutation))]
    public class TodoMutation
    {
        public TodoMutation()
        { }

        [GraphQLName("createTodo")]
        public async Task<BaseResponse<CreateTodoResponse>> CreateTodoAsync(CreateTodoRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("updateTodo")]
        public async Task<BaseResponse<UpdateTodoResponse>> UpdateTodoAsync(UpdateTodoRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }

        [GraphQLName("deleteTodo")]
        public async Task<BaseResponse<DeleteTodoResponse>> DeleteTodoAsync(DeleteTodoRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }
    }
}

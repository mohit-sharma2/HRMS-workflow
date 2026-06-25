using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Application.GraphQL;
using HotChocolate;
using HotChocolate.Types;
using MediatR;
using TodoFeature.Application.DTO;

namespace TodoFeature.GraphQL
{
    [ExtendObjectType(typeof(Query))]
    public class TodoQuery
    {
        public TodoQuery()
        { }

        [GraphQLName("getAllTodos")]
        public async Task<BaseResponsePagination<GetAllTodosResponse>> GetAllTodosAsync(GetAllTodosRequest request, [Service] IMediator mediator)
        {
            return await mediator.Send(request);
        }
    }
}

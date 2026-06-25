using HotChocolate.Execution.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TodoFeature.GraphQL
{
    public static class TodosGraphQLExtensions
    {
        public static IRequestExecutorBuilder AddTodosGraphQL(this IRequestExecutorBuilder builder)
        {
            return builder
                .AddTypeExtension<TodoMutation>()
                .AddTypeExtension<TodoQuery>();
        }
    }
}

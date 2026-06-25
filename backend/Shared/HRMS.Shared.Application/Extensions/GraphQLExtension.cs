using HRMS.Shared.Application.GraphQL;
using HotChocolate.Execution.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HRMS.Shared.Application.Extensions
{
    public static class GraphQLExtension
    {
        public static IRequestExecutorBuilder AddSharedGraphQLTypes(this IRequestExecutorBuilder builder)
        {
            return builder
                .AddType<MediaMutation>()
                .AddType<MediaQuery>();
        }
    }
}
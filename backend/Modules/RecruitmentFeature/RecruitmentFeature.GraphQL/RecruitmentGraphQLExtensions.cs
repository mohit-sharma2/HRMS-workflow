using HotChocolate.Execution.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace RecruitmentFeature.GraphQL
{
    public static class RecruitmentGraphQLExtensions
    {
        public static IRequestExecutorBuilder AddRecruitmentGraphQL(this IRequestExecutorBuilder builder)
        {
            return builder
                .AddTypeExtension<RecruitmentMutation>()
                .AddTypeExtension<RecruitmentQuery>();
        }
    }
}

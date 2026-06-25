using HRMS.API.Middleware;
using HRMS.API.RegisterDependencies;
using HRMS.Shared.Application.Extensions;
using HRMS.Shared.Application.GraphQL;
using HotChocolate;
using HotChocolate.Types;

namespace HRMS.API.Extensions
{
    public static class GraphQLExtensions
    {
        public static void ConfigureGraphQL(this IServiceCollection services, IConfiguration configuration)
        {
            bool allowIntrospection = configuration.GetValue<bool>("GraphQL:AllowIntrospection", false);
            bool includeExceptionDetails = configuration.GetValue<bool>("GraphQL:IncludeExceptionDetails", false);
            int requestTimeoutSeconds = configuration.GetValue<int>("RequestTimeout:Seconds", 90);

            services.AddGraphQLServer()
                    .ConfigureSchemaServices(schemaServices =>
                    {
                        schemaServices.AddHttpContextAccessor();
                        schemaServices.AddLogging();
                    })
                    .ModifyRequestOptions(o =>
                    {
                        o.IncludeExceptionDetails = includeExceptionDetails;
                        o.ExecutionTimeout = TimeSpan.FromSeconds(requestTimeoutSeconds);
                    })

                    .AddAuthorization()
                    .ModifyParserOptions(opt =>
                    {
                        opt.MaxAllowedFields = 4096; // ? increase from default 2048
                    })
                    .AddMutationType<Mutation>()
                    .AddQueryType<Query>()
                    .AddErrorFilter<GraphQLErrorFilter>()
                    .AddType<UploadType>()
                    .AddInMemorySubscriptions()
                    .AddGraphQLModules();

            services.Configure<SchemaOptions>(options =>
            {
                options.EnableDirectiveIntrospection = allowIntrospection;
            });
        }
    }
}
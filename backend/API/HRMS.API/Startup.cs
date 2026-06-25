using HRMS.Core.Postgres;
using HRMS.API.Extensions;
using HRMS.API.RegisterDependencies;
using HRMS.Shared.Infrastructure.Extensions;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;
using System.Reflection;
using System.Text.Json.Serialization;
using TodoFeature.Application.DTO;
using RecruitmentFeature.Application.DTO;

namespace HRMS.API
{
    public class NoCacheFilter : IActionFilter
    {
        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (!context.HttpContext.WebSockets.IsWebSocketRequest)
            {
                context.HttpContext.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
                context.HttpContext.Response.Headers["Pragma"] = "no-cache";
                context.HttpContext.Response.Headers["Expires"] = "-1";
            }
        }

        public void OnActionExecuting(ActionExecutingContext context)
        { }
    }

    public class Startup
    {
        public void Configure(WebApplication app, IWebHostEnvironment env, IConfiguration configuration)
        {
            app.UseForwardedHeaders();
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            _ = Task.Run(() =>
            {
                try
                {
                    app.EnsurePostgresDbIsCreated();
                    Console.WriteLine("PostgreSQL database initialized successfully");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error initializing PostgreSQL database: {ex.Message}");
                }
            });

            app.UseRouting();
            app.UseRequestTimeouts();
            app.UseCors();
            app.AddMiddleware();
            app.UseAuthentication();
            app.UseAuthorization();

            app.Use(async (context, next) =>
            {
                context.Response.Headers.CacheControl = "no-store, no-cache, must-revalidate, max-age=0";
                context.Response.Headers.Pragma = "no-cache";
                context.Response.Headers.Expires = "-1";
                await next();
            });

            bool enableGraphQLTool = configuration.GetValue<bool>("GraphQL:Tool:Enable", env.IsDevelopment());

            app.MapControllers();
            app.MapGraphQL()
                .WithOptions(options =>
                {
                    options.Tool.Enable = enableGraphQLTool;
                });
        }

        public void ConfigureServices(IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                options.KnownProxies.Add(IPAddress.Parse("10.0.0.1"));
            });

            services.AddControllers()
                   .AddJsonOptions(options =>
                   {
                       options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                   });

            services.AddEndpointsApiExplorer();
            services.AddHttpClient();

            // ApplicationInsights — empty connection string for local dev
            // services.AddApplicationInsightsTelemetry(options =>
            // {
            //     options.ConnectionString = configuration["ApplicationInsights:ConnectionString"] ?? "";
            //     //options.EnableAdaptiveSampling = false;
            // });

            // ApplicationInsights — only register if a connection string is configured
// ApplicationInsights — only register if a connection string is configured
var appInsightsConnectionString = configuration["ApplicationInsights:ConnectionString"];

if (!string.IsNullOrWhiteSpace(appInsightsConnectionString))
{
    services.AddApplicationInsightsTelemetry(options =>
    {
        options.ConnectionString = appInsightsConnectionString;
    });
}

            services.AddInjectionApplication(configuration, [
                typeof(CreateTodoHandler).Assembly,
                typeof(CreateJobPostingHandler).Assembly
            ]);
            services.AddInjectionPostgres(configuration);
            services.AddModulesDependencyInjection(configuration);

            services.ConfigureApiBehavior();
            services.ConfigureCorsPolicy(configuration);
            services.ConfigureGraphQL(configuration);

            services.AddMemoryCache();
            services.AddMvc(options =>
            {
                options.Filters.Add(new NoCacheFilter());
            });
        }
    }
}
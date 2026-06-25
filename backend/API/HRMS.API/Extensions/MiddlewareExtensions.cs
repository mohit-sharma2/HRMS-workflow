using HRMS.API.Middleware;

namespace HRMS.API.Extensions
{
    public static class MiddlewareExtensions
    {
        public static IApplicationBuilder AddMiddleware(this IApplicationBuilder app)
        {
            app.UseMiddleware<ExceptionMiddleware>();
            app.UseMiddleware<LocalAPIMiddleware>();
            app.UseMiddleware<IPAddressMiddleware>();
            return app;
        }
    }
}
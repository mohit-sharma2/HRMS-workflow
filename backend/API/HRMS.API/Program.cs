using HRMS.API;
using HRMS.Core.KeyVault.Extensions;
using Microsoft.AspNetCore.Http.Timeouts;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

builder.Configuration.AddAzureKeyVaultConfiguration(builder.Configuration);

int requestTimeoutSeconds = builder.Configuration.GetValue<int>("RequestTimeout:Seconds", 90);

builder.Services.AddRequestTimeouts(options =>
{
    options.DefaultPolicy = new RequestTimeoutPolicy
    {
        Timeout = TimeSpan.FromSeconds(requestTimeoutSeconds),
        TimeoutStatusCode = StatusCodes.Status504GatewayTimeout
    };
});

builder.Services.AddHttpContextAccessor();

//builder.Services.AddApplicationInsightsTelemetry(options =>
//{
//    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
//});

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 105 * 1024 * 1024;
    options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(requestTimeoutSeconds);
    options.Limits.KeepAliveTimeout = TimeSpan.FromSeconds(Math.Max(requestTimeoutSeconds + 30, 120));
});

var startup = new Startup();
startup.ConfigureServices(builder.Services, builder.Configuration);

var app = builder.Build();
app.Logger.LogInformation($"Current environment: {app.Environment.EnvironmentName}");

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

startup.Configure(app, app.Environment, builder.Configuration);
app.Run();
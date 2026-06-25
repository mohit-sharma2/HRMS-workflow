using Azure.Identity;
using Microsoft.Extensions.Configuration;

namespace HRMS.Core.KeyVault.Extensions
{
    public static class AzureKeyVaultExtensions
    {
        public static IConfigurationBuilder AddAzureKeyVaultConfiguration(this IConfigurationBuilder builder, IConfiguration configuration)
        {
            KeyVaultConfiguration keyVaultConfiguration = new()
            {
                KeyVaultURL = configuration["KeyVaultURL"],
                ClientId = configuration["ClientId"],
                ClientSecret = configuration["ClientSecret"],
                TenantId = configuration["TenantId"]
            };

            if (string.IsNullOrWhiteSpace(keyVaultConfiguration.KeyVaultURL) ||
                string.IsNullOrWhiteSpace(keyVaultConfiguration.ClientId) ||
                string.IsNullOrWhiteSpace(keyVaultConfiguration.ClientSecret) ||
                string.IsNullOrWhiteSpace(keyVaultConfiguration.TenantId))
            {
                return builder;
            }

            var clientSecretCredential = new ClientSecretCredential(keyVaultConfiguration.TenantId, keyVaultConfiguration.ClientId, keyVaultConfiguration.ClientSecret);
            builder.AddAzureKeyVault(new Uri(keyVaultConfiguration.KeyVaultURL), clientSecretCredential);
            return builder;
        }
    }
}
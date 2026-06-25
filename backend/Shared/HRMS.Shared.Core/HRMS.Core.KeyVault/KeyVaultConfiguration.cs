namespace HRMS.Core.KeyVault
{
    public class KeyVaultConfiguration
    {
        /// <summary>
        /// Database name
        /// </summary>
        public string? ClientId { get; set; }

        /// <summary>
        /// CosmosDb Account - The Azure Cosmos DB endpoint
        /// </summary>
        public string? ClientSecret { get; set; }

        /// <summary>
        /// Key - The primary key for the Azure DocumentDB account.
        /// </summary>
        public string? KeyVaultURL { get; set; }

        /// <summary>
        /// List of containers in the database
        /// </summary>
        public string? TenantId { get; set; }
    }
}
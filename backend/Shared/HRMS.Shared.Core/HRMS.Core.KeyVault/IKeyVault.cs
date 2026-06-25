using System;
using System.Collections.Generic;
using System.Text;

namespace HRMS.Core.KeyVault
{
    public interface IKeyVault
    {
        /// <summary>
        /// Download the certificate from the server
        /// </summary>
        /// <param name="certKey">Address where cert is stored</param>
        /// <param name="exportKey">True: to export the private key as well</param>
        /// <returns></returns>
        Task<byte[]> ExtractCertificateAsync(string certKey, bool exportKey = false);

        /// <summary>
        /// Get key from object
        /// </summary>
        /// <typeparam name="T">Object holding keys</typeparam>
        /// <param name="key">Key Name from object</param>
        /// <returns></returns>
        //string GetValue(string key);
    }
}
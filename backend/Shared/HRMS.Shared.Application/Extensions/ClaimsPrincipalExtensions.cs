using HRMS.Shared.Domain.Entity;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace HRMS.Shared.Application.Extensions
{
    public class ClaimsPrincipalExtensions
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ClaimsPrincipalExtensions(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        public string AuthToken
        {
            get { return _httpContextAccessor.HttpContext?.Items["AuthToken"] as string ?? string.Empty; }
        }

        public Lazy<Dictionary<string, string>>? DPFTLazy
        {
            get { return _httpContextAccessor.HttpContext?.Items["DPFTData"] as Lazy<Dictionary<string, string>>; }
        }

        public string Email
        {
            get { return GetSingleClaimValue(ClaimTypes.Email); }
        }

        /// <summary>
        /// Token expiration from the "exp" claim (JWT Unix seconds). UTC. Null if missing or invalid.
        /// </summary>
        public DateTime? ExpiryDate
        {
            get
            {
                var exp = GetSingleClaimValue("exp");
                if (string.IsNullOrWhiteSpace(exp) || !long.TryParse(exp, out var unixSeconds))
                    return null;
                try
                {
                    return DateTimeOffset.FromUnixTimeSeconds(unixSeconds).UtcDateTime;
                }
                catch
                {
                    return null;
                }
            }
        }

        public string FirstName
        {
            get { return GetSingleClaimValue(ClaimTypes.GivenName); }
        }

        public bool? IsAuthenticated
        {
            get { return _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated; }
        }

        public string LastLogin
        {
            get { return GetSingleClaimValue("LastLogin"); }
        }

        public string LastName
        {
            get { return GetSingleClaimValue(ClaimTypes.Surname); }
        }

        //public string LegalEntityId
        //{
        //    get { return GetSingleClaimValue($"{InternalContext.LegalEntityId}"); }
        //}

        public string Name
        {
            get { return GetSingleClaimValue(ClaimTypes.Name); }
        }

        public string PropertyId
        {
            get { return GetSingleClaimValue("PropertyId"); }
        }

        public string Role
        {
            get { return GetSingleClaimValue($"{InternalContext.Role}"); }
        }

        public string RoleId
        {
            get { return GetSingleClaimValue($"{InternalContext.RoleId}"); }
        }

        public string SessionId
        {
            get { return GetSingleClaimValue($"{InternalContext.SessionId}"); }
        }

        public string UserProfileId
        {
            get { return GetSingleClaimValue("id"); }
        }

        public string UserType
        {
            get { return GetSingleClaimValue("UserType"); }
        }

        public List<Claim>? GetClaims()
        {
            if (IsAuthenticated == true)
                return _httpContextAccessor.HttpContext?.User?.Claims?.ToList();

            return new List<Claim>();
        }

        private static bool TryParseBoolean(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return false;
            return bool.TryParse(value, out var result) && result;
        }

        private IEnumerable<Claim>? FindClaims(string ClaimType)
        {
            if (IsAuthenticated == true)
                return _httpContextAccessor.HttpContext?.User.Claims.Where(claim => claim.Type.Equals(ClaimType, StringComparison.Ordinal));

            return new List<Claim>();
        }

        private string GetSingleClaimValue(string claimType)
        {
            if (!string.IsNullOrEmpty(claimType))
            {
                Claim? c = FindClaims(claimType)?.FirstOrDefault();
                if (c != null)
                    return c.Value;
            }

            return string.Empty;
        }
    }
}
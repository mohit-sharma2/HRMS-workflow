using HRMS.Shared.Domain.Entity;

namespace HRMS.Shared.Application.Extensions
{
    internal static class UserContextExtension
    {
        internal static UserBase GetUserBaseContext(this ClaimsPrincipalExtensions userInfo, DateTime createdOn, DateTime modifiedOn)
        {
            return new UserBase
            {
                CreatedByUserId = userInfo.UserProfileId,
                CreatedByUserName = userInfo.Name,
                CreatedOn = createdOn,
                ModifiedByUserId = userInfo.UserProfileId,
                ModifiedByUserName = userInfo.Name,
                ModifiedOn = modifiedOn
            };
        }

        internal static UserBase GetUserBaseContext(this ClaimsPrincipalExtensions userInfo, DateTime createdOn)
        {
            return new UserBase
            {
                CreatedByUserId = userInfo.UserProfileId,
                CreatedByUserName = userInfo.Name,
                CreatedOn = createdOn
            };
        }

        internal static UserBase GetUserBaseContext(this ClaimsPrincipalExtensions userInfo, UserBase userContext, DateTime modifiedOn)
        {
            userContext.ModifiedByUserId = userInfo.UserProfileId;
            userContext.ModifiedByUserName = userInfo.Name;
            userContext.ModifiedOn = modifiedOn;
            return userContext;
        }

        internal static string TryGetValue(Lazy<Dictionary<string, string>> DPFTdata, string internalContext, bool throwExceptionWhenValueIsNull = false)
        {
            var contextData = DPFTdata.Value ?? null;
            if (contextData == null)
            {
                return string.Empty;
            }

            if (contextData.TryGetValue(internalContext.ToString(), out var value))
            {
                return value;
            }
            else if (throwExceptionWhenValueIsNull)
            {
                throw new ArgumentNullException($"The value for {internalContext} can not be null.");
            }

            return string.Empty;
        }
    }
}
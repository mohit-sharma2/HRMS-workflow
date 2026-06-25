using AutoMapper;
using HRMS.Shared.Application.Extensions;
using HRMS.Shared.Domain.Entity;

namespace HRMS.Shared.Application.Mapper
{
    public static class UserContextCreator
    {
        public static UserBase? Upsert(ClaimsPrincipalExtensions _userInfo, UserBase? userBase)
        {
            var currDateTime = DateTime.UtcNow;
            var userContext = userBase;
            return userContext != null ? _userInfo.GetUserBaseContext(userContext, currDateTime) : _userInfo.GetUserBaseContext(currDateTime, currDateTime);
        }
    }

    public class UserContextValueResolver<TSource, TDestination> : IValueResolver<TSource, TDestination, UserBase?>
    {
        private readonly ClaimsPrincipalExtensions _userInfo;

        public UserContextValueResolver(ClaimsPrincipalExtensions userInfo)
        {
            _userInfo = userInfo ?? throw new ArgumentNullException(nameof(userInfo));
        }

        public UserBase? Resolve(TSource source, TDestination destination, UserBase? destMember, ResolutionContext context)
        {
            var currDateTime = DateTime.UtcNow;
            var userContext = (UserBase?)typeof(TDestination).GetProperty("UserContext")?.GetValue(destination);
            return userContext != null
                ? _userInfo.GetUserBaseContext(userContext, currDateTime)
                : _userInfo.GetUserBaseContext(currDateTime, currDateTime);
        }
    }
}
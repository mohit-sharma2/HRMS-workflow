using AutoMapper;
using HRMS.Core.Postgres.Common;
using HRMS.Shared.Application.Extensions;
using Microsoft.AspNetCore.Http;

namespace HRMS.Shared.Application.Mapper
{
    public class BaseEntityAuditAction<TSource, TDestination> : IMappingAction<TSource, TDestination>
        where TDestination : BaseEntity
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ClaimsPrincipalExtensions _userInfo;

        public BaseEntityAuditAction(ClaimsPrincipalExtensions userInfo, IHttpContextAccessor httpContextAccessor)
        {
            _userInfo = userInfo ?? throw new ArgumentNullException(nameof(userInfo));
            _httpContextAccessor = httpContextAccessor;
        }

        public void Process(TSource source, TDestination destination, ResolutionContext context)
        {
            var now = DateTime.UtcNow;
            destination.CreatedOn = now;

            if (_userInfo.IsAuthenticated == true)
            {
                destination.CreatedByUserId = _userInfo.UserProfileId;
                destination.CreatedByUserName = _userInfo.Name;
                destination.ModifiedByUserId = _userInfo.UserProfileId;
                destination.ModifiedByUserName = _userInfo.Name;
                destination.ModifiedOn = now;
            }
        }
    }
}
using AutoMapper;
using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Application.Extensions;
using HRMS.Shared.Application.Helper;
using HRMS.Shared.Application.Modules.MediaFeature;
using HRMS.Shared.Application.Services;
using HRMS.Shared.Domain.Enum;
using Microsoft.Extensions.Configuration;

namespace HRMS.Shared.Application.Mapper
{
    public static class ProfileUrl
    {
        public static string RegularUrl(string? _blobUrl, string? userId)
        {
            var blobPath = $"users/{userId}/ProfilePicture";
            return $"{_blobUrl}{blobPath}?c={DateTime.Now.Ticks}";
        }

        public static string ThumbnailUrl(string? _blobUrl, string? userId)
        {
            var thumbnailBlobPath = $"users/{userId}/ProfilePictureThumbnail";

            return $"{_blobUrl}{thumbnailBlobPath}?c={DateTime.Now.Ticks}";
        }
    }

    public class ProfilePictureResolver
    {
        private readonly IAzureStorage _azureStorage;
        private readonly string _blobUrl;

        public ProfilePictureResolver(IConfiguration configuration, IAzureStorage azureStorage)
        {
            _blobUrl = configuration.ExtractKey<BlobStorage>(Key.BlobStorage).Url ?? string.Empty;
            _azureStorage = azureStorage;
        }

        public MediaItem GetProfilePictureMediaItem(string? userId)
        {
            if (string.IsNullOrEmpty(userId))
                return new MediaItem();

            return new MediaItem
            {
                Uri = GetProfilePictureUrl(userId),
                ThumbnailUri = GetProfilePictureThumbnailUrl(userId),
                ContainerName = BlobContainerNames.users,
            };
        }

        public string? GetProfilePictureThumbnailUrl(string? userId)
        {
            if (string.IsNullOrEmpty(userId))
                return null;

            return ProfileUrl.ThumbnailUrl(_blobUrl, userId);
        }

        public string? GetProfilePictureUrl(string? userId)
        {
            if (string.IsNullOrEmpty(userId))
                return null;

            return ProfileUrl.RegularUrl(_blobUrl, userId);
        }
    }

    public class ProfilePictureResolverByCreatedByUserId<TSource, TDestination> : IValueResolver<TSource, TDestination, string?>
    {
        private readonly IAzureStorage _azureStorage;
        private readonly string _blobUrl;
        private readonly ClaimsPrincipalExtensions _userInfo;

        public ProfilePictureResolverByCreatedByUserId(IConfiguration configuration, IAzureStorage azureStorage, ClaimsPrincipalExtensions userInfo)
        {
            _blobUrl = configuration.ExtractKey<BlobStorage>(Key.BlobStorage).Url ?? string.Empty;
            _azureStorage = azureStorage;
            _userInfo = userInfo;
        }

        public string? Resolve(TSource source, TDestination destination, string? destMember, ResolutionContext context)
        {
            if (source == null)
                return null;

            var userId = source.GetType().GetProperty("CreatedByUserId")?.GetValue(source)?.ToString();
            if (string.IsNullOrEmpty(userId)) return null;

            return ProfileUrl.RegularUrl(_blobUrl, userId);

            //// Check if the blob exists (lightweight metadata call)
            //var existsTask = _azureStorage.IsExistsAsync("users", $"{userId}/ProfilePicture"); // or whatever container you're using
            //existsTask.Wait(); // Still blocking, but much faster than DownloadAsync

            //if (!existsTask.Result)
            //    return null;

            // Construct direct URL with cache-busting
            //var userId = source.GetType().GetProperty("CreatedByUserId")?.GetValue(source)?.ToString();
            //// Calling async method synchronously (blocking on async operation)
            //var uriTask = _azureStorage.DownloadAsync("users", $"{userId}/ProfilePicture");
            //uriTask.Wait();  // Block until the task completes

            //// Return the URI as a string
            //return uriTask.Result.Uri;
        }
    }
}
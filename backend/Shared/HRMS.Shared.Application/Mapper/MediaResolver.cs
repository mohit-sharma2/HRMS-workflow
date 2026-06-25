using AutoMapper;
using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Application.Helper;
using HRMS.Shared.Application.Modules.MediaFeature;
using HRMS.Shared.Domain.Entity;
using HRMS.Shared.Domain.Enum;
using Microsoft.Extensions.Configuration;
using System.Net;

namespace HRMS.Shared.Application.Mapper
{
    public abstract class MediaResolverBase
    {
        protected string BlobUrl { get; }

        protected MediaResolverBase(IConfiguration configuration)
        {
            BlobUrl = configuration.ExtractKey<BlobStorage>(Key.BlobStorage).Url ?? string.Empty;
        }
    }

    public class MediaDtoToItemResolver : MediaResolverBase, IValueResolver<MediaDto, MediaItem, string?>
    {
        public MediaDtoToItemResolver(IConfiguration configuration) : base(configuration)
        {
        }

        public string? Resolve(MediaDto source, MediaItem destination, string? destMember, ResolutionContext context)
        {
            if (source == null)
                return string.Empty;

            return MediaUrlBuilder.BuildEncodedUrl(BlobUrl, source.ContainerName, source.FolderName, source.SubFolderName, source.FilePath);
        }
    }

    public class MediaItemResolver : MediaResolverBase, IValueResolver<Media, MediaItem, string?>
    {
        public MediaItemResolver(IConfiguration configuration) : base(configuration)
        {
        }

        public string? Resolve(Media source, MediaItem destination, string? destMember, ResolutionContext context)
        {
            if (source == null)
                return string.Empty;

            return MediaUrlBuilder.BuildEncodedUrl(BlobUrl, source.ContainerName, source.FolderName, source.SubFolderName, source.FilePath);
        }
    }

    public class MediaItemThumbnailResolver : MediaResolverBase, IValueResolver<Media, MediaItem, string?>
    {
        public MediaItemThumbnailResolver(IConfiguration configuration) : base(configuration)
        {
        }

        public string? Resolve(Media source, MediaItem destination, string? destMember, ResolutionContext context)
        {
            if (source == null)
                return string.Empty;

            return MediaUrlBuilder.BuildUrl(BlobUrl, source.ContainerName, source.FolderName, source.SubFolderName, source.ThumbnailPath);
        }
    }

    public class MediaResolver : MediaResolverBase, IValueResolver<Media, MediaDto, string?>
    {
        public MediaResolver(IConfiguration configuration) : base(configuration)
        {
        }

        public string? Resolve(Media source, MediaDto destination, string? destMember, ResolutionContext context)
        {
            if (source == null)
                return string.Empty;

            return MediaUrlBuilder.BuildUrl(BlobUrl, source.ContainerName, source.FolderName, source.SubFolderName, source.FilePath);
        }
    }

    public class MediaThumbnailResolver : MediaResolverBase, IValueResolver<Media, MediaDto, string?>
    {
        public MediaThumbnailResolver(IConfiguration configuration) : base(configuration)
        {
        }

        public string? Resolve(Media source, MediaDto destination, string? destMember, ResolutionContext context)
        {
            if (source == null)
                return string.Empty;

            return MediaUrlBuilder.BuildUrl(BlobUrl, source.ContainerName, source.FolderName, source.SubFolderName, source.ThumbnailPath);
        }
    }

    internal static class MediaUrlBuilder
    {
        public static string BuildUrl(string blobUrl, object? containerName, string? folderName, string? subFolderName, string? filePath)
        {
            return $"{blobUrl}{Convert.ToString(containerName)?.ToLowerInvariant() ?? string.Empty}/" +
                   $"{BuildRelativePath(folderName, subFolderName, filePath)}?c={DateTime.Now.Ticks}";
        }

        public static string BuildEncodedUrl(string blobUrl, object? containerName, string? folderName, string? subFolderName, string? filePath)
        {
            var encodedPath = WebUtility.UrlEncode(BuildRelativePath(folderName, subFolderName, filePath))
                .Replace("+", "%20");

            return $"{blobUrl}{Convert.ToString(containerName)?.ToLowerInvariant() ?? string.Empty}/{encodedPath}?c={DateTime.Now.Ticks}";
        }

        private static string BuildRelativePath(string? folderName, string? subFolderName, string? filePath)
        {
            return $"{(string.IsNullOrEmpty(folderName) ? "" : folderName + "/")}" +
                   $"{(string.IsNullOrEmpty(subFolderName) ? "" : subFolderName + "/")}" +
                   $"{filePath}";
        }
    }
}
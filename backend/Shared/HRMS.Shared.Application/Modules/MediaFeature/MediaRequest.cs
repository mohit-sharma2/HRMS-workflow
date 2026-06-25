using HRMS.Core.Postgres.Common;
using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Domain.Enum;
using MediatR;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace HRMS.Shared.Application.Modules.MediaFeature
{
    public enum PlatForm
    {
        [GraphQLName("Current")]
        Current
    }

    public class DownloadMediaDto : UploadMedia
    {
        public string? FilePath { get; set; }
    }

    public class DownloadMediaRequest : ExecutionRequest, IRequest<BaseResponse<DownloadMediaResponse>>
    {
        public DownloadMediaDto? RequestParam { get; set; }
    }

    public class DownloadMediaV1Request : ExecutionRequest, IRequest<BaseResponse<DownloadMediaV1Response>>
    {
        public DownloadMediaDto? RequestParam { get; set; }
    }

    public class DownloadMultipleMediaRequest : ExecutionRequest, IRequest<BaseResponse<DownloadMultipleMediaResponse>>
    {
        public DownloadMultipleMediaRequestDto? RequestParam { get; set; }
    }

    public class DownloadMultipleMediaRequestDto
    {
        public string? ContainerName { get; set; }
        public string? FilePath { get; set; }
        public string? FolderName { get; set; }
        public string? SubFolderName { get; set; }
    }

    public class DownloadZipMediaRequest : ExecutionRequest, IRequest<BaseResponse<DownloadMediaResponse>>
    {
        public DownloadMediaDto? RequestParam { get; set; }
    }

    public class DownloadZipMediaV1Request : ExecutionRequest, IRequest<BaseResponse<DownloadMediaV1Response>>
    {
        public DownloadMediaDto? RequestParam { get; set; }
    }

    public class MediaDto
    {
        [JsonConverter(typeof(StringEnumConverter))]
        public BlobContainerNames? ContainerName { get; set; }

        public string? ContentType { get; set; }
        public List<MediaDto>? Documents { get; set; }
        public string? FileExtension { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public long? FileSize { get; set; }
        public string? FolderName { get; set; }
        public string? MediaId { get; set; }
        public string? MediaType { get; set; }
        public string? SubFolderName { get; set; }
        public string? ThumbnailPath { get; set; }
        public string? ThumbnailUri { get; set; }
        public string? Uri { get; set; }
    }

    public class PreviewMediaRequest : ExecutionRequest, IRequest<BaseResponse<PreviewMediaResponse>>
    {
        public DownloadMediaDto? RequestParam { get; set; }
    }

    public class UploadMedia
    {
        [JsonConverter(typeof(StringEnumConverter))]
        public BlobContainerNames ContainerName { get; set; }

        public string? FolderName { get; set; }
        public string? SubFolderName { get; set; }
    }

    public class UploadMediaDto : UploadMedia
    {
        public IFormFile? FormFile { get; set; }
    }

    public class UploadMediaRequest : ExecutionRequest, IRequest<BaseResponse<UploadMediaResponse>>
    {
        public UploadMediaDto? RequestParam { get; set; }
    }

    public class UploadMediaV1Dto : UploadMedia
    {
        public IFile? FormFile { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public PlatForm? Platform { get; set; }
    }

    public class UploadMediaV1Request : ExecutionRequest, IRequest<BaseResponse<UploadMediaResponse>>
    {
        public UploadMediaV1Dto? RequestParam { get; set; }
    }

    public class UploadMediaV2Dto
    {
        public List<MediaDto>? Documents { get; set; }
        public bool? IsSameFileNameAndPath { get; set; } = false;
    }

    public class UploadMediaV2Request : ExecutionRequest, IRequest<BaseResponse<UploadMediaV2Response>>
    {
        public UploadMediaV2Dto? RequestParam { get; set; }
    }
}
using HRMS.Shared.Application.DTOs;
using HRMS.Shared.Domain.Enum;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace HRMS.Shared.Application.Modules.MediaFeature
{
    public class BlobDto
    {
        public Stream? Content { get; set; }
        public string? ContentType { get; set; }
        public string? Name { get; set; }

        public string? Path { get; set; }
        public long? Size { get; set; }
        public string? Uri { get; set; }
    }

    public class BlobResponseDto
    {
        public BlobResponseDto()
        {
            Blob = new BlobDto();
        }

        public BlobDto Blob { get; set; }
        public bool Error { get; set; }
        public string? Status { get; set; }
    }

    public class DownloadMediaResponse
    {
        public Stream? Content { get; set; }
        public string? ContentType { get; set; }
        public bool Error { get; set; }
        public string? FileExtension { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public long? FileSize { get; set; }
        public string? MediaType { get; set; }
        public string? Status { get; set; }
        public string? Uri { get; set; }

        public void setMediaType()
        {
            this.MediaType = MediaTypeMapper.GetMediaTypeFromExtension(this.FileExtension).ToString();
        }
    }

    public class DownloadMediaV1Response
    {
        public string? Content { get; set; }
        public string? ContentType { get; set; }
        public bool Error { get; set; }
        public string? FileExtension { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public long? FileSize { get; set; }
        public string? MediaType { get; set; }
        public string? Status { get; set; }
        public string? Uri { get; set; }

        public void setMediaType()
        {
            this.MediaType = MediaTypeMapper.GetMediaTypeFromExtension(this.FileExtension).ToString();
        }
    }

    public class DownloadMultipleMediaResponse : DownloadMediaV1Response
    {
    }

    public class MediaItem
    {
        [JsonConverter(typeof(StringEnumConverter))]
        public BlobContainerNames? ContainerName { get; set; }

        public string? ContentType { get; set; }
        public List<MediaItem>? Documents { get; set; }
        public string? FileExtension { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public long? FileSize { get; set; }
        public string? FolderName { get; set; }
        public string? MediaId { get; set; }
        public string? MediaType { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public Status Status { get; set; } = Status.Active;

        public string? SubFolderName { get; set; }
        public string? ThumbnailPath { get; set; }
        public string? ThumbnailUri { get; set; }
        public string? Uri { get; set; }
        public UserBaseItem? UserContext { get; set; }

        public void setMediaType()
        {
            this.MediaType = MediaTypeMapper.GetMediaTypeFromExtension(this.FileExtension).ToString();
        }
    }

    public class PreviewMediaResponse
    {
        public string? ContentType { get; set; }
        public string? FileExtension { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public long? FileSize { get; set; }
        public string? MediaType { get; set; }
        public string? Uri { get; set; }

        public void setMediaType()
        {
            this.MediaType = MediaTypeMapper.GetMediaTypeFromExtension(this.FileExtension).ToString();
        }
    }

    public class UploadMediaResponse
    {
        public bool Error { get; set; }
        public MediaItem? Media { get; set; }
        public string? Status { get; set; }
    }

    public class UploadMediaV2Response
    {
        public List<MediaItem>? Medias { get; set; }
    }
}
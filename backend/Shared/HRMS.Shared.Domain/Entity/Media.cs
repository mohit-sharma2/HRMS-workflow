using HRMS.Shared.Domain.Enum;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace HRMS.Shared.Domain.Entity
{
    public class Media
    {
        [JsonConverter(typeof(StringEnumConverter))]
        public BlobContainerNames? ContainerName { get; set; }

        public List<Media>? Documents { get; set; }
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

        public UserBase? UserContext { get; set; }
    }
}
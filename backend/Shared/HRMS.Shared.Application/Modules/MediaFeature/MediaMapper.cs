using AutoMapper;
using HRMS.Shared.Application.Mapper;
using HRMS.Shared.Domain.Entity;
using HRMS.Shared.Domain.Enum;
using Path = System.IO.Path;

namespace HRMS.Shared.Application.Modules.MediaFeature
{
    public sealed class CreateMediaMapper : Profile
    {
        public CreateMediaMapper()
        {
            CreateMap<MediaDto, Media>()
                .ForMember(dest => dest.MediaType, opt => opt.MapFrom(src => MediaTypeMapper.GetMediaTypeFromExtension((Path.GetExtension(src.FilePath) ?? string.Empty).TrimStart('.')).ToString()))
                .ForMember(dest => dest.MediaId, opt => opt.MapFrom(src => !string.IsNullOrEmpty(src.MediaId) ? src.MediaId : Guid.NewGuid().ToString()))
                .ForMember(dest => dest.UserContext, opt => opt.Ignore());
        }
    }

    public sealed class DownloadMediaMapper : Profile
    {
        public DownloadMediaMapper()
        {
            CreateMap<BlobResponseDto, Media>()
                .ForMember(dest => dest.FileName, opt => opt.MapFrom(src => src.Blob.Name))
                .ForMember(dest => dest.FilePath, opt => opt.MapFrom(src => src.Blob.Path))
                .ForMember(dest => dest.FileSize, opt => opt.MapFrom(src => src.Blob.Size))
                .ForMember(dest => dest.FileExtension, opt => opt.MapFrom(src => Path.GetExtension(src.Blob.Path)))
                .ForMember(dest => dest.MediaId, opt => opt.MapFrom(src => Guid.NewGuid().ToString()))
                .ForMember(dest => dest.MediaType, opt => opt.MapFrom(src => MediaTypeMapper.GetMediaTypeFromExtension(Path.GetExtension(src.Blob.Path)).ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Status.Active))
                .ForMember(dest => dest.UserContext, opt => opt.Ignore());
        }
    }

    public sealed class DownloadMultipleMediaMapper : Profile
    {
        public DownloadMultipleMediaMapper()
        {
            CreateMap<DownloadMediaV1Response, DownloadMultipleMediaResponse>();
        }
    }

    public sealed class GetMediaMapper : Profile
    {
        public GetMediaMapper()
        {
            CreateMap<Media, MediaDto>()
             .ForMember(dest => dest.Uri, opt => opt.MapFrom<MediaResolver>())
             .ForMember(dest => dest.ThumbnailUri, opt => opt.MapFrom<MediaThumbnailResolver>());
            //.ForMember(dest => dest, opt => opt.Condition(src => src.Status != Status.Deleted));

            CreateMap<Media, MediaItem>()
             .ForMember(dest => dest.Uri, opt => opt.MapFrom<MediaItemResolver>())
             .ForMember(dest => dest.ThumbnailUri, opt => opt.MapFrom<MediaItemThumbnailResolver>());

            CreateMap<MediaItem, Media>();
        }
    }

    /// <summary>
    /// Smart MediaId resolver that handles create vs update logic
    /// </summary>
    public class MediaIdResolver : IValueResolver<MediaDto, Media, string>
    {
        public string Resolve(MediaDto source, Media destination, string destMember, ResolutionContext context)
        {
            // If MediaId is provided -> UPDATE (preserve existing MediaId)
            if (!string.IsNullOrEmpty(source.MediaId))
                return source.MediaId;

            // If MediaId is empty/null -> CREATE (generate new MediaId)
            return Guid.NewGuid().ToString();
        }
    }

    /// <summary>
    /// Custom converter that handles media list updates intelligently
    /// </summary>
    public class SmartMediaListConverter : ITypeConverter<UpdateMediaContext, List<Media>>
    {
        private readonly IMapper _mapper;

        public SmartMediaListConverter(IMapper mapper)
        {
            _mapper = mapper;
        }

        public List<Media> Convert(UpdateMediaContext source, List<Media> destination, ResolutionContext context)
        {
            var existingDocuments = source.ExistingDocuments ?? new List<Media>();
            var result = new List<Media>();

            // Get all MediaIds from the request
            var requestedMediaIds = source.NewDocuments?.Where(d => !string.IsNullOrEmpty(d.MediaId))
                                                   .Select(d => d.MediaId!)
                                                   .ToHashSet() ?? new HashSet<string>();

            // ✅ DELETE: Mark existing documents not in request as deleted
            foreach (var existingDocument in existingDocuments)
            {
                if (string.IsNullOrEmpty(existingDocument.MediaId) || !requestedMediaIds.Contains(existingDocument.MediaId))
                {
                    existingDocument.Status = Status.Deleted;
                }
            }

            // Process new documents from request
            if (source?.NewDocuments != null)
            {
                foreach (var documentDto in source.NewDocuments)
                {
                    if (!existingDocuments.Any(x => x.MediaId == documentDto.MediaId))
                    {
                        // ✅ ADD: New document - create with new MediaId and UserContext
                        var newMedia = _mapper.Map<Media>(documentDto);
                        result.Add(newMedia);
                    }
                    else
                    {
                        // ✅ UPDATE: Existing document - find and update
                        var existingMedia = existingDocuments.FirstOrDefault(d => d.MediaId == documentDto.MediaId);
                        if (existingMedia != null)
                        {
                            // Update existing document - preserve MediaId and UserContext
                            existingMedia.Status = Status.Active;
                            _mapper.Map(documentDto, existingMedia);
                            //result.Add(existingMedia);
                        }
                        else
                        {
                            // ✅ ADD: MediaId provided but not found in existing documents - add as new
                            var newMedia = _mapper.Map<Media>(documentDto);
                            result.Add(newMedia);
                        }
                    }
                }
            }

            // Add all existing documents (including deleted ones) to result
            result.AddRange(existingDocuments);

            return result;
        }
    }

    /// <summary>
    /// Smart Media List Mapper that handles media list updates with existing documents context
    /// </summary>
    public sealed class SmartMediaListMapper : Profile
    {
        public SmartMediaListMapper()
        {
            CreateMap<UpdateMediaContext, List<Media>>()
                .ConvertUsing<SmartMediaListConverter>();
        }
    }

    /// <summary>
    /// Context model for media list updates
    /// </summary>
    public class UpdateMediaContext
    {
        public List<Media>? ExistingDocuments { get; set; }
        public List<MediaDto>? NewDocuments { get; set; }
    }

    public sealed class UploadMediaMapper : Profile
    {
        public UploadMediaMapper()
        {
        }
    }
}
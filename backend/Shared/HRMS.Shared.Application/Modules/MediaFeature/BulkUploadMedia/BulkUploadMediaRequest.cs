using HRMS.Core.Postgres.Common;
using HRMS.Shared.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace HRMS.Shared.Application.Modules.MediaFeature.BulkUploadMedia
{
    public class BulkUploadMediaDto : UploadMedia
    {
        public List<IFormFile>? FormFiles { get; set; }
    }

    public class BulkUploadMediaRequest : ExecutionRequest, IRequest<BaseResponse<BulkUploadMediaResponse>>
    {
        public BulkUploadMediaDto? RequestParam { get; set; }
    }

    public class BulkUploadMediaV1Dto : UploadMedia
    {
        public List<IFile>? FormFiles { get; set; }

        [JsonConverter(typeof(StringEnumConverter))]
        public PlatForm? Platform { get; set; }
    }

    public class BulkUploadMediaV1Request : ExecutionRequest, IRequest<BaseResponse<BulkUploadMediaResponse>>
    {
        public BulkUploadMediaV1Dto? RequestParam { get; set; }
    }
}
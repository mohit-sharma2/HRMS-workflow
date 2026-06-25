using AutoMapper;
using RecruitmentFeature.Domain;

namespace RecruitmentFeature.Application.DTO
{
    // ─── JobPosting Mappers ────────────────────────────────────────────────────

    public class CreateJobPostingMapper : Profile
    {
        public CreateJobPostingMapper()
        {
            CreateMap<CreateJobPostingDto, JobPosting>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(_ => Guid.NewGuid().ToString()))
                .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status ?? "Active"));
        }
    }

    public class UpdateJobPostingMapper : Profile
    {
        public UpdateJobPostingMapper()
        {
            CreateMap<UpdateJobPostingDto, JobPosting>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.JobPostingId))
                .ForMember(dest => dest.ModifiedOn, opt => opt.MapFrom(_ => DateTime.UtcNow));
        }
    }

    public sealed class GetAllJobPostingsMapper : Profile
    {
        public GetAllJobPostingsMapper()
        {
            CreateMap<JobPosting, GetAllJobPostingsItem>()
                .ForMember(dest => dest.JobPostingId, opt => opt.MapFrom(src => src.Id));
        }
    }

    // ─── Candidate Mappers ─────────────────────────────────────────────────────

    public class CreateCandidateMapper : Profile
    {
        public CreateCandidateMapper()
        {
            CreateMap<CreateCandidateDto, Candidate>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(_ => Guid.NewGuid().ToString()))
                .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status ?? "New"));
        }
    }

    public class UpdateCandidateMapper : Profile
    {
        public UpdateCandidateMapper()
        {
            CreateMap<UpdateCandidateDto, Candidate>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.CandidateId))
                .ForMember(dest => dest.ModifiedOn, opt => opt.MapFrom(_ => DateTime.UtcNow));
        }
    }

    public class UpdateCandidateStageMapper : Profile
    {
        public UpdateCandidateStageMapper()
        {
            CreateMap<UpdateCandidateStageDto, Candidate>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.CandidateId))
                .ForMember(dest => dest.ModifiedOn, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.InterviewDate, opt => opt.MapFrom(src => src.InterviewDate))
                .ForMember(dest => dest.Notes, opt => opt.MapFrom(src => src.Notes));
        }
    }

    public sealed class GetAllCandidatesMapper : Profile
    {
        public GetAllCandidatesMapper()
        {
            CreateMap<Candidate, GetAllCandidatesItem>()
                .ForMember(dest => dest.CandidateId, opt => opt.MapFrom(src => src.Id));
        }
    }
}

// using AutoMapper;
// using RecruitmentFeature.Domain;

// namespace RecruitmentFeature.Application.DTO
// {
//     // ─── JobPosting Mappers ────────────────────────────────────────────────────

//     public class CreateJobPostingMapper : Profile
//     {
//         public CreateJobPostingMapper()
//         {
//             CreateMap<CreateJobPostingDto, JobPosting>()
//                 .ForMember(dest => dest.Id, opt => opt.MapFrom(_ => Guid.NewGuid().ToString()))
//                 .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(_ => DateTime.UtcNow))
//                 .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status ?? "Active"));
//         }
//     }

//     public class UpdateJobPostingMapper : Profile
//     {
//         public UpdateJobPostingMapper()
//         {
//             CreateMap<UpdateJobPostingDto, JobPosting>()
//                 .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.JobPostingId))
//                 .ForMember(dest => dest.ModifiedOn, opt => opt.MapFrom(_ => DateTime.UtcNow));
//         }
//     }

//     public sealed class GetAllJobPostingsMapper : Profile
//     {
//         public GetAllJobPostingsMapper()
//         {
//             CreateMap<JobPosting, GetAllJobPostingsItem>()
//                 .ForMember(dest => dest.JobPostingId, opt => opt.MapFrom(src => src.Id));
//         }
//     }

//     // ─── Candidate Mappers ─────────────────────────────────────────────────────

//     public class CreateCandidateMapper : Profile
//     {
//         public CreateCandidateMapper()
//         {
//             CreateMap<CreateCandidateDto, Candidate>()
//                 .ForMember(dest => dest.Id, opt => opt.MapFrom(_ => Guid.NewGuid().ToString()))
//                 .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(_ => DateTime.UtcNow))
//                 .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status ?? "New"));
//         }
//     }

//     public class UpdateCandidateMapper : Profile
//     {
//         public UpdateCandidateMapper()
//         {
//             CreateMap<UpdateCandidateDto, Candidate>()
//                 .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.CandidateId))
//                 .ForMember(dest => dest.ModifiedOn, opt => opt.MapFrom(_ => DateTime.UtcNow));
//         }
//     }

//     public class UpdateCandidateStageMapper : Profile
//     {
//         public UpdateCandidateStageMapper()
//         {
//             CreateMap<UpdateCandidateStageDto, Candidate>()
//                 .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.CandidateId))
//                 .ForMember(dest => dest.ModifiedOn, opt => opt.MapFrom(_ => DateTime.UtcNow))
//                 .ForAllOtherMembers(opt => opt.Ignore());
//         }
//     }

//     public sealed class GetAllCandidatesMapper : Profile
//     {
//         public GetAllCandidatesMapper()
//         {
//             CreateMap<Candidate, GetAllCandidatesItem>()
//                 .ForMember(dest => dest.CandidateId, opt => opt.MapFrom(src => src.Id));
//         }
//     }
// }

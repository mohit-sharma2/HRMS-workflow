using AutoMapper;
using HRMS.Core.Telemetry.Exceptions;
using HRMS.Shared.Application.Constants;
using HRMS.Shared.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;
using RecruitmentFeature.Application.Repository;
using RecruitmentFeature.Domain;

namespace RecruitmentFeature.Application.DTO
{
    // ─── JobPosting Handlers ───────────────────────────────────────────────────

    public sealed class CreateJobPostingHandler : IRequestHandler<CreateJobPostingRequest, BaseResponse<CreateJobPostingResponse>>
    {
        private readonly IMapper _mapper;
        private readonly IJobPostingRepository _jobPostingRepository;

        public CreateJobPostingHandler(IMapper mapper, IJobPostingRepository jobPostingRepository)
        {
            _mapper = mapper;
            _jobPostingRepository = jobPostingRepository;
        }

        public async Task<BaseResponse<CreateJobPostingResponse>> Handle(CreateJobPostingRequest request, CancellationToken cancellationToken)
        {
            if (request?.RequestParam == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var entity = _mapper.Map<JobPosting>(request.RequestParam);
            entity = await _jobPostingRepository.AddItemAsync(entity);

            return new BaseResponse<CreateJobPostingResponse>
            {
                Data = new CreateJobPostingResponse { JobPostingId = entity?.Id },
                StatusCode = StatusCodes.Status200OK,
                Message = string.Format(Messaging.Insert, "JobPosting"),
                Success = true
            };
        }
    }

    public sealed class UpdateJobPostingHandler : IRequestHandler<UpdateJobPostingRequest, BaseResponse<UpdateJobPostingResponse>>
    {
        private readonly IMapper _mapper;
        private readonly IJobPostingRepository _jobPostingRepository;

        public UpdateJobPostingHandler(IMapper mapper, IJobPostingRepository jobPostingRepository)
        {
            _mapper = mapper;
            _jobPostingRepository = jobPostingRepository;
        }

        public async Task<BaseResponse<UpdateJobPostingResponse>> Handle(UpdateJobPostingRequest request, CancellationToken cancellationToken)
        {
            if (request?.RequestParam == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var existing = await _jobPostingRepository.GetJobPostingAsync(new GetAllJobPostingsRequest
            {
                RequestParam = new GetAllJobPostingsDto { JobPostingId = request.RequestParam.JobPostingId }
            });

            if (existing == null)
                throw new NotFoundException(string.Format(Messaging.NotFound, "JobPosting"));

            var entity = _mapper.Map<JobPosting>(request.RequestParam);
            entity.UserContext = existing.UserContext;
            entity.CreatedOn = existing.CreatedOn;
            entity.CreatedByUserId = existing.CreatedByUserId;
            entity.CreatedByUserName = existing.CreatedByUserName;

            await _jobPostingRepository.UpdateItemAsync(existing.Id, entity);

            return new BaseResponse<UpdateJobPostingResponse>
            {
                Data = new UpdateJobPostingResponse { JobPostingId = existing.Id },
                StatusCode = StatusCodes.Status200OK,
                Message = string.Format(Messaging.Update, "JobPosting"),
                Success = true
            };
        }
    }

    public sealed class DeleteJobPostingHandler : IRequestHandler<DeleteJobPostingRequest, BaseResponse<DeleteJobPostingResponse>>
    {
        private readonly IJobPostingRepository _jobPostingRepository;

        public DeleteJobPostingHandler(IJobPostingRepository jobPostingRepository)
        {
            _jobPostingRepository = jobPostingRepository;
        }

        public async Task<BaseResponse<DeleteJobPostingResponse>> Handle(DeleteJobPostingRequest request, CancellationToken cancellationToken)
        {
            if (request?.RequestParam == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var existing = await _jobPostingRepository.GetJobPostingAsync(new GetAllJobPostingsRequest
            {
                RequestParam = new GetAllJobPostingsDto { JobPostingId = request.RequestParam.JobPostingId }
            });

            if (existing == null)
                throw new NotFoundException(string.Format(Messaging.NotFound, "JobPosting"));

            await _jobPostingRepository.DeleteItemAsync(existing.Id);

            return new BaseResponse<DeleteJobPostingResponse>
            {
                Data = new DeleteJobPostingResponse { JobPostingId = existing.Id },
                StatusCode = StatusCodes.Status200OK,
                Message = string.Format(Messaging.Delete, "JobPosting"),
                Success = true
            };
        }
    }

    public sealed class GetAllJobPostingsHandler : IRequestHandler<GetAllJobPostingsRequest, BaseResponsePagination<GetAllJobPostingsResponse>>
    {
        private readonly IMapper _mapper;
        private readonly IJobPostingRepository _jobPostingRepository;

        public GetAllJobPostingsHandler(IJobPostingRepository jobPostingRepository, IMapper mapper)
        {
            _mapper = mapper;
            _jobPostingRepository = jobPostingRepository;
        }

        public async Task<BaseResponsePagination<GetAllJobPostingsResponse>> Handle(GetAllJobPostingsRequest request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var response = new BaseResponsePagination<GetAllJobPostingsResponse>();
            (var items, int count) = await _jobPostingRepository.GetAllJobPostingsWithCountAsync(request);

            if (items != null && items.Any())
            {
                var data = _mapper.Map<IReadOnlyList<JobPosting>, IReadOnlyList<GetAllJobPostingsItem>>(items.ToList());
                response.Data = new GetAllJobPostingsResponse { JobPostings = data.ToList() };

                if (request.PageCriteria != null && request.PageCriteria.EnablePage)
                {
                    response.Meta = new Meta
                    {
                        Skip = request.PageCriteria.Skip,
                        Take = request.PageCriteria.PageSize,
                        TotalCount = count
                    };
                }
            }

            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK;
            return response;
        }
    }

    // ─── Candidate Handlers ────────────────────────────────────────────────────

    public sealed class CreateCandidateHandler : IRequestHandler<CreateCandidateRequest, BaseResponse<CreateCandidateResponse>>
    {
        private readonly IMapper _mapper;
        private readonly ICandidateRepository _candidateRepository;

        public CreateCandidateHandler(IMapper mapper, ICandidateRepository candidateRepository)
        {
            _mapper = mapper;
            _candidateRepository = candidateRepository;
        }

        public async Task<BaseResponse<CreateCandidateResponse>> Handle(CreateCandidateRequest request, CancellationToken cancellationToken)
        {
            if (request?.RequestParam == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var entity = _mapper.Map<Candidate>(request.RequestParam);
            entity = await _candidateRepository.AddItemAsync(entity);

            return new BaseResponse<CreateCandidateResponse>
            {
                Data = new CreateCandidateResponse { CandidateId = entity?.Id },
                StatusCode = StatusCodes.Status200OK,
                Message = string.Format(Messaging.Insert, "Candidate"),
                Success = true
            };
        }
    }

    public sealed class UpdateCandidateHandler : IRequestHandler<UpdateCandidateRequest, BaseResponse<UpdateCandidateResponse>>
    {
        private readonly IMapper _mapper;
        private readonly ICandidateRepository _candidateRepository;

        public UpdateCandidateHandler(IMapper mapper, ICandidateRepository candidateRepository)
        {
            _mapper = mapper;
            _candidateRepository = candidateRepository;
        }

        public async Task<BaseResponse<UpdateCandidateResponse>> Handle(UpdateCandidateRequest request, CancellationToken cancellationToken)
        {
            if (request?.RequestParam == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var existing = await _candidateRepository.GetCandidateAsync(new GetAllCandidatesRequest
            {
                RequestParam = new GetAllCandidatesDto { CandidateId = request.RequestParam.CandidateId }
            });

            if (existing == null)
                throw new NotFoundException(string.Format(Messaging.NotFound, "Candidate"));

            var entity = _mapper.Map<Candidate>(request.RequestParam);
            entity.UserContext = existing.UserContext;
            entity.CreatedOn = existing.CreatedOn;
            entity.CreatedByUserId = existing.CreatedByUserId;
            entity.CreatedByUserName = existing.CreatedByUserName;

            await _candidateRepository.UpdateItemAsync(existing.Id, entity);

            return new BaseResponse<UpdateCandidateResponse>
            {
                Data = new UpdateCandidateResponse { CandidateId = existing.Id },
                StatusCode = StatusCodes.Status200OK,
                Message = string.Format(Messaging.Update, "Candidate"),
                Success = true
            };
        }
    }

    public sealed class UpdateCandidateStageHandler : IRequestHandler<UpdateCandidateStageRequest, BaseResponse<UpdateCandidateResponse>>
    {
        private readonly ICandidateRepository _candidateRepository;

        public UpdateCandidateStageHandler(ICandidateRepository candidateRepository)
        {
            _candidateRepository = candidateRepository;
        }

        public async Task<BaseResponse<UpdateCandidateResponse>> Handle(UpdateCandidateStageRequest request, CancellationToken cancellationToken)
        {
            if (request?.RequestParam == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var existing = await _candidateRepository.GetCandidateAsync(new GetAllCandidatesRequest
            {
                RequestParam = new GetAllCandidatesDto { CandidateId = request.RequestParam.CandidateId }
            });

            if (existing == null)
                throw new NotFoundException(string.Format(Messaging.NotFound, "Candidate"));

            existing.Status = request.RequestParam.Status;
            existing.InterviewDate = request.RequestParam.InterviewDate ?? existing.InterviewDate;
            existing.Notes = request.RequestParam.Notes ?? existing.Notes;
            existing.ModifiedOn = DateTime.UtcNow;

            await _candidateRepository.UpdateItemAsync(existing.Id, existing);

            return new BaseResponse<UpdateCandidateResponse>
            {
                Data = new UpdateCandidateResponse { CandidateId = existing.Id },
                StatusCode = StatusCodes.Status200OK,
                Message = string.Format(Messaging.Update, "Candidate stage"),
                Success = true
            };
        }
    }

    public sealed class DeleteCandidateHandler : IRequestHandler<DeleteCandidateRequest, BaseResponse<DeleteCandidateResponse>>
    {
        private readonly ICandidateRepository _candidateRepository;

        public DeleteCandidateHandler(ICandidateRepository candidateRepository)
        {
            _candidateRepository = candidateRepository;
        }

        public async Task<BaseResponse<DeleteCandidateResponse>> Handle(DeleteCandidateRequest request, CancellationToken cancellationToken)
        {
            if (request?.RequestParam == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var existing = await _candidateRepository.GetCandidateAsync(new GetAllCandidatesRequest
            {
                RequestParam = new GetAllCandidatesDto { CandidateId = request.RequestParam.CandidateId }
            });

            if (existing == null)
                throw new NotFoundException(string.Format(Messaging.NotFound, "Candidate"));

            await _candidateRepository.DeleteItemAsync(existing.Id);

            return new BaseResponse<DeleteCandidateResponse>
            {
                Data = new DeleteCandidateResponse { CandidateId = existing.Id },
                StatusCode = StatusCodes.Status200OK,
                Message = string.Format(Messaging.Delete, "Candidate"),
                Success = true
            };
        }
    }

    public sealed class GetAllCandidatesHandler : IRequestHandler<GetAllCandidatesRequest, BaseResponsePagination<GetAllCandidatesResponse>>
    {
        private readonly IMapper _mapper;
        private readonly ICandidateRepository _candidateRepository;

        public GetAllCandidatesHandler(ICandidateRepository candidateRepository, IMapper mapper)
        {
            _mapper = mapper;
            _candidateRepository = candidateRepository;
        }

        public async Task<BaseResponsePagination<GetAllCandidatesResponse>> Handle(GetAllCandidatesRequest request, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new BadRequestException(string.Format(Messaging.InvalidRequest));

            var response = new BaseResponsePagination<GetAllCandidatesResponse>();
            (var items, int count) = await _candidateRepository.GetAllCandidatesWithCountAsync(request);

            if (items != null && items.Any())
            {
                var data = _mapper.Map<IReadOnlyList<Candidate>, IReadOnlyList<GetAllCandidatesItem>>(items.ToList());
                response.Data = new GetAllCandidatesResponse { Candidates = data.ToList() };

                if (request.PageCriteria != null && request.PageCriteria.EnablePage)
                {
                    response.Meta = new Meta
                    {
                        Skip = request.PageCriteria.Skip,
                        Take = request.PageCriteria.PageSize,
                        TotalCount = count
                    };
                }
            }

            response.Success = true;
            response.StatusCode = StatusCodes.Status200OK;
            return response;
        }
    }
}


// using AutoMapper;
// using HRMS.Core.Telemetry.Exceptions;
// using HRMS.Shared.Application.Constants;
// using HRMS.Shared.Application.DTOs;
// using MediatR;
// using Microsoft.AspNetCore.Http;
// using RecruitmentFeature.Application.Repository;
// using RecruitmentFeature.Domain;

// namespace RecruitmentFeature.Application.DTO
// {
//     // ─── JobPosting Handlers ───────────────────────────────────────────────────

//     public sealed class CreateJobPostingHandler : IRequestHandler<CreateJobPostingRequest, BaseResponse<CreateJobPostingResponse>>
//     {
//         private readonly IMapper _mapper;
//         private readonly IJobPostingRepository _jobPostingRepository;

//         public CreateJobPostingHandler(IMapper mapper, IJobPostingRepository jobPostingRepository)
//         {
//             _mapper = mapper;
//             _jobPostingRepository = jobPostingRepository;
//         }

//         public async Task<BaseResponse<CreateJobPostingResponse>> Handle(CreateJobPostingRequest request, CancellationToken cancellationToken)
//         {
//             if (request?.RequestParam == null)
//                 throw new BadRequestException(string.Format(Messaging.InvalidRequest));

//             var entity = _mapper.Map<JobPosting>(request.RequestParam);
//             entity.DocumentType = nameof(JobPosting);
//             entity = await _jobPostingRepository.AddItemAsync(entity);

//             return new BaseResponse<CreateJobPostingResponse>
//             {
//                 Data = new CreateJobPostingResponse { JobPostingId = entity?.Id },
//                 StatusCode = StatusCodes.Status200OK,
//                 Message = string.Format(Messaging.Insert, "JobPosting"),
//                 Success = true
//             };
//         }
//     }

//     public sealed class UpdateJobPostingHandler : IRequestHandler<UpdateJobPostingRequest, BaseResponse<UpdateJobPostingResponse>>
//     {
//         private readonly IMapper _mapper;
//         private readonly IJobPostingRepository _jobPostingRepository;

//         public UpdateJobPostingHandler(IMapper mapper, IJobPostingRepository jobPostingRepository)
//         {
//             _mapper = mapper;
//             _jobPostingRepository = jobPostingRepository;
//         }

//         public async Task<BaseResponse<UpdateJobPostingResponse>> Handle(UpdateJobPostingRequest request, CancellationToken cancellationToken)
//         {
//             if (request?.RequestParam == null)
//                 throw new BadRequestException(string.Format(Messaging.InvalidRequest));

//             var existing = await _jobPostingRepository.GetJobPostingAsync(new GetAllJobPostingsRequest
//             {
//                 RequestParam = new GetAllJobPostingsDto { JobPostingId = request.RequestParam.JobPostingId }
//             });

//             if (existing == null)
//                 throw new NotFoundException(string.Format(Messaging.NotFound, "JobPosting"));

//             var entity = _mapper.Map<JobPosting>(request.RequestParam);
//             entity.UserContext = existing.UserContext;
//             entity.CreatedOn = existing.CreatedOn;
//             entity.CreatedByUserId = existing.CreatedByUserId;
//             entity.CreatedByUserName = existing.CreatedByUserName;
//             entity.DocumentType = nameof(JobPosting);

//             await _jobPostingRepository.UpdateItemAsync(existing.Id, entity);

//             return new BaseResponse<UpdateJobPostingResponse>
//             {
//                 Data = new UpdateJobPostingResponse { JobPostingId = existing.Id },
//                 StatusCode = StatusCodes.Status200OK,
//                 Message = string.Format(Messaging.Update, "JobPosting"),
//                 Success = true
//             };
//         }
//     }

//     public sealed class DeleteJobPostingHandler : IRequestHandler<DeleteJobPostingRequest, BaseResponse<DeleteJobPostingResponse>>
//     {
//         private readonly IJobPostingRepository _jobPostingRepository;

//         public DeleteJobPostingHandler(IJobPostingRepository jobPostingRepository)
//         {
//             _jobPostingRepository = jobPostingRepository;
//         }

//         public async Task<BaseResponse<DeleteJobPostingResponse>> Handle(DeleteJobPostingRequest request, CancellationToken cancellationToken)
//         {
//             if (request?.RequestParam == null)
//                 throw new BadRequestException(string.Format(Messaging.InvalidRequest));

//             var existing = await _jobPostingRepository.GetJobPostingAsync(new GetAllJobPostingsRequest
//             {
//                 RequestParam = new GetAllJobPostingsDto { JobPostingId = request.RequestParam.JobPostingId }
//             });

//             if (existing == null)
//                 throw new NotFoundException(string.Format(Messaging.NotFound, "JobPosting"));

//             await _jobPostingRepository.DeleteItemAsync(existing.Id);

//             return new BaseResponse<DeleteJobPostingResponse>
//             {
//                 Data = new DeleteJobPostingResponse { JobPostingId = existing.Id },
//                 StatusCode = StatusCodes.Status200OK,
//                 Message = string.Format(Messaging.Delete, "JobPosting"),
//                 Success = true
//             };
//         }
//     }

//     public sealed class GetAllJobPostingsHandler : IRequestHandler<GetAllJobPostingsRequest, BaseResponsePagination<GetAllJobPostingsResponse>>
//     {
//         private readonly IMapper _mapper;
//         private readonly IJobPostingRepository _jobPostingRepository;

//         public GetAllJobPostingsHandler(IJobPostingRepository jobPostingRepository, IMapper mapper)
//         {
//             _mapper = mapper;
//             _jobPostingRepository = jobPostingRepository;
//         }

//         public async Task<BaseResponsePagination<GetAllJobPostingsResponse>> Handle(GetAllJobPostingsRequest request, CancellationToken cancellationToken)
//         {
//             if (request == null)
//                 throw new BadRequestException(string.Format(Messaging.InvalidRequest));

//             var response = new BaseResponsePagination<GetAllJobPostingsResponse>();
//             (var items, int count) = await _jobPostingRepository.GetAllJobPostingsWithCountAsync(request);

//             if (items != null && items.Any())
//             {
//                 var data = _mapper.Map<IReadOnlyList<JobPosting>, IReadOnlyList<GetAllJobPostingsItem>>(items.ToList());
//                 response.Data = new GetAllJobPostingsResponse { JobPostings = data.ToList() };

//                 if (request.PageCriteria != null && request.PageCriteria.EnablePage)
//                 {
//                     response.Meta = new Meta
//                     {
//                         Skip = request.PageCriteria.Skip,
//                         Take = request.PageCriteria.PageSize,
//                         TotalCount = count
//                     };
//                 }
//             }

//             response.Success = true;
//             response.StatusCode = StatusCodes.Status200OK;
//             return response;
//         }
//     }

//     // ─── Candidate Handlers ────────────────────────────────────────────────────

//     public sealed class CreateCandidateHandler : IRequestHandler<CreateCandidateRequest, BaseResponse<CreateCandidateResponse>>
//     {
//         private readonly IMapper _mapper;
//         private readonly ICandidateRepository _candidateRepository;

//         public CreateCandidateHandler(IMapper mapper, ICandidateRepository candidateRepository)
//         {
//             _mapper = mapper;
//             _candidateRepository = candidateRepository;
//         }

//         public async Task<BaseResponse<CreateCandidateResponse>> Handle(CreateCandidateRequest request, CancellationToken cancellationToken)
//         {
//             if (request?.RequestParam == null)
//                 throw new BadRequestException(string.Format(Messaging.InvalidRequest));

//             var entity = _mapper.Map<Candidate>(request.RequestParam);
//             entity.DocumentType = nameof(Candidate);
//             entity = await _candidateRepository.AddItemAsync(entity);

//             return new BaseResponse<CreateCandidateResponse>
//             {
//                 Data = new CreateCandidateResponse { CandidateId = entity?.Id },
//                 StatusCode = StatusCodes.Status200OK,
//                 Message = string.Format(Messaging.Insert, "Candidate"),
//                 Success = true
//             };
//         }
//     }

//     public sealed class UpdateCandidateHandler : IRequestHandler<UpdateCandidateRequest, BaseResponse<UpdateCandidateResponse>>
//     {
//         private readonly IMapper _mapper;
//         private readonly ICandidateRepository _candidateRepository;

//         public UpdateCandidateHandler(IMapper mapper, ICandidateRepository candidateRepository)
//         {
//             _mapper = mapper;
//             _candidateRepository = candidateRepository;
//         }

//         public async Task<BaseResponse<UpdateCandidateResponse>> Handle(UpdateCandidateRequest request, CancellationToken cancellationToken)
//         {
//             if (request?.RequestParam == null)
//                 throw new BadRequestException(string.Format(Messaging.InvalidRequest));

//             var existing = await _candidateRepository.GetCandidateAsync(new GetAllCandidatesRequest
//             {
//                 RequestParam = new GetAllCandidatesDto { CandidateId = request.RequestParam.CandidateId }
//             });

//             if (existing == null)
//                 throw new NotFoundException(string.Format(Messaging.NotFound, "Candidate"));

//             var entity = _mapper.Map<Candidate>(request.RequestParam);
//             entity.UserContext = existing.UserContext;
//             entity.CreatedOn = existing.CreatedOn;
//             entity.CreatedByUserId = existing.CreatedByUserId;
//             entity.CreatedByUserName = existing.CreatedByUserName;
//             entity.DocumentType = nameof(Candidate);

//             await _candidateRepository.UpdateItemAsync(existing.Id, entity);

//             return new BaseResponse<UpdateCandidateResponse>
//             {
//                 Data = new UpdateCandidateResponse { CandidateId = existing.Id },
//                 StatusCode = StatusCodes.Status200OK,
//                 Message = string.Format(Messaging.Update, "Candidate"),
//                 Success = true
//             };
//         }
//     }

//     public sealed class UpdateCandidateStageHandler : IRequestHandler<UpdateCandidateStageRequest, BaseResponse<UpdateCandidateResponse>>
//     {
//         private readonly ICandidateRepository _candidateRepository;

//         public UpdateCandidateStageHandler(ICandidateRepository candidateRepository)
//         {
//             _candidateRepository = candidateRepository;
//         }

//         public async Task<BaseResponse<UpdateCandidateResponse>> Handle(UpdateCandidateStageRequest request, CancellationToken cancellationToken)
//         {
//             if (request?.RequestParam == null)
//                 throw new BadRequestException(string.Format(Messaging.InvalidRequest));

//             var existing = await _candidateRepository.GetCandidateAsync(new GetAllCandidatesRequest
//             {
//                 RequestParam = new GetAllCandidatesDto { CandidateId = request.RequestParam.CandidateId }
//             });

//             if (existing == null)
//                 throw new NotFoundException(string.Format(Messaging.NotFound, "Candidate"));

//             existing.Status = request.RequestParam.Status;
//             existing.InterviewDate = request.RequestParam.InterviewDate ?? existing.InterviewDate;
//             existing.Notes = request.RequestParam.Notes ?? existing.Notes;
//             existing.ModifiedOn = DateTime.UtcNow;

//             await _candidateRepository.UpdateItemAsync(existing.Id, existing);

//             return new BaseResponse<UpdateCandidateResponse>
//             {
//                 Data = new UpdateCandidateResponse { CandidateId = existing.Id },
//                 StatusCode = StatusCodes.Status200OK,
//                 Message = string.Format(Messaging.Update, "Candidate stage"),
//                 Success = true
//             };
//         }
//     }

//     public sealed class DeleteCandidateHandler : IRequestHandler<DeleteCandidateRequest, BaseResponse<DeleteCandidateResponse>>
//     {
//         private readonly ICandidateRepository _candidateRepository;

//         public DeleteCandidateHandler(ICandidateRepository candidateRepository)
//         {
//             _candidateRepository = candidateRepository;
//         }

//         public async Task<BaseResponse<DeleteCandidateResponse>> Handle(DeleteCandidateRequest request, CancellationToken cancellationToken)
//         {
//             if (request?.RequestParam == null)
//                 throw new BadRequestException(string.Format(Messaging.InvalidRequest));

//             var existing = await _candidateRepository.GetCandidateAsync(new GetAllCandidatesRequest
//             {
//                 RequestParam = new GetAllCandidatesDto { CandidateId = request.RequestParam.CandidateId }
//             });

//             if (existing == null)
//                 throw new NotFoundException(string.Format(Messaging.NotFound, "Candidate"));

//             await _candidateRepository.DeleteItemAsync(existing.Id);

//             return new BaseResponse<DeleteCandidateResponse>
//             {
//                 Data = new DeleteCandidateResponse { CandidateId = existing.Id },
//                 StatusCode = StatusCodes.Status200OK,
//                 Message = string.Format(Messaging.Delete, "Candidate"),
//                 Success = true
//             };
//         }
//     }

//     public sealed class GetAllCandidatesHandler : IRequestHandler<GetAllCandidatesRequest, BaseResponsePagination<GetAllCandidatesResponse>>
//     {
//         private readonly IMapper _mapper;
//         private readonly ICandidateRepository _candidateRepository;

//         public GetAllCandidatesHandler(ICandidateRepository candidateRepository, IMapper mapper)
//         {
//             _mapper = mapper;
//             _candidateRepository = candidateRepository;
//         }

//         public async Task<BaseResponsePagination<GetAllCandidatesResponse>> Handle(GetAllCandidatesRequest request, CancellationToken cancellationToken)
//         {
//             if (request == null)
//                 throw new BadRequestException(string.Format(Messaging.InvalidRequest));

//             var response = new BaseResponsePagination<GetAllCandidatesResponse>();
//             (var items, int count) = await _candidateRepository.GetAllCandidatesWithCountAsync(request);

//             if (items != null && items.Any())
//             {
//                 var data = _mapper.Map<IReadOnlyList<Candidate>, IReadOnlyList<GetAllCandidatesItem>>(items.ToList());
//                 response.Data = new GetAllCandidatesResponse { Candidates = data.ToList() };

//                 if (request.PageCriteria != null && request.PageCriteria.EnablePage)
//                 {
//                     response.Meta = new Meta
//                     {
//                         Skip = request.PageCriteria.Skip,
//                         Take = request.PageCriteria.PageSize,
//                         TotalCount = count
//                     };
//                 }
//             }

//             response.Success = true;
//             response.StatusCode = StatusCodes.Status200OK;
//             return response;
//         }
//     }
// }

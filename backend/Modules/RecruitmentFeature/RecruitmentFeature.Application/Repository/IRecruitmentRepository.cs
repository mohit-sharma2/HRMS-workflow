using HRMS.Core.Postgres.Repositories;
using RecruitmentFeature.Application.DTO;
using RecruitmentFeature.Domain;

namespace RecruitmentFeature.Application.Repository
{
    public interface IJobPostingRepository : IPostgresRepository<JobPosting>
    {
        Task<(IEnumerable<JobPosting> result, int count)> GetAllJobPostingsWithCountAsync(GetAllJobPostingsRequest request);
        Task<JobPosting?> GetJobPostingAsync(GetAllJobPostingsRequest request);
    }

    public interface ICandidateRepository : IPostgresRepository<Candidate>
    {
        Task<(IEnumerable<Candidate> result, int count)> GetAllCandidatesWithCountAsync(GetAllCandidatesRequest request);
        Task<Candidate?> GetCandidateAsync(GetAllCandidatesRequest request);
    }
}

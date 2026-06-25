using HRMS.Core.Postgres.Data;
using HRMS.Core.Postgres.Helper;
using HRMS.Core.Postgres.Interfaces;
using HRMS.Core.Postgres.Repositories;
using HRMS.Core.Telemetry;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq.Expressions;
using RecruitmentFeature.Application.DTO;
using RecruitmentFeature.Application.Repository;
using RecruitmentFeature.Domain;

namespace RecruitmentFeature.Infrastructure
{
    // ─── EF Entity Configurators ───────────────────────────────────────────────

    public class JobPostingEntityConfigurator : IPostgresEntityConfigurator
    {
        public void Configure(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<JobPosting>(entity =>
            {
                entity.ToTable("JobPosting");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(128);
                entity.Property(e => e.DocumentType).IsRequired().HasMaxLength(128);
                entity.Property(e => e.Title).HasMaxLength(500);
                entity.Property(e => e.Department).HasMaxLength(200);
                entity.Property(e => e.Location).HasMaxLength(200);
                entity.Property(e => e.JobType).HasMaxLength(100);
                entity.Property(e => e.ExperienceRequired).HasMaxLength(100);
                entity.Property(e => e.SalaryRange).HasMaxLength(200);
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.HasIndex(e => e.DocumentType);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Department);
                entity.OwnsOne(e => e.UserContext);
            });
        }
    }

    public class CandidateEntityConfigurator : IPostgresEntityConfigurator
    {
        public void Configure(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Candidate>(entity =>
            {
                entity.ToTable("Candidate");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasMaxLength(128);
                entity.Property(e => e.DocumentType).IsRequired().HasMaxLength(128);
                entity.Property(e => e.FullName).HasMaxLength(300);
                entity.Property(e => e.Email).HasMaxLength(300);
                entity.Property(e => e.Phone).HasMaxLength(50);
                entity.Property(e => e.JobPostingId).HasMaxLength(128);
                entity.Property(e => e.AppliedRole).HasMaxLength(300);
                entity.Property(e => e.Status).HasMaxLength(100);
                entity.Property(e => e.Skills).HasMaxLength(1000);
                entity.Property(e => e.ExperienceYears).HasMaxLength(50);
                entity.Property(e => e.ExpectedSalary).HasMaxLength(100);
                entity.Property(e => e.NoticePeriod).HasMaxLength(100);
                entity.Property(e => e.ResumeUrl).HasMaxLength(1000);
                entity.HasIndex(e => e.DocumentType);
                entity.HasIndex(e => e.JobPostingId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Email);
                entity.OwnsOne(e => e.UserContext);
            });
        }
    }

    // ─── JobPosting Repository ─────────────────────────────────────────────────

    public class JobPostingRepository : PostgresDbRepository<JobPosting>, IJobPostingRepository
    {
        public JobPostingRepository(
            PostgresDbContext context,
            ILogger<JobPostingRepository> logger,
            ITelemetryService telemetryService,
            IHttpContextAccessor httpContextAccessor)
            : base(context, logger, telemetryService, httpContextAccessor)
        { }

        public override string TableName => nameof(JobPosting);
        public override string GenerateId(JobPosting entity) => Guid.NewGuid().ToString();

        private Expression<Func<JobPosting, bool>> BuildFilter(GetAllJobPostingsRequest request)
        {
            Expression<Func<JobPosting, bool>> filter = x => x.DocumentType == nameof(JobPosting);

            if (request.RequestParam == null)
                return filter;

            var param = request.RequestParam;

            if (!string.IsNullOrEmpty(param.JobPostingId))
                filter = filter.And(x => x.Id == param.JobPostingId);

            if (!string.IsNullOrEmpty(param.Department))
                filter = filter.And(x => x.Department == param.Department);

            if (!string.IsNullOrEmpty(param.Status))
                filter = filter.And(x => x.Status == param.Status);

            if (!string.IsNullOrEmpty(param.Keyword))
            {
                var kw = param.Keyword.ToLower().Trim();
                Expression<Func<JobPosting, bool>> kwFilter = x => false;
                kwFilter = kwFilter
                    .Or(x => x.Title != null && x.Title.ToLower().Contains(kw))
                    .Or(x => x.Department != null && x.Department.ToLower().Contains(kw))
                    .Or(x => x.Location != null && x.Location.ToLower().Contains(kw));
                filter = filter.And(kwFilter);
            }

            return filter;
        }

        public async Task<(IEnumerable<JobPosting> result, int count)> GetAllJobPostingsWithCountAsync(GetAllJobPostingsRequest request)
        {
            var orderBy = request.OrderByCriteria != null ? OrderBy(request) : x => x.CreatedOn;
            return await GetItemsWithCountAsync(BuildFilter(request), request, orderBy);
        }

        public async Task<JobPosting?> GetJobPostingAsync(GetAllJobPostingsRequest request)
        {
            return await GetItemAsync(BuildFilter(request));
        }
    }

    // ─── Candidate Repository ──────────────────────────────────────────────────

    public class CandidateRepository : PostgresDbRepository<Candidate>, ICandidateRepository
    {
        public CandidateRepository(
            PostgresDbContext context,
            ILogger<CandidateRepository> logger,
            ITelemetryService telemetryService,
            IHttpContextAccessor httpContextAccessor)
            : base(context, logger, telemetryService, httpContextAccessor)
        { }

        public override string TableName => nameof(Candidate);
        public override string GenerateId(Candidate entity) => Guid.NewGuid().ToString();

        private Expression<Func<Candidate, bool>> BuildFilter(GetAllCandidatesRequest request)
        {
            Expression<Func<Candidate, bool>> filter = x => x.DocumentType == nameof(Candidate);

            if (request.RequestParam == null)
                return filter;

            var param = request.RequestParam;

            if (!string.IsNullOrEmpty(param.CandidateId))
                filter = filter.And(x => x.Id == param.CandidateId);

            if (!string.IsNullOrEmpty(param.JobPostingId))
                filter = filter.And(x => x.JobPostingId == param.JobPostingId);

            if (!string.IsNullOrEmpty(param.Status))
                filter = filter.And(x => x.Status == param.Status);

            if (!string.IsNullOrEmpty(param.Keyword))
            {
                var kw = param.Keyword.ToLower().Trim();
                Expression<Func<Candidate, bool>> kwFilter = x => false;
                kwFilter = kwFilter
                    .Or(x => x.FullName != null && x.FullName.ToLower().Contains(kw))
                    .Or(x => x.Email != null && x.Email.ToLower().Contains(kw))
                    .Or(x => x.AppliedRole != null && x.AppliedRole.ToLower().Contains(kw))
                    .Or(x => x.Skills != null && x.Skills.ToLower().Contains(kw));
                filter = filter.And(kwFilter);
            }

            return filter;
        }

        public async Task<(IEnumerable<Candidate> result, int count)> GetAllCandidatesWithCountAsync(GetAllCandidatesRequest request)
        {
            var orderBy = request.OrderByCriteria != null ? OrderBy(request) : x => x.CreatedOn;
            return await GetItemsWithCountAsync(BuildFilter(request), request, orderBy);
        }

        public async Task<Candidate?> GetCandidateAsync(GetAllCandidatesRequest request)
        {
            return await GetItemAsync(BuildFilter(request));
        }
    }
}

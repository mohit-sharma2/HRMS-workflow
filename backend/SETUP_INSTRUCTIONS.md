# HRMS Backend Setup Guide

## Step 1 — Neon.tech Connection String
1. neon.tech pe jao → account banao → New Project → name "HRMS"
2. Connection string copy karo (format: postgresql://user:pass@host/db)
3. `API/HRMS.API/appsettings.json` kholo
4. `YOUR_NEON_HOST`, `YOUR_DB_NAME`, `YOUR_USERNAME`, `YOUR_PASSWORD` replace karo

Example:
```
Host=ep-cool-rain-123456.ap-southeast-1.aws.neon.tech;Port=5432;Database=neondb;Username=neondb_owner;Password=abc123;SSL Mode=Require;Trust Server Certificate=true
```

## Step 2 — Visual Studio mein Solution open karo
`HRMSBoilerPlate.slnx` open karo

## Step 3 — Naye Projects Solution mein add karo
Right click on Solution → Add → Existing Project → yeh 4 add karo:
- `Modules/RecruitmentFeature/RecruitmentFeature.Domain/RecruitmentFeature.Domain.csproj`
- `Modules/RecruitmentFeature/RecruitmentFeature.Application/RecruitmentFeature.Application.csproj`
- `Modules/RecruitmentFeature/RecruitmentFeature.Infrastructure/RecruitmentFeature.Infrastructure.csproj`
- `Modules/RecruitmentFeature/RecruitmentFeature.GraphQL/RecruitmentFeature.GraphQL.csproj`

## Step 4 — Build & Run
```
dotnet build
dotnet run --project API/HRMS.API
```

## Step 5 — Verify
Browser mein kholo: http://localhost:5000/graphql
GraphQL tool dikhega — wahan query test kar sako ge

## Files jo change ki hain (sab already updated hain):
| File | Kya change hua |
|------|----------------|
| `API/HRMS.API/appsettings.json` | Neon connection string + 3 tables |
| `API/HRMS.API/HRMS.API.csproj` | Recruitment projects reference add |
| `API/HRMS.API/Startup.cs` | RecruitmentFeature assembly register |
| `API/HRMS.API/RegisterDependencies/RepositoryRegistration.cs` | AddRecruitmentDependency add |
| `API/HRMS.API/RegisterDependencies/GraphQLModuleRegistration.cs` | AddRecruitmentGraphQL add |

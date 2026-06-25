using HRMS.Shared.Application.Modules.MediaFeature;
using HRMS.Shared.Domain.Enum;
using Microsoft.AspNetCore.Http;

namespace HRMS.Shared.Application.Services
{
    public interface IAzureStorage
    {
        Task<bool> BlobExistsAsync(string blobUrl);

        Task CopyAsync(BlobContainerNames sourceContainerName, BlobContainerNames targetContainerName, string sourceFilePath, string targetFilePath);

        Task<BlobResponseDto> DeleteAsync(BlobContainerNames storageContainerName, string folderName, string fileName);

        Task<DownloadMediaResponse> DownloadAsync(BlobContainerNames storageContainerName, string blobFilename);

        Task<DownloadMediaResponse> DownloadBlobsAndCreateZipAsync(BlobContainerNames storageContainerName, List<string> blobFilenames, string zipFilePath);

        Task<DownloadMediaV1Response> DownloadBlobsAndCreateZipV1Async(BlobContainerNames storageContainerName, List<string> blobFilenames, string zipFilePath);

        Task<DownloadMediaV1Response> DownloadBlobsAndCreateZipV1Async(List<string> containerNames, List<string> blobFilenames, string zipFilePath);

        Task<DownloadMediaV1Response> DownloadV1Async(BlobContainerNames storageContainerName, string blobFilename);

        Task<string> GenerateUploadSasUrl(BlobContainerNames containerName, string blobPath, string contentType);

        Task<HashSet<string>> GetBlobNamesAsync(BlobContainerNames containerNames, string folderPath);

        Task<string> GetFileAsBase64Async(BlobContainerNames storageContainerName, string blobFilePath);

        Task<bool> IsExistsAsync(BlobContainerNames containerName, string blobPath);

        Task MigrateFolderAsync(BlobContainerNames sourceContainer, string sourceFolder, BlobContainerNames targetContainer, string targetFolder);

        Task SaveStreamAsFile(string filePath, Stream inputStream);

        /// <summary>
        /// This method uploads a file submitted with the request
        /// </summary>
        /// <param name="file">File for upload</param>
        /// <returns>Blob with status</returns>
        Task<BlobResponseDto> UploadAsync(BlobContainerNames storageContainerName, string folderName, string fileName, string filePath, string contentType);

        Task<BlobResponseDto> UploadAsync(BlobContainerNames storageContainerName, string folderName, string fileName, IFormFile blob);

        Task<BlobResponseDto> UploadAsync(BlobContainerNames storageContainerName, string folderName, string fileName, byte[] fileBytes, string contentType);

        Task<BlobResponseDto> UploadAsync(BlobContainerNames storageContainerName, string folderName, string fileName, IFile blob);
    }
}
namespace HRMS.Shared.Application.Services
{
    /// <summary>
    /// Converts HEIC/HEIF images to JPEG for storage and display compatibility.
    /// </summary>
    public interface IHeicConversionService
    {
        /// <summary>
        /// If the input appears to be HEIC/HEIF, converts it to JPEG and returns the result.
        /// Otherwise returns null (caller should use the original file).
        /// </summary>
        /// <param name="sourceStream">
        /// Stream containing the image data (will be read from current position).
        /// </param>
        /// <param name="fileName">
        /// Original file name (used to infer format and to derive output name).
        /// </param>
        /// <param name="contentType">Original content type (e.g. image/heic).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>
        /// Conversion result with JPEG stream and metadata, or null if not HEIC or conversion failed.
        /// </returns>
        Task<HeicConversionResult?> ConvertToJpegIfHeicAsync(
            Stream sourceStream,
            string fileName,
            string? contentType,
            CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// Result of converting a HEIC/HEIF image to JPEG. Caller is responsible for disposing <see cref="JpegStream"/>.
    /// </summary>
    public sealed class HeicConversionResult : IDisposable
    {
        public HeicConversionResult(Stream jpegStream, string fileName, string contentType)
        {
            JpegStream = jpegStream ?? throw new ArgumentNullException(nameof(jpegStream));
            FileName = fileName ?? throw new ArgumentNullException(nameof(fileName));
            ContentType = contentType ?? "image/jpeg";
        }

        public string ContentType { get; }
        public string FileName { get; }
        public Stream JpegStream { get; }

        public void Dispose() => JpegStream?.Dispose();
    }
}
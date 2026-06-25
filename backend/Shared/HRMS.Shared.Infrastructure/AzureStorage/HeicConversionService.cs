using HRMS.Shared.Application.Services;
using ImageMagick;

namespace HRMS.Shared.Infrastructure.AzureStorage
{
    /// <summary>
    /// Converts HEIC/HEIF images to JPEG using Magick.NET so they can be stored and displayed universally.
    /// </summary>
    public sealed class HeicConversionService : IHeicConversionService
    {
        private static readonly HashSet<string> HeicContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"
        };

        private static readonly HashSet<string> HeicExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".heic", ".heif"
        };

        public static bool IsHeicFile(string? fileName, string? contentType)
        {
            if (!string.IsNullOrWhiteSpace(fileName) && HeicExtensions.Contains(Path.GetExtension(fileName)))
                return true;
            if (!string.IsNullOrWhiteSpace(contentType) && HeicContentTypes.Contains(contentType.Trim()))
                return true;
            return false;
        }

        public async Task<HeicConversionResult?> ConvertToJpegIfHeicAsync(
            Stream sourceStream,
            string fileName,
            string? contentType,
            CancellationToken cancellationToken = default)
        {
            if (sourceStream == null || !sourceStream.CanRead)
                return null;

            if (!IsHeicFile(fileName, contentType))
                return null;

            try
            {
                sourceStream.Position = 0;
                var settings = new MagickReadSettings();
                settings.SetDefine(MagickFormat.Heic, "preserve-orientation", true);

                using var image = new MagickImage(sourceStream, settings);
                image.Format = MagickFormat.Jpeg;
                image.Quality = 92;

                var outputStream = new MemoryStream();
                await image.WriteAsync(outputStream, MagickFormat.Jpeg, cancellationToken);
                outputStream.Position = 0;

                var baseName = Path.GetFileNameWithoutExtension(fileName);
                var jpegFileName = string.IsNullOrEmpty(baseName) ? "image.jpg" : $"{baseName}.jpg";

                return new HeicConversionResult(outputStream, jpegFileName, "image/jpeg");
            }
            catch (MagickMissingDelegateErrorException)
            {
                // HEIC codec not available on this system (e.g. missing libheif on Linux)
                return null;
            }
            catch (MagickException)
            {
                // Corrupt or unsupported HEIC
                return null;
            }
        }
    }
}
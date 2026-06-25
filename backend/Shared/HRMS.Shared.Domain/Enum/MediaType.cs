namespace HRMS.Shared.Domain.Enum
{
    public enum MediaType
    {
        pdf,
        image,
        video,
        audio,
        doc,
        excel,
        ppt,
        txt,
        zip,
        svg,
        other
    }

    public static class MediaTypeMapper
    {
        private static readonly Dictionary<string, MediaType> _mediaTypeMappings = new Dictionary<string, MediaType>(StringComparer.OrdinalIgnoreCase)
{
    // PDF
    { "pdf", MediaType.pdf },

    // Images
    { "jpg", MediaType.image },
    { "jpeg", MediaType.image },
    { "png", MediaType.image },
    { "gif", MediaType.image },
    { "svg", MediaType.image },
    { "heic", MediaType.image },     // ✅ Apple HEIC
    { "heif", MediaType.image },     // ✅ HEIF format
    { "webp", MediaType.image },     // ✅ Modern web image
    { "bmp", MediaType.image },      // ✅ Bitmap
    { "tiff", MediaType.image },     // ✅ TIFF
    { "tif", MediaType.image },      // ✅ TIFF alternate
    { "ico", MediaType.image },      // ✅ Icon
    { "jfif", MediaType.image },     // ✅ JPEG variant

    // Videos
    { "mp4", MediaType.video },
    { "avi", MediaType.video },
    { "mov", MediaType.video },
    { "mkv", MediaType.video },      // ✅ Matroska
    { "webm", MediaType.video },     // ✅ WebM
    { "flv", MediaType.video },      // ✅ Flash Video
    { "wmv", MediaType.video },      // ✅ Windows Media
    { "m4v", MediaType.video },      // ✅ MPEG-4
    { "3gp", MediaType.video },      // ✅ Mobile video
    { "mpeg", MediaType.video },     // ✅ MPEG
    { "mpg", MediaType.video },      // ✅ MPEG alternate

    // Audio
    { "mp3", MediaType.audio },
    { "wav", MediaType.audio },
    { "aac", MediaType.audio },      // ✅ Advanced Audio Coding
    { "flac", MediaType.audio },     // ✅ Lossless audio
    { "ogg", MediaType.audio },      // ✅ Ogg Vorbis
    { "m4a", MediaType.audio },      // ✅ MPEG-4 audio
    { "wma", MediaType.audio },      // ✅ Windows Media Audio
    { "opus", MediaType.audio },     // ✅ Opus codec
    { "aiff", MediaType.audio },     // ✅ Audio Interchange
    { "aif", MediaType.audio },      // ✅ AIFF alternate

    // Documents
    { "doc", MediaType.doc },
    { "docx", MediaType.doc },
    { "odt", MediaType.doc },        // ✅ OpenDocument Text
    { "rtf", MediaType.doc },        // ✅ Rich Text Format

    // Spreadsheets
    { "xls", MediaType.excel },
    { "xlsx", MediaType.excel },
    { "xlsm", MediaType.excel },     // ✅ Excel with macros
    { "csv", MediaType.excel },      // ✅ CSV
    { "ods", MediaType.excel },      // ✅ OpenDocument Spreadsheet

    // Presentations
    { "ppt", MediaType.ppt },
    { "pptx", MediaType.ppt },
    { "pptm", MediaType.ppt },       // ✅ PowerPoint with macros
    { "odp", MediaType.ppt },        // ✅ OpenDocument Presentation

    // Text
    { "txt", MediaType.txt },
    { "log", MediaType.txt },        // ✅ Log files
    { "md", MediaType.txt },         // ✅ Markdown
    { "json", MediaType.txt },       // ✅ JSON
    { "xml", MediaType.txt },        // ✅ XML
    { "yaml", MediaType.txt },       // ✅ YAML
    { "yml", MediaType.txt },        // ✅ YAML alternate

    // Archives
    { "zip", MediaType.zip },
    { "rar", MediaType.zip },
    { "7z", MediaType.zip },         // ✅ 7-Zip
    { "tar", MediaType.zip },        // ✅ TAR
    { "gz", MediaType.zip },         // ✅ GZip
    { "bz2", MediaType.zip }         // ✅ BZip2
};

        public static MediaType GetMediaTypeFromExtension(string? fileExtension)
        {
            if (string.IsNullOrWhiteSpace(fileExtension))
                return MediaType.other;

            var key = fileExtension.TrimStart('.').ToLowerInvariant();
            if (_mediaTypeMappings.TryGetValue(key, out MediaType mediaType))
            {
                return mediaType;
            }

            return MediaType.other;
        }
    }
}
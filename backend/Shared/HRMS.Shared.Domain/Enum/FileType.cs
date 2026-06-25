namespace HRMS.Shared.Domain.Enum
{
    public enum FileType
    {
        Xlsx,
        Xls,
        Csv,
        Pdf,
        Docx,
        Doc,
        Pptx,
        Ppt,
        Txt,
        Zip,
        Png,
        Jpg,
        Other
    }

    public static class FileTypeMapper
    {
        private static readonly Dictionary<FileType, string> _extensions = new()
        {
            { FileType.Xlsx,  ".xlsx" },
            { FileType.Xls,   ".xls"  },
            { FileType.Csv,   ".csv"  },
            { FileType.Pdf,   ".pdf"  },
            { FileType.Docx,  ".docx" },
            { FileType.Doc,   ".doc"  },
            { FileType.Pptx,  ".pptx" },
            { FileType.Ppt,   ".ppt"  },
            { FileType.Txt,   ".txt"  },
            { FileType.Zip,   ".zip"  },
            { FileType.Png,   ".png"  },
            { FileType.Jpg,   ".jpg"  },
            { FileType.Other, ""      }
        };

        private static readonly Dictionary<FileType, string> _contentTypes = new()
        {
            { FileType.Xlsx,  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            { FileType.Xls,   "application/vnd.ms-excel" },
            { FileType.Csv,   "text/csv" },
            { FileType.Pdf,   "application/pdf" },
            { FileType.Docx,  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            { FileType.Doc,   "application/msword" },
            { FileType.Pptx,  "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
            { FileType.Ppt,   "application/vnd.ms-powerpoint" },
            { FileType.Txt,   "text/plain" },
            { FileType.Zip,   "application/zip" },
            { FileType.Png,   "image/png" },
            { FileType.Jpg,   "image/jpeg" },
            { FileType.Other, "application/octet-stream" }
        };

        public static string GetExtension(FileType fileType) =>
            _extensions.TryGetValue(fileType, out var ext) ? ext : string.Empty;

        public static string GetContentType(FileType fileType) =>
            _contentTypes.TryGetValue(fileType, out var ct) ? ct : "application/octet-stream";
    }
}

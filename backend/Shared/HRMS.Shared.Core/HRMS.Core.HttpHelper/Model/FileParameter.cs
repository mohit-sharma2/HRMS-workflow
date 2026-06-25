namespace HRMS.Core.HttpHelper.Model
{
    public class FileParameter
    {
        public FileParameter(byte[] file) : this(file, null)
        {
        }

        public FileParameter(byte[] file, string? filename) : this(file, filename, null)
        {
        }

        public FileParameter(byte[] file, string? filename, string? contenttype)
        {
            File = file;
            FileName = filename;
            ContentType = contenttype;
        }

        public string? ContentType { get; set; }
        public byte[] File { get; set; }
        public string? FileName { get; set; }
    }
}
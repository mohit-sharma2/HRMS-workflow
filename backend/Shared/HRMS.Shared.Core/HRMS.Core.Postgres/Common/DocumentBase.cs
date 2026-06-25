namespace HRMS.Core.Postgres.Common
{
    public abstract class DocumentBase
    {
        public DocumentBase()
        {
            DocumentType = GetType().Name;
        }

        public string DocumentType { get; private set; }

        public void SetCustomDocumentType(string type)
        {
            DocumentType = type;
        }
    }
}

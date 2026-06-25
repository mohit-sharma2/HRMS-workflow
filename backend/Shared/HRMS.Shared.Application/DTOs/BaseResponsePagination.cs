namespace HRMS.Shared.Application.DTOs
{
    public class BaseResponsePagination<T> : BaseReponseGeneric<T>
    {
        public Meta? Meta { get; set; }
    }

    public class Meta
    {
        public string? ContinuationToken { get; set; }
        public bool HasNextPage => PageNumber < TotalPages;
        public bool HasPreviousPage => PageNumber > 1;
        public int PageNumber => (Skip / Take) + 1;
        public int Skip { get; set; }
        public int Take { get; set; }
        public long TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / Take);

        public string UrlEncodedContinuationToken
        {
            get => Uri.EscapeDataString(this.ContinuationToken ?? string.Empty);
        }
    }
}
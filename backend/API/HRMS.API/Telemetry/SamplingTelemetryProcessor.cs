namespace HRMS.API.Telemetry
{
    /// <summary>
    /// Custom telemetry processor to implement sampling and reduce Application Insights costs.
    /// Samples only a percentage of telemetry items to reduce data volume and costs.
    /// </summary>
    //public class SamplingTelemetryProcessor : ITelemetryProcessor
    //{
    //    private readonly ITelemetryProcessor _next;
    //    private readonly Random _random = new Random();
    //    private readonly double _samplingPercentage;

    // public SamplingTelemetryProcessor(ITelemetryProcessor next) { _next = next; // Sample 10% of
    // telemetry - reduces costs by 90% Always track exceptions and failed // requests regardless of
    // sampling _samplingPercentage = 10.0; }

    // public void Process(ITelemetry item) { // Always track exceptions and failed requests if
    // (item is ExceptionTelemetry || (item is RequestTelemetry request && request.Success ==
    // false)) { _next.Process(item); return; }

    //        // Sample other telemetry based on percentage
    //        if (_random.NextDouble() * 100 < _samplingPercentage)
    //        {
    //            _next.Process(item);
    //        }
    //    }
    //}
}
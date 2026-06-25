using HRMS.Core.HttpHelper.Model;
using HRMS.Core.HttpHelper.Services.Constant;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Web;

namespace HRMS.Core.HttpHelper.Services
{
    public class HttpClientService
    {
        public static async Task<T?> DeleteAsync<T>(string url, Dictionary<string, string>? headers = null)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (headers != null && headers.Any())
                    {
                        foreach (KeyValuePair<string, string> header in headers)
                        {
                            client.DefaultRequestHeaders.Add(header.Key, header.Value);
                        }
                    }

                    client.DefaultRequestHeaders.Accept.Clear();
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(HttpClientConstants.MediaType.MEDIA_TYPE_JSON));

                    var response = await client.DeleteAsync(url);

                    var stringContent = await response.Content.ReadAsStringAsync();

                    return JsonConvert.DeserializeObject<T>(stringContent);
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        public static async Task<HttpResponseMessage> ExecuteAsync(HttpMethod httpMethod, string url, ICollection<KeyValuePair<string, string>>? formData = null, string? jsonContent = null, ICollection<KeyValuePair<string, string>>? customHeaders = null, MultipartContent? multipartContent = null)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    using (var request = new HttpRequestMessage(httpMethod, url))
                    {
                        if (customHeaders != null && customHeaders.Any())
                        {
                            foreach (var customHeader in customHeaders)
                            {
                                request.Headers.Add(customHeader.Key, customHeader.Value);
                            }
                        }

                        if (formData != null && formData.Any())
                        {
                            request.Content = new FormUrlEncodedContent(formData);
                        }
                        else if (!string.IsNullOrEmpty(jsonContent))
                        {
                            request.Content = new StringContent(jsonContent, Encoding.UTF8, HttpClientConstants.MediaType.MEDIA_TYPE_JSON);
                        }
                        else if (multipartContent != null)
                        {
                            request.Content = multipartContent;
                        }

                        return await client.SendAsync(request);
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        public static async Task<T?> GetAsync<T>(string url, Dictionary<string, string>? headers = null, HttpClientHandler? httpClientHandler = null)
        {
            try
            {
                using (var client = httpClientHandler == null ? new HttpClient() : new HttpClient(handler: httpClientHandler, disposeHandler: true))
                {
                    if (headers != null && headers != null)
                    {
                        foreach (KeyValuePair<string, string> header in headers)
                        {
                            client.DefaultRequestHeaders.Add(header.Key, header.Value);
                        }
                    }
                    client.DefaultRequestHeaders.Accept.Clear();
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(HttpClientConstants.MediaType.MEDIA_TYPE_JSON));

                    var response = await client.GetAsync(url);

                    var stringContent = await response.Content.ReadAsStringAsync();

                    return JsonConvert.DeserializeObject<T>(stringContent);
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        public static async Task<HttpResponseMessage> MultipartFormPostAsync(string postUrl, string userAgent, Dictionary<string, object> postParameters, Dictionary<string, string> headers)
        {
            using var client = new HttpClient();
            using var content = new MultipartFormDataContent();

            if (!string.IsNullOrWhiteSpace(userAgent))
                client.DefaultRequestHeaders.UserAgent.TryParseAdd(userAgent);

            foreach (var header in headers)
            {
                client.DefaultRequestHeaders.TryAddWithoutValidation(header.Key, header.Value);
            }

            foreach (var parameter in postParameters)
            {
                if (parameter.Value is FileParameter fileParameter)
                {
                    var fileContent = new ByteArrayContent(fileParameter.File);
                    fileContent.Headers.ContentType = new MediaTypeHeaderValue(fileParameter.ContentType ?? "application/octet-stream");
                    content.Add(fileContent, parameter.Key, fileParameter.FileName ?? parameter.Key);
                    continue;
                }

                content.Add(new StringContent(Convert.ToString(parameter.Value) ?? string.Empty), parameter.Key);
            }

            return await client.PostAsync(postUrl, content);
        }

        public static async Task<T?> PostAsync<T>(
                         string url,
                         string mediaType,
                         Dictionary<string, string>? headers = null,
                         HttpClientHandler? httpClientHandler = null,
                         List<KeyValuePair<string, string>>? keyValues = null)
        {
            using var client = httpClientHandler == null ? new HttpClient() : new HttpClient(httpClientHandler, disposeHandler: true);

            // Construct query string
            var queryString = HttpUtility.ParseQueryString(string.Empty);
            queryString["format"] = "json";

            HttpContent content = mediaType == HttpClientConstants.MediaType.MEDIA_TYPE_JSON
                    ? new StringContent(JsonConvert.SerializeObject(keyValues?.ToDictionary(k => k.Key, k => k.Value)), Encoding.UTF8, mediaType)
                    : new FormUrlEncodedContent(keyValues ?? new List<KeyValuePair<string, string>>());

            // Add headers
            if (headers is { Count: > 0 })
            {
                foreach (var header in headers)
                {
                    client.DefaultRequestHeaders.TryAddWithoutValidation(header.Key, header.Value);
                }
            }

            // Set JSON accept headers
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(HttpClientConstants.MediaType.MEDIA_TYPE_JSON));

            // Make request
            var response = await client.PostAsync($"{url}?{queryString}", content);
            response.EnsureSuccessStatusCode(); // Throws exception if response is unsuccessful

            var stringContent = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(stringContent);
        }

        public static async Task<T?> PutAsync<T>(
                                 string url,
                                 string mediaType,
                                 Dictionary<string, string>? headers = null,
                                 HttpClientHandler? httpClientHandler = null,
                                 List<KeyValuePair<string, string>>? keyValues = null)
        {
            using var client = httpClientHandler == null ? new HttpClient() : new HttpClient(httpClientHandler, disposeHandler: true);

            // Construct query string
            var queryString = HttpUtility.ParseQueryString(string.Empty);
            queryString["format"] = "json";

            // Manually encode key-values into URL-encoded form
            var items = keyValues is { Count: > 0 }
                ? keyValues.Select(i => $"{WebUtility.UrlEncode(i.Key)}={WebUtility.UrlEncode(i.Value)}")
                : Enumerable.Empty<string>();

            var content = new StringContent(string.Join("&", items), Encoding.UTF8, mediaType);

            // Add headers
            if (headers is { Count: > 0 })
            {
                foreach (var header in headers)
                {
                    client.DefaultRequestHeaders.TryAddWithoutValidation(header.Key, header.Value);
                }
            }

            // Set JSON accept headers
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(HttpClientConstants.MediaType.MEDIA_TYPE_JSON));

            // Make request
            var response = await client.PutAsync($"{url}?{queryString}", content);
            response.EnsureSuccessStatusCode(); // Throws exception if response is unsuccessful

            var stringContent = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(stringContent);
        }

        public static async Task<TResponse?> SendAsync<TResponse>(HttpMethod httpMethod, string url, ICollection<KeyValuePair<string, string>>? formData = null, string? jsonContent = null, ICollection<KeyValuePair<string, string>>? customHeaders = null, MultipartContent? multipartContent = null, HttpClientHandler? httpClientHandler = null)
        {
            try
            {
                using HttpClient client = ((httpClientHandler == null) ? new HttpClient() : new HttpClient(httpClientHandler, disposeHandler: true));
                using HttpRequestMessage request = new HttpRequestMessage(httpMethod, url);
                if (customHeaders?.Any() ?? false)
                {
                    foreach (KeyValuePair<string, string> customHeader in customHeaders)
                    {
                        request.Headers.Add(customHeader.Key, customHeader.Value);
                    }
                }

                if (formData != null && formData.Any())
                {
                    request.Content = new FormUrlEncodedContent(formData);
                }
                else if (!string.IsNullOrEmpty(jsonContent))
                {
                    request.Content = new StringContent(jsonContent, Encoding.UTF8, HttpClientConstants.MediaType.MEDIA_TYPE_JSON);
                }
                else if (multipartContent != null)
                {
                    request.Content = multipartContent;
                }

                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var response = await client.SendAsync(request);

                return JsonConvert.DeserializeObject<TResponse>(await (response).Content.ReadAsStringAsync());
            }
            catch (Exception)
            {
                throw;
            }
        }

    }
}
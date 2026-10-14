using System.Globalization;
using System.Net.Http.Headers;
using System.Text.Json;
using full_stack_project_backend.Models;
using Microsoft.Extensions.Options;

namespace full_stack_project_backend.Services;

public sealed class StripeCheckoutService(
    HttpClient httpClient,
    IOptions<StripeOptions> options,
    ILogger<StripeCheckoutService> logger)
{
    private readonly StripeOptions _options = options.Value;

    public async Task<StripeCheckoutSession> CreateSessionAsync(
        CourseApplication application,
        CancellationToken cancellationToken)
    {
        var secretKey = RequireOption(_options.SecretKey, "Stripe:SecretKey");
        var frontendBaseUrl = GetFrontendBaseUrl();
        var unitAmount = decimal.ToInt64(
            decimal.Round(application.Amount * 100m, 0, MidpointRounding.ToZero));
        if (unitAmount <= 0)
        {
            throw new InvalidOperationException(
                "Stripe checkout requires a positive course price.");
        }

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "https://api.stripe.com/v1/checkout/sessions");
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            secretKey);
        var attemptWindow = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        request.Headers.Add(
            "Idempotency-Key",
            $"course-application-{application.Id}-{attemptWindow}");
        request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["mode"] = "payment",
            ["success_url"] =
                $"{frontendBaseUrl}/Apply/{application.CourseId}?checkout=success&session_id={{CHECKOUT_SESSION_ID}}",
            ["cancel_url"] =
                $"{frontendBaseUrl}/Apply/{application.CourseId}?checkout=cancelled",
            ["client_reference_id"] = application.Id.ToString(),
            ["metadata[applicationId]"] = application.Id.ToString(),
            ["line_items[0][quantity]"] = "1",
            ["line_items[0][price_data][currency]"] =
                _options.Currency.ToLowerInvariant(),
            ["line_items[0][price_data][unit_amount]"] =
                unitAmount.ToString(CultureInfo.InvariantCulture),
            ["line_items[0][price_data][product_data][name]"] =
                application.CourseName
        });

        using var response = await httpClient.SendAsync(request, cancellationToken);
        using var document = await ReadResponseAsync(response, cancellationToken);
        var root = document.RootElement;
        return new StripeCheckoutSession(
            GetRequiredString(root, "id"),
            GetRequiredString(root, "url"),
            DateTimeOffset.FromUnixTimeSeconds(
                root.GetProperty("expires_at").GetInt64()).UtcDateTime);
    }

    public async Task<StripeCheckoutSessionDetails> GetSessionAsync(
        string sessionId,
        CancellationToken cancellationToken)
    {
        var secretKey = RequireOption(_options.SecretKey, "Stripe:SecretKey");
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"https://api.stripe.com/v1/checkout/sessions/{Uri.EscapeDataString(sessionId)}");
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            secretKey);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        using var document = await ReadResponseAsync(response, cancellationToken);
        var root = document.RootElement;
        var metadata = root.GetProperty("metadata");
        var paymentIntent = root.GetProperty("payment_intent");
        return new StripeCheckoutSessionDetails(
            GetRequiredString(root, "id"),
            GetOptionalString(root, "status"),
            GetOptionalString(root, "payment_status"),
            GetOptionalString(metadata, "applicationId"),
            paymentIntent.ValueKind == JsonValueKind.String
                ? paymentIntent.GetString()
                : paymentIntent.ValueKind == JsonValueKind.Object
                    ? GetOptionalString(paymentIntent, "id")
                    : null,
            root.TryGetProperty("amount_total", out var amountTotal) &&
                amountTotal.ValueKind == JsonValueKind.Number &&
                amountTotal.TryGetInt64(out var parsedAmount)
                    ? parsedAmount
                    : null,
            GetOptionalString(root, "currency"),
            GetOptionalString(root, "url"),
            root.TryGetProperty("expires_at", out var expiresAt) &&
                expiresAt.ValueKind == JsonValueKind.Number &&
                expiresAt.TryGetInt64(out var expiration)
                    ? DateTimeOffset.FromUnixTimeSeconds(expiration).UtcDateTime
                    : null);
    }

    public string GetWebhookSecret() =>
        RequireOption(_options.WebhookSecret, "Stripe:WebhookSecret");

    private string GetFrontendBaseUrl()
    {
        if (!Uri.TryCreate(_options.FrontendBaseUrl, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttps &&
             !(uri.Scheme == Uri.UriSchemeHttp && uri.IsLoopback)))
        {
            throw new InvalidOperationException(
                "Stripe:FrontendBaseUrl must be an HTTPS URL, except for localhost development.");
        }
        return uri.ToString().TrimEnd('/');
    }

    private static string RequireOption(string value, string optionName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException(
                $"{optionName} must be configured before using Stripe payments.");
        }
        return value;
    }

    private async Task<JsonDocument> ReadResponseAsync(
        HttpResponseMessage response,
        CancellationToken cancellationToken)
    {
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var detail = "Stripe did not accept the checkout request.";
            try
            {
                using var errorDocument = JsonDocument.Parse(responseBody);
                if (errorDocument.RootElement.TryGetProperty("error", out var error) &&
                    error.TryGetProperty("message", out var message) &&
                    message.ValueKind == JsonValueKind.String)
                {
                    detail = message.GetString() ?? detail;
                }
            }
            catch (JsonException)
            {
                logger.LogWarning(
                    "Stripe returned an error response with an unreadable body (HTTP {StatusCode}).",
                    (int)response.StatusCode);
            }
            throw new StripeRequestException(detail, (int)response.StatusCode);
        }

        try
        {
            return JsonDocument.Parse(responseBody);
        }
        catch (JsonException exception)
        {
            throw new StripeRequestException(
                "Stripe returned a response in an unexpected format.",
                (int)response.StatusCode,
                exception);
        }
    }

    private static string GetRequiredString(JsonElement element, string propertyName)
    {
        var value = GetOptionalString(element, propertyName);
        return !string.IsNullOrWhiteSpace(value)
            ? value
            : throw new StripeRequestException(
                $"Stripe response did not include {propertyName}.",
                StatusCodes.Status502BadGateway);
    }

    private static string? GetOptionalString(JsonElement element, string propertyName) =>
        element.TryGetProperty(propertyName, out var value) &&
        value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;
}

public sealed record StripeCheckoutSession(
    string Id,
    string Url,
    DateTime ExpiresAt);

public sealed record StripeCheckoutSessionDetails(
    string Id,
    string? Status,
    string? PaymentStatus,
    string? ApplicationId,
    string? PaymentIntentId,
    long? AmountTotal,
    string? Currency,
    string? Url,
    DateTime? ExpiresAt);

public sealed class StripeRequestException(
    string message,
    int statusCode,
    Exception? innerException = null) : Exception(message, innerException)
{
    public int StatusCode { get; } = statusCode;
}

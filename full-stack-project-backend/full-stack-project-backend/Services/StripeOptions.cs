namespace full_stack_project_backend.Services;

public sealed class StripeOptions
{
    public const string SectionName = "Stripe";

    public string SecretKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public string Currency { get; set; } = "usd";
    public string FrontendBaseUrl { get; set; } = "http://localhost:5173";
}

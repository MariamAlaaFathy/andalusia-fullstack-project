namespace full_stack_project_backend.Models;

public enum PaymentStatus
{
    Pending,
    Paid,
    Failed
}

public class Payment
{
    public Guid Id { get; set; }
    public Guid CourseApplicationId { get; set; }
    public CourseApplication CourseApplication { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "usd";
    public PaymentStatus Status { get; set; }
    public string? StripeCheckoutSessionId { get; set; }
    public DateTime? CheckoutExpiresAt { get; set; }
    public string? StripePaymentIntentId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
}

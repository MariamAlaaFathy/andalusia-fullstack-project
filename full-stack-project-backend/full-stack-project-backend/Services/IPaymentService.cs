namespace full_stack_project_backend.Services;

public interface IPaymentService
{
    Task<string> CreateCheckoutSessionAsync(
        int applicationId,
        int learnerId,
        CancellationToken cancellationToken);

    Task<bool> MarkCheckoutSessionPaidAsync(
        string checkoutSessionId,
        string? paymentIntentId,
        CancellationToken cancellationToken);
}

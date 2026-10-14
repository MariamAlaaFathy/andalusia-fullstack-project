using full_stack_project_backend.DTOs;

namespace full_stack_project_backend.Services;

public interface IPaymentService
{
    Task<CheckoutResponse> StartCheckoutAsync(
        Guid applicationId,
        string learnerId,
        CancellationToken cancellationToken);

    Task<CourseApplicationResponse> ConfirmCheckoutAsync(
        string sessionId,
        string learnerId,
        CancellationToken cancellationToken);

    Task ProcessWebhookAsync(
        string payload,
        string signature,
        CancellationToken cancellationToken);
}

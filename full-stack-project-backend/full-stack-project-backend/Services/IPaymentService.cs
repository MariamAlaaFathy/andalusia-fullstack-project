using full_stack_project_backend.DTOs;

namespace full_stack_project_backend.Services;

public interface IPaymentService
{
    Task<CourseApplicationResponse> CompleteDemoPaymentAsync(
        int applicationId,
        int learnerId,
        CancellationToken cancellationToken);
}

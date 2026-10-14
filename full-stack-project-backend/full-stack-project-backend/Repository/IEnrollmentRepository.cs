using full_stack_project_backend.Models;

namespace full_stack_project_backend.Repository;

public interface IEnrollmentRepository
{
    Task<IReadOnlyList<CourseApplication>> GetApplicationsAsync(
        string learnerId,
        CancellationToken cancellationToken);

    Task<CourseApplication?> GetApplicationAsync(
        Guid applicationId,
        string learnerId,
        CancellationToken cancellationToken);

    Task<CourseApplication?> GetApplicationForCourseAsync(
        string learnerId,
        int courseId,
        CancellationToken cancellationToken);

    Task<Course?> GetCourseAsync(int courseId, CancellationToken cancellationToken);

    Task<Payment?> GetPaymentAsync(
        string sessionId,
        string? learnerId,
        CancellationToken cancellationToken);

    Task AddApplicationAsync(
        CourseApplication application,
        CancellationToken cancellationToken);

    void AddPayment(Payment payment);

    Task SaveChangesAsync(CancellationToken cancellationToken);

    void ClearTracking();
}

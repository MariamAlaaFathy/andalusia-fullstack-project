using full_stack_project_backend.Models;

namespace full_stack_project_backend.Repository;

public interface IEnrollmentRepository
{
    Task<IReadOnlyList<CourseApplication>> GetApplicationsAsync(
        int learnerId,
        CancellationToken cancellationToken);

    Task<CourseApplication?> GetApplicationAsync(
        int applicationId,
        int learnerId,
        CancellationToken cancellationToken);

    Task<CourseApplication?> GetApplicationForCourseAsync(
        int learnerId,
        int courseId,
        CancellationToken cancellationToken);

    Task<Course?> GetCourseAsync(int courseId, CancellationToken cancellationToken);

    Task AddApplicationAsync(
        CourseApplication application,
        CancellationToken cancellationToken);

    void AddPayment(Payment payment);

    Task SaveChangesAsync(CancellationToken cancellationToken);

    void ClearTracking();
}

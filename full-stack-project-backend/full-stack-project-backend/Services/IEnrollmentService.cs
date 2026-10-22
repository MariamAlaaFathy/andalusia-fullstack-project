using full_stack_project_backend.DTOs;

namespace full_stack_project_backend.Services;

public interface IEnrollmentService
{
    Task<IReadOnlyList<CourseApplicationResponse>> GetMineAsync(
        int learnerId,
        CancellationToken cancellationToken);

    Task<CourseApplicationResponse> GetByIdAsync(
        int applicationId,
        int learnerId,
        CancellationToken cancellationToken);

    Task<(CourseApplicationResponse Application, bool Created)> CreateAsync(
        int courseId,
        int learnerId,
        CancellationToken cancellationToken);
}

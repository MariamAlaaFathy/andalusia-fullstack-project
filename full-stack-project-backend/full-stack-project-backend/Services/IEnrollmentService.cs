using full_stack_project_backend.DTOs;

namespace full_stack_project_backend.Services;

public interface IEnrollmentService
{
    Task<IReadOnlyList<CourseApplicationResponse>> GetMineAsync(
        string learnerId,
        CancellationToken cancellationToken);

    Task<CourseApplicationResponse> GetByIdAsync(
        Guid applicationId,
        string learnerId,
        CancellationToken cancellationToken);

    Task<(CourseApplicationResponse Application, bool Created)> CreateAsync(
        int courseId,
        string learnerId,
        CancellationToken cancellationToken);
}

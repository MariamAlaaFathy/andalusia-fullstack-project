using full_stack_project_backend.Models;

namespace full_stack_project_backend.Repository
{
    public interface ICourseRepository
    {
        Task<(IReadOnlyList<Course> Items, int TotalCount)> GetCoursesAsync(
            string? search,
            string? category,
            int page,
            int pageSize,
            CancellationToken cancellationToken);
        Task<Course?> GetCourseByIdAsync(int id, CancellationToken cancellationToken);
    }
}

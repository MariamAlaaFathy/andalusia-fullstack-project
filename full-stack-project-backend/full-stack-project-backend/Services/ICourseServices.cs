using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;

namespace full_stack_project_backend.Services
{
    public interface ICourseServices
    {
        Task<Pagedresult<CourseDto>> GetCoursesAsync(
            PaginatedParam paginationParams,
            CancellationToken cancellationToken);
        Task<CourseDto?> GetCourseByIdAsync(int id, CancellationToken cancellationToken);
    }
}

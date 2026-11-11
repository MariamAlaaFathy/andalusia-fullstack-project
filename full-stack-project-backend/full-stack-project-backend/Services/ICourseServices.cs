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

        Task <CourseDto> CreateCourseAsync(CreateCourseRequest request, CancellationToken cancellationToken);

        Task<CourseDto?> UpdateCourseAsync( int id, UpdateCourseRequest request, CancellationToken cancellationToken);

        Task<bool> DeleteCourseAsync(int id, CancellationToken cancellationToken);

     
    }
}

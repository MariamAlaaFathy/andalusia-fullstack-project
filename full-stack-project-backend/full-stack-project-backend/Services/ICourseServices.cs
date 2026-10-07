using full_stack_project_backend.Models;

namespace full_stack_project_backend.Services
{
    public interface ICourseServices
    {
        public List<Course> GetAllCourses();
        Pagedresult<Course> GetCourses(PaginatedParam paginationParams);
    }
}

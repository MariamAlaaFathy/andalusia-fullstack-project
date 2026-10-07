using full_stack_project_backend.Models;

namespace full_stack_project_backend.Repository
{
    public interface ICourseRepository
    {
        public List<Course> GetAllCourses();
    }
}

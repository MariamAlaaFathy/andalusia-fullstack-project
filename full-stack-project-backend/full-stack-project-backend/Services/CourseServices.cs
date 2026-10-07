using full_stack_project_backend.Models;
using full_stack_project_backend.Repository;

namespace full_stack_project_backend.Services
{
    public class CourseServices : ICourseServices
    {
        private ICourseRepository _courseRepository;

        public CourseServices(ICourseRepository courseRepository)
        {
            _courseRepository = courseRepository;
        }
        public List<Course> GetAllCourses()
        {
            return _courseRepository.GetAllCourses();
            
        }

        public Pagedresult<Course> GetCourses(
        PaginatedParam paginationParams)
        {
            var courses = _courseRepository.GetAllCourses();

            
            if (!string.IsNullOrEmpty(paginationParams.Search))
            {
                courses = courses
                    .Where(c => c.Name.Contains(
                        paginationParams.Search,
                        StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

           
            if (!string.IsNullOrEmpty(paginationParams.Category))
            {
                courses = courses
                    .Where(c => c.Category.Equals(
                        paginationParams.Category,
                        StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

           
            var totalCount = courses.Count;

     
            courses = courses
                .Skip((paginationParams.Page - 1) * paginationParams.PageSize)
                .Take(paginationParams.PageSize)
                .ToList();

            return new Pagedresult<Course>
            {
                Data = courses,
                Page = paginationParams.Page,
                PageSize = paginationParams.PageSize,
                TotalCount = totalCount
            };
        }
    }
}

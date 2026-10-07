using full_stack_project_backend.Models;

namespace full_stack_project_backend.Repository
{
    public class CourseRepository : ICourseRepository
    {
        private List<Course> _courses = new List<Course>
        {
            new Course
             {
                Id = 1,
                Name = "C# Basics",
                Description = "Learn the basics of C#",
                Price = 100,
                Category = "Programming"
            },
            new Course
            {
                Id = 2,
                Name = "ASP.NET Core",
                Description = "Learn how to build web applications with ASP.NET Core",
                Price = 200,
                Category = "Web Development"
            },
            new Course
            {
                Id = 3,
                Name = "Entity Framework Core",
                Description = "Learn how to use Entity Framework Core for data access",
                Price = 150,
                Category = "Database"
            }
        };

        public List<Course> GetAllCourses()
        {
            return _courses;
        }
    }
}

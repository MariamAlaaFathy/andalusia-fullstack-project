using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace full_stack_project_backend.Controllers
{
    [ApiController]
    [Route("api/Courses")]
    public class CoursesController : ControllerBase
{
        private readonly ICourseServices _courseServices;

        public CoursesController(ICourseServices courseServices)
        {
            _courseServices = courseServices;
        }

        [HttpGet]
        public async Task<IActionResult> GetCourses(
            [FromQuery] PaginatedParam paginationParams,
            CancellationToken cancellationToken)
        {
            var courses = await _courseServices.GetCoursesAsync(
                paginationParams,
                cancellationToken);
            return Ok(courses);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetCourse(
            int id,
            CancellationToken cancellationToken)
        {
            var course = await _courseServices.GetCourseByIdAsync(id, cancellationToken);
            return course is null ? NotFound() : Ok(course);
        }
    }
}

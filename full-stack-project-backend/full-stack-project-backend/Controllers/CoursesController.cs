using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Mvc;
<<<<<<< HEAD
using Microsoft.AspNetCore.Authorization;

namespace full_stack_project_backend.Controllers
{
[ApiController]
[Route("api/Courses")]
[Authorize]
public class CoursesController : ControllerBase
=======

namespace full_stack_project_backend.Controllers
{
    [ApiController]
    [Route("api/Courses")]
    public class CoursesController : ControllerBase
>>>>>>> 8e79a0b19b404d7fd483f8628b4c610b2474a23e
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

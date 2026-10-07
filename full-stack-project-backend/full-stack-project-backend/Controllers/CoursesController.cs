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
        public IActionResult GetCourses(
            [FromQuery] PaginatedParam paginationParams)
        {
            var courses = _courseServices.GetCourses(paginationParams);

            return Ok(courses);
        }

    }
}


using full_stack_project_backend.DTOs;
using full_stack_project_backend.Exceptions;
using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
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

        [HttpPost]
        [Authorize(Roles = "ContentManager,Administrator")]
        public async Task<IActionResult> CreateCourse(
        [FromBody] CreateCourseRequest request,
        CancellationToken cancellationToken)
        {
            var createdCourse = await _courseServices.CreateCourseAsync(
         request,
        cancellationToken);

            return CreatedAtAction(
                nameof(GetCourse),
                new { id = createdCourse.Id },
                createdCourse);
        }


        [HttpPut("{id:int}")]
        [Authorize(Roles = "ContentManager,Administrator")]
        public async Task<IActionResult> UpdateCourse(
            int id,
            [FromBody] UpdateCourseRequest request,
            CancellationToken cancellationToken)
        {
            var updatedCourse = await _courseServices.UpdateCourseAsync(
                id,
                request,
                cancellationToken);

            if (updatedCourse is null)
            {
                return NotFound();
            }

            return Ok(updatedCourse);
        }


        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ContentManager,Administrator")]
        public async Task<IActionResult> DeleteCourse(
            int id,
            CancellationToken cancellationToken)
        {
            try
            {
                var deleted = await _courseServices.DeleteCourseAsync(
                    id,
                    cancellationToken);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        message = "Course not found."
                    });
                }

                return NoContent();
            }
            catch (CourseHasApplicationsException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }


    }
}

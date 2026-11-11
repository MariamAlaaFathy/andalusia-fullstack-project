using full_stack_project_backend.Data;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Controllers
{
    [ApiController]
    [Route("api/course-content")]
    public class CourseContentController(AppDbcontext dbContext) : ControllerBase
    {
        [AllowAnonymous]
        [HttpGet("courses/{courseId:int}")]
        public async Task<IActionResult> GetCourseContent(int courseId, CancellationToken cancellationToken)
        {
            var courseExists = await dbContext.Courses
                .AsNoTracking()
                .AnyAsync(course => course.Id == courseId, cancellationToken);

            if (!courseExists)
                return NotFound();

            var modules = await dbContext.CourseModules
                .AsNoTracking()
                .Where(module => module.CourseId == courseId)
                .Include(module => module.Lessons)
                .OrderBy(module => module.Order)
                .ThenBy(module => module.Id)
                .ToListAsync(cancellationToken);

            foreach (var module in modules)
                module.Lessons = module.Lessons.OrderBy(lesson => lesson.Order).ThenBy(lesson => lesson.Id).ToList();

            return Ok(modules);
        }

        [Authorize(Roles = "ContentManager,Administrator")]
        [HttpPost("courses/{courseId:int}/modules")]
        public async Task<IActionResult> CreateModule(
            int courseId,
            [FromBody] CourseModuleRequest request,
            CancellationToken cancellationToken)
        {
            if (!await dbContext.Courses.AnyAsync(course => course.Id == courseId, cancellationToken))
                return NotFound(new { message = "Course not found." });

            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest(new { message = "Module title is required." });

            var module = new CourseModule
            {
                CourseId = courseId,
                Title = request.Title.Trim(),
                Description = request.Description,
                Order = request.Order
            };

            dbContext.CourseModules.Add(module);
            await dbContext.SaveChangesAsync(cancellationToken);
            return CreatedAtAction(nameof(GetCourseContent), new { courseId }, module);
        }

        [Authorize(Roles = "ContentManager,Administrator")]
        [HttpPut("modules/{id:int}")]
        public async Task<IActionResult> UpdateModule(
            int id,
            [FromBody] CourseModuleRequest request,
            CancellationToken cancellationToken)
        {
            var module = await dbContext.CourseModules.FindAsync([id], cancellationToken);
            if (module is null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest(new { message = "Module title is required." });

            module.Title = request.Title.Trim();
            module.Description = request.Description;
            module.Order = request.Order;
            await dbContext.SaveChangesAsync(cancellationToken);
            return Ok(module);
        }

        [Authorize(Roles = "ContentManager,Administrator")]
        [HttpDelete("modules/{id:int}")]
        public async Task<IActionResult> DeleteModule(int id, CancellationToken cancellationToken)
        {
            var module = await dbContext.CourseModules.FindAsync([id], cancellationToken);
            if (module is null)
                return NotFound();

            dbContext.CourseModules.Remove(module);
            await dbContext.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        [Authorize(Roles = "ContentManager,Administrator")]
        [HttpPost("modules/{moduleId:int}/lessons")]
        public async Task<IActionResult> CreateLesson(
            int moduleId,
            [FromBody] LessonRequest request,
            CancellationToken cancellationToken)
        {
            if (!await dbContext.CourseModules.AnyAsync(module => module.Id == moduleId, cancellationToken))
                return NotFound(new { message = "Module not found." });

            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest(new { message = "Lesson title is required." });

            var lesson = new Lesson
            {
                ModuleId = moduleId,
                Title = request.Title.Trim(),
                Description = request.Description,
                Content = request.Content,
                VideoUrl = request.VideoUrl,
                PdfUrl = request.PdfUrl,
                Order = request.Order
            };

            dbContext.Lessons.Add(lesson);
            await dbContext.SaveChangesAsync(cancellationToken);
            return Ok(lesson);
        }

        [Authorize(Roles = "ContentManager,Administrator")]
        [HttpPut("lessons/{id:int}")]
        public async Task<IActionResult> UpdateLesson(
            int id,
            [FromBody] LessonRequest request,
            CancellationToken cancellationToken)
        {
            var lesson = await dbContext.Lessons.FindAsync([id], cancellationToken);
            if (lesson is null)
                return NotFound();

            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest(new { message = "Lesson title is required." });

            lesson.Title = request.Title.Trim();
            lesson.Description = request.Description;
            lesson.Content = request.Content;
            lesson.VideoUrl = request.VideoUrl;
            lesson.PdfUrl = request.PdfUrl;
            lesson.Order = request.Order;
            await dbContext.SaveChangesAsync(cancellationToken);
            return Ok(lesson);
        }

        [Authorize(Roles = "ContentManager,Administrator")]
        [HttpDelete("lessons/{id:int}")]
        public async Task<IActionResult> DeleteLesson(int id, CancellationToken cancellationToken)
        {
            var lesson = await dbContext.Lessons.FindAsync([id], cancellationToken);
            if (lesson is null)
                return NotFound();

            dbContext.Lessons.Remove(lesson);
            await dbContext.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}

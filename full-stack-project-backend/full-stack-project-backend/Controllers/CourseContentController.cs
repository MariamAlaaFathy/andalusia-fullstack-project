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

            return Ok(modules.Select(module => new CourseContentModuleDto(
                module.Id,
                module.CourseId,
                module.Title,
                module.Description,
                module.Order,
                module.Lessons
                    .OrderBy(lesson => lesson.Order)
                    .ThenBy(lesson => lesson.Id)
                    .Select(ToDto)
                    .ToList())));
        }

        [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
        [HttpGet("modules")]
        public async Task<IActionResult> GetModules(CancellationToken cancellationToken)
        {
            var modules = await dbContext.CourseModules
                .AsNoTracking()
                .OrderBy(module => module.CourseId)
                .ThenBy(module => module.Order)
                .ThenBy(module => module.Id)
                .Select(module => new CourseModuleSummaryDto(
                    module.Id,
                    module.CourseId,
                    module.Title,
                    module.Description,
                    module.Order))
                .ToListAsync(cancellationToken);

            return Ok(modules);
        }

        [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
        [HttpGet("lessons")]
        public async Task<IActionResult> GetLessons(CancellationToken cancellationToken)
        {
            var lessons = await dbContext.Lessons
                .AsNoTracking()
                .OrderBy(lesson => lesson.ModuleId)
                .ThenBy(lesson => lesson.Order)
                .ThenBy(lesson => lesson.Id)
                .Select(lesson => new LessonDto(
                    lesson.Id,
                    lesson.Title,
                    lesson.Description,
                    lesson.Content,
                    lesson.VideoUrl,
                    lesson.PdfUrl,
                    lesson.Order,
                    lesson.ModuleId))
                .ToListAsync(cancellationToken);

            return Ok(lessons);
        }

        [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
        [HttpPost("courses/{courseId:int}/modules")]
        public async Task<IActionResult> CreateModule(
            int courseId,
            [FromBody] CourseModuleRequest request,
            CancellationToken cancellationToken)
        {
            if (!await dbContext.Courses.AnyAsync(course => course.Id == courseId, cancellationToken))
                return NotFound(new { message = "Course not found." });

            var module = new CourseModule
            {
                CourseId = courseId,
                Title = request.Title.Trim(),
                Description = request.Description ?? string.Empty,
                Order = request.Order
            };

            dbContext.CourseModules.Add(module);
            await dbContext.SaveChangesAsync(cancellationToken);
            return CreatedAtAction(
                nameof(GetCourseContent),
                new { courseId },
                new CourseModuleSummaryDto(module.Id, module.CourseId, module.Title, module.Description, module.Order));
        }

        [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
        [HttpPut("modules/{id:int}")]
        public async Task<IActionResult> UpdateModule(
            int id,
            [FromBody] CourseModuleRequest request,
            CancellationToken cancellationToken)
        {
            var module = await dbContext.CourseModules.FindAsync([id], cancellationToken);
            if (module is null)
                return NotFound();

            module.Title = request.Title.Trim();
            module.Description = request.Description ?? string.Empty;
            module.Order = request.Order;
            await dbContext.SaveChangesAsync(cancellationToken);
            return Ok(new CourseModuleSummaryDto(module.Id, module.CourseId, module.Title, module.Description, module.Order));
        }

        [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
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

        [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
        [HttpPost("modules/{moduleId:int}/lessons")]
        public async Task<IActionResult> CreateLesson(
            int moduleId,
            [FromBody] LessonRequest request,
            CancellationToken cancellationToken)
        {
            if (!await dbContext.CourseModules.AnyAsync(module => module.Id == moduleId, cancellationToken))
                return NotFound(new { message = "Module not found." });

            var lesson = new Lesson
            {
                ModuleId = moduleId,
                Title = request.Title.Trim(),
                Description = request.Description ?? string.Empty,
                Content = request.Content ?? string.Empty,
                VideoUrl = NormalizeUrl(request.VideoUrl),
                PdfUrl = NormalizeUrl(request.PdfUrl),
                Order = request.Order
            };

            dbContext.Lessons.Add(lesson);
            await dbContext.SaveChangesAsync(cancellationToken);
            return Ok(ToDto(lesson));
        }

        [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
        [HttpPut("lessons/{id:int}")]
        public async Task<IActionResult> UpdateLesson(
            int id,
            [FromBody] LessonRequest request,
            CancellationToken cancellationToken)
        {
            var lesson = await dbContext.Lessons.FindAsync([id], cancellationToken);
            if (lesson is null)
                return NotFound();

            lesson.Title = request.Title.Trim();
            lesson.Description = request.Description ?? string.Empty;
            lesson.Content = request.Content ?? string.Empty;
            lesson.VideoUrl = NormalizeUrl(request.VideoUrl);
            lesson.PdfUrl = NormalizeUrl(request.PdfUrl);
            lesson.Order = request.Order;
            await dbContext.SaveChangesAsync(cancellationToken);
            return Ok(ToDto(lesson));
        }

        [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
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

        private static LessonDto ToDto(Lesson lesson) =>
            new(
                lesson.Id,
                lesson.Title,
                lesson.Description,
                lesson.Content,
                lesson.VideoUrl,
                lesson.PdfUrl,
                lesson.Order,
                lesson.ModuleId);

        private static string? NormalizeUrl(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}

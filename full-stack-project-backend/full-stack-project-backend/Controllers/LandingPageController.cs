using full_stack_project_backend.Data;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Controllers
{
    [ApiController]
    [Route("api/landing-page")]
    public class LandingPageController(AppDbcontext dbContext) : ControllerBase
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> Get(CancellationToken cancellationToken)
        {
            var hero = await dbContext.LandingPageContents
                .AsNoTracking()
                .SingleOrDefaultAsync(content => content.Id == 1, cancellationToken);

            var featuredCourses = await dbContext.FeaturedCourses
                .AsNoTracking()
                .Include(featured => featured.Course)
                .Where(featured => featured.Course != null)
                .OrderBy(featured => featured.Order)
                .ThenBy(featured => featured.Id)
                .Select(featured => featured.Course)
                .ToListAsync(cancellationToken);

            return Ok(new { hero, featuredCourses });
        }

        [Authorize(Roles = "ContentManager,Administrator")]
        [HttpPut("hero")]
        public async Task<IActionResult> UpdateHero(
            [FromBody] LandingPageHeroRequest request,
            CancellationToken cancellationToken)
        {
            var hero = await dbContext.LandingPageContents
                .SingleOrDefaultAsync(content => content.Id == 1, cancellationToken);

            if (hero is null)
            {
                hero = new LandingPageContent { Id = 1 };
                dbContext.LandingPageContents.Add(hero);
            }

            hero.HeroTitle = request.HeroTitle.Trim();
            hero.HeroSubtitle = request.HeroSubtitle.Trim();
            hero.HeroImageUrl = request.HeroImageUrl;
            hero.CallToActionText = request.CallToActionText.Trim();
            hero.CallToActionUrl = request.CallToActionUrl;
            hero.UpdatedAtUtc = DateTime.UtcNow;

            await dbContext.SaveChangesAsync(cancellationToken);
            return Ok(hero);
        }

        [Authorize(Roles = "ContentManager,Administrator")]
        [HttpPut("featured-courses")]
        public async Task<IActionResult> UpdateFeaturedCourses(
            [FromBody] FeaturedCourseRequest request,
            CancellationToken cancellationToken)
        {
            var courseIds = request.CourseIds.Distinct().ToList();
            var existingCourseIds = await dbContext.Courses
                .Where(course => courseIds.Contains(course.Id))
                .Select(course => course.Id)
                .ToListAsync(cancellationToken);

            if (existingCourseIds.Count != courseIds.Count)
                return BadRequest(new { message = "One or more featured course IDs do not exist." });

            var current = await dbContext.FeaturedCourses.ToListAsync(cancellationToken);
            dbContext.FeaturedCourses.RemoveRange(current);
            dbContext.FeaturedCourses.AddRange(courseIds.Select((courseId, index) => new FeaturedCourse
            {
                CourseId = courseId,
                Order = index
            }));

            await dbContext.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}

using full_stack_project_backend.Data;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Controllers
{
    [ApiController]
    [Route("api/landing-page")]
    public class LandingPageController(AppDbcontext dbContext, IMapper mapper) : ControllerBase
    {
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<LandingPageResponse>> Get(CancellationToken cancellationToken)
        {
            var hero = await dbContext.LandingPageContents
                .AsNoTracking()
                .SingleOrDefaultAsync(content => content.Id == 1, cancellationToken);

            var featuredCourses = await dbContext.FeaturedCourses
                .AsNoTracking()
                .Include(featured => featured.Course)
                    .ThenInclude(course => course.Program)
                        .ThenInclude(program => program.CareerPath)
                .Include(featured => featured.Course)
                    .ThenInclude(course => course.Instructors)
                        .ThenInclude(assignment => assignment.Instructor)
                .Where(featured => featured.Course != null)
                .OrderBy(featured => featured.Order)
                .ThenBy(featured => featured.Id)
                .ToListAsync(cancellationToken);

            var banners = await dbContext.LandingPageBanners
                .AsNoTracking()
                .Where(item => item.IsPublished)
                .OrderBy(item => item.Order)
                .ThenBy(item => item.Id)
                .Select(item => new LandingPageBannerDto(
                    item.Id,
                    item.Title,
                    item.Description,
                    item.ImageUrl,
                    item.CallToActionText,
                    item.CallToActionUrl,
                    item.Order,
                    item.IsPublished))
                .ToListAsync(cancellationToken);

            var highlights = await dbContext.LandingPageHighlights
                .AsNoTracking()
                .Where(item => item.IsPublished)
                .OrderBy(item => item.Order)
                .ThenBy(item => item.Id)
                .Select(item => new LandingPageHighlightDto(
                    item.Id,
                    item.Title,
                    item.Description,
                    item.Order,
                    item.IsPublished))
                .ToListAsync(cancellationToken);

            var testimonials = await dbContext.LandingPageTestimonials
                .AsNoTracking()
                .Where(item => item.IsPublished)
                .OrderBy(item => item.Order)
                .ThenBy(item => item.Id)
                .Select(item => new LandingPageTestimonialDto(
                    item.Id,
                    item.Quote,
                    item.Author,
                    item.Role,
                    item.Order,
                    item.IsPublished))
                .ToListAsync(cancellationToken);

            var faqs = await dbContext.LandingPageFaqs
                .AsNoTracking()
                .Where(item => item.IsPublished)
                .OrderBy(item => item.Order)
                .ThenBy(item => item.Id)
                .Select(item => new LandingPageFaqDto(
                    item.Id,
                    item.Question,
                    item.Answer,
                    item.Order,
                    item.IsPublished))
                .ToListAsync(cancellationToken);

            return Ok(new LandingPageResponse(
                hero is null ? null : ToDto(hero),
                featuredCourses
                    .Select(featured => mapper.Map<CourseDto>(featured.Course))
                    .ToList(),
                banners,
                highlights,
                testimonials,
                faqs));
        }

        [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
        [HttpPut("hero")]
        public async Task<IActionResult> UpdateHero(
            [FromBody] LandingPageHeroRequest request,
            CancellationToken cancellationToken)
        {
            if (!IsSafeLink(request.CallToActionUrl))
                return BadRequest(new { message = "The call-to-action link must be a site path or an HTTP(S) URL." });

            var hero = await dbContext.LandingPageContents
                .SingleOrDefaultAsync(content => content.Id == 1, cancellationToken);

            if (hero is null)
            {
                hero = new LandingPageContent { Id = 1 };
                dbContext.LandingPageContents.Add(hero);
            }

            hero.HeroTitle = request.HeroTitle.Trim();
            hero.HeroSubtitle = request.HeroSubtitle.Trim();
            hero.HeroImageUrl = NormalizeUrl(request.HeroImageUrl);
            hero.CallToActionText = request.CallToActionText.Trim();
            hero.CallToActionUrl = NormalizeUrl(request.CallToActionUrl);
            hero.UpdatedAtUtc = DateTime.UtcNow;

            await dbContext.SaveChangesAsync(cancellationToken);
            return Ok(ToDto(hero));
        }

        [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
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

            var requestedCourseIds = courseIds.ToHashSet();
            var current = await dbContext.FeaturedCourses.ToListAsync(cancellationToken);
            dbContext.FeaturedCourses.RemoveRange(
                current.Where(featured => !requestedCourseIds.Contains(featured.CourseId)));

            var currentByCourseId = current
                .Where(featured => requestedCourseIds.Contains(featured.CourseId))
                .ToDictionary(featured => featured.CourseId);
            for (var index = 0; index < courseIds.Count; index++)
            {
                var courseId = courseIds[index];
                if (currentByCourseId.TryGetValue(courseId, out var featured))
                {
                    featured.Order = index;
                }
                else
                {
                    dbContext.FeaturedCourses.Add(new FeaturedCourse
                    {
                        CourseId = courseId,
                        Order = index
                    });
                }
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        private static LandingPageContentDto ToDto(LandingPageContent content) =>
            new(
                content.Id,
                content.HeroTitle,
                content.HeroSubtitle,
                content.HeroImageUrl,
                content.CallToActionText,
                content.CallToActionUrl,
                content.UpdatedAtUtc);

        private static string? NormalizeUrl(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        private static bool IsSafeLink(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return true;

            var link = value.Trim();
            if (Uri.TryCreate(link, UriKind.Absolute, out var absoluteUri))
                return absoluteUri.Scheme == Uri.UriSchemeHttp ||
                    absoluteUri.Scheme == Uri.UriSchemeHttps;

            return link.StartsWith("/", StringComparison.Ordinal) &&
                !link.StartsWith("//", StringComparison.Ordinal) &&
                !link.Contains('\\');
        }
    }
}

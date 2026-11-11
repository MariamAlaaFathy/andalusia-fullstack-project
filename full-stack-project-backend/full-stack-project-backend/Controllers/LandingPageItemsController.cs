using full_stack_project_backend.Data;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Route("api/landing-page")]
public sealed class LandingPageItemsController(AppDbcontext dbContext) : ControllerBase
{
    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpGet("manage")]
    public async Task<ActionResult<LandingPageManagementResponse>> GetForManagement(
        CancellationToken cancellationToken)
    {
        var banners = await dbContext.LandingPageBanners.AsNoTracking()
            .OrderBy(item => item.Order).ThenBy(item => item.Id)
            .Select(item => ToDto(item)).ToListAsync(cancellationToken);
        var highlights = await dbContext.LandingPageHighlights.AsNoTracking()
            .OrderBy(item => item.Order).ThenBy(item => item.Id)
            .Select(item => ToDto(item)).ToListAsync(cancellationToken);
        var testimonials = await dbContext.LandingPageTestimonials.AsNoTracking()
            .OrderBy(item => item.Order).ThenBy(item => item.Id)
            .Select(item => ToDto(item)).ToListAsync(cancellationToken);
        var faqs = await dbContext.LandingPageFaqs.AsNoTracking()
            .OrderBy(item => item.Order).ThenBy(item => item.Id)
            .Select(item => ToDto(item)).ToListAsync(cancellationToken);

        return Ok(new LandingPageManagementResponse(banners, highlights, testimonials, faqs));
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpPost("banners")]
    public async Task<ActionResult<LandingPageBannerDto>> CreateBanner(
        LandingPageBannerRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsSafeLink(request.CallToActionUrl) || !IsSafeLink(request.ImageUrl))
            return BadRequest(new { message = "Banner links must use a site path or an HTTP(S) URL." });

        var banner = new LandingPageBanner
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            ImageUrl = Normalize(request.ImageUrl),
            CallToActionText = Normalize(request.CallToActionText),
            CallToActionUrl = Normalize(request.CallToActionUrl),
            Order = request.Order,
            IsPublished = request.IsPublished
        };
        dbContext.LandingPageBanners.Add(banner);
        await dbContext.SaveChangesAsync(cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ToDto(banner));
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpPut("banners/{id:int}")]
    public async Task<ActionResult<LandingPageBannerDto>> UpdateBanner(
        int id,
        LandingPageBannerRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsSafeLink(request.CallToActionUrl) || !IsSafeLink(request.ImageUrl))
            return BadRequest(new { message = "Banner links must use a site path or an HTTP(S) URL." });
        var banner = await dbContext.LandingPageBanners.FindAsync([id], cancellationToken);
        if (banner is null) return NotFound();

        banner.Title = request.Title.Trim();
        banner.Description = request.Description.Trim();
        banner.ImageUrl = Normalize(request.ImageUrl);
        banner.CallToActionText = Normalize(request.CallToActionText);
        banner.CallToActionUrl = Normalize(request.CallToActionUrl);
        banner.Order = request.Order;
        banner.IsPublished = request.IsPublished;
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(banner));
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpDelete("banners/{id:int}")]
    public async Task<IActionResult> DeleteBanner(int id, CancellationToken cancellationToken)
    {
        var banner = await dbContext.LandingPageBanners.FindAsync([id], cancellationToken);
        if (banner is null) return NotFound();
        dbContext.LandingPageBanners.Remove(banner);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpPost("highlights")]
    public async Task<ActionResult<LandingPageHighlightDto>> CreateHighlight(
        LandingPageHighlightRequest request,
        CancellationToken cancellationToken)
    {
        var highlight = new LandingPageHighlight
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Order = request.Order,
            IsPublished = request.IsPublished
        };
        dbContext.LandingPageHighlights.Add(highlight);
        await dbContext.SaveChangesAsync(cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ToDto(highlight));
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpPut("highlights/{id:int}")]
    public async Task<ActionResult<LandingPageHighlightDto>> UpdateHighlight(
        int id,
        LandingPageHighlightRequest request,
        CancellationToken cancellationToken)
    {
        var highlight = await dbContext.LandingPageHighlights.FindAsync([id], cancellationToken);
        if (highlight is null) return NotFound();
        highlight.Title = request.Title.Trim();
        highlight.Description = request.Description.Trim();
        highlight.Order = request.Order;
        highlight.IsPublished = request.IsPublished;
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(highlight));
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpDelete("highlights/{id:int}")]
    public async Task<IActionResult> DeleteHighlight(int id, CancellationToken cancellationToken)
    {
        var highlight = await dbContext.LandingPageHighlights.FindAsync([id], cancellationToken);
        if (highlight is null) return NotFound();
        dbContext.LandingPageHighlights.Remove(highlight);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpPost("testimonials")]
    public async Task<ActionResult<LandingPageTestimonialDto>> CreateTestimonial(
        LandingPageTestimonialRequest request,
        CancellationToken cancellationToken)
    {
        var testimonial = new LandingPageTestimonial
        {
            Quote = request.Quote.Trim(),
            Author = request.Author.Trim(),
            Role = Normalize(request.Role),
            Order = request.Order,
            IsPublished = request.IsPublished
        };
        dbContext.LandingPageTestimonials.Add(testimonial);
        await dbContext.SaveChangesAsync(cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ToDto(testimonial));
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpPut("testimonials/{id:int}")]
    public async Task<ActionResult<LandingPageTestimonialDto>> UpdateTestimonial(
        int id,
        LandingPageTestimonialRequest request,
        CancellationToken cancellationToken)
    {
        var testimonial = await dbContext.LandingPageTestimonials.FindAsync([id], cancellationToken);
        if (testimonial is null) return NotFound();
        testimonial.Quote = request.Quote.Trim();
        testimonial.Author = request.Author.Trim();
        testimonial.Role = Normalize(request.Role);
        testimonial.Order = request.Order;
        testimonial.IsPublished = request.IsPublished;
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(testimonial));
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpDelete("testimonials/{id:int}")]
    public async Task<IActionResult> DeleteTestimonial(int id, CancellationToken cancellationToken)
    {
        var testimonial = await dbContext.LandingPageTestimonials.FindAsync([id], cancellationToken);
        if (testimonial is null) return NotFound();
        dbContext.LandingPageTestimonials.Remove(testimonial);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpPost("faqs")]
    public async Task<ActionResult<LandingPageFaqDto>> CreateFaq(
        LandingPageFaqRequest request,
        CancellationToken cancellationToken)
    {
        var faq = new LandingPageFaq
        {
            Question = request.Question.Trim(),
            Answer = request.Answer.Trim(),
            Order = request.Order,
            IsPublished = request.IsPublished
        };
        dbContext.LandingPageFaqs.Add(faq);
        await dbContext.SaveChangesAsync(cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ToDto(faq));
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpPut("faqs/{id:int}")]
    public async Task<ActionResult<LandingPageFaqDto>> UpdateFaq(
        int id,
        LandingPageFaqRequest request,
        CancellationToken cancellationToken)
    {
        var faq = await dbContext.LandingPageFaqs.FindAsync([id], cancellationToken);
        if (faq is null) return NotFound();
        faq.Question = request.Question.Trim();
        faq.Answer = request.Answer.Trim();
        faq.Order = request.Order;
        faq.IsPublished = request.IsPublished;
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(faq));
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpDelete("faqs/{id:int}")]
    public async Task<IActionResult> DeleteFaq(int id, CancellationToken cancellationToken)
    {
        var faq = await dbContext.LandingPageFaqs.FindAsync([id], cancellationToken);
        if (faq is null) return NotFound();
        dbContext.LandingPageFaqs.Remove(faq);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static LandingPageBannerDto ToDto(LandingPageBanner item) =>
        new(item.Id, item.Title, item.Description, item.ImageUrl, item.CallToActionText,
            item.CallToActionUrl, item.Order, item.IsPublished);

    private static LandingPageHighlightDto ToDto(LandingPageHighlight item) =>
        new(item.Id, item.Title, item.Description, item.Order, item.IsPublished);

    private static LandingPageTestimonialDto ToDto(LandingPageTestimonial item) =>
        new(item.Id, item.Quote, item.Author, item.Role, item.Order, item.IsPublished);

    private static LandingPageFaqDto ToDto(LandingPageFaq item) =>
        new(item.Id, item.Question, item.Answer, item.Order, item.IsPublished);

    private static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static bool IsSafeLink(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return true;
        var link = value.Trim();
        if (Uri.TryCreate(link, UriKind.Absolute, out var absoluteUri))
            return absoluteUri.Scheme == Uri.UriSchemeHttp ||
                absoluteUri.Scheme == Uri.UriSchemeHttps;
        return link.StartsWith("/", StringComparison.Ordinal) &&
            !link.StartsWith("//", StringComparison.Ordinal) &&
            !link.Contains('\\');
    }
}

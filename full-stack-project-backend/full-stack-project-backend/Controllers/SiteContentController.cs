using full_stack_project_backend.Data;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Route("api/site-content")]
public sealed class SiteContentController(AppDbcontext dbContext) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("about")]
    public async Task<ActionResult<IReadOnlyList<AboutPageBlockDto>>> GetAbout(
        CancellationToken cancellationToken)
    {
        var blocks = await dbContext.AboutPageBlocks
            .AsNoTracking()
            .OrderBy(item => item.Order)
            .ThenBy(item => item.Id)
            .Select(item => ToDto(item))
            .ToListAsync(cancellationToken);
        return Ok(blocks);
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpPost("about/blocks")]
    public async Task<ActionResult<AboutPageBlockDto>> CreateAboutBlock(
        AboutPageBlockRequest request,
        CancellationToken cancellationToken)
    {
        var block = new AboutPageBlock
        {
            Title = request.Title.Trim(),
            Body = request.Body.Trim(),
            Order = request.Order
        };
        dbContext.AboutPageBlocks.Add(block);
        await dbContext.SaveChangesAsync(cancellationToken);
        return StatusCode(StatusCodes.Status201Created, ToDto(block));
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpPut("about/blocks/{id:int}")]
    public async Task<ActionResult<AboutPageBlockDto>> UpdateAboutBlock(
        int id,
        AboutPageBlockRequest request,
        CancellationToken cancellationToken)
    {
        var block = await dbContext.AboutPageBlocks.FindAsync([id], cancellationToken);
        if (block is null) return NotFound();
        block.Title = request.Title.Trim();
        block.Body = request.Body.Trim();
        block.Order = request.Order;
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(block));
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpDelete("about/blocks/{id:int}")]
    public async Task<IActionResult> DeleteAboutBlock(int id, CancellationToken cancellationToken)
    {
        var block = await dbContext.AboutPageBlocks.FindAsync([id], cancellationToken);
        if (block is null) return NotFound();
        dbContext.AboutPageBlocks.Remove(block);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [AllowAnonymous]
    [HttpGet("contact")]
    public async Task<ActionResult<ContactPageSettingsDto>> GetContact(
        CancellationToken cancellationToken)
    {
        var settings = await dbContext.ContactPageSettings
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == 1, cancellationToken);
        return settings is null ? NotFound() : Ok(ToDto(settings));
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpPut("contact")]
    public async Task<ActionResult<ContactPageSettingsDto>> UpdateContact(
        ContactPageSettingsRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsSafeLink(request.MapUrl))
            return BadRequest(new { message = "The map link must be a site path or an HTTP(S) URL." });

        var settings = await dbContext.ContactPageSettings
            .SingleOrDefaultAsync(item => item.Id == 1, cancellationToken);
        if (settings is null)
        {
            settings = new ContactPageSettings
            {
                Id = 1,
                Introduction = string.Empty,
                Address = string.Empty,
                Email = string.Empty,
                Phone = string.Empty,
                WorkingHours = string.Empty
            };
            dbContext.ContactPageSettings.Add(settings);
        }

        settings.Introduction = request.Introduction.Trim();
        settings.Address = request.Address.Trim();
        settings.Email = request.Email.Trim();
        settings.Phone = request.Phone.Trim();
        settings.WorkingHours = request.WorkingHours.Trim();
        settings.MapUrl = Normalize(request.MapUrl);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(settings));
    }

    [AllowAnonymous]
    [EnableRateLimiting("contact-submission")]
    [HttpPost("contact/messages")]
    public async Task<ActionResult> SubmitContactMessage(
        ContactSubmissionRequest request,
        CancellationToken cancellationToken)
    {
        var submission = new ContactSubmission
        {
            Name = request.Name.Trim(),
            Email = request.Email.Trim(),
            Subject = Normalize(request.Subject),
            Message = request.Message.Trim(),
            SubmittedAtUtc = DateTime.UtcNow,
            IsRead = false
        };
        dbContext.ContactSubmissions.Add(submission);
        await dbContext.SaveChangesAsync(cancellationToken);
        return StatusCode(StatusCodes.Status201Created, new { message = "Your message has been received." });
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpGet("contact/messages")]
    public async Task<ActionResult<IReadOnlyList<ContactSubmissionDto>>> GetContactMessages(
        CancellationToken cancellationToken)
    {
        var messages = await dbContext.ContactSubmissions
            .AsNoTracking()
            .OrderBy(item => item.IsRead)
            .ThenByDescending(item => item.SubmittedAtUtc)
            .Select(item => ToDto(item))
            .ToListAsync(cancellationToken);
        return Ok(messages);
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpPatch("contact/messages/{id:int}/read")]
    public async Task<IActionResult> MarkContactMessageRead(
        int id,
        [FromBody] bool isRead,
        CancellationToken cancellationToken)
    {
        var submission = await dbContext.ContactSubmissions.FindAsync([id], cancellationToken);
        if (submission is null) return NotFound();
        submission.IsRead = isRead;
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    [HttpDelete("contact/messages/{id:int}")]
    public async Task<IActionResult> DeleteContactMessage(int id, CancellationToken cancellationToken)
    {
        var submission = await dbContext.ContactSubmissions.FindAsync([id], cancellationToken);
        if (submission is null) return NotFound();
        dbContext.ContactSubmissions.Remove(submission);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static AboutPageBlockDto ToDto(AboutPageBlock item) =>
        new(item.Id, item.Title, item.Body, item.Order);

    private static ContactPageSettingsDto ToDto(ContactPageSettings item) =>
        new(item.Id, item.Introduction, item.Address, item.Email, item.Phone, item.WorkingHours, item.MapUrl);

    private static ContactSubmissionDto ToDto(ContactSubmission item) =>
        new(item.Id, item.Name, item.Email, item.Subject, item.Message, item.SubmittedAtUtc, item.IsRead);

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

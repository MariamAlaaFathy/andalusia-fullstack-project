using System.ComponentModel.DataAnnotations;

namespace full_stack_project_backend.DTOs;

public sealed record LandingPageBannerDto(
    int Id,
    string Title,
    string Description,
    string? ImageUrl,
    string? CallToActionText,
    string? CallToActionUrl,
    int Order,
    bool IsPublished);

public sealed class LandingPageBannerRequest
{
    [Required, StringLength(160)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [StringLength(2048)]
    public string? ImageUrl { get; set; }

    [StringLength(80)]
    public string? CallToActionText { get; set; }

    [StringLength(2048)]
    public string? CallToActionUrl { get; set; }

    [Range(0, int.MaxValue)]
    public int Order { get; set; }

    public bool IsPublished { get; set; } = true;
}

public sealed record LandingPageHighlightDto(
    int Id,
    string Title,
    string Description,
    int Order,
    bool IsPublished);

public sealed class LandingPageHighlightRequest
{
    [Required, StringLength(160)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Order { get; set; }

    public bool IsPublished { get; set; } = true;
}

public sealed record LandingPageTestimonialDto(
    int Id,
    string Quote,
    string Author,
    string? Role,
    int Order,
    bool IsPublished);

public sealed class LandingPageTestimonialRequest
{
    [Required, StringLength(2000)]
    public string Quote { get; set; } = string.Empty;

    [Required, StringLength(120)]
    public string Author { get; set; } = string.Empty;

    [StringLength(160)]
    public string? Role { get; set; }

    [Range(0, int.MaxValue)]
    public int Order { get; set; }

    public bool IsPublished { get; set; } = true;
}

public sealed record LandingPageFaqDto(
    int Id,
    string Question,
    string Answer,
    int Order,
    bool IsPublished);

public sealed record LandingPageManagementResponse(
    IReadOnlyList<LandingPageBannerDto> Banners,
    IReadOnlyList<LandingPageHighlightDto> Highlights,
    IReadOnlyList<LandingPageTestimonialDto> Testimonials,
    IReadOnlyList<LandingPageFaqDto> Faqs);

public sealed class LandingPageFaqRequest
{
    [Required, StringLength(500)]
    public string Question { get; set; } = string.Empty;

    [Required, StringLength(4000)]
    public string Answer { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Order { get; set; }

    public bool IsPublished { get; set; } = true;
}

public sealed record AboutPageBlockDto(int Id, string Title, string Body, int Order);

public sealed class AboutPageBlockRequest
{
    [Required, StringLength(160)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(4000)]
    public string Body { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Order { get; set; }
}

public sealed record ContactPageSettingsDto(
    int Id,
    string Introduction,
    string Address,
    string Email,
    string Phone,
    string WorkingHours,
    string? MapUrl);

public sealed class ContactPageSettingsRequest
{
    [Required, StringLength(1000)]
    public string Introduction { get; set; } = string.Empty;

    [Required, StringLength(500)]
    public string Address { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(64)]
    public string Phone { get; set; } = string.Empty;

    [Required, StringLength(500)]
    public string WorkingHours { get; set; } = string.Empty;

    [StringLength(2048)]
    public string? MapUrl { get; set; }
}

public sealed class ContactSubmissionRequest
{
    [Required, StringLength(120)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(254)]
    public string Email { get; set; } = string.Empty;

    [StringLength(200)]
    public string? Subject { get; set; }

    [Required, StringLength(4000)]
    public string Message { get; set; } = string.Empty;
}

public sealed record ContactSubmissionDto(
    int Id,
    string Name,
    string Email,
    string? Subject,
    string Message,
    DateTime SubmittedAtUtc,
    bool IsRead);

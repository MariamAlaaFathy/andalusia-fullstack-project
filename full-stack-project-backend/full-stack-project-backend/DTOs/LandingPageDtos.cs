using System.ComponentModel.DataAnnotations;

namespace full_stack_project_backend.DTOs
{
    public class LandingPageHeroRequest
    {
        [Required]
        [StringLength(160)]
        public string HeroTitle { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string HeroSubtitle { get; set; } = string.Empty;

        [StringLength(2048)]
        public string? HeroImageUrl { get; set; }

        [Required]
        [StringLength(80)]
        public string CallToActionText { get; set; } = string.Empty;

        [StringLength(2048)]
        public string? CallToActionUrl { get; set; }
    }

    public class FeaturedCourseRequest
    {
        [Required]
        public IReadOnlyList<int> CourseIds { get; set; } = [];
    }

    public sealed record LandingPageContentDto(
        int Id,
        string HeroTitle,
        string HeroSubtitle,
        string? HeroImageUrl,
        string CallToActionText,
        string? CallToActionUrl,
        DateTime UpdatedAtUtc);

    public sealed record LandingPageResponse(
        LandingPageContentDto? Hero,
        IReadOnlyList<CourseDto> FeaturedCourses,
        IReadOnlyList<LandingPageBannerDto> Banners,
        IReadOnlyList<LandingPageHighlightDto> Highlights,
        IReadOnlyList<LandingPageTestimonialDto> Testimonials,
        IReadOnlyList<LandingPageFaqDto> Faqs);
}

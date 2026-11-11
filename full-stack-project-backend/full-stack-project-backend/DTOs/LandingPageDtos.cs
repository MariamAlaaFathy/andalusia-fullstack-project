namespace full_stack_project_backend.DTOs
{
    public class LandingPageHeroRequest
    {
        public string HeroTitle { get; set; } = string.Empty;
        public string HeroSubtitle { get; set; } = string.Empty;
        public string? HeroImageUrl { get; set; }
        public string CallToActionText { get; set; } = string.Empty;
        public string? CallToActionUrl { get; set; }
    }

    public class FeaturedCourseRequest
    {
        public IReadOnlyList<int> CourseIds { get; set; } = [];
    }
}

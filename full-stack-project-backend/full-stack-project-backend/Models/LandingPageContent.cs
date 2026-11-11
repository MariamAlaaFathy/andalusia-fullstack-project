namespace full_stack_project_backend.Models
{
    public class LandingPageContent
    {
        public int Id { get; set; }
        public string HeroTitle { get; set; } = string.Empty;
        public string HeroSubtitle { get; set; } = string.Empty;
        public string? HeroImageUrl { get; set; }
        public string CallToActionText { get; set; } = string.Empty;
        public string? CallToActionUrl { get; set; }
        public DateTime UpdatedAtUtc { get; set; }
    }
}

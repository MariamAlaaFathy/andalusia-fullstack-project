namespace full_stack_project_backend.Models;

public class LandingPageBanner
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? CallToActionText { get; set; }
    public string? CallToActionUrl { get; set; }
    public int Order { get; set; }
    public bool IsPublished { get; set; } = true;
}

public class LandingPageHighlight
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public int Order { get; set; }
    public bool IsPublished { get; set; } = true;
}

public class LandingPageTestimonial
{
    public int Id { get; set; }
    public required string Quote { get; set; }
    public required string Author { get; set; }
    public string? Role { get; set; }
    public int Order { get; set; }
    public bool IsPublished { get; set; } = true;
}

public class LandingPageFaq
{
    public int Id { get; set; }
    public required string Question { get; set; }
    public required string Answer { get; set; }
    public int Order { get; set; }
    public bool IsPublished { get; set; } = true;
}

public class AboutPageBlock
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Body { get; set; }
    public int Order { get; set; }
}

public class ContactPageSettings
{
    public int Id { get; set; }
    public required string Introduction { get; set; }
    public required string Address { get; set; }
    public required string Email { get; set; }
    public required string Phone { get; set; }
    public required string WorkingHours { get; set; }
    public string? MapUrl { get; set; }
}

public class ContactSubmission
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? Subject { get; set; }
    public required string Message { get; set; }
    public DateTime SubmittedAtUtc { get; set; }
    public bool IsRead { get; set; }
}

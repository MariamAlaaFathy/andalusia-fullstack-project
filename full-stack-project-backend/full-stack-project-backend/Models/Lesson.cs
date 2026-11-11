namespace full_stack_project_backend.Models
{
    public class Lesson
    {
        public int Id { get; set; }

        public required string Title { get; set; }

        public string Description { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;

        public string? VideoUrl { get; set; }

        public string? PdfUrl { get; set; }

        public int Order { get; set; }

        public int ModuleId { get; set; }
        public CourseModule Module { get; set; } = null!;

    }
}

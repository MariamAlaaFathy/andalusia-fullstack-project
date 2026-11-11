namespace full_stack_project_backend.DTOs
{
    public class CourseModuleRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Order { get; set; }
    }

    public class LessonRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? VideoUrl { get; set; }
        public string? PdfUrl { get; set; }
        public int Order { get; set; }
    }
}

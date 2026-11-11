using System.ComponentModel.DataAnnotations;

namespace full_stack_project_backend.DTOs
{
    public class CourseModuleRequest
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int Order { get; set; }
    }

    public class LessonRequest
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [StringLength(20000)]
        public string Content { get; set; } = string.Empty;

        [StringLength(2048)]
        [Url]
        public string? VideoUrl { get; set; }

        [StringLength(2048)]
        [Url]
        public string? PdfUrl { get; set; }

        [Range(1, int.MaxValue)]
        public int Order { get; set; }
    }

    public sealed record CourseModuleSummaryDto(
        int Id,
        int CourseId,
        string Title,
        string Description,
        int Order);

    public sealed record CourseContentModuleDto(
        int Id,
        int CourseId,
        string Title,
        string Description,
        int Order,
        IReadOnlyList<LessonDto> Lessons);

    public sealed record LessonDto(
        int Id,
        string Title,
        string Description,
        string Content,
        string? VideoUrl,
        string? PdfUrl,
        int Order,
        int ModuleId);
}

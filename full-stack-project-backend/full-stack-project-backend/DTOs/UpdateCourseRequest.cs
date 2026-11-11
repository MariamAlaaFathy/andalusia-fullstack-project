using System.ComponentModel.DataAnnotations;
namespace full_stack_project_backend.DTOs
{
    public class UpdateCourseRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Range(0, int.MaxValue)]
        public int Price { get; set; }

        [Required]
        public string Category { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int ProgramId { get; set; }

        [Required]
        public string Duration { get; set; } = string.Empty;

        [Required]
        public string Level { get; set; } = string.Empty;

        public List<string> Prerequisites { get; set; } = [];

        public List<string> LearningOutcomes { get; set; } = [];
    }
}

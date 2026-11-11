using System.ComponentModel.DataAnnotations;
namespace full_stack_project_backend.DTOs
{
    public class CreateCourseRequest
    {
        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        public int Price { get; set; }

        public string Category { get; set; }

        public int ProgramId { get; set; }

        public string Duration { get; set; }

        public string Level { get; set; }

        public List<string> Prerequisites { get; set; } = [];

        public List<string> LearningOutcomes { get; set; } = [];
    }
}

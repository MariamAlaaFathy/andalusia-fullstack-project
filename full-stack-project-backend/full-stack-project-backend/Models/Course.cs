namespace full_stack_project_backend.Models
{
    public class Course
{
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Price { get; set; }  
        public string Category { get; set; }
        public int ProgramId { get; set; }
        public Program Program { get; set; } = null!;
        public string Duration { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public List<string> Prerequisites { get; set; } = [];
        public List<string> LearningOutcomes { get; set; } = [];
    }
}

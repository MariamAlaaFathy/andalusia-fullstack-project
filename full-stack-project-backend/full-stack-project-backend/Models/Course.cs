namespace full_stack_project_backend.Models
{
    public class Course
{
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Price { get; set; }  
        public string Category { get; set; } = string.Empty;
        public int ProgramId { get; set; }
        public Program Program { get; set; } = null!;
        public string Duration { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public List<string> Prerequisites { get; set; } = [];
        public List<string> LearningOutcomes { get; set; } = [];
        public ICollection<CourseInstructor> Instructors { get; set; } = [];
        public ICollection<CourseSession> Sessions { get; set; } = [];
        public ICollection<CourseAssignment> Assignments { get; set; } = [];

       

        public string Title { get; set; } = string.Empty;

    
        public string Content { get; set; } = string.Empty;

        public string? VideoUrl { get; set; }

        public string? PdfUrl { get; set; }

        public int Order { get; set; }

    }
}

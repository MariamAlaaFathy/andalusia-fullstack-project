namespace full_stack_project_backend.Models
{
    public class CourseModule
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Order { get; set; }
        public Course Course { get; set; } = null!;
        public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    }
}

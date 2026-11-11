namespace full_stack_project_backend.Models
{
    public class FeaturedCourse
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public int Order { get; set; }
        public Course Course { get; set; } = null!;
    }
}

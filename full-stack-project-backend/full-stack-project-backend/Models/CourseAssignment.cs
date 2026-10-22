namespace full_stack_project_backend.Models;

public sealed class CourseAssignment
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueAt { get; set; }
    public ICollection<AssignmentSubmission> Submissions { get; set; } = [];
}

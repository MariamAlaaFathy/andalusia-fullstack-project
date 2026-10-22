namespace full_stack_project_backend.Models;

public sealed class AssignmentSubmission
{
    public int Id { get; set; }
    public int CourseAssignmentId { get; set; }
    public CourseAssignment CourseAssignment { get; set; } = null!;
    public int LearnerId { get; set; }
    public User Learner { get; set; } = null!;
    public string Content { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public decimal? Grade { get; set; }
    public string? Feedback { get; set; }
}

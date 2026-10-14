namespace full_stack_project_backend.Models;

public enum CourseApplicationStatus
{
    AwaitingPayment,
    Enrolled
}

public class CourseApplication
{
    public int Id { get; set; }
    public int LearnerId { get; set; }
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public string CourseName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public CourseApplicationStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public Payment? Payment { get; set; }
}

namespace full_stack_project_backend.Models;

public sealed class SessionAttendance
{
    public int CourseSessionId { get; set; }
    public CourseSession CourseSession { get; set; } = null!;
    public int LearnerId { get; set; }
    public User Learner { get; set; } = null!;
    public bool IsPresent { get; set; }
    public DateTime RecordedAt { get; set; }
}

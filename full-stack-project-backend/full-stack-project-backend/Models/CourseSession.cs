namespace full_stack_project_backend.Models;

public sealed class CourseSession
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public string Location { get; set; } = string.Empty;
    public ICollection<SessionAttendance> Attendance { get; set; } = [];
}

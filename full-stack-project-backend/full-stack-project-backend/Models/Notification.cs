namespace full_stack_project_backend.Models;

public sealed class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Text { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public bool IsRead { get; set; }
}

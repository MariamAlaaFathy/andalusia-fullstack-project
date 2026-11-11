using full_stack_project_backend.Models;

namespace full_stack_project_backend.Services;

public interface INotificationService
{
    Task<IReadOnlyList<Notification>> GetForUserAsync(
        int userId,
        CancellationToken cancellationToken);

    Task<int> GetUnreadCountAsync(
        int userId,
        CancellationToken cancellationToken);

    Task<bool> MarkAsReadAsync(
        int notificationId,
        int userId,
        CancellationToken cancellationToken);

    Task CreateAsync(
        int userId,
        string text,
        CancellationToken cancellationToken);

    Task CreateForCourseLearnersAsync(
        int courseId,
        string text,
        CancellationToken cancellationToken);
}

using full_stack_project_backend.Data;
using full_stack_project_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Services;

public sealed class NotificationService(AppDbcontext dbContext)
    : INotificationService
{
    public async Task<IReadOnlyList<Notification>> GetForUserAsync(
        int userId,
        CancellationToken cancellationToken) =>
        await dbContext.Notifications
            .AsNoTracking()
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.Date)
            .ToListAsync(cancellationToken);

    public Task<int> GetUnreadCountAsync(
        int userId,
        CancellationToken cancellationToken) =>
        dbContext.Notifications
            .CountAsync(
                notification => notification.UserId == userId && !notification.IsRead,
                cancellationToken);

    public async Task<bool> MarkAsReadAsync(
        int notificationId,
        int userId,
        CancellationToken cancellationToken)
    {
        var notification = await dbContext.Notifications.FirstOrDefaultAsync(
            item => item.Id == notificationId && item.UserId == userId,
            cancellationToken);
        if (notification is null)
        {
            return false;
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        return true;
    }

    public async Task CreateAsync(
        int userId,
        string text,
        CancellationToken cancellationToken)
    {
        dbContext.Notifications.Add(new Notification
        {
            UserId = userId,
            Text = text,
            Date = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task CreateForCourseLearnersAsync(
        int courseId,
        string text,
        CancellationToken cancellationToken)
    {
        var learnerIds = await dbContext.CourseApplications
            .Where(application =>
                application.CourseId == courseId &&
                application.Status == CourseApplicationStatus.Enrolled)
            .Select(application => application.LearnerId)
            .Distinct()
            .ToListAsync(cancellationToken);
        if (learnerIds.Count == 0)
        {
            return;
        }

        dbContext.Notifications.AddRange(learnerIds.Select(userId => new Notification
        {
            UserId = userId,
            Text = text,
            Date = DateTime.UtcNow
        }));
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}

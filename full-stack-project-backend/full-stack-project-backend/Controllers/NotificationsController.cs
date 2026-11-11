using System.Security.Claims;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public sealed class NotificationsController(INotificationService notificationService)
    : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NotificationResponse>>> GetMine(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var notifications = await notificationService.GetForUserAsync(
            userId,
            cancellationToken);
        return Ok(notifications.Select(notification => new NotificationResponse(
            notification.Id,
            notification.UserId,
            notification.Text,
            notification.Date,
            notification.IsRead)));
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<UnreadCountResponse>> GetUnreadCount(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return Ok(new UnreadCountResponse(
            await notificationService.GetUnreadCountAsync(userId, cancellationToken)));
    }

    [HttpPatch("{notificationId:int}/read")]
    public async Task<IActionResult> MarkAsRead(
        int notificationId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        return await notificationService.MarkAsReadAsync(
            notificationId,
            userId,
            cancellationToken)
            ? NoContent()
            : NotFound();
    }

    private bool TryGetUserId(out int userId) =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId) &&
        userId > 0;
}

public sealed record NotificationResponse(
    int Id,
    int UserId,
    string Text,
    DateTime Date,
    bool IsRead);

public sealed record UnreadCountResponse(int Count);

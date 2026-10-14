using System.Security.Claims;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace full_stack_project_backend.Controllers;

public abstract class LearnerControllerBase : ControllerBase
{
    protected bool TryGetLearnerId(out string learnerId)
    {
        learnerId = string.Empty;
        if (User.Identity?.IsAuthenticated != true) return false;
        learnerId = User.FindFirstValue("sub") ??
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            string.Empty;
        return !string.IsNullOrWhiteSpace(learnerId);
    }

    internal static CourseApplicationResponse ToResponse(
        CourseApplication application) =>
        new(
            application.Id,
            application.CourseId,
            application.CourseName,
            application.Amount,
            application.Status.ToString(),
            application.CreatedAt,
            application.Payment is null
                ? null
                : new PaymentResponse(
                    application.Payment.Id,
                    application.Payment.Amount,
                    application.Payment.Currency,
                    application.Payment.Status.ToString(),
                    application.Payment.PaidAt));
}

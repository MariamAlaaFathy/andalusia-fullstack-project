using full_stack_project_backend.Data;
using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Authorize(Policy = "AdminOnly")]
[Route("api/admin/applications")]
public sealed class AdminApplicationsController(
    AppDbcontext dbContext,
    INotificationService notificationService) : ControllerBase
{
    [HttpPatch("{applicationId:int}/status")]
    public async Task<ActionResult<ApplicationStatusResponse>> UpdateStatus(
        int applicationId,
        [FromBody] UpdateApplicationStatusRequest request,
        CancellationToken cancellationToken)
    {
        var status = request.Status switch
        {
            "Pending" => CourseApplicationStatus.Pending,
            "Approved" => CourseApplicationStatus.Approved,
            "Enrolled" => CourseApplicationStatus.Enrolled,
            _ => (CourseApplicationStatus?)null
        };
        if (status is null)
        {
            return BadRequest(new
            {
                message = "Status must be Pending, Approved, or Enrolled."
            });
        }

        var application = await dbContext.CourseApplications
            .FirstOrDefaultAsync(
                item => item.Id == applicationId,
                cancellationToken);
        if (application is null)
        {
            return NotFound();
        }

        if (application.Status != status.Value)
        {
            application.Status = status.Value;
            await dbContext.SaveChangesAsync(cancellationToken);
            await notificationService.CreateAsync(
                application.LearnerId,
                $"Your application for {application.CourseName} is now {status.Value}.",
                cancellationToken);
        }

        return Ok(new ApplicationStatusResponse(application.Id, status.Value.ToString()));
    }
}

public sealed record UpdateApplicationStatusRequest(string Status);

public sealed record ApplicationStatusResponse(int Id, string Status);

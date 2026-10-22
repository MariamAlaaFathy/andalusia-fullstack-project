using full_stack_project_backend.DTOs;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Authorize(Roles = "Learner")]
[Route("api/payments")]
public sealed class PaymentsController(
    IPaymentService paymentService,
    IHostEnvironment environment) : ControllerBase
{
    [HttpPost("application/{applicationId:int}/demo-payment")]
    public async Task<ActionResult<CourseApplicationResponse>> CompleteDemoPayment(
        int applicationId,
        CancellationToken cancellationToken)
    {
        if (!environment.IsDevelopment()) return NotFound();
        if (!int.TryParse(
                User.FindFirstValue(ClaimTypes.NameIdentifier),
                out var learnerId) ||
            learnerId <= 0)
        {
            return Unauthorized();
        }
        return Ok(await paymentService.CompleteDemoPaymentAsync(
            applicationId,
            learnerId,
            cancellationToken));
    }
}

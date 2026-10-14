using System.Text;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Authorize]
[Route("api/payments")]
public sealed class PaymentsController(IPaymentService paymentService)
    : LearnerControllerBase
{
    [HttpPost("application/{applicationId:guid}/checkout")]
    public async Task<ActionResult<CheckoutResponse>> StartCheckout(
        Guid applicationId,
        CancellationToken cancellationToken)
    {
        if (!TryGetLearnerId(out var learnerId)) return Unauthorized();
        return Ok(await paymentService.StartCheckoutAsync(
            applicationId,
            learnerId,
            cancellationToken));
    }

    [HttpPost("confirm")]
    public async Task<ActionResult<CourseApplicationResponse>> ConfirmCheckout(
        ConfirmCheckoutRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetLearnerId(out var learnerId)) return Unauthorized();
        return Ok(await paymentService.ConfirmCheckoutAsync(
            request.SessionId,
            learnerId,
            cancellationToken));
    }

    [AllowAnonymous]
    [HttpPost("webhook")]
    [RequestSizeLimit(64_000)]
    public async Task<IActionResult> Webhook(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var payload = await reader.ReadToEndAsync(cancellationToken);
        await paymentService.ProcessWebhookAsync(
            payload,
            Request.Headers["Stripe-Signature"].ToString(),
            cancellationToken);
        return Ok();
    }
}

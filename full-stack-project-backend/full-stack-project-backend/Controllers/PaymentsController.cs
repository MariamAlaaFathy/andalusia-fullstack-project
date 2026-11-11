using Stripe;
using Stripe.Checkout;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Route("api/payments")]
public sealed class PaymentsController(
    IPaymentService paymentService,
    IConfiguration configuration,
    ILogger<PaymentsController> logger) : ControllerBase
{
    [Authorize(Roles = "Learner")]
    [HttpPost("create-checkout-session")]
    public async Task<IActionResult> CreateCheckoutSession(
        [FromBody] CreateCheckoutSessionRequest request,
        CancellationToken cancellationToken)
    {
        if (!int.TryParse(
                User.FindFirstValue(ClaimTypes.NameIdentifier),
                out var learnerId) ||
            learnerId <= 0)
        {
            return Unauthorized();
        }

        var sessionUrl = await paymentService.CreateCheckoutSessionAsync(
            request.ApplicationId,
            learnerId,
            cancellationToken);
        return Ok(new { url = sessionUrl });
    }

    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> HandleWebhook(CancellationToken cancellationToken)
    {
        var webhookSecret = configuration["Stripe:WebhookSecret"];
        if (string.IsNullOrWhiteSpace(webhookSecret))
        {
            logger.LogError("Stripe webhook secret is not configured.");
            return StatusCode(StatusCodes.Status503ServiceUnavailable);
        }

        var signature = Request.Headers["Stripe-Signature"].ToString();
        if (string.IsNullOrWhiteSpace(signature))
        {
            return BadRequest("Missing Stripe signature.");
        }

        using var reader = new StreamReader(Request.Body);
        var payload = await reader.ReadToEndAsync(cancellationToken);

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(payload, signature, webhookSecret);
        }
        catch (StripeException exception)
        {
            logger.LogWarning(exception, "Received an invalid Stripe webhook signature.");
            return BadRequest("Invalid Stripe signature.");
        }

        if (stripeEvent.Type is not "checkout.session.completed"
            and not "checkout.session.async_payment_succeeded")
        {
            return Ok();
        }

        if (stripeEvent.Data.Object is not Session session ||
            (stripeEvent.Type == "checkout.session.completed" &&
             session.PaymentStatus != "paid"))
        {
            return Ok();
        }

        var markedPaid = await paymentService.MarkCheckoutSessionPaidAsync(
            session.Id,
            session.PaymentIntentId,
            cancellationToken);
        if (!markedPaid)
        {
            logger.LogError(
                "No payment record was found for Stripe checkout session {SessionId}.",
                session.Id);
            return NotFound();
        }

        return Ok();
    }
}

public sealed record CreateCheckoutSessionRequest(int ApplicationId);

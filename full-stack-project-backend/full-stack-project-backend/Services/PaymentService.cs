using full_stack_project_backend.Models;
using full_stack_project_backend.Repository;
using Assignment_3.Middleware;
using Stripe;
using Stripe.Checkout;

namespace full_stack_project_backend.Services;

public sealed class PaymentService(
    IEnrollmentRepository repository,
    IConfiguration configuration) : IPaymentService
{
    public async Task<string> CreateCheckoutSessionAsync(
        int applicationId,
        int learnerId,
        CancellationToken cancellationToken)
    {
        var application = await repository.GetApplicationAsync(
            applicationId,
            learnerId,
            cancellationToken)
            ?? throw new NotFoundException("Course application not found.");

        if (application.Status == CourseApplicationStatus.Enrolled)
        {
            throw new ConflictException("This application is already enrolled.");
        }

        if (application.Amount <= 0)
        {
            throw new RequestValidationException(
                "Checkout is only available for courses with a payment due.");
        }

        var stripeClient = new StripeClient(GetRequiredSetting("Stripe:SecretKey"));
        var frontendBaseUrl = GetRequiredSetting("Stripe:FrontendBaseUrl").TrimEnd('/');
        if (!Uri.TryCreate(frontendBaseUrl, UriKind.Absolute, out var frontendUri) ||
            (frontendUri.Scheme != Uri.UriSchemeHttp &&
             frontendUri.Scheme != Uri.UriSchemeHttps))
        {
            throw new InvalidOperationException(
                "Stripe:FrontendBaseUrl must be an absolute HTTP or HTTPS URL.");
        }

        var payment = application.Payment;
        if (payment is null)
        {
            payment = new Payment
            {
                CourseApplicationId = application.Id,
                Amount = application.Amount,
                Currency = "usd",
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };
            repository.AddPayment(payment);
            application.Payment = payment;
        }

        var sessionService = new SessionService(stripeClient);
        if (!string.IsNullOrEmpty(payment.StripeCheckoutSessionId))
        {
            var oldSession = await sessionService.GetAsync(
                payment.StripeCheckoutSessionId,
                cancellationToken: cancellationToken);
            if (oldSession.Status == "open")
            {
                await sessionService.ExpireAsync(
                    oldSession.Id,
                    cancellationToken: cancellationToken);
            }
        }

        payment.Amount = application.Amount;
        payment.Currency = "usd";
        payment.Status = PaymentStatus.Pending;
        payment.PaidAt = null;
        payment.StripePaymentIntentId = null;
        await repository.SaveChangesAsync(cancellationToken);

        var courseUrl = $"{frontendBaseUrl}/Apply/{application.CourseId}";
        var session = await sessionService.CreateAsync(
            new SessionCreateOptions
            {
                Mode = "payment",
                SuccessUrl = $"{courseUrl}?checkout=success&session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{courseUrl}?checkout=cancelled",
                ClientReferenceId = application.Id.ToString(),
                Metadata = new Dictionary<string, string>
                {
                    ["courseApplicationId"] = application.Id.ToString(),
                    ["learnerId"] = learnerId.ToString()
                },
                LineItems =
                [
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = payment.Currency,
                            UnitAmount = decimal.ToInt64(
                                decimal.Round(
                                    payment.Amount * 100m,
                                    0,
                                    MidpointRounding.AwayFromZero)),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = application.CourseName
                            }
                        },
                        Quantity = 1
                    }
                ]
            },
            cancellationToken: cancellationToken);
            Console.WriteLine($"[DEBUG] Stripe Session Created ID: {session.Id}");

        payment.StripeCheckoutSessionId = session.Id;
        payment.CheckoutExpiresAt = session.ExpiresAt;
        try
        {
            await repository.SaveChangesAsync(cancellationToken);
            Console.WriteLine("[DEBUG] Payment session ID successfully saved to database.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Failed to save session ID: {ex.Message}");
            throw;
        }
        return session.Url;
    }

    public async Task<bool> MarkCheckoutSessionPaidAsync(
        string checkoutSessionId,
        string? paymentIntentId,
        CancellationToken cancellationToken)
    {
        var payment = await repository.GetPaymentByCheckoutSessionIdAsync(
            checkoutSessionId,
            cancellationToken);
        if (payment is null)
        {
            return false;
        }

        payment.Status = PaymentStatus.Paid;
        payment.StripePaymentIntentId = paymentIntentId;
        payment.PaidAt ??= DateTime.UtcNow;
        payment.CourseApplication.Status = CourseApplicationStatus.Enrolled;
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private string GetRequiredSetting(string key)
    {
        var value = configuration[key];
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException(
                $"Configure {key} before using Stripe checkout.");
        }

        return value;
    }
}

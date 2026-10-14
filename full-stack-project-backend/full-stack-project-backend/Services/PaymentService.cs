using System.Text.Json;
using AutoMapper;
using Assignment_3.Middleware;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Repository;
using Microsoft.Extensions.Options;

namespace full_stack_project_backend.Services;

public sealed class PaymentService(
    IEnrollmentRepository repository,
    StripeCheckoutService stripe,
    IOptions<StripeOptions> stripeOptions,
    IMapper mapper,
    ILogger<PaymentService> logger) : IPaymentService
{
    public async Task<CheckoutResponse> StartCheckoutAsync(
        Guid applicationId,
        string learnerId,
        CancellationToken cancellationToken)
    {
        var application = await repository.GetApplicationAsync(
            applicationId,
            learnerId,
            cancellationToken)
            ?? throw new NotFoundException("Course application not found.");

        if (application.Status == CourseApplicationStatus.Enrolled)
        {
            return new CheckoutResponse(null, mapper.Map<CourseApplicationResponse>(application));
        }

        if (application.Amount <= 0)
        {
            application.Status = CourseApplicationStatus.Enrolled;
            await repository.SaveChangesAsync(cancellationToken);
            return new CheckoutResponse(null, mapper.Map<CourseApplicationResponse>(application));
        }

        var payment = application.Payment;
        if (payment?.Status == PaymentStatus.Paid)
        {
            application.Status = CourseApplicationStatus.Enrolled;
            await repository.SaveChangesAsync(cancellationToken);
            return new CheckoutResponse(null, mapper.Map<CourseApplicationResponse>(application));
        }

        if (payment?.Status == PaymentStatus.Pending &&
            payment.StripeCheckoutSessionId is not null &&
            payment.CheckoutExpiresAt > DateTime.UtcNow.AddMinutes(1))
        {
            var existingSession = await RequestStripeAsync(
                () => stripe.GetSessionAsync(
                    payment.StripeCheckoutSessionId,
                    cancellationToken),
                "Stripe checkout could not be retrieved.");
            if (existingSession.Status == "open" &&
                existingSession.Url is not null &&
                existingSession.ExpiresAt > DateTime.UtcNow.AddMinutes(1))
            {
                return new CheckoutResponse(
                    existingSession.Url,
                    mapper.Map<CourseApplicationResponse>(application));
            }
            if (existingSession.Status == "complete" &&
                existingSession.PaymentStatus == "paid" &&
                MatchesPayment(existingSession, payment))
            {
                MarkPaid(payment, existingSession.PaymentIntentId);
                await repository.SaveChangesAsync(cancellationToken);
                return new CheckoutResponse(
                    null,
                    mapper.Map<CourseApplicationResponse>(application));
            }
        }

        var session = await RequestStripeAsync(
            () => stripe.CreateSessionAsync(application, cancellationToken),
            "Stripe checkout could not be started.");
        if (payment is null)
        {
            payment = new Payment
            {
                Id = Guid.NewGuid(),
                CourseApplicationId = application.Id,
                Amount = application.Amount,
                Currency = stripeOptions.Value.Currency.ToLowerInvariant(),
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };
            repository.AddPayment(payment);
        }

        payment.StripeCheckoutSessionId = session.Id;
        payment.CheckoutExpiresAt = session.ExpiresAt;
        await repository.SaveChangesAsync(cancellationToken);
        return new CheckoutResponse(
            session.Url,
            mapper.Map<CourseApplicationResponse>(application));
    }

    public async Task<CourseApplicationResponse> ConfirmCheckoutAsync(
        string sessionId,
        string learnerId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            throw new RequestValidationException(
                "A Stripe Checkout session ID is required.");
        }

        var payment = await repository.GetPaymentAsync(
            sessionId,
            learnerId,
            cancellationToken)
            ?? throw new NotFoundException("Payment session not found.");

        if (payment.Status == PaymentStatus.Paid)
        {
            return mapper.Map<CourseApplicationResponse>(payment.CourseApplication);
        }

        var session = await RequestStripeAsync(
            () => stripe.GetSessionAsync(sessionId, cancellationToken),
            "Payment confirmation could not be checked.");
        if (session.ApplicationId != payment.CourseApplicationId.ToString())
        {
            throw new RequestValidationException(
                "Checkout session did not match this application.");
        }

        if (session.Status != "complete" ||
            session.PaymentStatus != "paid" ||
            !MatchesPayment(session, payment))
        {
            throw new ConflictException("Payment has not been confirmed yet.");
        }

        MarkPaid(payment, session.PaymentIntentId);
        await repository.SaveChangesAsync(cancellationToken);
        return mapper.Map<CourseApplicationResponse>(payment.CourseApplication);
    }

    public async Task ProcessWebhookAsync(
        string payload,
        string signature,
        CancellationToken cancellationToken)
    {
        string webhookSecret;
        try
        {
            webhookSecret = stripe.GetWebhookSecret();
        }
        catch (InvalidOperationException exception)
        {
            logger.LogError(exception, "Stripe webhook configuration is incomplete.");
            throw new ServiceUnavailableException(
                "Payment notifications are not configured.");
        }

        if (!StripeWebhookSignature.IsValid(
                signature,
                payload,
                webhookSecret,
                DateTimeOffset.UtcNow))
        {
            throw new UnauthorizedAccessException("Invalid Stripe webhook signature.");
        }

        try
        {
            using var eventDocument = JsonDocument.Parse(payload);
            var eventRoot = eventDocument.RootElement;
            var eventType = GetString(eventRoot, "type");
            if (eventType is not ("checkout.session.completed" or
                "checkout.session.async_payment_succeeded" or
                "checkout.session.async_payment_failed" or
                "checkout.session.expired"))
            {
                return;
            }

            var session = eventRoot.GetProperty("data").GetProperty("object");
            var sessionId = GetString(session, "id");
            var applicationId = GetString(
                session.GetProperty("metadata"),
                "applicationId");
            var paymentIntent = session.GetProperty("payment_intent");
            var paymentIntentId = paymentIntent.ValueKind == JsonValueKind.String
                ? paymentIntent.GetString()
                : paymentIntent.ValueKind == JsonValueKind.Object
                    ? GetString(paymentIntent, "id")
                    : null;
            var payment = await repository.GetPaymentAsync(
                sessionId,
                null,
                cancellationToken);
            if (payment is null ||
                payment.CourseApplicationId.ToString() != applicationId)
            {
                logger.LogWarning(
                    "Stripe event {EventId} references an unknown checkout session.",
                    GetString(eventRoot, "id"));
                throw new NotFoundException("Stripe checkout session not found.");
            }

            if (eventType is "checkout.session.async_payment_failed" or
                "checkout.session.expired" ||
                GetString(session, "payment_status") != "paid" ||
                !MatchesPayment(session, payment.Amount, payment.Currency))
            {
                if (payment.Status != PaymentStatus.Paid)
                {
                    payment.Status = PaymentStatus.Failed;
                }
            }
            else
            {
                MarkPaid(payment, paymentIntentId);
            }
            await repository.SaveChangesAsync(cancellationToken);
        }
        catch (JsonException exception)
        {
            logger.LogWarning(exception, "Stripe sent a malformed webhook payload.");
            throw new RequestValidationException(
                "Stripe webhook payload is malformed.");
        }
    }

    private async Task<T> RequestStripeAsync<T>(
        Func<Task<T>> request,
        string failureMessage)
    {
        try
        {
            return await request();
        }
        catch (StripeRequestException exception)
        {
            logger.LogError(exception, "{FailureMessage}", failureMessage);
            throw new PaymentGatewayException(failureMessage, exception);
        }
        catch (HttpRequestException exception)
        {
            logger.LogError(exception, "{FailureMessage}", failureMessage);
            throw new PaymentGatewayException(failureMessage, exception);
        }
        catch (InvalidOperationException exception)
        {
            logger.LogError(exception, "Stripe payment configuration is incomplete.");
            throw new ServiceUnavailableException(
                "Online payments are not configured yet.",
                exception);
        }
    }

    private static void MarkPaid(Payment payment, string? paymentIntentId)
    {
        payment.Status = PaymentStatus.Paid;
        payment.StripePaymentIntentId = paymentIntentId;
        payment.PaidAt ??= DateTime.UtcNow;
        payment.CourseApplication.Status = CourseApplicationStatus.Enrolled;
    }

    private static bool MatchesPayment(
        StripeCheckoutSessionDetails session,
        Payment payment) =>
        session.AmountTotal == ToMinorUnits(payment.Amount) &&
        string.Equals(
            session.Currency,
            payment.Currency,
            StringComparison.OrdinalIgnoreCase);

    private static bool MatchesPayment(
        JsonElement session,
        decimal expectedAmount,
        string expectedCurrency)
    {
        if (!session.TryGetProperty("amount_total", out var amount) ||
            amount.ValueKind != JsonValueKind.Number ||
            !amount.TryGetInt64(out var amountTotal))
        {
            return false;
        }

        return amountTotal == ToMinorUnits(expectedAmount) &&
            string.Equals(
                GetString(session, "currency"),
                expectedCurrency,
                StringComparison.OrdinalIgnoreCase);
    }

    private static long ToMinorUnits(decimal amount) =>
        decimal.ToInt64(decimal.Round(amount * 100m, 0, MidpointRounding.ToZero));

    private static string GetString(JsonElement element, string propertyName) =>
        element.TryGetProperty(propertyName, out var value) &&
        value.ValueKind == JsonValueKind.String
            ? value.GetString() ?? string.Empty
            : string.Empty;
}

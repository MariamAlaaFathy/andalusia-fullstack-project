using AutoMapper;
using Assignment_3.Middleware;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Repository;

namespace full_stack_project_backend.Services;

public sealed class PaymentService(
    IEnrollmentRepository repository,
    IMapper mapper) : IPaymentService
{
    public async Task<CourseApplicationResponse> CompleteDemoPaymentAsync(
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
            return mapper.Map<CourseApplicationResponse>(application);
        }

        if (application.Amount <= 0)
        {
            throw new RequestValidationException(
                "Demo payment is only available for courses with a payment due.");
        }

        var payment = application.Payment;
        if (payment is null)
        {
            payment = new Payment
            {
                CourseApplicationId = application.Id,
                Amount = application.Amount,
                Currency = "usd",
                CreatedAt = DateTime.UtcNow
            };
            repository.AddPayment(payment);
            application.Payment = payment;
        }

        payment.Amount = application.Amount;
        payment.Currency = "usd";
        payment.Status = PaymentStatus.Paid;
        payment.PaidAt ??= DateTime.UtcNow;
        application.Status = CourseApplicationStatus.Enrolled;

        await repository.SaveChangesAsync(cancellationToken);
        return mapper.Map<CourseApplicationResponse>(application);
    }
}

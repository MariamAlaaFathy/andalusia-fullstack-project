namespace full_stack_project_backend.DTOs;

public sealed record CourseApplicationResponse(
    Guid Id,
    int CourseId,
    string CourseName,
    decimal Amount,
    string Status,
    DateTime CreatedAt,
    PaymentResponse? Payment);

public sealed record PaymentResponse(
    Guid Id,
    decimal Amount,
    string Currency,
    string Status,
    DateTime? PaidAt);

public sealed record CheckoutResponse(
    string? CheckoutUrl,
    CourseApplicationResponse Application);

public sealed record ConfirmCheckoutRequest(string SessionId);

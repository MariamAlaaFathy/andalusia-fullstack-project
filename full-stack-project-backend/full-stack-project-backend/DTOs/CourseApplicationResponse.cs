namespace full_stack_project_backend.DTOs;

public sealed record CourseApplicationResponse(
    int Id,
    int CourseId,
    string CourseName,
    decimal Amount,
    string Status,
    DateTime CreatedAt,
    PaymentResponse? Payment);

public sealed record PaymentResponse(
    int Id,
    decimal Amount,
    string Currency,
    string Status,
    DateTime? PaidAt);

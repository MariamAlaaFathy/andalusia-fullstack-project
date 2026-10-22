namespace full_stack_project_backend.DTOs;

public sealed record InstructorCourseResponse(
    int CourseId,
    string CourseName,
    int StudentCount,
    int UpcomingSessionCount,
    int AssignmentCount);

public sealed record InstructorStudentResponse(
    int StudentId,
    string Name,
    string Email,
    int Progress,
    int PresentCount,
    int SessionCount);

public sealed record InstructorSessionResponse(
    int Id,
    string Title,
    DateTime StartsAt,
    DateTime EndsAt,
    string Location);

public sealed record CreateInstructorSessionRequest(
    string Title,
    DateTime StartsAt,
    DateTime EndsAt,
    string Location);

public sealed record AttendanceEntryRequest(int StudentId, bool IsPresent);

public sealed record RecordAttendanceRequest(
    IReadOnlyList<AttendanceEntryRequest> Entries);

public sealed record AttendanceEntryResponse(
    int StudentId,
    bool IsPresent,
    DateTime RecordedAt);

public sealed record InstructorAssignmentResponse(
    int Id,
    string Title,
    string Description,
    DateTime DueAt,
    int SubmissionCount);

public sealed record CreateInstructorAssignmentRequest(
    string Title,
    string Description,
    DateTime DueAt);

public sealed record AssignmentSubmissionResponse(
    int Id,
    int StudentId,
    string StudentName,
    string Content,
    DateTime SubmittedAt,
    decimal? Grade,
    string? Feedback);

public sealed record GradeSubmissionRequest(decimal Grade, string? Feedback);

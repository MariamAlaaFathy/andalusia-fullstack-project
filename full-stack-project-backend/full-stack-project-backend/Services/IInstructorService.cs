using full_stack_project_backend.DTOs;

namespace full_stack_project_backend.Services;

public interface IInstructorService
{
    Task<IReadOnlyList<InstructorCourseResponse>> GetCoursesAsync(
        int instructorId,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<InstructorStudentResponse>> GetStudentsAsync(
        int instructorId,
        int courseId,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<InstructorSessionResponse>> GetSessionsAsync(
        int instructorId,
        int courseId,
        CancellationToken cancellationToken);

    Task<InstructorSessionResponse> CreateSessionAsync(
        int instructorId,
        int courseId,
        CreateInstructorSessionRequest request,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<AttendanceEntryResponse>> RecordAttendanceAsync(
        int instructorId,
        int sessionId,
        RecordAttendanceRequest request,
        CancellationToken cancellationToken);

    Task<int> UpdateProgressAsync(
        int instructorId,
        int courseId,
        int studentId,
        int progress,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<InstructorAssignmentResponse>> GetAssignmentsAsync(
        int instructorId,
        int courseId,
        CancellationToken cancellationToken);

    Task<InstructorAssignmentResponse> CreateAssignmentAsync(
        int instructorId,
        int courseId,
        CreateInstructorAssignmentRequest request,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<AssignmentSubmissionResponse>> GetSubmissionsAsync(
        int instructorId,
        int assignmentId,
        CancellationToken cancellationToken);

    Task<AssignmentSubmissionResponse> GradeSubmissionAsync(
        int instructorId,
        int assignmentId,
        int submissionId,
        GradeSubmissionRequest request,
        CancellationToken cancellationToken);
}

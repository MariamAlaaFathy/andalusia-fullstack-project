using System.Security.Claims;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Authorize(Roles = "Instructor")]
[Route("api/instructor")]
public sealed class InstructorController(IInstructorService instructorService)
    : ControllerBase
{
    [HttpGet("courses")]
    public async Task<ActionResult<IReadOnlyList<InstructorCourseResponse>>> GetCourses(
        CancellationToken cancellationToken)
    {
        if (!TryGetInstructorId(out var instructorId)) return Unauthorized();
        return Ok(await instructorService.GetCoursesAsync(
            instructorId,
            cancellationToken));
    }

    [HttpGet("courses/{courseId:int}/students")]
    public async Task<ActionResult<IReadOnlyList<InstructorStudentResponse>>> GetStudents(
        int courseId,
        CancellationToken cancellationToken)
    {
        if (!TryGetInstructorId(out var instructorId)) return Unauthorized();
        return Ok(await instructorService.GetStudentsAsync(
            instructorId,
            courseId,
            cancellationToken));
    }

    [HttpPut("courses/{courseId:int}/students/{studentId:int}/progress")]
    public async Task<IActionResult> UpdateProgress(
        int courseId,
        int studentId,
        [FromBody] UpdateStudentProgressRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetInstructorId(out var instructorId)) return Unauthorized();
        var progress = await instructorService.UpdateProgressAsync(
            instructorId,
            courseId,
            studentId,
            request.Progress,
            cancellationToken);
        return Ok(new { studentId, progress });
    }

    [HttpGet("courses/{courseId:int}/sessions")]
    public async Task<ActionResult<IReadOnlyList<InstructorSessionResponse>>> GetSessions(
        int courseId,
        CancellationToken cancellationToken)
    {
        if (!TryGetInstructorId(out var instructorId)) return Unauthorized();
        return Ok(await instructorService.GetSessionsAsync(
            instructorId,
            courseId,
            cancellationToken));
    }

    [HttpPost("courses/{courseId:int}/sessions")]
    public async Task<ActionResult<InstructorSessionResponse>> CreateSession(
        int courseId,
        [FromBody] CreateInstructorSessionRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetInstructorId(out var instructorId)) return Unauthorized();
        var session = await instructorService.CreateSessionAsync(
            instructorId,
            courseId,
            request,
            cancellationToken);
        return CreatedAtAction(nameof(GetSessions), new { courseId }, session);
    }

    [HttpPost("sessions/{sessionId:int}/attendance")]
    public async Task<ActionResult<IReadOnlyList<AttendanceEntryResponse>>> RecordAttendance(
        int sessionId,
        [FromBody] RecordAttendanceRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetInstructorId(out var instructorId)) return Unauthorized();
        return Ok(await instructorService.RecordAttendanceAsync(
            instructorId,
            sessionId,
            request,
            cancellationToken));
    }

    [HttpGet("courses/{courseId:int}/assignments")]
    public async Task<ActionResult<IReadOnlyList<InstructorAssignmentResponse>>> GetAssignments(
        int courseId,
        CancellationToken cancellationToken)
    {
        if (!TryGetInstructorId(out var instructorId)) return Unauthorized();
        return Ok(await instructorService.GetAssignmentsAsync(
            instructorId,
            courseId,
            cancellationToken));
    }

    [HttpPost("courses/{courseId:int}/assignments")]
    public async Task<ActionResult<InstructorAssignmentResponse>> CreateAssignment(
        int courseId,
        [FromBody] CreateInstructorAssignmentRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetInstructorId(out var instructorId)) return Unauthorized();
        var assignment = await instructorService.CreateAssignmentAsync(
            instructorId,
            courseId,
            request,
            cancellationToken);
        return CreatedAtAction(
            nameof(GetSubmissions),
            new { assignmentId = assignment.Id },
            assignment);
    }

    [HttpGet("assignments/{assignmentId:int}/submissions")]
    public async Task<ActionResult<IReadOnlyList<AssignmentSubmissionResponse>>> GetSubmissions(
        int assignmentId,
        CancellationToken cancellationToken)
    {
        if (!TryGetInstructorId(out var instructorId)) return Unauthorized();
        return Ok(await instructorService.GetSubmissionsAsync(
            instructorId,
            assignmentId,
            cancellationToken));
    }

    [HttpPut("assignments/{assignmentId:int}/submissions/{submissionId:int}/grade")]
    public async Task<ActionResult<AssignmentSubmissionResponse>> GradeSubmission(
        int assignmentId,
        int submissionId,
        [FromBody] GradeSubmissionRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetInstructorId(out var instructorId)) return Unauthorized();
        return Ok(await instructorService.GradeSubmissionAsync(
            instructorId,
            assignmentId,
            submissionId,
            request,
            cancellationToken));
    }

    private bool TryGetInstructorId(out int instructorId) =>
        int.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out instructorId) && instructorId > 0;
}

public sealed record UpdateStudentProgressRequest(int Progress);

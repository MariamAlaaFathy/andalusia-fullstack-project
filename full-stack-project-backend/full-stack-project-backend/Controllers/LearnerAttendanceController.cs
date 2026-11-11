using System.Security.Claims;
using Assignment_3.Middleware;
using full_stack_project_backend.Data;
using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Authorize(Roles = "Learner")]
[Route("api/courses/{courseId:int}/attendance")]
public sealed class LearnerAttendanceController(
    AppDbcontext dbContext,
    ICourseProgressService courseProgressService)
    : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<LearnerAttendanceSummaryResponse>> GetCourseAttendance(
        int courseId,
        CancellationToken cancellationToken)
    {
        if (!TryGetLearnerId(out var learnerId)) return Unauthorized();

        var isEnrolled = await dbContext.CourseApplications.AnyAsync(
            application =>
                application.CourseId == courseId &&
                application.LearnerId == learnerId &&
                application.Status == CourseApplicationStatus.Enrolled,
            cancellationToken);
        if (!isEnrolled)
        {
            throw new NotFoundException("Enrolled course not found.");
        }

        var progressByLearner = await courseProgressService.RecalculateAsync(
            courseId,
            [learnerId],
            cancellationToken);
        if (!progressByLearner.TryGetValue(learnerId, out var courseProgress))
        {
            throw new NotFoundException("Enrolled course not found.");
        }

        var now = DateTime.UtcNow;
        var totalHeldSessions = await dbContext.CourseSessions
            .AsNoTracking()
            .CountAsync(
                session => session.CourseId == courseId && session.EndsAt <= now,
                cancellationToken);
        var presentHeldSessions = await dbContext.SessionAttendances
            .AsNoTracking()
            .CountAsync(
                record =>
                    record.LearnerId == learnerId &&
                    record.IsPresent &&
                    record.CourseSession.CourseId == courseId &&
                    record.CourseSession.EndsAt <= now,
                cancellationToken);
        var visibleSessions = await dbContext.CourseSessions
            .AsNoTracking()
            .Where(session =>
                session.CourseId == courseId &&
                (session.EndsAt <= now ||
                 session.Attendance.Any(record => record.LearnerId == learnerId)))
            .OrderByDescending(session => session.StartsAt)
            .Select(session => new
            {
                session.Id,
                session.Title,
                session.StartsAt
            })
            .ToListAsync(cancellationToken);

        var sessionIds = visibleSessions.Select(session => session.Id).ToArray();
        List<LearnerSessionAttendance> attendance;
        if (sessionIds.Length == 0)
        {
            attendance = [];
        }
        else
        {
            attendance = await dbContext.SessionAttendances
                .AsNoTracking()
                .Where(record =>
                    record.LearnerId == learnerId &&
                    sessionIds.Contains(record.CourseSessionId))
                .Select(record => new LearnerSessionAttendance(
                    record.CourseSessionId,
                    record.IsPresent))
                .ToListAsync(cancellationToken);
        }
        var attendanceBySession = attendance.ToDictionary(
            record => record.SessionId,
            record => record.IsPresent);

        var sessions = visibleSessions
            .Select(session =>
            {
                attendanceBySession.TryGetValue(session.Id, out var isPresent);
                var hasAttendance = attendanceBySession.ContainsKey(session.Id);
                return new LearnerAttendanceSessionResponse(
                    session.Id,
                    session.Title,
                    session.StartsAt,
                    hasAttendance
                        ? isPresent ? "Present" : "Absent"
                        : "Not recorded");
            })
            .ToArray();

        return Ok(new LearnerAttendanceSummaryResponse(
            courseId,
            courseProgress,
            totalHeldSessions,
            presentHeldSessions,
            sessions));
    }

    private bool TryGetLearnerId(out int learnerId) =>
        int.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out learnerId) && learnerId > 0;
}

public sealed record LearnerAttendanceSummaryResponse(
    int CourseId,
    int CourseProgress,
    int TotalSessions,
    int PresentSessions,
    IReadOnlyList<LearnerAttendanceSessionResponse> Sessions);

public sealed record LearnerAttendanceSessionResponse(
    int Id,
    string Title,
    DateTime StartsAt,
    string Status);

public sealed record LearnerSessionAttendance(int SessionId, bool IsPresent);

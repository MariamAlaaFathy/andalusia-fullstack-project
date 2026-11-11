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
[Authorize(Roles = "Learner,Instructor")]
[Route("api/courses/{courseId:int}/assignments")]
public sealed class LearnerAssignmentsController(
    AppDbcontext dbContext,
    IInstructorService instructorService,
    ILogger<LearnerAssignmentsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetForCourse(
        int courseId,
        CancellationToken cancellationToken)
    {
        if (User.IsInRole("Instructor"))
        {
            if (!TryGetInstructorId(out var instructorId)) return Unauthorized();
            return Ok(await instructorService.GetAssignmentsAsync(
                instructorId,
                courseId,
                cancellationToken));
        }

        if (!TryGetLearnerId(out var learnerId)) return Unauthorized();
        await EnsureEnrolledAsync(courseId, learnerId, cancellationToken);

        var assignments = await dbContext.CourseAssignments
            .AsNoTracking()
            .Where(assignment => assignment.CourseId == courseId)
            .OrderBy(assignment => assignment.DueAt)
            .ToListAsync(cancellationToken);
        if (assignments.Count == 0)
        {
            return Ok(Array.Empty<LearnerAssignmentResponse>());
        }

        var assignmentIds = assignments.Select(assignment => assignment.Id).ToArray();
        var submissions = await dbContext.AssignmentSubmissions
            .AsNoTracking()
            .Where(submission =>
                submission.LearnerId == learnerId &&
                assignmentIds.Contains(submission.CourseAssignmentId))
            .ToDictionaryAsync(
                submission => submission.CourseAssignmentId,
                cancellationToken);

        return Ok(assignments.Select(assignment =>
        {
            submissions.TryGetValue(assignment.Id, out var submission);
            return new LearnerAssignmentResponse(
                assignment.Id,
                assignment.Title,
                assignment.Description,
                assignment.DueAt,
                submission?.Status.ToString() ?? "NotSubmitted",
                submission?.Content,
                submission?.SubmittedAt,
                submission?.Grade,
                submission?.Feedback);
        }).ToArray());
    }

    [HttpPost("{assignmentId:int}/submit")]
    public async Task<ActionResult<LearnerSubmissionResponse>> Submit(
        int courseId,
        int assignmentId,
        [FromBody] SubmitAssignmentRequest request,
        CancellationToken cancellationToken)
    {
        if (!User.IsInRole("Learner")) return Forbid();
        if (!TryGetLearnerId(out var learnerId)) return Unauthorized();
        await EnsureEnrolledAsync(courseId, learnerId, cancellationToken);

        var assignmentExists = await dbContext.CourseAssignments.AnyAsync(
            assignment =>
                assignment.Id == assignmentId &&
                assignment.CourseId == courseId,
            cancellationToken);
        if (!assignmentExists)
        {
            return NotFound();
        }

        var content = request.Content?.Trim();
        if (string.IsNullOrWhiteSpace(content) || content.Length > 8000)
        {
            throw new RequestValidationException(
                "Submission content is required and cannot exceed 8000 characters.");
        }

        var alreadySubmitted = await dbContext.AssignmentSubmissions.AnyAsync(
            submission =>
                submission.CourseAssignmentId == assignmentId &&
                submission.LearnerId == learnerId,
            cancellationToken);
        if (alreadySubmitted)
        {
            return Conflict(new { message = "This assignment has already been submitted." });
        }

        var submission = new AssignmentSubmission
        {
            CourseAssignmentId = assignmentId,
            LearnerId = learnerId,
            Content = content,
            SubmittedAt = DateTime.UtcNow,
            Status = AssignmentSubmissionStatus.Submitted
        };
        dbContext.AssignmentSubmissions.Add(submission);
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
        {
            dbContext.ChangeTracker.Clear();
            if (await dbContext.AssignmentSubmissions.AnyAsync(
                    item =>
                        item.CourseAssignmentId == assignmentId &&
                        item.LearnerId == learnerId,
                    cancellationToken))
            {
                return Conflict(new { message = "This assignment has already been submitted." });
            }

            logger.LogError(
                exception,
                "Assignment submission could not be saved for learner {LearnerId} and assignment {AssignmentId}.",
                learnerId,
                assignmentId);
            throw;
        }

        return CreatedAtAction(
            nameof(GetForCourse),
            new { courseId },
            new LearnerSubmissionResponse(
                submission.Id,
                submission.Content,
                submission.Status.ToString(),
                submission.SubmittedAt,
                submission.Grade,
                submission.Feedback));
    }

    private async Task EnsureEnrolledAsync(
        int courseId,
        int learnerId,
        CancellationToken cancellationToken)
    {
        if (!await dbContext.CourseApplications.AnyAsync(
                application =>
                    application.CourseId == courseId &&
                    application.LearnerId == learnerId &&
                    application.Status == CourseApplicationStatus.Enrolled,
                cancellationToken))
        {
            throw new NotFoundException("Enrolled course not found.");
        }
    }

    private bool TryGetLearnerId(out int learnerId) =>
        int.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out learnerId) && learnerId > 0;

    private bool TryGetInstructorId(out int instructorId) =>
        int.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out instructorId) && instructorId > 0;
}

public sealed record SubmitAssignmentRequest(string? Content);

public sealed record LearnerAssignmentResponse(
    int Id,
    string Title,
    string Description,
    DateTime DueAt,
    string Status,
    string? Submission,
    DateTime? SubmittedAt,
    decimal? Grade,
    string? Feedback);

public sealed record LearnerSubmissionResponse(
    int Id,
    string Content,
    string Status,
    DateTime SubmittedAt,
    decimal? Grade,
    string? Feedback);

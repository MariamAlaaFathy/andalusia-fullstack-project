using Assignment_3.Middleware;
using full_stack_project_backend.Data;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Services;

public sealed class InstructorService(
    AppDbcontext dbContext,
    INotificationService notificationService,
    ICourseProgressService courseProgressService) : IInstructorService
{
    public async Task<IReadOnlyList<InstructorCourseResponse>> GetCoursesAsync(
        int instructorId,
        CancellationToken cancellationToken)
    {
        return await dbContext.CourseInstructors
            .AsNoTracking()
            .Where(assignment => assignment.InstructorId == instructorId)
            .Select(assignment => new
            {
                assignment.CourseId,
                assignment.Course.Name,
                StudentCount = dbContext.CourseApplications.Count(application =>
                    application.CourseId == assignment.CourseId &&
                    application.Status == CourseApplicationStatus.Enrolled),
                UpcomingSessionCount = dbContext.CourseSessions.Count(session =>
                    session.CourseId == assignment.CourseId &&
                    session.StartsAt > DateTime.UtcNow),
                AssignmentCount = dbContext.CourseAssignments.Count(courseAssignment =>
                    courseAssignment.CourseId == assignment.CourseId)
            })
            .OrderBy(course => course.Name)
            .Select(course => new InstructorCourseResponse(
                course.CourseId,
                course.Name,
                course.StudentCount,
                course.UpcomingSessionCount,
                course.AssignmentCount))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InstructorStudentResponse>> GetStudentsAsync(
        int instructorId,
        int courseId,
        CancellationToken cancellationToken)
    {
        await EnsureAssignedAsync(instructorId, courseId, cancellationToken);

        var students = await dbContext.CourseApplications
            .AsNoTracking()
            .Where(application =>
                application.CourseId == courseId &&
                application.Status == CourseApplicationStatus.Enrolled)
            .Join(
                dbContext.Users.AsNoTracking(),
                application => application.LearnerId,
                learner => learner.UserId,
                (application, learner) => new
                {
                    learner.UserId,
                    learner.Username,
                    learner.Email,
                    application.Progress
                })
            .ToListAsync(cancellationToken);

        var studentIds = students.Select(student => student.UserId).ToArray();
        if (studentIds.Length == 0)
        {
            return [];
        }

        var attendanceByStudent = await dbContext.SessionAttendances
            .AsNoTracking()
            .Where(record =>
                studentIds.Contains(record.LearnerId) &&
                record.CourseSession.CourseId == courseId)
            .GroupBy(record => record.LearnerId)
            .Select(group => new
            {
                LearnerId = group.Key,
                PresentCount = group.Count(record => record.IsPresent),
                SessionCount = group.Count()
            })
            .ToDictionaryAsync(
                record => record.LearnerId,
                cancellationToken);

        return students
            .Select(student =>
            {
                attendanceByStudent.TryGetValue(student.UserId, out var counts);
                return new InstructorStudentResponse(
                    student.UserId,
                    student.Username,
                    student.Email,
                    student.Progress,
                    counts?.PresentCount ?? 0,
                    counts?.SessionCount ?? 0);
            })
            .OrderBy(student => student.Name)
            .ToArray();
    }

    public async Task<IReadOnlyList<InstructorSessionResponse>> GetSessionsAsync(
        int instructorId,
        int courseId,
        CancellationToken cancellationToken)
    {
        await EnsureAssignedAsync(instructorId, courseId, cancellationToken);

        var sessions = await dbContext.CourseSessions
            .AsNoTracking()
            .Where(session => session.CourseId == courseId)
            .OrderBy(session => session.StartsAt)
            .ToListAsync(cancellationToken);

        return sessions.Select(ToSessionResponse).ToArray();
    }

    public async Task<InstructorSessionResponse> CreateSessionAsync(
        int instructorId,
        int courseId,
        CreateInstructorSessionRequest request,
        CancellationToken cancellationToken)
    {
        await EnsureAssignedAsync(instructorId, courseId, cancellationToken);
        ValidateSessionRequest(request);

        var session = new CourseSession
        {
            CourseId = courseId,
            Title = request.Title.Trim(),
            StartsAt = request.StartsAt,
            EndsAt = request.EndsAt,
            Location = request.Location.Trim()
        };
        dbContext.CourseSessions.Add(session);
        await dbContext.SaveChangesAsync(cancellationToken);
        var courseName = await dbContext.Courses
            .Where(course => course.Id == courseId)
            .Select(course => course.Name)
            .FirstAsync(cancellationToken);
        await notificationService.CreateForCourseLearnersAsync(
            courseId,
            $"A new session, {session.Title}, has been scheduled for {courseName} on {session.StartsAt.ToLocalTime():g}.",
            cancellationToken);
        return ToSessionResponse(session);
    }

    public async Task<InstructorSessionResponse> UpdateSessionAsync(
        int instructorId,
        int courseId,
        int sessionId,
        CreateInstructorSessionRequest request,
        CancellationToken cancellationToken)
    {
        await EnsureAssignedAsync(instructorId, courseId, cancellationToken);
        ValidateSessionRequest(request);

        var session = await dbContext.CourseSessions.FirstOrDefaultAsync(
            item => item.Id == sessionId && item.CourseId == courseId,
            cancellationToken)
            ?? throw new NotFoundException("Course session not found.");

        var title = request.Title.Trim();
        var location = request.Location.Trim();
        var hasChanged = session.Title != title ||
            session.StartsAt != request.StartsAt ||
            session.EndsAt != request.EndsAt ||
            session.Location != location;
        if (hasChanged)
        {
            session.Title = title;
            session.StartsAt = request.StartsAt;
            session.EndsAt = request.EndsAt;
            session.Location = location;
            await dbContext.SaveChangesAsync(cancellationToken);

            var courseName = await dbContext.Courses
                .Where(course => course.Id == courseId)
                .Select(course => course.Name)
                .FirstAsync(cancellationToken);
            await notificationService.CreateForCourseLearnersAsync(
                courseId,
                $"The schedule for {session.Title} in {courseName} has been updated to {session.StartsAt.ToLocalTime():g}.",
                cancellationToken);
        }

        return ToSessionResponse(session);
    }

    public async Task<IReadOnlyList<AttendanceEntryResponse>> RecordAttendanceAsync(
        int instructorId,
        int sessionId,
        RecordAttendanceRequest request,
        CancellationToken cancellationToken)
    {
        var session = await dbContext.CourseSessions
            .FirstOrDefaultAsync(item => item.Id == sessionId, cancellationToken)
            ?? throw new NotFoundException("Course session not found.");
        await EnsureAssignedAsync(instructorId, session.CourseId, cancellationToken);

        if (request.Entries is null ||
            request.Entries.Count == 0 ||
            request.Entries.Select(entry => entry.StudentId).Distinct().Count() !=
            request.Entries.Count)
        {
            throw new RequestValidationException(
                "Attendance must contain at least one unique student.");
        }

        var studentIds = request.Entries.Select(entry => entry.StudentId).ToArray();
        var enrolledStudentIds = await dbContext.CourseApplications
            .Where(application =>
                application.CourseId == session.CourseId &&
                application.Status == CourseApplicationStatus.Enrolled &&
                studentIds.Contains(application.LearnerId))
            .Select(application => application.LearnerId)
            .ToListAsync(cancellationToken);
        if (enrolledStudentIds.Count != studentIds.Length)
        {
            throw new RequestValidationException(
                "Attendance can only be recorded for enrolled students in this course.");
        }

        var records = await dbContext.SessionAttendances
            .Where(attendance =>
                attendance.CourseSessionId == sessionId &&
                studentIds.Contains(attendance.LearnerId))
            .ToDictionaryAsync(attendance => attendance.LearnerId, cancellationToken);
        await using var transaction =
            await dbContext.Database.BeginTransactionAsync(cancellationToken);
        var recordedAt = DateTime.UtcNow;
        foreach (var entry in request.Entries)
        {
            if (!records.TryGetValue(entry.StudentId, out var attendance))
            {
                attendance = new SessionAttendance
                {
                    CourseSessionId = sessionId,
                    LearnerId = entry.StudentId,
                    RecordedAt = recordedAt
                };
                dbContext.SessionAttendances.Add(attendance);
            }

            attendance.IsPresent = entry.IsPresent;
            attendance.RecordedAt = recordedAt;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await courseProgressService.RecalculateAsync(
            session.CourseId,
            studentIds,
            cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return request.Entries
            .Select(entry => new AttendanceEntryResponse(
                entry.StudentId,
                entry.IsPresent,
                recordedAt))
            .ToArray();
    }

    public async Task<int> UpdateProgressAsync(
        int instructorId,
        int courseId,
        int studentId,
        int progress,
        CancellationToken cancellationToken)
    {
        await EnsureAssignedAsync(instructorId, courseId, cancellationToken);
        if (progress is < 0 or > 100)
        {
            throw new RequestValidationException(
                "Progress must be between 0 and 100.");
        }

        var application = await dbContext.CourseApplications
            .FirstOrDefaultAsync(
                item => item.CourseId == courseId &&
                    item.LearnerId == studentId &&
                    item.Status == CourseApplicationStatus.Enrolled,
                cancellationToken)
            ?? throw new NotFoundException("Enrolled student not found.");

        application.Progress = progress;
        await dbContext.SaveChangesAsync(cancellationToken);
        return application.Progress;
    }

    public async Task<IReadOnlyList<InstructorAssignmentResponse>> GetAssignmentsAsync(
        int instructorId,
        int courseId,
        CancellationToken cancellationToken)
    {
        await EnsureAssignedAsync(instructorId, courseId, cancellationToken);

        return await dbContext.CourseAssignments
            .AsNoTracking()
            .Where(assignment => assignment.CourseId == courseId)
            .OrderBy(assignment => assignment.DueAt)
            .Select(assignment => new InstructorAssignmentResponse(
                assignment.Id,
                assignment.Title,
                assignment.Description,
                assignment.DueAt,
                dbContext.AssignmentSubmissions.Count(
                    submission =>
                        submission.CourseAssignmentId == assignment.Id)))
            .ToListAsync(cancellationToken);
    }

    public async Task<InstructorAssignmentResponse> CreateAssignmentAsync(
        int instructorId,
        int courseId,
        CreateInstructorAssignmentRequest request,
        CancellationToken cancellationToken)
    {
        await EnsureAssignedAsync(instructorId, courseId, cancellationToken);
        if (string.IsNullOrWhiteSpace(request.Title) ||
            request.Title.Length > 200 ||
            string.IsNullOrWhiteSpace(request.Description) ||
            request.Description.Length > 4000 ||
            request.DueAt == default)
        {
            throw new RequestValidationException(
                "Provide an assignment title (max 200 characters) and description (max 4000 characters).");
        }

        var assignment = new CourseAssignment
        {
            CourseId = courseId,
            InstructorId = instructorId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            DueAt = request.DueAt
        };
        dbContext.CourseAssignments.Add(assignment);
        await dbContext.SaveChangesAsync(cancellationToken);
        return new InstructorAssignmentResponse(
            assignment.Id,
            assignment.Title,
            assignment.Description,
            assignment.DueAt,
            0);
    }

    public async Task<IReadOnlyList<AssignmentSubmissionResponse>> GetSubmissionsAsync(
        int instructorId,
        int assignmentId,
        int? requestedCourseId,
        CancellationToken cancellationToken)
    {
        var courseId = await EnsureAssignmentAssignedAsync(
            instructorId,
            assignmentId,
            cancellationToken);
        if (requestedCourseId.HasValue && requestedCourseId.Value != courseId)
        {
            throw new NotFoundException("Assignment not found.");
        }

        return await dbContext.AssignmentSubmissions
            .AsNoTracking()
            .Where(submission =>
                submission.CourseAssignmentId == assignmentId &&
                dbContext.CourseApplications.Any(application =>
                    application.CourseId == courseId &&
                    application.LearnerId == submission.LearnerId &&
                    application.Status == CourseApplicationStatus.Enrolled))
            .OrderBy(submission => submission.SubmittedAt)
            .Select(submission => new AssignmentSubmissionResponse(
                submission.Id,
                submission.LearnerId,
                submission.Learner.Username,
                submission.Content,
                submission.SubmittedAt,
                submission.Status.ToString(),
                submission.Grade,
                submission.Feedback))
            .ToListAsync(cancellationToken);
    }

    public async Task<AssignmentSubmissionResponse> GradeSubmissionAsync(
        int instructorId,
        int assignmentId,
        int submissionId,
        int? requestedCourseId,
        GradeSubmissionRequest request,
        CancellationToken cancellationToken)
    {
        var courseId = await EnsureAssignmentAssignedAsync(
            instructorId,
            assignmentId,
            cancellationToken);
        if (requestedCourseId.HasValue && requestedCourseId.Value != courseId)
        {
            throw new NotFoundException("Assignment not found.");
        }
        if (request.Grade is < 0 or > 100 ||
            request.Feedback?.Length > 2000)
        {
            throw new RequestValidationException(
                "Grade must be from 0 to 100 and feedback cannot exceed 2000 characters.");
        }

        var submission = await dbContext.AssignmentSubmissions
            .Include(item => item.Learner)
            .Include(item => item.CourseAssignment)
            .FirstOrDefaultAsync(
                item => item.Id == submissionId &&
                    item.CourseAssignmentId == assignmentId &&
                    dbContext.CourseApplications.Any(application =>
                        application.CourseId == courseId &&
                        application.LearnerId == item.LearnerId &&
                        application.Status == CourseApplicationStatus.Enrolled),
                cancellationToken)
            ?? throw new NotFoundException("Assignment submission not found.");
        var hasEnrollment = await dbContext.CourseApplications
            .AnyAsync(
                item => item.CourseId == courseId &&
                    item.LearnerId == submission.LearnerId &&
                    item.Status == CourseApplicationStatus.Enrolled,
                cancellationToken);
        if (!hasEnrollment)
        {
            throw new NotFoundException("Enrolled student not found.");
        }

        await using var transaction =
            await dbContext.Database.BeginTransactionAsync(cancellationToken);
        submission.Grade = request.Grade;
        submission.Feedback = request.Feedback?.Trim();
        submission.Status = AssignmentSubmissionStatus.Graded;
        await dbContext.SaveChangesAsync(cancellationToken);
        await courseProgressService.RecalculateAsync(
            courseId,
            [submission.LearnerId],
            cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        await notificationService.CreateAsync(
            submission.LearnerId,
            $"Your submission for {submission.CourseAssignment.Title} has been graded. Grade: {request.Grade:0.##}.{(string.IsNullOrWhiteSpace(submission.Feedback) ? string.Empty : $" Feedback: {submission.Feedback}")}",
            cancellationToken);

        return new AssignmentSubmissionResponse(
            submission.Id,
            submission.LearnerId,
            submission.Learner.Username,
            submission.Content,
            submission.SubmittedAt,
            submission.Status.ToString(),
            submission.Grade,
            submission.Feedback);
    }

    private async Task EnsureAssignedAsync(
        int instructorId,
        int courseId,
        CancellationToken cancellationToken)
    {
        if (!await dbContext.CourseInstructors.AnyAsync(
                assignment => assignment.InstructorId == instructorId &&
                    assignment.CourseId == courseId,
                cancellationToken))
        {
            throw new NotFoundException("Assigned course not found.");
        }
    }

    private async Task<int> EnsureAssignmentAssignedAsync(
        int instructorId,
        int assignmentId,
        CancellationToken cancellationToken)
    {
        var courseId = await dbContext.CourseAssignments
            .Where(assignment => assignment.Id == assignmentId)
            .Select(assignment => (int?)assignment.CourseId)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("Assignment not found.");
        await EnsureAssignedAsync(instructorId, courseId, cancellationToken);
        return courseId;
    }

    private static void ValidateSessionRequest(
        CreateInstructorSessionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) ||
            request.Title.Length > 200 ||
            string.IsNullOrWhiteSpace(request.Location) ||
            request.Location.Length > 300 ||
            request.EndsAt <= request.StartsAt)
        {
            throw new RequestValidationException(
                "Provide a title, location, and end time after the start time.");
        }
    }

    private static InstructorSessionResponse ToSessionResponse(
        CourseSession session) =>
        new(
            session.Id,
            session.Title,
            session.StartsAt,
            session.EndsAt,
            session.Location);
}

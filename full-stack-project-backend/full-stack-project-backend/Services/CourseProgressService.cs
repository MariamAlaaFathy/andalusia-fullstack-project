using full_stack_project_backend.Data;
using full_stack_project_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Services;

public sealed class CourseProgressService(AppDbcontext dbContext)
    : ICourseProgressService
{
    public async Task<IReadOnlyDictionary<int, int>> RecalculateAsync(
        int courseId,
        IReadOnlyCollection<int> requestedLearnerIds,
        CancellationToken cancellationToken)
    {
        var learnerIds = requestedLearnerIds.Distinct().ToArray();
        if (learnerIds.Length == 0)
        {
            return new Dictionary<int, int>();
        }

        var applications = await dbContext.CourseApplications
            .Where(application =>
                application.CourseId == courseId &&
                application.Status == CourseApplicationStatus.Enrolled &&
                learnerIds.Contains(application.LearnerId))
            .ToListAsync(cancellationToken);
        if (applications.Count == 0)
        {
            return new Dictionary<int, int>();
        }

        var enrolledLearnerIds = applications
            .Select(application => application.LearnerId)
            .ToArray();
        var now = DateTime.UtcNow;
        var totalHeldSessions = await dbContext.CourseSessions
            .AsNoTracking()
            .CountAsync(
                session => session.CourseId == courseId && session.EndsAt <= now,
                cancellationToken);
        var presentSessionsByLearner = await dbContext.SessionAttendances
            .AsNoTracking()
            .Where(record =>
                enrolledLearnerIds.Contains(record.LearnerId) &&
                record.CourseSession.CourseId == courseId &&
                record.CourseSession.EndsAt <= now &&
                record.IsPresent)
            .GroupBy(record => record.LearnerId)
            .Select(group => new
            {
                LearnerId = group.Key,
                Count = group.Count()
            })
            .ToDictionaryAsync(
                group => group.LearnerId,
                group => group.Count,
                cancellationToken);

        var averageScoresByLearner = await dbContext.AssignmentSubmissions
            .AsNoTracking()
            .Where(submission =>
                enrolledLearnerIds.Contains(submission.LearnerId) &&
                submission.CourseAssignment.CourseId == courseId &&
                submission.Status == AssignmentSubmissionStatus.Graded &&
                submission.Grade.HasValue)
            .GroupBy(submission => submission.LearnerId)
            .Select(group => new
            {
                LearnerId = group.Key,
                AverageScore = group.Average(submission => submission.Grade!.Value)
            })
            .ToDictionaryAsync(
                group => group.LearnerId,
                group => (decimal?)group.AverageScore,
                cancellationToken);

        foreach (var application in applications)
        {
            presentSessionsByLearner.TryGetValue(
                application.LearnerId,
                out var presentSessions);
            averageScoresByLearner.TryGetValue(
                application.LearnerId,
                out var averageScore);
            application.Progress = CalculateProgress(
                totalHeldSessions,
                presentSessions,
                averageScore);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return applications.ToDictionary(
            application => application.LearnerId,
            application => application.Progress);
    }

    private static int CalculateProgress(
        int totalHeldSessions,
        int presentSessions,
        decimal? averageGradedScore)
    {
        var components = new List<decimal>();
        if (totalHeldSessions > 0)
        {
            components.Add(presentSessions * 100m / totalHeldSessions);
        }

        if (averageGradedScore.HasValue)
        {
            components.Add(averageGradedScore.Value);
        }

        return components.Count == 0
            ? 0
            : (int)Math.Round(
                components.Average(),
                MidpointRounding.AwayFromZero);
    }
}

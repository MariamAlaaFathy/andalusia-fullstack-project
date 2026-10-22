using full_stack_project_backend.Data;
using full_stack_project_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Repository;

public sealed class EnrollmentRepository(AppDbcontext dbContext)
    : IEnrollmentRepository
{
    public async Task<IReadOnlyList<CourseApplication>> GetApplicationsAsync(
        int learnerId,
        CancellationToken cancellationToken) =>
        await dbContext.CourseApplications
            .AsNoTracking()
            .Include(application => application.Payment)
            .Where(application => application.LearnerId == learnerId)
            .OrderByDescending(application => application.CreatedAt)
            .ToListAsync(cancellationToken);

    public Task<CourseApplication?> GetApplicationAsync(
        int applicationId,
        int learnerId,
        CancellationToken cancellationToken) =>
        dbContext.CourseApplications
            .Include(application => application.Payment)
            .FirstOrDefaultAsync(
                application =>
                    application.Id == applicationId &&
                    application.LearnerId == learnerId,
                cancellationToken);

    public Task<CourseApplication?> GetApplicationForCourseAsync(
        int learnerId,
        int courseId,
        CancellationToken cancellationToken) =>
        dbContext.CourseApplications
            .Include(application => application.Payment)
            .FirstOrDefaultAsync(
                application =>
                    application.LearnerId == learnerId &&
                    application.CourseId == courseId,
                cancellationToken);

    public Task<Course?> GetCourseAsync(
        int courseId,
        CancellationToken cancellationToken) =>
        dbContext.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(course => course.Id == courseId, cancellationToken);

    public async Task AddApplicationAsync(
        CourseApplication application,
        CancellationToken cancellationToken)
    {
        dbContext.CourseApplications.Add(application);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public void AddPayment(Payment payment) => dbContext.Payments.Add(payment);

    public Task SaveChangesAsync(CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);

    public void ClearTracking() => dbContext.ChangeTracker.Clear();
}

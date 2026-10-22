using AutoMapper;
using Assignment_3.Middleware;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Repository;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Services;

public sealed class EnrollmentService(
    IEnrollmentRepository repository,
    IMapper mapper,
    ILogger<EnrollmentService> logger) : IEnrollmentService
{
    public async Task<IReadOnlyList<CourseApplicationResponse>> GetMineAsync(
        int learnerId,
        CancellationToken cancellationToken)
    {
        var applications = await repository.GetApplicationsAsync(
            learnerId,
            cancellationToken);
        return mapper.Map<IReadOnlyList<CourseApplicationResponse>>(applications);
    }

    public async Task<CourseApplicationResponse> GetByIdAsync(
        int applicationId,
        int learnerId,
        CancellationToken cancellationToken)
    {
        var application = await repository.GetApplicationAsync(
            applicationId,
            learnerId,
            cancellationToken);
        return application is null
            ? throw new NotFoundException("Course application not found.")
            : mapper.Map<CourseApplicationResponse>(application);
    }

    public async Task<(CourseApplicationResponse Application, bool Created)> CreateAsync(
        int courseId,
        int learnerId,
        CancellationToken cancellationToken)
    {
        if (courseId <= 0)
        {
            throw new RequestValidationException(
                "Course ID must be a positive integer.");
        }

        var existing = await repository.GetApplicationForCourseAsync(
            learnerId,
            courseId,
            cancellationToken);
        if (existing is not null)
        {
            return (mapper.Map<CourseApplicationResponse>(existing), false);
        }

        var course = await repository.GetCourseAsync(courseId, cancellationToken)
            ?? throw new NotFoundException("Course not found.");
        if (course.Price < 0)
        {
            throw new RequestValidationException(
                "This course has an invalid price and cannot be applied for.");
        }

        var application = new CourseApplication
        {
            LearnerId = learnerId,
            CourseId = course.Id,
            CourseName = course.Name,
            Amount = course.Price,
            Status = course.Price == 0
                ? CourseApplicationStatus.Enrolled
                : CourseApplicationStatus.AwaitingPayment,
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            await repository.AddApplicationAsync(application, cancellationToken);
            return (mapper.Map<CourseApplicationResponse>(application), true);
        }
        catch (DbUpdateException exception)
        {
            repository.ClearTracking();
            var concurrentApplication =
                await repository.GetApplicationForCourseAsync(
                    learnerId,
                    courseId,
                    cancellationToken);
            if (concurrentApplication is not null)
            {
                return (
                    mapper.Map<CourseApplicationResponse>(concurrentApplication),
                    false);
            }

            logger.LogError(
                exception,
                "Course application could not be saved for learner {LearnerId} and course {CourseId}.",
                learnerId,
                courseId);
            throw;
        }
    }
}

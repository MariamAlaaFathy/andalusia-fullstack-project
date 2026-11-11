using full_stack_project_backend.Data;
using full_stack_project_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Repository
{
    public sealed class CourseRepository(AppDbcontext dbContext) : ICourseRepository
    {
        public async Task<(IReadOnlyList<Course> Items, int TotalCount)> GetCoursesAsync(
            string? search,
            string? category,
            int page,
            int pageSize,
            CancellationToken cancellationToken)
        {
            var query = dbContext.Courses
                .AsNoTracking()
                .AsSplitQuery()
                .Include(course => course.Program)
                .ThenInclude(program => program.CareerPath)
                .Include(course => course.Instructors)
                .ThenInclude(assignment => assignment.Instructor)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(course => course.Name.Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                var selectedCategory = category.Trim();
                query = query.Where(course => course.Category == selectedCategory);
            }

            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .OrderBy(course => course.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return (items, totalCount);
        }

        public Task<Course?> GetCourseByIdAsync(
            int id,
            CancellationToken cancellationToken) =>
            dbContext.Courses
                .AsNoTracking()
                .AsSplitQuery()
                .Include(course => course.Program)
                .ThenInclude(program => program.CareerPath)
                .Include(course => course.Instructors)
                .ThenInclude(assignment => assignment.Instructor)
                .SingleOrDefaultAsync(course => course.Id == id, cancellationToken);


        public async Task<Course> CreateCourseAsync(Course course, CancellationToken cancellationToken)
        {
            dbContext.Courses.Add(course);
            await dbContext.SaveChangesAsync(cancellationToken);
            return course;
        }

        public async Task<Course?> GetCourseForUpdateAsync( int id, CancellationToken cancellationToken)
        {
            return await dbContext.Courses
                .SingleOrDefaultAsync(
                    course => course.Id == id,
                    cancellationToken);
        }

        public async Task UpdateCourseAsync(
            Course course,
            CancellationToken cancellationToken)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }


        public async Task<bool> CourseHasApplicationsAsync( int courseId,CancellationToken cancellationToken)
        {
            return await dbContext.CourseApplications
                .AsNoTracking()
                .AnyAsync(application => application.CourseId == courseId,
                    cancellationToken);
        }

        public async Task DeleteCourseAsync(Course course,CancellationToken cancellationToken)
        {
            dbContext.Courses.Remove(course);

            await dbContext.SaveChangesAsync(cancellationToken);
        }


    }
}

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
                .Include(course => course.Program)
                .ThenInclude(program => program.CareerPath)
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
                .Include(course => course.Program)
                .ThenInclude(program => program.CareerPath)
                .SingleOrDefaultAsync(course => course.Id == id, cancellationToken);
    }
}

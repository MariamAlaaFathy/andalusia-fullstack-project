using full_stack_project_backend.Data;
using full_stack_project_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Repository;

public sealed class CareerPathRepository(AppDbcontext dbContext)
    : ICareerPathRepository
{
    public async Task<(IReadOnlyList<CareerPath> Items, int TotalCount)> GetCareerPathsAsync(
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = dbContext.CareerPaths
            .AsNoTracking()
            .Include(careerPath => careerPath.Skills)
            .Include(careerPath => careerPath.Programs)
                .ThenInclude(program => program.Courses)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(careerPath =>
                careerPath.Name.Contains(term) ||
                careerPath.Description.Contains(term) ||
                careerPath.Skills.Any(skill => skill.Name.Contains(term)) ||
                careerPath.Programs.Any(program => program.Name.Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(careerPath => careerPath.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<CareerPath?> GetCareerPathByIdAsync(
        int id,
        CancellationToken cancellationToken) =>
        dbContext.CareerPaths
            .AsNoTracking()
            .Include(careerPath => careerPath.Skills)
            .Include(careerPath => careerPath.Programs)
                .ThenInclude(program => program.Courses)
            .SingleOrDefaultAsync(careerPath => careerPath.Id == id, cancellationToken);
}

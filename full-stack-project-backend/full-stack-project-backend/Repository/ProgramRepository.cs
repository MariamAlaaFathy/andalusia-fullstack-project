using full_stack_project_backend.Data;
using full_stack_project_backend.Models;
using Microsoft.EntityFrameworkCore;
using ProgramEntity = full_stack_project_backend.Models.Program;

namespace full_stack_project_backend.Repository;

public sealed class ProgramRepository(AppDbcontext dbContext) : IProgramRepository
{
    public async Task<(IReadOnlyList<ProgramEntity> Items, int TotalCount)> GetProgramsAsync(
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Programs
            .AsNoTracking()
            .Include(program => program.CareerPath)
            .Include(program => program.Courses)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(program =>
                program.Name.Contains(term) ||
                program.Description.Contains(term) ||
                program.CareerPath.Name.Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(program => program.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<ProgramEntity?> GetProgramByIdAsync(
        int id,
        CancellationToken cancellationToken) =>
        dbContext.Programs
            .AsNoTracking()
            .Include(program => program.CareerPath)
            .Include(program => program.Courses)
            .SingleOrDefaultAsync(program => program.Id == id, cancellationToken);
}

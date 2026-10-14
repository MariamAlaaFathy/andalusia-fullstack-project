using full_stack_project_backend.Models;
using ProgramEntity = full_stack_project_backend.Models.Program;

namespace full_stack_project_backend.Repository;

public interface IProgramRepository
{
    Task<(IReadOnlyList<ProgramEntity> Items, int TotalCount)> GetProgramsAsync(
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<ProgramEntity?> GetProgramByIdAsync(
        int id,
        CancellationToken cancellationToken);
}

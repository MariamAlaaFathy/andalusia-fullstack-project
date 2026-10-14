using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;

namespace full_stack_project_backend.Services;

public interface IProgramServices
{
    Task<Pagedresult<ProgramDto>> GetProgramsAsync(
        PaginatedParam pagination,
        CancellationToken cancellationToken);

    Task<ProgramDto?> GetProgramByIdAsync(int id, CancellationToken cancellationToken);
}

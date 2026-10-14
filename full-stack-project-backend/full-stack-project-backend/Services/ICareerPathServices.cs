using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;

namespace full_stack_project_backend.Services;

public interface ICareerPathServices
{
    Task<Pagedresult<CareerPathDto>> GetCareerPathsAsync(
        PaginatedParam pagination,
        CancellationToken cancellationToken);

    Task<CareerPathDto?> GetCareerPathByIdAsync(
        int id,
        CancellationToken cancellationToken);
}

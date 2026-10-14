using full_stack_project_backend.Models;

namespace full_stack_project_backend.Repository;

public interface ICareerPathRepository
{
    Task<(IReadOnlyList<CareerPath> Items, int TotalCount)> GetCareerPathsAsync(
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<CareerPath?> GetCareerPathByIdAsync(int id, CancellationToken cancellationToken);
}

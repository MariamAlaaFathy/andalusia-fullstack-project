namespace full_stack_project_backend.Services;

public interface ICourseProgressService
{
    Task<IReadOnlyDictionary<int, int>> RecalculateAsync(
        int courseId,
        IReadOnlyCollection<int> learnerIds,
        CancellationToken cancellationToken);
}

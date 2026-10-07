namespace full_stack_project_backend.DTOs;

public sealed record CareerPathDto(
    int Id,
    string Name,
    string Description,
    IReadOnlyList<string> Skills,
    IReadOnlyList<CareerPathProgramDto> Programs);

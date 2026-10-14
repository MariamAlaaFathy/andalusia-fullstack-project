namespace full_stack_project_backend.DTOs;

public sealed record ProgramDto(
    int Id,
    string Name,
    string Description,
    int CareerPathId,
    string CareerPathName,
    IReadOnlyList<ProgramCourseDto> Courses);

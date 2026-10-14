namespace full_stack_project_backend.DTOs;

public sealed record CareerPathProgramDto(
    int Id,
    string Name,
    IReadOnlyList<CareerPathCourseDto> Courses);

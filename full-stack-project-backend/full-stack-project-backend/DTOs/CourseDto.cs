namespace full_stack_project_backend.DTOs;

public sealed record CourseDto(
    int Id,
    string Name,
    string Description,
    int Price,
    string Category,
    int ProgramId,
    string ProgramName,
    int CareerPathId,
    string CareerPathName,
    string Duration,
    string Level,
    IReadOnlyList<string> Prerequisites,
    IReadOnlyList<string> LearningOutcomes);

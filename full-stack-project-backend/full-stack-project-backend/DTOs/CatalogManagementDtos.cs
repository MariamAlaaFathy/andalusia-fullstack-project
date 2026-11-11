using System.ComponentModel.DataAnnotations;

namespace full_stack_project_backend.DTOs;

public sealed class ProgramRequest
{
    [Required, StringLength(160)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int CareerPathId { get; set; }
}

public sealed class CareerPathRequest
{
    [Required, StringLength(160)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(4000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(40)]
    public IReadOnlyList<string> Skills { get; set; } = [];
}

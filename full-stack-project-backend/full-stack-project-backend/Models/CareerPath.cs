namespace full_stack_project_backend.Models;

public class CareerPath
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public ICollection<CareerPathSkill> Skills { get; set; } = [];
    public ICollection<Program> Programs { get; set; } = [];
}

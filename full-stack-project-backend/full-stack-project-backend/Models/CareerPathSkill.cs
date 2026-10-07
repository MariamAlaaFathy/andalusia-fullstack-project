namespace full_stack_project_backend.Models;

public class CareerPathSkill
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public int CareerPathId { get; set; }
    public CareerPath CareerPath { get; set; } = null!;
}

namespace full_stack_project_backend.Models;

public class Program
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public int CareerPathId { get; set; }
    public CareerPath CareerPath { get; set; } = null!;
    public ICollection<Course> Courses { get; set; } = [];
}

namespace full_stack_project_backend.Models;

public static class UserRoles
{
    public const string Learner = "Learner";
    public const string Instructor = "Instructor";
    public const string Admin = "Admin";
    public const string ContentManager = "Content Manager";

    public static bool IsSupported(string? role) =>
        role is Learner or Instructor or Admin or ContentManager;
}

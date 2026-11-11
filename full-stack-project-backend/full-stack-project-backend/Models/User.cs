namespace full_stack_project_backend.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "Learner";
        public string Bio { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public UserToken? UserToken { get; set; }
        public ICollection<CourseAssignment> CreatedAssignments { get; set; } = [];
        public ICollection<AssignmentSubmission> AssignmentSubmissions { get; set; } = [];
    }
}

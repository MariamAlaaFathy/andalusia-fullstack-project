namespace full_stack_project_backend.DTOs
{
    public class UserDto
    {
        public int UserId { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string Role { get; set; } = "Learner";
        public string Bio { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
       
    }
}

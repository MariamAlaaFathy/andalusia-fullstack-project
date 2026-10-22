namespace full_stack_project_backend.DTOs
{
    public class UserDto
    {
<<<<<<< Updated upstream
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
      
=======
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string Role { get; set; } = "Learner";
        public bool IsAdmin { get; set; }

>>>>>>> Stashed changes
    }
}

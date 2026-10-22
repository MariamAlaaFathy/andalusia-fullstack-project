namespace full_stack_project_backend.Models
{
    public class UserToken
    {
        public int UserId { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
        public User User { get; set; } = null!;
    }
}

using full_stack_project_backend.Models;

namespace full_stack_project_backend.Services
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        double GetAccessTokenExpiryMinutes();
    }
}

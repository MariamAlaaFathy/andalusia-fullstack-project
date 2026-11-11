using full_stack_project_backend.DTOs;

namespace full_stack_project_backend.Services;

public interface IAuthService
{
    Task<AuthOperationResult> LoginAsync(
        LoginDto request,
        CancellationToken cancellationToken);

    Task<AuthOperationResult> RefreshAsync(
        RefreshDto request,
        CancellationToken cancellationToken);
}

public sealed record AuthUserResponse(
    int UserId,
    string Username,
    string Email,
    string Role);

public sealed record AuthSessionResponse(
    string AccessToken,
    string RefreshToken,
    double ExpiresInMinutes,
    AuthUserResponse User);

public sealed record AuthOperationResult(
    AuthSessionResponse? Session,
    string? ErrorMessage);

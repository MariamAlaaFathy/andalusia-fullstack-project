using full_stack_project_backend.Data;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Services;

public sealed class AuthService(
    AppDbcontext dbContext,
    IPasswordHasher<User> passwordHasher,
    ITokenService tokenService) : IAuthService
{
    public async Task<AuthOperationResult> LoginAsync(
        LoginDto request,
        CancellationToken cancellationToken)
    {
        var email = request.Email.Trim();
        var user = await dbContext.Users
            .SingleOrDefaultAsync(
                account => account.Email == email,
                cancellationToken);

        if (user is null)
        {
            return InvalidCredentials();
        }

        if (!user.IsActive)
        {
            return new AuthOperationResult(null, "This account is suspended.");
        }

        var verification = passwordHasher.VerifyHashedPassword(
            user,
            user.Password,
            request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return InvalidCredentials();
        }

        return await CreateSessionAsync(user, cancellationToken);
    }

    public async Task<AuthOperationResult> RefreshAsync(
        RefreshDto request,
        CancellationToken cancellationToken)
    {
        var token = await dbContext.UserTokens
            .Include(userToken => userToken.User)
            .SingleOrDefaultAsync(
                userToken => userToken.RefreshToken == request.RefreshToken,
                cancellationToken);

        if (token?.User is null)
        {
            return new AuthOperationResult(null, "Invalid refresh token");
        }

        if (!token.User.IsActive)
        {
            return new AuthOperationResult(null, "This account is suspended.");
        }

        if (token.RefreshTokenExpiry is not DateTime expiry ||
            expiry < DateTime.UtcNow)
        {
            return new AuthOperationResult(null, "Refresh token expired");
        }

        return await CreateSessionAsync(token.User, cancellationToken);
    }

    private async Task<AuthOperationResult> CreateSessionAsync(
        User user,
        CancellationToken cancellationToken)
    {
        var accessToken = tokenService.GenerateAccessToken(user);
        var refreshToken = tokenService.GenerateRefreshToken();
        var storedToken = await dbContext.UserTokens
            .SingleOrDefaultAsync(
                item => item.UserId == user.UserId,
                cancellationToken);

        if (storedToken is null)
        {
            storedToken = new UserToken { UserId = user.UserId };
            dbContext.UserTokens.Add(storedToken);
        }

        storedToken.RefreshToken = refreshToken;
        storedToken.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthOperationResult(
            new AuthSessionResponse(
                accessToken,
                refreshToken,
                tokenService.GetAccessTokenExpiryMinutes(),
                new AuthUserResponse(
                    user.UserId,
                    user.Username,
                    user.Email,
                    user.Role)),
            null);
    }

    private static AuthOperationResult InvalidCredentials() =>
        new(null, "Invalid credentials");
}

using full_stack_project_backend.Data;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace full_stack_project_backend.Services;

public sealed class AuthService(
    AppDbcontext dbContext,
    IPasswordHasher<User> passwordHasher,
    ITokenService tokenService,
    IPasswordResetLinkSender passwordResetLinkSender,
    IConfiguration configuration) : IAuthService
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

    public async Task RequestPasswordResetAsync(
        ForgotPasswordDto request,
        CancellationToken cancellationToken)
    {
        var email = request.Email.Trim();
        var user = await dbContext.Users.FirstOrDefaultAsync(
            account => account.Email == email && account.IsActive,
            cancellationToken);
        if (user is null) return;

        var rawToken = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
        var tokenHash = HashResetToken(rawToken);
        var storedToken = await dbContext.UserTokens
            .FirstOrDefaultAsync(item => item.UserId == user.UserId, cancellationToken);

        if (storedToken is null)
        {
            storedToken = new UserToken { UserId = user.UserId };
            dbContext.UserTokens.Add(storedToken);
        }

        storedToken.PasswordResetTokenHash = tokenHash;
        storedToken.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(30);
        await dbContext.SaveChangesAsync(cancellationToken);

        var resetPageUrl = configuration["PasswordReset:FrontendBaseUrl"]
            ?? "http://localhost:5173/forgot";
        if (!Uri.TryCreate(resetPageUrl, UriKind.Absolute, out var resetPageUri) ||
            (resetPageUri.Scheme != Uri.UriSchemeHttp &&
             resetPageUri.Scheme != Uri.UriSchemeHttps))
        {
            throw new InvalidOperationException(
                "PasswordReset:FrontendBaseUrl must be an absolute HTTP or HTTPS URL.");
        }

        var resetLink = QueryHelpers.AddQueryString(
            resetPageUri.ToString(),
            new Dictionary<string, string?>
            {
                ["email"] = user.Email,
                ["token"] = rawToken
            });
        await passwordResetLinkSender.SendResetLinkAsync(
            user.Email,
            resetLink,
            cancellationToken);
    }

    public async Task<bool> ResetPasswordAsync(
        ResetPasswordDto request,
        CancellationToken cancellationToken)
    {
        var tokenHash = HashResetToken(request.Token);
        var email = request.Email.Trim();
        var storedToken = await dbContext.UserTokens
            .Include(item => item.User)
            .FirstOrDefaultAsync(
                item => item.PasswordResetTokenHash == tokenHash &&
                    item.User.Email == email,
                cancellationToken);

        if (storedToken is null) return false;

        if (!storedToken.User.IsActive ||
            storedToken.PasswordResetTokenExpiry is not DateTime expiry ||
            expiry <= DateTime.UtcNow)
        {
            storedToken.PasswordResetTokenHash = null;
            storedToken.PasswordResetTokenExpiry = null;
            await dbContext.SaveChangesAsync(cancellationToken);
            return false;
        }

        storedToken.User.Password = passwordHasher.HashPassword(
            storedToken.User,
            request.NewPassword);
        storedToken.PasswordResetTokenHash = null;
        storedToken.PasswordResetTokenExpiry = null;
        storedToken.RefreshToken = null;
        storedToken.RefreshTokenExpiry = null;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
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

    private static string HashResetToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}

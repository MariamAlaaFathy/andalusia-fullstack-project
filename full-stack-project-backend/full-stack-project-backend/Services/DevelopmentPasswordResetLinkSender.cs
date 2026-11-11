namespace full_stack_project_backend.Services;

public sealed class DevelopmentPasswordResetLinkSender(
    IWebHostEnvironment environment,
    ILogger<DevelopmentPasswordResetLinkSender> logger) : IPasswordResetLinkSender
{
    public Task SendResetLinkAsync(
        string email,
        string resetLink,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (!environment.IsDevelopment())
        {
            throw new InvalidOperationException(
                "The simulated password reset sender is available only in Development.");
        }

        logger.LogInformation(
            "Development password reset link for {Email}: {ResetLink}",
            email,
            resetLink);
        return Task.CompletedTask;
    }
}

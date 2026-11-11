namespace full_stack_project_backend.Services;

public interface IPasswordResetLinkSender
{
    Task SendResetLinkAsync(
        string email,
        string resetLink,
        CancellationToken cancellationToken);
}

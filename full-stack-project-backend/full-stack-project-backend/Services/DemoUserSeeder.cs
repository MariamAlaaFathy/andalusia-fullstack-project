using full_stack_project_backend.Data;
using full_stack_project_backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Services;

public sealed class DemoUserSeeder(
    AppDbcontext dbContext,
    IPasswordHasher<User> passwordHasher,
    ILogger<DemoUserSeeder> logger)
{
    private const string DemoPassword = "Password123!";

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var accounts = new[]
        {
            new DemoAccount(
                "Andalusia Academy Admin",
                "admin@example.com",
                UserRoles.Admin,
                "Demo administrator account for local development."),
            new DemoAccount(
                "Andalusia Academy Instructor",
                "instructor@example.com",
                UserRoles.Instructor,
                "Demo instructor profile for Andalusia Academy courses."),
            new DemoAccount(
                "Andalusia Academy Learner",
                "learner@example.com",
                UserRoles.Learner,
                "Demo learner account for local development.")
        };
        var emails = accounts.Select(account => account.Email).ToArray();
        var existingEmails = await dbContext.Users
            .AsNoTracking()
            .Where(user => emails.Contains(user.Email))
            .Select(user => user.Email)
            .ToListAsync(cancellationToken);
        var existingEmailSet = existingEmails.ToHashSet(
            StringComparer.OrdinalIgnoreCase);
        var addedAccounts = new List<string>();

        foreach (var account in accounts.Where(
                     account => !existingEmailSet.Contains(account.Email)))
        {
            var user = new User
            {
                Username = account.Username,
                Email = account.Email,
                Role = account.Role,
                Bio = account.Bio
            };
            user.Password = passwordHasher.HashPassword(user, DemoPassword);
            dbContext.Users.Add(user);
            addedAccounts.Add(account.Email);
        }

        if (addedAccounts.Count == 0)
        {
            return;
        }

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception)
        {
            dbContext.ChangeTracker.Clear();
            var allAccountsExist = await dbContext.Users
                .AsNoTracking()
                .CountAsync(user => emails.Contains(user.Email), cancellationToken);
            if (allAccountsExist != accounts.Length)
            {
                throw;
            }

            logger.LogInformation(
                exception,
                "Another application instance created the demo accounts during startup.");
            return;
        }

        logger.LogInformation(
            "Created local demo accounts: {Emails}",
            string.Join(", ", addedAccounts));
    }

    private sealed record DemoAccount(
        string Username,
        string Email,
        string Role,
        string Bio);
}

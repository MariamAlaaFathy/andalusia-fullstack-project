using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedDemoLearner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'learner@example.com')
                BEGIN
                    INSERT INTO [Users] ([Username], [Password], [Email], [Role], [Bio])
                    VALUES (
                        N'Andalusia Academy Learner',
                        N'AQAAAAIAAYagAAAAEG8qg5vF4U1/kKMU+GnCWwHJ1nB5AFe0aQ4wZgQabNKdjYkmYIjIjBgYNz1TiYyeBA==',
                        N'learner@example.com',
                        N'Learner',
                        N'Demo learner account for local development.');
                END;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE learner
                FROM [Users] AS learner
                WHERE learner.[Email] = N'learner@example.com'
                    AND learner.[Password] = N'AQAAAAIAAYagAAAAEG8qg5vF4U1/kKMU+GnCWwHJ1nB5AFe0aQ4wZgQabNKdjYkmYIjIjBgYNz1TiYyeBA=='
                    AND NOT EXISTS (
                        SELECT 1 FROM [CourseApplications] AS application
                        WHERE application.[LearnerId] = learner.[UserId])
                    AND NOT EXISTS (
                        SELECT 1 FROM [SessionAttendances] AS attendance
                        WHERE attendance.[LearnerId] = learner.[UserId])
                    AND NOT EXISTS (
                        SELECT 1 FROM [AssignmentSubmissions] AS submission
                        WHERE submission.[LearnerId] = learner.[UserId]);
                """);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedDemoAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'admin@example.com')
                BEGIN
                    INSERT INTO [Users] ([Username], [Password], [Email], [Role], [Bio])
                    VALUES (
                        N'Andalusia Academy Admin',
                        N'AQAAAAIAAYagAAAAEG8qg5vF4U1/kKMU+GnCWwHJ1nB5AFe0aQ4wZgQabNKdjYkmYIjIjBgYNz1TiYyeBA==',
                        N'admin@example.com',
                        N'Admin',
                        N'Demo administrator account for local development.');
                END;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE administrator
                FROM [Users] AS administrator
                WHERE administrator.[Email] = N'admin@example.com'
                    AND administrator.[Password] = N'AQAAAAIAAYagAAAAEG8qg5vF4U1/kKMU+GnCWwHJ1nB5AFe0aQ4wZgQabNKdjYkmYIjIjBgYNz1TiYyeBA=='
                    AND NOT EXISTS (
                        SELECT 1 FROM [CourseApplications] AS application
                        WHERE application.[LearnerId] = administrator.[UserId])
                    AND NOT EXISTS (
                        SELECT 1 FROM [CourseInstructors] AS assignment
                        WHERE assignment.[InstructorId] = administrator.[UserId])
                    AND NOT EXISTS (
                        SELECT 1 FROM [SessionAttendances] AS attendance
                        WHERE attendance.[LearnerId] = administrator.[UserId])
                    AND NOT EXISTS (
                        SELECT 1 FROM [AssignmentSubmissions] AS submission
                        WHERE submission.[LearnerId] = administrator.[UserId]);
                """);
        }
    }
}

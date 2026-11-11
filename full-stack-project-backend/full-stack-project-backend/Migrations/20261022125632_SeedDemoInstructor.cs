using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedDemoInstructor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "Users",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(
                """
                IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = N'instructor@example.com')
                BEGIN
                    INSERT INTO [Users] ([Username], [Password], [Email], [Role], [Bio])
                    VALUES (
                        N'Andalusia Academy Instructor',
                        N'AQAAAAIAAYagAAAAEG8qg5vF4U1/kKMU+GnCWwHJ1nB5AFe0aQ4wZgQabNKdjYkmYIjIjBgYNz1TiYyeBA==',
                        N'instructor@example.com',
                        N'Instructor',
                        N'Demo instructor profile for Andalusia Academy courses.');
                END;

                INSERT INTO [CourseInstructors] ([CourseId], [InstructorId])
                SELECT course.[Id], instructor.[UserId]
                FROM [Courses] AS course
                CROSS JOIN [Users] AS instructor
                WHERE instructor.[Email] = N'instructor@example.com'
                    AND instructor.[Role] = N'Instructor'
                    AND instructor.[Password] = N'AQAAAAIAAYagAAAAEG8qg5vF4U1/kKMU+GnCWwHJ1nB5AFe0aQ4wZgQabNKdjYkmYIjIjBgYNz1TiYyeBA=='
                    AND NOT EXISTS (
                        SELECT 1
                        FROM [CourseInstructors] AS assignment
                        WHERE assignment.[CourseId] = course.[Id]
                            AND assignment.[InstructorId] = instructor.[UserId]);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE assignment
                FROM [CourseInstructors] AS assignment
                INNER JOIN [Users] AS instructor ON instructor.[UserId] = assignment.[InstructorId]
                WHERE instructor.[Email] = N'instructor@example.com'
                    AND instructor.[Password] = N'AQAAAAIAAYagAAAAEG8qg5vF4U1/kKMU+GnCWwHJ1nB5AFe0aQ4wZgQabNKdjYkmYIjIjBgYNz1TiYyeBA==';

                DELETE instructor
                FROM [Users] AS instructor
                WHERE instructor.[Email] = N'instructor@example.com'
                    AND instructor.[Password] = N'AQAAAAIAAYagAAAAEG8qg5vF4U1/kKMU+GnCWwHJ1nB5AFe0aQ4wZgQabNKdjYkmYIjIjBgYNz1TiYyeBA=='
                    AND NOT EXISTS (
                        SELECT 1 FROM [CourseApplications] AS application
                        WHERE application.[LearnerId] = instructor.[UserId])
                    AND NOT EXISTS (
                        SELECT 1 FROM [SessionAttendances] AS attendance
                        WHERE attendance.[LearnerId] = instructor.[UserId])
                    AND NOT EXISTS (
                        SELECT 1 FROM [AssignmentSubmissions] AS submission
                        WHERE submission.[LearnerId] = instructor.[UserId]);
                """);

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "Users");
        }
    }
}

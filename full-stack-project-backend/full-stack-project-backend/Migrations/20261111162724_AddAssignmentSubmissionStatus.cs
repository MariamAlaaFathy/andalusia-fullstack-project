using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignmentSubmissionStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "AssignmentSubmissions",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "Submitted");

            migrationBuilder.Sql(
                "UPDATE [AssignmentSubmissions] SET [Status] = N'Graded' WHERE [Grade] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "AssignmentSubmissions");
        }
    }
}

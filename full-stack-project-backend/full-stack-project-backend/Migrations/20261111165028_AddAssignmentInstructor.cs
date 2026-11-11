using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignmentInstructor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "InstructorId",
                table: "CourseAssignments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CourseAssignments_InstructorId",
                table: "CourseAssignments",
                column: "InstructorId");

            migrationBuilder.AddForeignKey(
                name: "FK_CourseAssignments_Users_InstructorId",
                table: "CourseAssignments",
                column: "InstructorId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourseAssignments_Users_InstructorId",
                table: "CourseAssignments");

            migrationBuilder.DropIndex(
                name: "IX_CourseAssignments_InstructorId",
                table: "CourseAssignments");

            migrationBuilder.DropColumn(
                name: "InstructorId",
                table: "CourseAssignments");
        }
    }
}

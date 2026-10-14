using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseDetailsAndSeedCourses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Duration",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LearningOutcomes",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "Level",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Prerequisites",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.InsertData(
                table: "Courses",
                columns: new[] { "Id", "Category", "Description", "Duration", "LearningOutcomes", "Level", "Name", "Prerequisites", "Price" },
                values: new object[,]
                {
                    { 1, "Programming", "Learn the basics of C#", "6 weeks", "[\"Understand variables, data types, and control flow\",\"Write methods and work with collections\",\"Build a small console application in C#\"]", "Beginner", "C# Basics", "[\"No prior programming experience required\"]", 100 },
                    { 2, "Web Development", "Learn how to build web applications with ASP.NET Core", "8 weeks", "[\"Build web APIs with ASP.NET Core\",\"Work with routing, dependency injection, and middleware\",\"Connect an application to a database\"]", "Intermediate", "ASP.NET Core", "[\"Basic C# programming\",\"Familiarity with HTTP and web fundamentals\"]", 200 },
                    { 3, "Database", "Learn how to use Entity Framework Core for data access", "5 weeks", "[\"Model entities and relationships\",\"Query and update data with Entity Framework Core\",\"Manage database schema changes with migrations\"]", "Intermediate", "Entity Framework Core", "[\"Basic C# programming\",\"Basic relational database concepts\"]", 150 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "LearningOutcomes",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "Prerequisites",
                table: "Courses");
        }
    }
}

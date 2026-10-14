using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAdditionalCourses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Courses",
                columns: new[] { "Id", "Category", "Description", "Duration", "LearningOutcomes", "Level", "Name", "Prerequisites", "Price", "ProgramId" },
                values: new object[,]
                {
                    { 4, "Frontend Development", "Build semantic web pages and style responsive layouts from the ground up.", "4 weeks", "[\"Structure accessible pages with HTML\",\"Style responsive layouts with CSS\",\"Use flexbox and grid to arrange page content\"]", "Beginner", "HTML & CSS Foundations", "[\"No prior experience required\"]", 80, 1 },
                    { 5, "Programming", "Learn the language of the web through practical programming exercises.", "5 weeks", "[\"Work with variables, functions, and objects\",\"Control page behavior with events\",\"Use modern JavaScript syntax\"]", "Beginner", "JavaScript Fundamentals", "[\"Basic computer skills\"]", 120, 1 },
                    { 6, "Frontend Development", "Create interactive interfaces with reusable React components.", "6 weeks", "[\"Build interfaces with components and props\",\"Manage state and user events\",\"Create multi-page React applications\"]", "Intermediate", "React Foundations", "[\"Basic HTML, CSS, and JavaScript\"]", 180, 1 },
                    { 7, "Backend Development", "Design and build REST APIs using Node.js and Express.", "7 weeks", "[\"Create REST endpoints with Express\",\"Validate requests and handle errors\",\"Connect an API to a database\"]", "Intermediate", "Node.js API Development", "[\"JavaScript fundamentals\"]", 190, 2 },
                    { 8, "Data", "Query and summarize relational data to answer practical business questions.", "5 weeks", "[\"Filter, sort, and join datasets\",\"Summarize data with aggregate functions\",\"Write queries for common analysis tasks\"]", "Beginner", "SQL for Data Analysis", "[\"No prior SQL experience required\"]", 130, 3 },
                    { 9, "Data", "Turn business data into clear, interactive reports and dashboards.", "6 weeks", "[\"Prepare and transform data\",\"Build interactive Power BI reports\",\"Choose visualizations that communicate insights\"]", "Intermediate", "Power BI Dashboards", "[\"Basic spreadsheet skills\"]", 160, 3 },
                    { 10, "Backend Development", "Understand cloud concepts, deployment models, and core services.", "4 weeks", "[\"Compare cloud service and deployment models\",\"Understand compute, storage, and networking basics\",\"Recognize cloud security fundamentals\"]", "Beginner", "Cloud Computing Essentials", "[\"Basic computer skills\"]", 140, 2 },
                    { 11, "Web Development", "Make websites more usable with accessible markup and inclusive design practices.", "3 weeks", "[\"Use semantic HTML and accessible labels\",\"Navigate and test interfaces with a keyboard\",\"Apply color contrast and inclusive content practices\"]", "Beginner", "Web Accessibility Basics", "[\"Basic HTML knowledge\"]", 90, 1 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Courses",
                keyColumn: "Id",
                keyValue: 11);
        }
    }
}

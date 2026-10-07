using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddProgramsAndCareerPaths : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CareerPaths",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareerPaths", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CareerPathSkills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CareerPathId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareerPathSkills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CareerPathSkills_CareerPaths_CareerPathId",
                        column: x => x.CareerPathId,
                        principalTable: "CareerPaths",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Programs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CareerPathId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Programs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Programs_CareerPaths_CareerPathId",
                        column: x => x.CareerPathId,
                        principalTable: "CareerPaths",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "CareerPaths",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Learn to build fast, accessible interfaces with modern JavaScript frameworks.", "Frontend Developer" },
                    { 2, "Design APIs, databases, and the systems that keep them running.", "Backend Developer" },
                    { 3, "Turn raw numbers into decisions stakeholders can act on.", "Data Analyst" }
                });

            migrationBuilder.InsertData(
                table: "CareerPathSkills",
                columns: new[] { "Id", "CareerPathId", "Name" },
                values: new object[,]
                {
                    { 1, 1, "HTML" },
                    { 2, 1, "CSS" },
                    { 3, 1, "JavaScript" },
                    { 4, 1, "React" },
                    { 5, 1, "Git" },
                    { 6, 2, "C#" },
                    { 7, 2, "ASP.NET Core" },
                    { 8, 2, "SQL" },
                    { 9, 2, "REST APIs" },
                    { 10, 2, "Git" },
                    { 11, 3, "SQL" },
                    { 12, 3, "Excel" },
                    { 13, 3, "Power BI" },
                    { 14, 3, "Statistics" }
                });

            migrationBuilder.InsertData(
                table: "Programs",
                columns: new[] { "Id", "CareerPathId", "Description", "Name" },
                values: new object[,]
                {
                    { 1, 1, "A project-based path from HTML basics to a production React app.", "Frontend Developer Program" },
                    { 2, 2, "Build and ship a real API, from first endpoint to deployment.", "Backend Developer Program" },
                    { 3, 3, "Go from spreadsheets to dashboards stakeholders actually use.", "Data Analyst Program" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CareerPathSkills_CareerPathId",
                table: "CareerPathSkills",
                column: "CareerPathId");

            migrationBuilder.CreateIndex(
                name: "IX_Programs_CareerPathId",
                table: "Programs",
                column: "CareerPathId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CareerPathSkills");

            migrationBuilder.DropTable(
                name: "Programs");

            migrationBuilder.DropTable(
                name: "CareerPaths");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDynamicSiteContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AboutPageBlocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AboutPageBlocks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContactPageSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Introduction = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    WorkingHours = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    MapUrl = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactPageSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContactSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Message = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    SubmittedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactSubmissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LandingPageBanners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CallToActionText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CallToActionUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandingPageBanners", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LandingPageFaqs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Question = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandingPageFaqs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LandingPageHighlights",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandingPageHighlights", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LandingPageTestimonials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Quote = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Author = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandingPageTestimonials", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "AboutPageBlocks",
                columns: new[] { "Id", "Body", "Order", "Title" },
                values: new object[,]
                {
                    { 1, "Empowering learners across the region with structured career paths, hands-on technical training, and industry-aligned skills.", 0, "About Andalusia Academy" },
                    { 2, "Andalusia Academy was created to bridge the gap between academic education and practical industry demands. We provide accessible, high-quality learning experiences designed to take you from foundational concepts to market-ready expertise. Whether you are stepping into tech for the first time, upskilling for a promotion, or training an engineering team, our programs adapt to your goals.", 1, "Our Mission" },
                    { 3, "Every course is built around real-world projects, giving you skills you can immediately apply in your job or portfolio.", 2, "Practical Learning" },
                    { 4, "Learn directly from industry practitioners who bring active experience and guidance to your learning journey.", 3, "Expert Mentorship" },
                    { 5, "Clear learning paths remove the guesswork, letting you focus on step-by-step progress towards your career goals.", 4, "Structured Growth" }
                });

            migrationBuilder.InsertData(
                table: "ContactPageSettings",
                columns: new[] { "Id", "Address", "Email", "Introduction", "MapUrl", "Phone", "WorkingHours" },
                values: new object[] { 1, "39 Khaleel El-Khayat Basha, Abu an Nawatir, Sidi Gaber, Alexandria Governorate", "andalusiaacadem@andalusia.com", "Have questions about our programs, course tracks, or team pricing? We're here to help.", "https://maps.google.com/?q=39+Khaleel+El-Khayat+Basha,+Abu+an+Nawatir,+Sidi+Gaber,+Alexandria+Governorate", "01202317780", "Sunday – Thursday: 9:00 AM – 5:00 PM; Friday & Saturday: Closed" });

            migrationBuilder.InsertData(
                table: "LandingPageBanners",
                columns: new[] { "Id", "CallToActionText", "CallToActionUrl", "Description", "ImageUrl", "IsPublished", "Order", "Title" },
                values: new object[] { 1, "Join waitlist", null, "Launching next month — join the waitlist to get early access and a founding-cohort discount.", null, true, 0, "New: Full Stack Development (.NET)" });

            migrationBuilder.InsertData(
                table: "LandingPageHighlights",
                columns: new[] { "Id", "Description", "IsPublished", "Order", "Title" },
                values: new object[] { 1, "Upskill your team with cohort pricing, progress reporting and a dedicated account contact.", true, 0, "For business" });

            migrationBuilder.InsertData(
                table: "LandingPageTestimonials",
                columns: new[] { "Id", "Author", "IsPublished", "Order", "Quote", "Role" },
                values: new object[,]
                {
                    { 1, "Abdlhamid Medhat", true, 0, "Courses and conferences are well-organized and professionally managed. Andalusia Academy offers accredited courses and conferences for medical and non-medical professionals.", null },
                    { 2, "Amr Gamal", true, 1, "Your future starts with one click. Join thousands of successful learners.", null },
                    { 3, "Karim Fakhry", true, 2, "Every graduate starts with a lesson. Learn today, lead tomorrow.", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContactSubmissions_IsRead_SubmittedAtUtc",
                table: "ContactSubmissions",
                columns: new[] { "IsRead", "SubmittedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AboutPageBlocks");

            migrationBuilder.DropTable(
                name: "ContactPageSettings");

            migrationBuilder.DropTable(
                name: "ContactSubmissions");

            migrationBuilder.DropTable(
                name: "LandingPageBanners");

            migrationBuilder.DropTable(
                name: "LandingPageFaqs");

            migrationBuilder.DropTable(
                name: "LandingPageHighlights");

            migrationBuilder.DropTable(
                name: "LandingPageTestimonials");
        }
    }
}

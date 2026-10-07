using full_stack_project_backend.Models;
using Microsoft.EntityFrameworkCore;
using ProgramEntity = full_stack_project_backend.Models.Program;

namespace full_stack_project_backend.Data
{
    public class AppDbcontext : DbContext
    {
        public AppDbcontext(DbContextOptions<AppDbcontext> options) : base(options)
        {
        }
        public DbSet<Course> Courses
        {
            get; set;
        }

        public DbSet<ProgramEntity> Programs => Set<ProgramEntity>();
        public DbSet<CareerPath> CareerPaths => Set<CareerPath>();
        public DbSet<CareerPathSkill> CareerPathSkills => Set<CareerPathSkill>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ProgramEntity>()
                .HasOne(program => program.CareerPath)
                .WithMany(careerPath => careerPath.Programs)
                .HasForeignKey(program => program.CareerPathId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Course>()
                .HasOne(course => course.Program)
                .WithMany(program => program.Courses)
                .HasForeignKey(course => course.ProgramId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CareerPathSkill>()
                .HasOne(skill => skill.CareerPath)
                .WithMany(careerPath => careerPath.Skills)
                .HasForeignKey(skill => skill.CareerPathId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CareerPath>()
                .HasData(
                    new CareerPath
                    {
                        Id = 1,
                        Name = "Frontend Developer",
                        Description = "Learn to build fast, accessible interfaces with modern JavaScript frameworks."
                    },
                    new CareerPath
                    {
                        Id = 2,
                        Name = "Backend Developer",
                        Description = "Design APIs, databases, and the systems that keep them running."
                    },
                    new CareerPath
                    {
                        Id = 3,
                        Name = "Data Analyst",
                        Description = "Turn raw numbers into decisions stakeholders can act on."
                    });

            modelBuilder.Entity<CareerPathSkill>()
                .HasData(
                    new CareerPathSkill { Id = 1, CareerPathId = 1, Name = "HTML" },
                    new CareerPathSkill { Id = 2, CareerPathId = 1, Name = "CSS" },
                    new CareerPathSkill { Id = 3, CareerPathId = 1, Name = "JavaScript" },
                    new CareerPathSkill { Id = 4, CareerPathId = 1, Name = "React" },
                    new CareerPathSkill { Id = 5, CareerPathId = 1, Name = "Git" },
                    new CareerPathSkill { Id = 6, CareerPathId = 2, Name = "C#" },
                    new CareerPathSkill { Id = 7, CareerPathId = 2, Name = "ASP.NET Core" },
                    new CareerPathSkill { Id = 8, CareerPathId = 2, Name = "SQL" },
                    new CareerPathSkill { Id = 9, CareerPathId = 2, Name = "REST APIs" },
                    new CareerPathSkill { Id = 10, CareerPathId = 2, Name = "Git" },
                    new CareerPathSkill { Id = 11, CareerPathId = 3, Name = "SQL" },
                    new CareerPathSkill { Id = 12, CareerPathId = 3, Name = "Excel" },
                    new CareerPathSkill { Id = 13, CareerPathId = 3, Name = "Power BI" },
                    new CareerPathSkill { Id = 14, CareerPathId = 3, Name = "Statistics" });

            modelBuilder.Entity<ProgramEntity>()
                .HasData(
                    new ProgramEntity
                    {
                        Id = 1,
                        Name = "Frontend Developer Program",
                        Description = "A project-based path from HTML basics to a production React app.",
                        CareerPathId = 1
                    },
                    new ProgramEntity
                    {
                        Id = 2,
                        Name = "Backend Developer Program",
                        Description = "Build and ship a real API, from first endpoint to deployment.",
                        CareerPathId = 2
                    },
                    new ProgramEntity
                    {
                        Id = 3,
                        Name = "Data Analyst Program",
                        Description = "Go from spreadsheets to dashboards stakeholders actually use.",
                        CareerPathId = 3
                    });

            modelBuilder.Entity<Course>()
                .HasData(
                    new Course
                    {
                        Id = 1,
                        Name = "C# Basics",
                        Description = "Learn the basics of C#",
                        Price = 100,
                        Category = "Programming",
                        ProgramId = 2,
                        Duration = "6 weeks",
                        Level = "Beginner",
                        Prerequisites = ["No prior programming experience required"],
                        LearningOutcomes =
                        [
                            "Understand variables, data types, and control flow",
                            "Write methods and work with collections",
                            "Build a small console application in C#"
                        ]
                    },
                    new Course
                    {
                        Id = 2,
                        Name = "ASP.NET Core",
                        Description = "Learn how to build web applications with ASP.NET Core",
                        Price = 200,
                        Category = "Web Development",
                        ProgramId = 2,
                        Duration = "8 weeks",
                        Level = "Intermediate",
                        Prerequisites =
                        [
                            "Basic C# programming",
                            "Familiarity with HTTP and web fundamentals"
                        ],
                        LearningOutcomes =
                        [
                            "Build web APIs with ASP.NET Core",
                            "Work with routing, dependency injection, and middleware",
                            "Connect an application to a database"
                        ]
                    },
                    new Course
                    {
                        Id = 3,
                        Name = "Entity Framework Core",
                        Description = "Learn how to use Entity Framework Core for data access",
                        Price = 150,
                        Category = "Database",
                        ProgramId = 2,
                        Duration = "5 weeks",
                        Level = "Intermediate",
                        Prerequisites =
                        [
                            "Basic C# programming",
                            "Basic relational database concepts"
                        ],
                        LearningOutcomes =
                        [
                            "Model entities and relationships",
                            "Query and update data with Entity Framework Core",
                            "Manage database schema changes with migrations"
                        ]
                    });
        }
    }
}

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
        public DbSet<CourseModule> CourseModules => Set<CourseModule>();
        public DbSet<Lesson> Lessons => Set<Lesson>();
        public DbSet<LandingPageContent> LandingPageContents => Set<LandingPageContent>();
        public DbSet<FeaturedCourse> FeaturedCourses => Set<FeaturedCourse>();
        public DbSet<LandingPageBanner> LandingPageBanners => Set<LandingPageBanner>();
        public DbSet<LandingPageHighlight> LandingPageHighlights => Set<LandingPageHighlight>();
        public DbSet<LandingPageTestimonial> LandingPageTestimonials => Set<LandingPageTestimonial>();
        public DbSet<LandingPageFaq> LandingPageFaqs => Set<LandingPageFaq>();
        public DbSet<AboutPageBlock> AboutPageBlocks => Set<AboutPageBlock>();
        public DbSet<ContactPageSettings> ContactPageSettings => Set<ContactPageSettings>();
        public DbSet<ContactSubmission> ContactSubmissions => Set<ContactSubmission>();

        public DbSet<ProgramEntity> Programs => Set<ProgramEntity>();
        public DbSet<CareerPath> CareerPaths => Set<CareerPath>();
        public DbSet<CareerPathSkill> CareerPathSkills => Set<CareerPathSkill>();
        public DbSet<User> Users { get; set; }
        public DbSet<UserToken> UserTokens => Set<UserToken>();
        public DbSet<CourseApplication> CourseApplications => Set<CourseApplication>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<CourseInstructor> CourseInstructors => Set<CourseInstructor>();
        public DbSet<CourseSession> CourseSessions => Set<CourseSession>();
        public DbSet<SessionAttendance> SessionAttendances => Set<SessionAttendance>();
        public DbSet<CourseAssignment> CourseAssignments => Set<CourseAssignment>();
        public DbSet<AssignmentSubmission> AssignmentSubmissions => Set<AssignmentSubmission>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(user =>
            {
                user.Property(item => item.IsActive)
                    .HasDefaultValue(true);
                user.HasIndex(item => item.Email)
                    .IsUnique();
            });

            modelBuilder.Entity<UserToken>(userToken =>
            {
                userToken.HasKey(item => item.UserId);
                userToken.Property(item => item.PasswordResetTokenHash)
                    .HasMaxLength(64);
                userToken.HasIndex(item => item.PasswordResetTokenHash)
                    .IsUnique()
                    .HasFilter("[PasswordResetTokenHash] IS NOT NULL");
                userToken.HasOne(item => item.User)
                    .WithOne(user => user.UserToken)
                    .HasForeignKey<UserToken>(item => item.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Notification>(notification =>
            {
                notification.Property(item => item.Text)
                    .HasMaxLength(4000)
                    .IsRequired();
                notification.Property(item => item.Date)
                    .IsRequired();
                notification.Property(item => item.IsRead)
                    .HasDefaultValue(false);
                notification.HasOne(item => item.User)
                    .WithMany()
                    .HasForeignKey(item => item.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                notification.HasIndex(item => new { item.UserId, item.IsRead, item.Date });
            });

            modelBuilder.Entity<CourseApplication>(application =>
            {
                application.Property(item => item.CourseName).IsRequired();
                application.Property(item => item.Amount).HasPrecision(18, 2);
                application.Property(item => item.Progress).HasDefaultValue(0);
                application.Property(item => item.Status)
                    .HasConversion<string>()
                    .HasMaxLength(32);
                application.HasIndex(item => new { item.LearnerId, item.CourseId })
                    .IsUnique();
                application.HasOne(item => item.Course)
                    .WithMany()
                    .HasForeignKey(item => item.CourseId)
                    .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CourseModule>()
                .HasOne(module => module.Course)
                .WithMany()
                .HasForeignKey(module => module.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Lesson>()
                .HasOne(lesson => lesson.Module)
                .WithMany(module => module.Lessons)
                .HasForeignKey(lesson => lesson.ModuleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FeaturedCourse>()
                .HasOne(featured => featured.Course)
                .WithMany()
                .HasForeignKey(featured => featured.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FeaturedCourse>()
                .HasIndex(featured => new { featured.CourseId })
                .IsUnique();

            modelBuilder.Entity<LandingPageContent>()
                .HasData(new LandingPageContent
                {
                    Id = 1,
                    UpdatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                });

            modelBuilder.Entity<LandingPageBanner>(entity =>
            {
                entity.Property(item => item.Title).HasMaxLength(160).IsRequired();
                entity.Property(item => item.Description).HasMaxLength(1000).IsRequired();
                entity.HasData(new LandingPageBanner
                {
                    Id = 1,
                    Title = "New: Full Stack Development (.NET)",
                    Description = "Launching next month — join the waitlist to get early access and a founding-cohort discount.",
                    CallToActionText = "Join waitlist",
                    Order = 0,
                    IsPublished = true
                });
            });

            modelBuilder.Entity<LandingPageHighlight>(entity =>
            {
                entity.Property(item => item.Title).HasMaxLength(160).IsRequired();
                entity.Property(item => item.Description).HasMaxLength(1000).IsRequired();
                entity.HasData(new LandingPageHighlight
                {
                    Id = 1,
                    Title = "For business",
                    Description = "Upskill your team with cohort pricing, progress reporting and a dedicated account contact.",
                    Order = 0,
                    IsPublished = true
                });
            });

            modelBuilder.Entity<LandingPageTestimonial>(entity =>
            {
                entity.Property(item => item.Quote).HasMaxLength(2000).IsRequired();
                entity.Property(item => item.Author).HasMaxLength(120).IsRequired();
                entity.Property(item => item.Role).HasMaxLength(160);
                entity.HasData(
                    new LandingPageTestimonial
                    {
                        Id = 1,
                        Quote = "Courses and conferences are well-organized and professionally managed. Andalusia Academy offers accredited courses and conferences for medical and non-medical professionals.",
                        Author = "Abdlhamid Medhat",
                        Order = 0,
                        IsPublished = true
                    },
                    new LandingPageTestimonial
                    {
                        Id = 2,
                        Quote = "Your future starts with one click. Join thousands of successful learners.",
                        Author = "Amr Gamal",
                        Order = 1,
                        IsPublished = true
                    },
                    new LandingPageTestimonial
                    {
                        Id = 3,
                        Quote = "Every graduate starts with a lesson. Learn today, lead tomorrow.",
                        Author = "Karim Fakhry",
                        Order = 2,
                        IsPublished = true
                    });
            });

            modelBuilder.Entity<LandingPageFaq>(entity =>
            {
                entity.Property(item => item.Question).HasMaxLength(500).IsRequired();
                entity.Property(item => item.Answer).HasMaxLength(4000).IsRequired();
            });

            modelBuilder.Entity<AboutPageBlock>(entity =>
            {
                entity.Property(item => item.Title).HasMaxLength(160).IsRequired();
                entity.Property(item => item.Body).HasMaxLength(4000).IsRequired();
                entity.HasData(
                    new AboutPageBlock
                    {
                        Id = 1,
                        Title = "About Andalusia Academy",
                        Body = "Empowering learners across the region with structured career paths, hands-on technical training, and industry-aligned skills.",
                        Order = 0
                    },
                    new AboutPageBlock
                    {
                        Id = 2,
                        Title = "Our Mission",
                        Body = "Andalusia Academy was created to bridge the gap between academic education and practical industry demands. We provide accessible, high-quality learning experiences designed to take you from foundational concepts to market-ready expertise. Whether you are stepping into tech for the first time, upskilling for a promotion, or training an engineering team, our programs adapt to your goals.",
                        Order = 1
                    },
                    new AboutPageBlock
                    {
                        Id = 3,
                        Title = "Practical Learning",
                        Body = "Every course is built around real-world projects, giving you skills you can immediately apply in your job or portfolio.",
                        Order = 2
                    },
                    new AboutPageBlock
                    {
                        Id = 4,
                        Title = "Expert Mentorship",
                        Body = "Learn directly from industry practitioners who bring active experience and guidance to your learning journey.",
                        Order = 3
                    },
                    new AboutPageBlock
                    {
                        Id = 5,
                        Title = "Structured Growth",
                        Body = "Clear learning paths remove the guesswork, letting you focus on step-by-step progress towards your career goals.",
                        Order = 4
                    });
            });

            modelBuilder.Entity<ContactPageSettings>(entity =>
            {
                entity.Property(item => item.Introduction).HasMaxLength(1000).IsRequired();
                entity.Property(item => item.Address).HasMaxLength(500).IsRequired();
                entity.Property(item => item.Email).HasMaxLength(254).IsRequired();
                entity.Property(item => item.Phone).HasMaxLength(64).IsRequired();
                entity.Property(item => item.WorkingHours).HasMaxLength(500).IsRequired();
                entity.HasData(new ContactPageSettings
                {
                    Id = 1,
                    Introduction = "Have questions about our programs, course tracks, or team pricing? We're here to help.",
                    Address = "39 Khaleel El-Khayat Basha, Abu an Nawatir, Sidi Gaber, Alexandria Governorate",
                    Email = "andalusiaacadem@andalusia.com",
                    Phone = "01202317780",
                    WorkingHours = "Sunday – Thursday: 9:00 AM – 5:00 PM; Friday & Saturday: Closed",
                    MapUrl = "https://maps.google.com/?q=39+Khaleel+El-Khayat+Basha,+Abu+an+Nawatir,+Sidi+Gaber,+Alexandria+Governorate"
                });
            });

            modelBuilder.Entity<ContactSubmission>(entity =>
            {
                entity.Property(item => item.Name).HasMaxLength(120).IsRequired();
                entity.Property(item => item.Email).HasMaxLength(254).IsRequired();
                entity.Property(item => item.Subject).HasMaxLength(200);
                entity.Property(item => item.Message).HasMaxLength(4000).IsRequired();
                entity.HasIndex(item => new { item.IsRead, item.SubmittedAtUtc });
            });
                application.HasOne(item => item.Payment)
                    .WithOne(payment => payment.CourseApplication)
                    .HasForeignKey<Payment>(payment => payment.CourseApplicationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Payment>(payment =>
            {
                payment.Property(item => item.Amount).HasPrecision(18, 2);
                payment.Property(item => item.StripeCheckoutSessionId)
                    .HasMaxLength(450);
                payment.Property(item => item.Status)
                    .HasConversion<string>()
                    .HasMaxLength(32);
                payment.HasIndex(item => item.StripeCheckoutSessionId)
                    .IsUnique()
                    .HasFilter("[StripeCheckoutSessionId] IS NOT NULL");
            });

            modelBuilder.Entity<User>()
                .Property(user => user.Role)
                .HasMaxLength(32)
                .HasDefaultValue("Learner");

            modelBuilder.Entity<User>()
                .Property(user => user.Bio)
                .HasMaxLength(1000);

            modelBuilder.Entity<CourseInstructor>(assignment =>
            {
                assignment.HasKey(item => new { item.CourseId, item.InstructorId });
                assignment.HasOne(item => item.Course)
                    .WithMany(course => course.Instructors)
                    .HasForeignKey(item => item.CourseId)
                    .OnDelete(DeleteBehavior.Cascade);
                assignment.HasOne(item => item.Instructor)
                    .WithMany()
                    .HasForeignKey(item => item.InstructorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<CourseSession>(session =>
            {
                session.Property(item => item.Title).HasMaxLength(200).IsRequired();
                session.Property(item => item.Location).HasMaxLength(300).IsRequired();
                session.HasOne(item => item.Course)
                    .WithMany(course => course.Sessions)
                    .HasForeignKey(item => item.CourseId)
                    .OnDelete(DeleteBehavior.Cascade);
                session.HasIndex(item => new { item.CourseId, item.StartsAt });
            });

            modelBuilder.Entity<SessionAttendance>(attendance =>
            {
                attendance.HasKey(item => new
                {
                    item.CourseSessionId,
                    item.LearnerId
                });
                attendance.HasOne(item => item.CourseSession)
                    .WithMany(session => session.Attendance)
                    .HasForeignKey(item => item.CourseSessionId)
                    .OnDelete(DeleteBehavior.Cascade);
                attendance.HasOne(item => item.Learner)
                    .WithMany()
                    .HasForeignKey(item => item.LearnerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<CourseAssignment>(assignment =>
            {
                assignment.Property(item => item.Title).HasMaxLength(200).IsRequired();
                assignment.Property(item => item.Description).HasMaxLength(4000).IsRequired();
                assignment.HasOne(item => item.Course)
                    .WithMany(course => course.Assignments)
                    .HasForeignKey(item => item.CourseId)
                    .OnDelete(DeleteBehavior.Cascade);
                assignment.HasOne(item => item.Instructor)
                    .WithMany(instructor => instructor.CreatedAssignments)
                    .HasForeignKey(item => item.InstructorId)
                    .OnDelete(DeleteBehavior.Restrict);
                assignment.HasIndex(item => new { item.CourseId, item.DueAt });
            });

            modelBuilder.Entity<AssignmentSubmission>(submission =>
            {
                submission.Property(item => item.Content).HasMaxLength(8000).IsRequired();
                submission.Property(item => item.Status)
                    .HasConversion<string>()
                    .HasMaxLength(32)
                    .HasDefaultValue(AssignmentSubmissionStatus.Submitted);
                submission.Property(item => item.Grade).HasPrecision(5, 2);
                submission.Property(item => item.Feedback).HasMaxLength(2000);
                submission.HasOne(item => item.CourseAssignment)
                    .WithMany(assignment => assignment.Submissions)
                    .HasForeignKey(item => item.CourseAssignmentId)
                    .OnDelete(DeleteBehavior.Cascade);
                submission.HasOne(item => item.Learner)
                    .WithMany(learner => learner.AssignmentSubmissions)
                    .HasForeignKey(item => item.LearnerId)
                    .OnDelete(DeleteBehavior.Restrict);
                submission.HasIndex(item => new
                {
                    item.CourseAssignmentId,
                    item.LearnerId
                }).IsUnique();
            });

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
                    },
                    new Course
                    {
                        Id = 4,
                        Name = "HTML & CSS Foundations",
                        Description = "Build semantic web pages and style responsive layouts from the ground up.",
                        Price = 80,
                        Category = "Frontend Development",
                        ProgramId = 1,
                        Duration = "4 weeks",
                        Level = "Beginner",
                        Prerequisites = ["No prior experience required"],
                        LearningOutcomes =
                        [
                            "Structure accessible pages with HTML",
                            "Style responsive layouts with CSS",
                            "Use flexbox and grid to arrange page content"
                        ]
                    },
                    new Course
                    {
                        Id = 5,
                        Name = "JavaScript Fundamentals",
                        Description = "Learn the language of the web through practical programming exercises.",
                        Price = 120,
                        Category = "Programming",
                        ProgramId = 1,
                        Duration = "5 weeks",
                        Level = "Beginner",
                        Prerequisites = ["Basic computer skills"],
                        LearningOutcomes =
                        [
                            "Work with variables, functions, and objects",
                            "Control page behavior with events",
                            "Use modern JavaScript syntax"
                        ]
                    },
                    new Course
                    {
                        Id = 6,
                        Name = "React Foundations",
                        Description = "Create interactive interfaces with reusable React components.",
                        Price = 180,
                        Category = "Frontend Development",
                        ProgramId = 1,
                        Duration = "6 weeks",
                        Level = "Intermediate",
                        Prerequisites = ["Basic HTML, CSS, and JavaScript"],
                        LearningOutcomes =
                        [
                            "Build interfaces with components and props",
                            "Manage state and user events",
                            "Create multi-page React applications"
                        ]
                    },
                    new Course
                    {
                        Id = 7,
                        Name = "Node.js API Development",
                        Description = "Design and build REST APIs using Node.js and Express.",
                        Price = 190,
                        Category = "Backend Development",
                        ProgramId = 2,
                        Duration = "7 weeks",
                        Level = "Intermediate",
                        Prerequisites = ["JavaScript fundamentals"],
                        LearningOutcomes =
                        [
                            "Create REST endpoints with Express",
                            "Validate requests and handle errors",
                            "Connect an API to a database"
                        ]
                    },
                    new Course
                    {
                        Id = 8,
                        Name = "SQL for Data Analysis",
                        Description = "Query and summarize relational data to answer practical business questions.",
                        Price = 130,
                        Category = "Data",
                        ProgramId = 3,
                        Duration = "5 weeks",
                        Level = "Beginner",
                        Prerequisites = ["No prior SQL experience required"],
                        LearningOutcomes =
                        [
                            "Filter, sort, and join datasets",
                            "Summarize data with aggregate functions",
                            "Write queries for common analysis tasks"
                        ]
                    },
                    new Course
                    {
                        Id = 9,
                        Name = "Power BI Dashboards",
                        Description = "Turn business data into clear, interactive reports and dashboards.",
                        Price = 160,
                        Category = "Data",
                        ProgramId = 3,
                        Duration = "6 weeks",
                        Level = "Intermediate",
                        Prerequisites = ["Basic spreadsheet skills"],
                        LearningOutcomes =
                        [
                            "Prepare and transform data",
                            "Build interactive Power BI reports",
                            "Choose visualizations that communicate insights"
                        ]
                    },
                    new Course
                    {
                        Id = 10,
                        Name = "Cloud Computing Essentials",
                        Description = "Understand cloud concepts, deployment models, and core services.",
                        Price = 140,
                        Category = "Backend Development",
                        ProgramId = 2,
                        Duration = "4 weeks",
                        Level = "Beginner",
                        Prerequisites = ["Basic computer skills"],
                        LearningOutcomes =
                        [
                            "Compare cloud service and deployment models",
                            "Understand compute, storage, and networking basics",
                            "Recognize cloud security fundamentals"
                        ]
                    },
                    new Course
                    {
                        Id = 11,
                        Name = "Web Accessibility Basics",
                        Description = "Make websites more usable with accessible markup and inclusive design practices.",
                        Price = 90,
                        Category = "Web Development",
                        ProgramId = 1,
                        Duration = "3 weeks",
                        Level = "Beginner",
                        Prerequisites = ["Basic HTML knowledge"],
                        LearningOutcomes =
                        [
                            "Use semantic HTML and accessible labels",
                            "Navigate and test interfaces with a keyboard",
                            "Apply color contrast and inclusive content practices"
                        ]
                    });
        }
    }
}

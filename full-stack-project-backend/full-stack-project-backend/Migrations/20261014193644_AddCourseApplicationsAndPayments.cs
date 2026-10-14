using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseApplicationsAndPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[dbo].[CourseApplications]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[CourseApplications] (
                        [Id] uniqueidentifier NOT NULL,
                        [LearnerId] nvarchar(450) NOT NULL,
                        [CourseId] int NOT NULL,
                        [CourseName] nvarchar(max) NOT NULL,
                        [Amount] decimal(18,2) NOT NULL,
                        [Status] nvarchar(32) NOT NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_CourseApplications] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_CourseApplications_Courses_CourseId]
                            FOREIGN KEY ([CourseId]) REFERENCES [dbo].[Courses] ([Id])
                            ON DELETE NO ACTION
                    );
                END;

                IF OBJECT_ID(N'[dbo].[Payments]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[Payments] (
                        [Id] uniqueidentifier NOT NULL,
                        [CourseApplicationId] uniqueidentifier NOT NULL,
                        [Amount] decimal(18,2) NOT NULL,
                        [Currency] nvarchar(max) NOT NULL,
                        [Status] nvarchar(32) NOT NULL,
                        [StripeCheckoutSessionId] nvarchar(450) NULL,
                        [CheckoutExpiresAt] datetime2 NULL,
                        [StripePaymentIntentId] nvarchar(max) NULL,
                        [CreatedAt] datetime2 NOT NULL,
                        [PaidAt] datetime2 NULL,
                        CONSTRAINT [PK_Payments] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_Payments_CourseApplications_CourseApplicationId]
                            FOREIGN KEY ([CourseApplicationId])
                            REFERENCES [dbo].[CourseApplications] ([Id])
                            ON DELETE CASCADE
                    );
                END;

                IF NOT EXISTS (
                    SELECT 1 FROM sys.indexes
                    WHERE [object_id] = OBJECT_ID(N'[dbo].[CourseApplications]')
                      AND [name] = N'IX_CourseApplications_CourseId')
                    CREATE INDEX [IX_CourseApplications_CourseId]
                        ON [dbo].[CourseApplications] ([CourseId]);

                IF NOT EXISTS (
                    SELECT 1 FROM sys.indexes
                    WHERE [object_id] = OBJECT_ID(N'[dbo].[CourseApplications]')
                      AND [name] = N'IX_CourseApplications_LearnerId_CourseId')
                    CREATE UNIQUE INDEX [IX_CourseApplications_LearnerId_CourseId]
                        ON [dbo].[CourseApplications] ([LearnerId], [CourseId]);

                IF NOT EXISTS (
                    SELECT 1 FROM sys.indexes
                    WHERE [object_id] = OBJECT_ID(N'[dbo].[Payments]')
                      AND [name] = N'IX_Payments_CourseApplicationId')
                    CREATE UNIQUE INDEX [IX_Payments_CourseApplicationId]
                        ON [dbo].[Payments] ([CourseApplicationId]);

                IF NOT EXISTS (
                    SELECT 1 FROM sys.indexes
                    WHERE [object_id] = OBJECT_ID(N'[dbo].[Payments]')
                      AND [name] = N'IX_Payments_StripeCheckoutSessionId')
                    CREATE UNIQUE INDEX [IX_Payments_StripeCheckoutSessionId]
                        ON [dbo].[Payments] ([StripeCheckoutSessionId])
                        WHERE [StripeCheckoutSessionId] IS NOT NULL;

                IF NOT EXISTS (
                    SELECT 1 FROM sys.foreign_keys
                    WHERE [name] = N'FK_CourseApplications_Courses_CourseId')
                    ALTER TABLE [dbo].[CourseApplications]
                        ADD CONSTRAINT [FK_CourseApplications_Courses_CourseId]
                        FOREIGN KEY ([CourseId]) REFERENCES [dbo].[Courses] ([Id])
                        ON DELETE NO ACTION;

                IF NOT EXISTS (
                    SELECT 1 FROM sys.foreign_keys
                    WHERE [name] = N'FK_Payments_CourseApplications_CourseApplicationId')
                    ALTER TABLE [dbo].[Payments]
                        ADD CONSTRAINT [FK_Payments_CourseApplications_CourseApplicationId]
                        FOREIGN KEY ([CourseApplicationId])
                        REFERENCES [dbo].[CourseApplications] ([Id])
                        ON DELETE CASCADE;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[dbo].[Payments]', N'U') IS NOT NULL
                   AND OBJECT_ID(N'[dbo].[CourseApplications]', N'U') IS NOT NULL
                   AND NOT EXISTS (SELECT 1 FROM [dbo].[Payments])
                   AND NOT EXISTS (SELECT 1 FROM [dbo].[CourseApplications])
                BEGIN
                    DROP TABLE [dbo].[Payments];
                    DROP TABLE [dbo].[CourseApplications];
                END;
                """);
        }
    }
}

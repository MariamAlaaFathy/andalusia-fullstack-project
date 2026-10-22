using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class ConvertEnrollmentIdentifiersToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[dbo].[CourseApplications]', N'U') IS NULL
                   OR OBJECT_ID(N'[dbo].[Payments]', N'U') IS NULL
                    THROW 51000, 'Course application and payment tables must exist before converting their identifiers.', 1;

                SELECT * INTO #OldCourseApplications
                FROM [dbo].[CourseApplications];

                SELECT * INTO #OldPayments
                FROM [dbo].[Payments];

                IF EXISTS (
                    SELECT 1
                    FROM #OldCourseApplications AS application
                    LEFT JOIN [dbo].[Users] AS userById
                        ON userById.[UserId] = TRY_CONVERT(int, application.[LearnerId])
                    LEFT JOIN [dbo].[Users] AS userByEmail
                        ON userByEmail.[Email] = application.[LearnerId]
                    WHERE userById.[UserId] IS NULL
                      AND userByEmail.[UserId] IS NULL)
                    THROW 51001, 'Every course application LearnerId must match a user ID or email before migration.', 1;

                IF EXISTS (
                    SELECT mapped.[LearnerId], mapped.[CourseId]
                    FROM (
                        SELECT
                            COALESCE(userById.[UserId], userByEmail.[UserId]) AS [LearnerId],
                            application.[CourseId]
                        FROM #OldCourseApplications AS application
                        LEFT JOIN [dbo].[Users] AS userById
                            ON userById.[UserId] = TRY_CONVERT(int, application.[LearnerId])
                        LEFT JOIN [dbo].[Users] AS userByEmail
                            ON userByEmail.[Email] = application.[LearnerId]
                    ) AS mapped
                    GROUP BY mapped.[LearnerId], mapped.[CourseId]
                    HAVING COUNT(*) > 1)
                    THROW 51002, 'The learner ID conversion would create duplicate course applications.', 1;

                DROP TABLE [dbo].[Payments];
                DROP TABLE [dbo].[CourseApplications];

                CREATE TABLE [dbo].[CourseApplications] (
                    [Id] int IDENTITY(1,1) NOT NULL,
                    [LearnerId] int NOT NULL,
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

                CREATE TABLE #CourseApplicationIdMap (
                    [OldId] uniqueidentifier NOT NULL PRIMARY KEY,
                    [NewId] int NOT NULL
                );

                MERGE [dbo].[CourseApplications] AS target
                USING (
                    SELECT
                        application.*,
                        COALESCE(userById.[UserId], userByEmail.[UserId]) AS [NewLearnerId]
                    FROM #OldCourseApplications AS application
                    LEFT JOIN [dbo].[Users] AS userById
                        ON userById.[UserId] = TRY_CONVERT(int, application.[LearnerId])
                    LEFT JOIN [dbo].[Users] AS userByEmail
                        ON userByEmail.[Email] = application.[LearnerId]
                ) AS source
                ON 1 = 0
                WHEN NOT MATCHED THEN
                    INSERT ([LearnerId], [CourseId], [CourseName], [Amount], [Status], [CreatedAt])
                    VALUES (
                        source.[NewLearnerId],
                        source.[CourseId],
                        source.[CourseName],
                        source.[Amount],
                        source.[Status],
                        source.[CreatedAt])
                OUTPUT source.[Id], inserted.[Id]
                    INTO #CourseApplicationIdMap ([OldId], [NewId]);

                CREATE TABLE [dbo].[Payments] (
                    [Id] int IDENTITY(1,1) NOT NULL,
                    [CourseApplicationId] int NOT NULL,
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

                INSERT INTO [dbo].[Payments] (
                    [CourseApplicationId], [Amount], [Currency], [Status],
                    [StripeCheckoutSessionId], [CheckoutExpiresAt],
                    [StripePaymentIntentId], [CreatedAt], [PaidAt])
                SELECT
                    appMap.[NewId],
                    payment.[Amount],
                    payment.[Currency],
                    payment.[Status],
                    payment.[StripeCheckoutSessionId],
                    payment.[CheckoutExpiresAt],
                    payment.[StripePaymentIntentId],
                    payment.[CreatedAt],
                    payment.[PaidAt]
                FROM [#OldPayments] AS payment
                INNER JOIN #CourseApplicationIdMap AS appMap
                    ON appMap.[OldId] = payment.[CourseApplicationId];

                CREATE INDEX [IX_CourseApplications_CourseId]
                    ON [dbo].[CourseApplications] ([CourseId]);
                CREATE UNIQUE INDEX [IX_CourseApplications_LearnerId_CourseId]
                    ON [dbo].[CourseApplications] ([LearnerId], [CourseId]);
                CREATE UNIQUE INDEX [IX_Payments_CourseApplicationId]
                    ON [dbo].[Payments] ([CourseApplicationId]);
                CREATE UNIQUE INDEX [IX_Payments_StripeCheckoutSessionId]
                    ON [dbo].[Payments] ([StripeCheckoutSessionId])
                    WHERE [StripeCheckoutSessionId] IS NOT NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                SELECT * INTO #NewCourseApplications
                FROM [dbo].[CourseApplications];

                SELECT * INTO #NewPayments
                FROM [dbo].[Payments];

                DROP TABLE [dbo].[Payments];
                DROP TABLE [dbo].[CourseApplications];

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

                CREATE TABLE #NewCourseApplicationIdMap (
                    [OldId] int NOT NULL PRIMARY KEY,
                    [NewId] uniqueidentifier NOT NULL
                );

                INSERT INTO #NewCourseApplicationIdMap ([OldId], [NewId])
                SELECT [Id], NEWID()
                FROM #NewCourseApplications;

                INSERT INTO [dbo].[CourseApplications] (
                    [Id], [LearnerId], [CourseId], [CourseName],
                    [Amount], [Status], [CreatedAt])
                SELECT
                    appMap.[NewId],
                    CONVERT(nvarchar(450), app.[LearnerId]),
                    app.[CourseId],
                    app.[CourseName],
                    app.[Amount],
                    app.[Status],
                    app.[CreatedAt]
                FROM #NewCourseApplications AS app
                INNER JOIN #NewCourseApplicationIdMap AS appMap
                    ON appMap.[OldId] = app.[Id];

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

                INSERT INTO [dbo].[Payments] (
                    [Id], [CourseApplicationId], [Amount], [Currency], [Status],
                    [StripeCheckoutSessionId], [CheckoutExpiresAt],
                    [StripePaymentIntentId], [CreatedAt], [PaidAt])
                SELECT
                    NEWID(),
                    appMap.[NewId],
                    payment.[Amount],
                    payment.[Currency],
                    payment.[Status],
                    payment.[StripeCheckoutSessionId],
                    payment.[CheckoutExpiresAt],
                    payment.[StripePaymentIntentId],
                    payment.[CreatedAt],
                    payment.[PaidAt]
                FROM #NewPayments AS payment
                INNER JOIN #NewCourseApplicationIdMap AS appMap
                    ON appMap.[OldId] = payment.[CourseApplicationId];

                CREATE INDEX [IX_CourseApplications_CourseId]
                    ON [dbo].[CourseApplications] ([CourseId]);
                CREATE UNIQUE INDEX [IX_CourseApplications_LearnerId_CourseId]
                    ON [dbo].[CourseApplications] ([LearnerId], [CourseId]);
                CREATE UNIQUE INDEX [IX_Payments_CourseApplicationId]
                    ON [dbo].[Payments] ([CourseApplicationId]);
                CREATE UNIQUE INDEX [IX_Payments_StripeCheckoutSessionId]
                    ON [dbo].[Payments] ([StripeCheckoutSessionId])
                    WHERE [StripeCheckoutSessionId] IS NOT NULL;
                """);
        }
    }
}

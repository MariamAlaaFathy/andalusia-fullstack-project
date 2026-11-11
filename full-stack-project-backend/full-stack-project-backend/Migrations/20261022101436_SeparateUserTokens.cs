using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class SeparateUserTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserTokens",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshTokenExpiry = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTokens", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql("""
                INSERT INTO [UserTokens] ([UserId], [RefreshToken], [RefreshTokenExpiry])
                SELECT [UserId], [RefreshToken], [RefreshTokenExpiry]
                FROM [Users]
                WHERE [RefreshToken] IS NOT NULL OR [RefreshTokenExpiry] IS NOT NULL;
                """);

            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpiry",
                table: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiry",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE [Users]
                SET [RefreshToken] = [UserTokens].[RefreshToken],
                    [RefreshTokenExpiry] = [UserTokens].[RefreshTokenExpiry]
                FROM [Users]
                INNER JOIN [UserTokens] ON [Users].[UserId] = [UserTokens].[UserId];
                """);

            migrationBuilder.DropTable(
                name: "UserTokens");
        }
    }
}

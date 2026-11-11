using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace full_stack_project_backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordResetTokens : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetTokenExpiry",
                table: "UserTokens",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetTokenHash",
                table: "UserTokens",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTokens_PasswordResetTokenHash",
                table: "UserTokens",
                column: "PasswordResetTokenHash",
                unique: true,
                filter: "[PasswordResetTokenHash] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserTokens_PasswordResetTokenHash",
                table: "UserTokens");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenExpiry",
                table: "UserTokens");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenHash",
                table: "UserTokens");
        }
    }
}

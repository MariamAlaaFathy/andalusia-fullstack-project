using full_stack_project_backend.Data;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Repository
{
    public class AdminRepository : IAdminRepository
    {
        private readonly AppDbcontext _context;

        public AdminRepository(AppDbcontext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<UserDto>> GetUsers()
        {
            var users = await _context.Users
                .AsNoTracking()
                .OrderBy(user => user.UserId)
                .ToListAsync();

            return users.Select(ToDto).ToList();
        }

        public async Task<UserDto?> GetUserById(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.UserId == userId);

            return user is null ? null : ToDto(user);
        }

        public async Task<UserDto> CreateUser(UserDto user)
        {
            var entity = new User
            {
                Username = user.Username,
                Email = user.Email,
                Password = user.Password,
                Role = user.Role,
                IsAdmin = user.IsAdmin
            };

            _context.Users.Add(entity);
            await _context.SaveChangesAsync();

            return ToDto(entity);
        }

        public async Task<UserDto?> UpdateUser(int userId, UserDto user)
        {
            var entity = await _context.Users
                .FirstOrDefaultAsync(item => item.UserId == userId);

            if (entity is null)
                return null;

            entity.Username = user.Username;
            entity.Email = user.Email;
            if (!string.IsNullOrWhiteSpace(user.Password))
                entity.Password = user.Password;
            entity.Role = user.Role;
            entity.IsAdmin = user.IsAdmin;

            await _context.SaveChangesAsync();
            return ToDto(entity);
        }

        public async Task<bool> DeleteUser(int userId)
        {
            var entity = await _context.Users
                .FirstOrDefaultAsync(item => item.UserId == userId);

            if (entity is null)
                return false;

            _context.Users.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        private static UserDto ToDto(User user)
        {
            return new UserDto
            {
                Username = user.Username,
                Email = user.Email,
                Password = string.Empty,
                Role = user.Role,
                IsAdmin = user.IsAdmin
            };
        }
    }
}

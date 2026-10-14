using full_stack_project_backend.Data;
using full_stack_project_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Repository
{

    public class UserRepository : IUserRepository
    {
        private readonly AppDbcontext _context;
        public UserRepository(AppDbcontext context)
        {
            _context = context;
        }
        public async Task<User> CreateUser(User user)
        {
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<bool> DeleteUser(int userId)
        {
            var user = await _context.Users
             .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
                return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<User?> GetUserById(int id)
        {
            return await _context.Users
       .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User?> GetByEmail(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByRefreshToken(string refreshToken)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        }

        
        public async Task<User?> UpdateUser(int id, User updatedUser)
        {
            var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                return null;

            if (!string.IsNullOrEmpty(updatedUser.Password))
                user.Password = updatedUser.Password;

            if (!string.IsNullOrEmpty(updatedUser.Email))
                user.Email = updatedUser.Email;

            if (!string.IsNullOrEmpty(updatedUser.Username))
                user.Username = updatedUser.Username;

            if (!string.IsNullOrEmpty(updatedUser.RefreshToken))
                user.RefreshToken = updatedUser.RefreshToken;

            if (updatedUser.RefreshTokenExpiry.HasValue)
                user.RefreshTokenExpiry = updatedUser.RefreshTokenExpiry;

            await _context.SaveChangesAsync();

            return user;
        }

        public async Task RevokeRefreshToken(int userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(existingUser => existingUser.UserId == userId);

            if (user == null)
                return;

            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            await _context.SaveChangesAsync();
        }
    }
}

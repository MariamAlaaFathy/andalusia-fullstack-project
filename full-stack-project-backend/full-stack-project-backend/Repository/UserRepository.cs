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
                .Include(user => user.UserToken)
                .FirstOrDefaultAsync(user => user.UserToken != null
                    && user.UserToken.RefreshToken == refreshToken);
        }

        public async Task SetRefreshToken(int userId, string refreshToken, DateTime expiry)
        {
            var userToken = await _context.UserTokens.FindAsync(userId);
            if (userToken == null)
            {
                userToken = new UserToken { UserId = userId };
                _context.UserTokens.Add(userToken);
            }

            userToken.RefreshToken = refreshToken;
            userToken.RefreshTokenExpiry = expiry;
            await _context.SaveChangesAsync();
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

            await _context.SaveChangesAsync();

            return user;
        }

        public async Task RevokeRefreshToken(int userId)
        {
            var userToken = await _context.UserTokens.FindAsync(userId);
            if (userToken == null)
                return;

            _context.UserTokens.Remove(userToken);
            await _context.SaveChangesAsync();
        }
    }
}

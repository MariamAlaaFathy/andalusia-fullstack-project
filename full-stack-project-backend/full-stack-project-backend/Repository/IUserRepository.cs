using full_stack_project_backend.Models;

namespace full_stack_project_backend.Repository
{
    public interface IUserRepository
    {
        public Task<User> CreateUser(User user);

        public Task<User?> GetByEmail(string email);
        public Task<User?> GetByRefreshToken(string refreshToken);

        public Task<bool> DeleteUser(int userId);
        public Task<User?> UpdateUser(int id, User user);

        public Task<User?> GetUserById(int userId);
        public Task RevokeRefreshToken(int userId);
    }
}

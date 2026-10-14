using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;

namespace full_stack_project_backend.Services
{
    public interface IUserServices
    {
        public Task<User> CreateUser(UserDto dto);
        public Task<User?> UpdateUser(int id, User updatedUser);
        public Task<bool> DeleteUser(int id);
        public Task<User?> GetUserById(int id);
    }
}

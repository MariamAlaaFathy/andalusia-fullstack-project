using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Repository;
using Microsoft.AspNetCore.Identity;

namespace full_stack_project_backend.Services
{
    public class AdminServices : IAdminServices
    {
        private readonly IAdminRepository _adminRepository;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AdminServices(IAdminRepository adminRepository, IPasswordHasher<User> passwordHasher)
        {
            _adminRepository = adminRepository;
            _passwordHasher = passwordHasher;
        }

        public Task<IReadOnlyList<UserDto>> GetUsers() => _adminRepository.GetUsers();

        public Task<UserDto?> GetUserById(int userId) => _adminRepository.GetUserById(userId);

        public async Task<UserDto> CreateUser(UserDto user)
        {
            user.Password = _passwordHasher.HashPassword(new User(), user.Password);
            return await _adminRepository.CreateUser(user);
        }

        public async Task<UserDto?> UpdateUser(int userId, UserDto user)
        {
            if (!string.IsNullOrWhiteSpace(user.Password))
                user.Password = _passwordHasher.HashPassword(new User(), user.Password);

            return await _adminRepository.UpdateUser(userId, user);
        }

        public async Task<UserDto?> AssignRole(int userId, string role, bool isAdmin)
        {
            var user = await _adminRepository.GetUserById(userId);
            if (user is null)
                return null;

            user.Role = role;
            user.IsAdmin = isAdmin;
            return await _adminRepository.UpdateUser(userId, user);
        }

        public Task<bool> DeleteUser(int userId) => _adminRepository.DeleteUser(userId);
    }
}

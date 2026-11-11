using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Repository;

namespace full_stack_project_backend.Services
{
    public class UserServices : IUserServices
    {
        private readonly IUserRepository _userRepository;
        private readonly Microsoft.AspNetCore.Identity.IPasswordHasher<User> _passwordHasher;
        private readonly INotificationService _notificationService;

        public UserServices(
            IUserRepository userRepository,
            Microsoft.AspNetCore.Identity.IPasswordHasher<User> passwordHasher,
            INotificationService notificationService)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _notificationService = notificationService;
        }

        public async Task<User> CreateUser(UserDto dto)
        {
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                Role = "Learner"
            };

            user.Password = _passwordHasher.HashPassword(user, dto.Password);

            var createdUser = await _userRepository.CreateUser(user);
            await _notificationService.CreateAsync(
                createdUser.UserId,
                $"Welcome to Andalusia Academy, {createdUser.Username}! Your learner account is ready.",
                CancellationToken.None);
            return createdUser;
        }

        public async Task<User?> UpdateUser(int id, User updatedUser)
        {
            if (!string.IsNullOrEmpty(updatedUser.Password))
            {
                updatedUser.Password = _passwordHasher.HashPassword(updatedUser, updatedUser.Password);
            }

            return await _userRepository.UpdateUser(id, updatedUser);
        }

        public async Task<bool> DeleteUser(int id)
        {
            return await _userRepository.DeleteUser(id);
        }


        public async Task<User?> GetUserById(int id)
        {
            return await _userRepository.GetUserById(id);
        }
    }
}

using full_stack_project_backend.DTOs;

namespace full_stack_project_backend.Repository
{
    public interface IAdminRepository
    {
        Task<IReadOnlyList<UserDto>> GetUsers();
        Task<UserDto?> GetUserById(int userId);
        Task<UserDto> CreateUser(UserDto user);
        Task<UserDto?> UpdateUser(int userId, UserDto user);
        Task<bool> DeleteUser(int userId);
    }
}

using full_stack_project_backend.DTOs;

namespace full_stack_project_backend.Services
{
    public interface IAdminServices
    {
        Task<IReadOnlyList<UserDto>> GetUsers();
        Task<UserDto?> GetUserById(int userId);
        Task<UserDto> CreateUser(UserDto user);
        Task<UserDto?> UpdateUser(int userId, UserDto user);
        Task<UserDto?> AssignRole(int userId, string role);
        Task<UserDto?> SetUserActive(int userId, bool isActive);
        Task<bool> DeleteUser(int userId);
        Task<bool?> AssignInstructorToCourse(
            int courseId,
            int instructorId,
            CancellationToken cancellationToken);
        Task<bool> RemoveInstructorFromCourse(
            int courseId,
            int instructorId,
            CancellationToken cancellationToken);
    }
}

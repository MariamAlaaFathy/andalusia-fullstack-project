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
                Bio = user.Bio,
                IsActive = user.IsActive
            
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
            entity.Bio = user.Bio;

            await _context.SaveChangesAsync();
            return ToDto(entity);
        }

        public async Task<UserDto?> SetUserActive(int userId, bool isActive)
        {
            var entity = await _context.Users
                .Include(user => user.UserToken)
                .FirstOrDefaultAsync(item => item.UserId == userId);
            if (entity is null)
                return null;

            entity.IsActive = isActive;
            if (!isActive && entity.UserToken is not null)
                _context.UserTokens.Remove(entity.UserToken);

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

        public async Task<bool?> AssignInstructorToCourse(
            int courseId,
            int instructorId,
            CancellationToken cancellationToken)
        {
            var courseExists = await _context.Courses
                .AnyAsync(course => course.Id == courseId, cancellationToken);
            var instructorExists = await _context.Users
                .AnyAsync(
                    user => user.UserId == instructorId &&
                        user.Role == UserRoles.Instructor,
                    cancellationToken);
            if (!courseExists || !instructorExists)
                return null;

            var assignmentExists = await _context.CourseInstructors
                .AnyAsync(
                    assignment => assignment.CourseId == courseId &&
                        assignment.InstructorId == instructorId,
                    cancellationToken);
            if (assignmentExists)
                return false;

            _context.CourseInstructors.Add(new CourseInstructor
            {
                CourseId = courseId,
                InstructorId = instructorId
            });
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<bool> RemoveInstructorFromCourse(
            int courseId,
            int instructorId,
            CancellationToken cancellationToken)
        {
            var assignment = await _context.CourseInstructors
                .FirstOrDefaultAsync(
                    item => item.CourseId == courseId &&
                        item.InstructorId == instructorId,
                    cancellationToken);
            if (assignment is null)
                return false;

            _context.CourseInstructors.Remove(assignment);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        private static UserDto ToDto(User user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Password = string.Empty,
                Role = user.Role,
                Bio = user.Bio,
                IsActive = user.IsActive
            
            };
        }
    }
}

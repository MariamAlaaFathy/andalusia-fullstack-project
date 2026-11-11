using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using full_stack_project_backend.Repository;
using System.Security.Claims;

namespace full_stack_project_backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    
    public class UserController : ControllerBase
    {
        private readonly IUserServices _userservices;
        private readonly IUserRepository _userRepository;
        private readonly IAuthService _authService;

        public UserController(
            IUserServices userservices,
            IUserRepository userRepository,
            IAuthService authService)
        {
            _userservices = userservices;
            _userRepository = userRepository;
            _authService = authService;
        }

        [AllowAnonymous]
        [HttpPost]
        [HttpPost("~/api/auth/register")]
        public async Task<IActionResult> CreateUser([FromBody] UserDto dto)
        {
            if (await _userRepository.GetByEmail(dto.Email) != null)
                return Conflict(new { message = "An account with this email already exists." });

            var user = await _userservices.CreateUser(dto);

            return Ok(new { user.UserId, user.Username, user.Email, user.Role });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            if (!IsCurrentUser(id))
                return Forbid();

            var user = await _userservices.GetUserById(id);

            if (user == null)
                return NotFound();

            return Ok(new { user.UserId, user.Username, user.Email, user.Bio });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User updatedUser)
        {
            if (!IsCurrentUser(id))
                return Forbid();

            var user = await _userservices.UpdateUser(id, updatedUser);

            if (user == null)
                return NotFound();

            return Ok(new { user.UserId, user.Username, user.Email, user.Bio });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            if (!IsCurrentUser(id))
                return Forbid();

            var deleted = await _userservices.DeleteUser(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost("login")]
        [HttpPost("~/api/auth/login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(
                dto,
                HttpContext.RequestAborted);

            return result.Session is null
                ? Unauthorized(new { message = result.ErrorMessage })
                : Ok(result.Session);
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshDto dto)
        {
            var result = await _authService.RefreshAsync(
                dto,
                HttpContext.RequestAborted);

            return result.Session is null
                ? Unauthorized(new { message = result.ErrorMessage })
                : Ok(result.Session);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var user = await _userRepository.GetUserById(userId);
            if (user == null)
                return NotFound();

            await _userRepository.RevokeRefreshToken(userId);

            return NoContent();
        }

        private bool IsCurrentUser(int id) =>
            int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId)
            && userId == id;
    }
}
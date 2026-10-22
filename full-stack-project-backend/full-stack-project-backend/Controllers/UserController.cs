using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using full_stack_project_backend.Repository;
using System.Security.Claims;

namespace full_stack_project_backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserServices _userservices;
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UserController(IUserServices userservices, IUserRepository userRepository, ITokenService tokenService, IPasswordHasher<User> passwordHasher)
        {
            _userservices = userservices;
            _userRepository = userRepository;
            _tokenService = tokenService;
            _passwordHasher = passwordHasher;
        }

        [AllowAnonymous]
        [HttpPost]
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

            return Ok(new { user.UserId, user.Email });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User updatedUser)
        {
            if (!IsCurrentUser(id))
                return Forbid();

            var user = await _userservices.UpdateUser(id, updatedUser);

            if (user == null)
                return NotFound();

            return Ok(new { user.UserId, user.Email });
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
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _userRepository.GetByEmail(dto.Email);

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            var result = _passwordHasher.VerifyHashedPassword(user, user.Password, dto.Password);
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized(new { message = "Invalid credentials" });

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            await _userRepository.SetRefreshToken(
                user.UserId,
                refreshToken,
                DateTime.UtcNow.AddDays(7));

            return Ok(new
            {
                accessToken,
                refreshToken,
                expiresInMinutes = _tokenService.GetAccessTokenExpiryMinutes(),
                user = new { user.UserId, user.Username, user.Email, user.Role }
            });
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshDto dto)
        {
            var existing = await _userRepository.GetByRefreshToken(dto.RefreshToken);
            if (existing == null)
                return Unauthorized(new { message = "Invalid refresh token" });

            if (existing.UserToken?.RefreshTokenExpiry is not DateTime expiry || expiry < DateTime.UtcNow)
                return Unauthorized(new { message = "Refresh token expired" });

            var accessToken = _tokenService.GenerateAccessToken(existing);
            var newRefresh = _tokenService.GenerateRefreshToken();

            await _userRepository.SetRefreshToken(
                existing.UserId,
                newRefresh,
                DateTime.UtcNow.AddDays(7));

            return Ok(new
            {
                accessToken,
                refreshToken = newRefresh,
                expiresInMinutes = _tokenService.GetAccessTokenExpiryMinutes(),
                user = new
                {
                    existing.UserId,
                    existing.Username,
                    existing.Email,
                    existing.Role
                }
            });
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
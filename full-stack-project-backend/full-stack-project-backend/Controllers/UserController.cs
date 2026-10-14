using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using full_stack_project_backend.Repository;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;

namespace full_stack_project_backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserServices _userservices;
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;
        private readonly ITokenService _tokenService;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UserController(IUserServices userservices, IUserRepository userRepository, IConfiguration configuration, ITokenService tokenService, IPasswordHasher<User> passwordHasher)
        {
            _userservices = userservices;
            _userRepository = userRepository;
            _configuration = configuration;
            _tokenService = tokenService;
            _passwordHasher = passwordHasher;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserDto dto)
        {
            var user = await _userservices.CreateUser(dto);

            return Ok(new { user.UserId, user.Email });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userservices.GetUserById(id);

            if (user == null)
                return NotFound();

            return Ok(new { user.UserId, user.Email });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User updatedUser)
        {
            var user = await _userservices.UpdateUser(id, updatedUser);

            if (user == null)
                return NotFound();

            return Ok(new { user.UserId, user.Email });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
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

            var updated = new User
            {
                RefreshToken = refreshToken,
                RefreshTokenExpiry = DateTime.UtcNow.AddDays(7)
            };

            await _userRepository.UpdateUser(user.UserId, updated);

            return Ok(new { accessToken, refreshToken, expiresInMinutes = _tokenService.GetAccessTokenExpiryMinutes() });
        }

        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshDto dto)
        {
            var existing = await _userRepository.GetByRefreshToken(dto.RefreshToken);
            if (existing == null)
                return Unauthorized(new { message = "Invalid refresh token" });

            if (!existing.RefreshTokenExpiry.HasValue || existing.RefreshTokenExpiry.Value < DateTime.UtcNow)
                return Unauthorized(new { message = "Refresh token expired" });

            var accessToken = _tokenService.GenerateAccessToken(existing);
            var newRefresh = _tokenService.GenerateRefreshToken();

            var updated = new User
            {
                RefreshToken = newRefresh,
                RefreshTokenExpiry = DateTime.UtcNow.AddDays(7)
            };

            await _userRepository.UpdateUser(existing.UserId, updated);

            return Ok(new { accessToken, refreshToken = newRefresh, expiresInMinutes = _tokenService.GetAccessTokenExpiryMinutes() });
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

            var updated = new User
            {
                RefreshToken = null,
                RefreshTokenExpiry = null
            };

            await _userRepository.UpdateUser(userId, updated);

            return NoContent();
        }
    }
}
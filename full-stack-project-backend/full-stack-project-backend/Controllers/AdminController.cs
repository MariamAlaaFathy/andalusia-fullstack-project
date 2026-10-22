using full_stack_project_backend.DTOs;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace full_stack_project_backend.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminServices _adminServices;

        public AdminController(IAdminServices adminServices)
        {
            _adminServices = adminServices;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers() => Ok(await _adminServices.GetUsers());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _adminServices.GetUserById(id);
            return user is null ? NotFound() : Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserDto user)
        {
            return Ok(await _adminServices.CreateUser(user));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserDto user)
        {
            var updated = await _adminServices.UpdateUser(id, user);
            return updated is null ? NotFound() : Ok(updated);
        }

        [HttpPatch("{id:int}/role")]
        public async Task<IActionResult> AssignRole(int id, [FromBody] RoleAssignmentDto assignment)
        {
            var updated = await _adminServices.AssignRole(id, assignment.Role, assignment.IsAdmin);
            return updated is null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            return await _adminServices.DeleteUser(id) ? NoContent() : NotFound();
        }
    }
}

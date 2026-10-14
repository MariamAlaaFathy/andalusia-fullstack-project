using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Mvc;
<<<<<<< HEAD
using Microsoft.AspNetCore.Authorization;
=======
>>>>>>> 8e79a0b19b404d7fd483f8628b4c610b2474a23e

namespace full_stack_project_backend.Controllers;

[ApiController]
[Route("api/Programs")]
<<<<<<< HEAD
[Authorize]
=======
>>>>>>> 8e79a0b19b404d7fd483f8628b4c610b2474a23e
public sealed class ProgramsController(IProgramServices programServices) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPrograms(
        [FromQuery] PaginatedParam pagination,
        CancellationToken cancellationToken)
    {
        var result = await programServices.GetProgramsAsync(pagination, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProgram(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await programServices.GetProgramByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}

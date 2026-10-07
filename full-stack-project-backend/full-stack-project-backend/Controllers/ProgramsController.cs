using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Route("api/Programs")]
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

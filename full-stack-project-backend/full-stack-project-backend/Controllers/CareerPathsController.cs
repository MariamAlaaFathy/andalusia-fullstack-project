using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Route("api/CareerPaths")]
public sealed class CareerPathsController(ICareerPathServices careerPathServices)
    : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCareerPaths(
        [FromQuery] PaginatedParam pagination,
        CancellationToken cancellationToken)
    {
        var result = await careerPathServices.GetCareerPathsAsync(
            pagination,
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCareerPath(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await careerPathServices.GetCareerPathByIdAsync(
            id,
            cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }
}

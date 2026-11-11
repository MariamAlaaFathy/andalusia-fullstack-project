using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using full_stack_project_backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ProgramEntity = full_stack_project_backend.Models.Program;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Route("api/Programs")]
[Authorize]
public sealed class ProgramsController(
    IProgramServices programServices,
    AppDbcontext dbContext) : ControllerBase
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

    [HttpPost]
    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    public async Task<IActionResult> CreateProgram(
        ProgramRequest request,
        CancellationToken cancellationToken)
    {
        if (!await dbContext.CareerPaths.AnyAsync(
                item => item.Id == request.CareerPathId,
                cancellationToken))
            return BadRequest(new { message = "Career path not found." });

        var program = new ProgramEntity
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            CareerPathId = request.CareerPathId
        };
        dbContext.Programs.Add(program);
        await dbContext.SaveChangesAsync(cancellationToken);
        var result = await programServices.GetProgramByIdAsync(program.Id, cancellationToken);
        return CreatedAtAction(nameof(GetProgram), new { id = program.Id }, result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    public async Task<IActionResult> UpdateProgram(
        int id,
        ProgramRequest request,
        CancellationToken cancellationToken)
    {
        var program = await dbContext.Programs.FindAsync([id], cancellationToken);
        if (program is null) return NotFound();
        if (!await dbContext.CareerPaths.AnyAsync(
                item => item.Id == request.CareerPathId,
                cancellationToken))
            return BadRequest(new { message = "Career path not found." });

        program.Name = request.Name.Trim();
        program.Description = request.Description.Trim();
        program.CareerPathId = request.CareerPathId;
        await dbContext.SaveChangesAsync(cancellationToken);
        var result = await programServices.GetProgramByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    public async Task<IActionResult> DeleteProgram(int id, CancellationToken cancellationToken)
    {
        var program = await dbContext.Programs.FindAsync([id], cancellationToken);
        if (program is null) return NotFound();
        if (await dbContext.Courses.AnyAsync(course => course.ProgramId == id, cancellationToken))
            return Conflict(new { message = "This program cannot be deleted while courses reference it." });

        dbContext.Programs.Remove(program);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}

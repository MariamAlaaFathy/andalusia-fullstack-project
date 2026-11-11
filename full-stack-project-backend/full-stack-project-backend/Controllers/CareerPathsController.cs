using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Services;
using full_stack_project_backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Route("api/CareerPaths")]
[Authorize]
public sealed class CareerPathsController(
    ICareerPathServices careerPathServices,
    AppDbcontext dbContext)
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

    [HttpPost]
    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    public async Task<IActionResult> CreateCareerPath(
        CareerPathRequest request,
        CancellationToken cancellationToken)
    {
        var careerPath = new CareerPath
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Skills = NormalizeSkills(request.Skills)
                .Select(name => new CareerPathSkill { Name = name })
                .ToList()
        };
        dbContext.CareerPaths.Add(careerPath);
        await dbContext.SaveChangesAsync(cancellationToken);
        var result = await careerPathServices.GetCareerPathByIdAsync(careerPath.Id, cancellationToken);
        return CreatedAtAction(nameof(GetCareerPath), new { id = careerPath.Id }, result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    public async Task<IActionResult> UpdateCareerPath(
        int id,
        CareerPathRequest request,
        CancellationToken cancellationToken)
    {
        var careerPath = await dbContext.CareerPaths
            .Include(item => item.Skills)
            .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (careerPath is null) return NotFound();

        careerPath.Name = request.Name.Trim();
        careerPath.Description = request.Description.Trim();
        var requestedSkills = NormalizeSkills(request.Skills);
        var requestedSet = requestedSkills.ToHashSet(StringComparer.OrdinalIgnoreCase);
        dbContext.CareerPathSkills.RemoveRange(
            careerPath.Skills.Where(skill => !requestedSet.Contains(skill.Name)));
        var existingSet = careerPath.Skills
            .Where(skill => requestedSet.Contains(skill.Name))
            .Select(skill => skill.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        foreach (var skill in requestedSkills.Where(skill => !existingSet.Contains(skill)))
            careerPath.Skills.Add(new CareerPathSkill { Name = skill, CareerPathId = id });

        await dbContext.SaveChangesAsync(cancellationToken);
        var result = await careerPathServices.GetCareerPathByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = UserRoles.ContentManager + "," + UserRoles.Admin)]
    public async Task<IActionResult> DeleteCareerPath(int id, CancellationToken cancellationToken)
    {
        var careerPath = await dbContext.CareerPaths.FindAsync([id], cancellationToken);
        if (careerPath is null) return NotFound();
        if (await dbContext.Programs.AnyAsync(program => program.CareerPathId == id, cancellationToken))
            return Conflict(new { message = "This career path cannot be deleted while programs reference it." });

        dbContext.CareerPaths.Remove(careerPath);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static IReadOnlyList<string> NormalizeSkills(IEnumerable<string> skills) =>
        skills.Select(skill => skill.Trim())
            .Where(skill => skill.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
}

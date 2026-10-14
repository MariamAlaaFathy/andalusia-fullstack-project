using full_stack_project_backend.DTOs;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Authorize(Roles = "Learner")]
[Route("api/applications")]
public sealed class ApplicationsController(IEnrollmentService enrollmentService)
    : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<IReadOnlyList<CourseApplicationResponse>>> GetMine(
        CancellationToken cancellationToken)
    {
        if (!TryGetLearnerId(out var learnerId)) return Unauthorized();
        return Ok(await enrollmentService.GetMineAsync(learnerId, cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CourseApplicationResponse>> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        if (!TryGetLearnerId(out var learnerId)) return Unauthorized();
        return Ok(await enrollmentService.GetByIdAsync(
            id,
            learnerId,
            cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<CourseApplicationResponse>> Create(
        CreateCourseApplicationRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetLearnerId(out var learnerId)) return Unauthorized();
        var result = await enrollmentService.CreateAsync(
            request.CourseId,
            learnerId,
            cancellationToken);
        if (!result.Created) return Ok(result.Application);

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Application.Id },
            result.Application);
    }

    private bool TryGetLearnerId(out int learnerId) =>
        int.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out learnerId) && learnerId > 0;
}

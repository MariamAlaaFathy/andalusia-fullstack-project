using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace full_stack_project_backend.Controllers;

[ApiController]
[Authorize(Policy = "AdminOnly")]
[Route("api/admin/courses/{courseId:int}/instructors")]
public sealed class AdminCourseInstructorsController(
    IAdminServices adminServices) : ControllerBase
{
    [HttpPut("{instructorId:int}")]
    public async Task<ActionResult<InstructorCourseAssignmentResponse>> Assign(
        int courseId,
        int instructorId,
        CancellationToken cancellationToken)
    {
        var result = await adminServices.AssignInstructorToCourse(
            courseId,
            instructorId,
            cancellationToken);
        if (result is null)
        {
            return NotFound(new
            {
                message = "Course or instructor account was not found."
            });
        }

        return Ok(new InstructorCourseAssignmentResponse(
            courseId,
            instructorId,
            true,
            result.Value));
    }

    [HttpDelete("{instructorId:int}")]
    public async Task<IActionResult> Remove(
        int courseId,
        int instructorId,
        CancellationToken cancellationToken)
    {
        var removed = await adminServices.RemoveInstructorFromCourse(
            courseId,
            instructorId,
            cancellationToken);
        return removed ? NoContent() : NotFound();
    }
}

public sealed record InstructorCourseAssignmentResponse(
    int CourseId,
    int InstructorId,
    bool IsAssigned,
    bool Created);

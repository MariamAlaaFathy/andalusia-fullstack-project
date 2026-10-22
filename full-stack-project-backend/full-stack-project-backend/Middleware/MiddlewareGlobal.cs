using Microsoft.AspNetCore.Mvc;

namespace Assignment_3.Middleware
{
    public class MiddlewareGlobal
    {
        private readonly RequestDelegate _next;

        private readonly ILogger<MiddlewareGlobal> _logger;

        public MiddlewareGlobal(
            RequestDelegate next,
            ILogger<MiddlewareGlobal> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (NotFoundException ex)
            {
                await WriteProblemAsync(context, StatusCodes.Status404NotFound, "Not found", ex.Message);
            }
            catch (ConflictException ex)
            {
                await WriteProblemAsync(context, StatusCodes.Status409Conflict, "Conflict", ex.Message);
            }
            catch (RequestValidationException ex)
            {
                await WriteProblemAsync(context, StatusCodes.Status400BadRequest, "Invalid request", ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                await WriteProblemAsync(context, StatusCodes.Status401Unauthorized, "Unauthorized", ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Unhandled exception while processing {Method} {Path}.",
                    context.Request.Method,
                    context.Request.Path);
                await WriteProblemAsync(
                    context,
                    StatusCodes.Status500InternalServerError,
                    "Internal server error",
                    "An unexpected error occurred.");
            }
        }

        private static async Task WriteProblemAsync(
            HttpContext context,
            int statusCode,
            string title,
            string detail)
        {
            if (context.Response.HasStarted) return;
            context.Response.Clear();
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/problem+json";
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Title = title,
                Status = statusCode,
                Detail = detail
            });
        }
    }
}

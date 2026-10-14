using Microsoft.AspNetCore.Mvc;

namespace Assignment_3.Middleware
{
    public class MiddlewareGlobal
    {
        private readonly RequestDelegate _next;

        public MiddlewareGlobal(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (NotFoundException ex)
            {

                var problem = new ProblemDetails
                {
                    Title = "Not found",
                    Status = 404,
                    Detail = ex.Message,
                };

                context.Response.StatusCode = 404;

                context.Response.ContentType = "application/problem+json";
                await context.Response.WriteAsJsonAsync(problem);


            }
            catch (ConflictException ex)
            {
                var problem = new ProblemDetails
                {
                    Title = "conflict",
                    Status = 409,
                    Detail = ex.Message,
                };
                context.Response.StatusCode = 409;
                context.Response.ContentType = "application/problem+json";

                await context.Response.WriteAsJsonAsync(problem);

            }
            catch (Exception ex)
            {
                var problem = new ProblemDetails
                {
                    Title = "Internal error",
                    Status = 500,
                    Detail = "An unexpected error occured",
                };
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/problem+json";

                await context.Response.WriteAsJsonAsync(problem);


            }
        }
    }
}

namespace Assignment_3.Middleware
{
    public class ConflictMiddleware
    {
        private RequestDelegate _next;

        public ConflictMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (ConflictException ex)
            {
                context.Response.StatusCode = 409;

                await context.Response.WriteAsync("task already exists");
            }

        }


    }
}

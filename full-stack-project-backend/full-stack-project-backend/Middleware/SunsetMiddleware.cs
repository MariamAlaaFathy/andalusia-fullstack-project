namespace Assignment_3.Middleware
{
    public class SunsetMiddleware
    {
        private readonly RequestDelegate _next;


        public SunsetMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            if (context.Request.Path.StartsWithSegments("/api/v1"))
            {
                context.Response.Headers.Append("sunset", "date here ");

            }

            await _next(context);
        }
    }
}

using System.Text;
using Assignment_3.Middleware;
using full_stack_project_backend.Data;
using full_stack_project_backend.Mapping;
using full_stack_project_backend.Models;
using full_stack_project_backend.Repository;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ICourseServices, CourseServices>();
builder.Services.AddScoped<IProgramRepository, ProgramRepository>();
builder.Services.AddScoped<IProgramServices, ProgramServices>();
builder.Services.AddScoped<ICareerPathRepository, CareerPathRepository>();
builder.Services.AddScoped<ICareerPathServices, CareerPathServices>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserServices, UserServices>();
builder.Services.AddScoped<IAdminRepository, AdminRepository>();
builder.Services.AddScoped<IAdminServices, AdminServices>();

builder.Services.AddScoped<Microsoft.AspNetCore.Identity.IPasswordHasher<full_stack_project_backend.Models.User>, Microsoft.AspNetCore.Identity.PasswordHasher<full_stack_project_backend.Models.User>>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<DemoUserSeeder>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<ICourseProgressService, CourseProgressService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IInstructorService, InstructorService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

builder.Services.AddControllers();
builder.Services.AddAutoMapper(configuration =>
    configuration.AddProfile<MappingProfile>());
builder.Services.AddDbContext<AppDbcontext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "Configure Jwt:Key with a secret of at least 32 bytes.");
if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException(
        "Jwt:Key must be at least 32 bytes long.");
}
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = ClaimTypes.Role
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var userIdValue = context.Principal?
                    .FindFirstValue(ClaimTypes.NameIdentifier);
                var role = context.Principal?.FindFirstValue(ClaimTypes.Role);
                if (!int.TryParse(userIdValue, out var userId) ||
                    string.IsNullOrWhiteSpace(role))
                {
                    context.Fail("The account token is invalid.");
                    return;
                }

                var dbContext = context.HttpContext.RequestServices
                    .GetRequiredService<AppDbcontext>();
                var account = await dbContext.Users
                    .AsNoTracking()
                    .Where(user => user.UserId == userId)
                    .Select(user => new
                    {
                        user.IsActive,
                        user.Role,
                        user.Username
                    })
                    .FirstOrDefaultAsync(context.HttpContext.RequestAborted);

                if (account is null ||
                    !account.IsActive ||
                    !string.Equals(account.Role, role, StringComparison.Ordinal) ||
                    !string.Equals(
                        account.Username,
                        context.Principal?.FindFirstValue(ClaimTypes.Name),
                        StringComparison.Ordinal))
                {
                    context.Fail("The account is inactive or its role has changed.");
                }
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
        policy.RequireAuthenticatedUser()
              .RequireRole("Admin"));
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    await using var scope = app.Services.CreateAsyncScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbcontext>();
    await dbContext.Database.MigrateAsync();

    var demoUserSeeder = scope.ServiceProvider.GetRequiredService<DemoUserSeeder>();
    await demoUserSeeder.SeedAsync();
}

app.UseMiddleware<MiddlewareGlobal>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

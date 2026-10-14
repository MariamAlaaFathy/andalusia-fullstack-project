using FluentValidation;
using FluentValidation.AspNetCore;
using Assignment_3.Middleware;
using full_stack_project_backend.Data;
using full_stack_project_backend.Mapping;
using full_stack_project_backend.Repository;
using full_stack_project_backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);



// Add services to the container.
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ICourseServices, CourseServices>();
builder.Services.AddScoped<IProgramRepository, ProgramRepository>();
builder.Services.AddScoped<IProgramServices, ProgramServices>();
builder.Services.AddScoped<ICareerPathRepository, CareerPathRepository>();
builder.Services.AddScoped<ICareerPathServices, CareerPathServices>();
builder.Services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddHttpClient<StripeCheckoutService>();
builder.Services.Configure<StripeOptions>(
    builder.Configuration.GetSection(StripeOptions.SectionName));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserServices, UserServices>();
builder.Services.AddScoped<Microsoft.AspNetCore.Identity.IPasswordHasher<full_stack_project_backend.Models.User>, Microsoft.AspNetCore.Identity.PasswordHasher<full_stack_project_backend.Models.User>>();
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddControllers();
var jwtSigningKey = builder.Configuration["Authentication:Jwt:SigningKey"];
var signingKeyBytes = string.IsNullOrWhiteSpace(jwtSigningKey)
    ? RandomNumberGenerator.GetBytes(32)
    : Encoding.UTF8.GetBytes(jwtSigningKey);
if (signingKeyBytes.Length < 32)
{
    throw new InvalidOperationException(
        "Authentication:Jwt:SigningKey must contain at least 32 UTF-8 bytes.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(signingKeyBytes),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Authentication:Jwt:Issuer"]
                ?? "andalusia-academy",
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Authentication:Jwt:Audience"]
                ?? "andalusia-academy-api",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddAutoMapper(configuration =>
    configuration.AddProfile<MappingProfile>());
builder.Services.AddDbContext<AppDbcontext>(options =>
        options.UseSqlServer(
            builder.Configuration.GetConnectionString("DefaultConnection")
            )
);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();

if (string.IsNullOrWhiteSpace(jwtSigningKey))
{
    app.Logger.LogWarning(
        "Authentication:Jwt:SigningKey is not configured. A temporary key is being used, so authentication tokens will not survive an API restart.");
}

// Configure the HTTP request pipeline.
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

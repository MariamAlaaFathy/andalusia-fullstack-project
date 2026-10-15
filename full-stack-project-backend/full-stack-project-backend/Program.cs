using FluentValidation;
using FluentValidation.AspNetCore;
using full_stack_project_backend.Data;
using full_stack_project_backend.Mapping;
using full_stack_project_backend.Repository;
using full_stack_project_backend.Services;
<<<<<<< HEAD
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
=======
>>>>>>> 8e79a0b19b404d7fd483f8628b4c610b2474a23e
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);



// Add services to the container.
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ICourseServices, CourseServices>();
builder.Services.AddScoped<IProgramRepository, ProgramRepository>();
builder.Services.AddScoped<IProgramServices, ProgramServices>();
builder.Services.AddScoped<ICareerPathRepository, CareerPathRepository>();
builder.Services.AddScoped<ICareerPathServices, CareerPathServices>();
<<<<<<< HEAD
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserServices, UserServices>();
builder.Services.AddScoped<Microsoft.AspNetCore.Identity.IPasswordHasher<full_stack_project_backend.Models.User>, Microsoft.AspNetCore.Identity.PasswordHasher<full_stack_project_backend.Models.User>>();
builder.Services.AddScoped<ITokenService, TokenService>();
=======
>>>>>>> 8e79a0b19b404d7fd483f8628b4c610b2474a23e

builder.Services.AddControllers();
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

<<<<<<< HEAD
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

=======
>>>>>>> 8e79a0b19b404d7fd483f8628b4c610b2474a23e
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

<<<<<<< HEAD
app.UseAuthentication();

=======
>>>>>>> 8e79a0b19b404d7fd483f8628b4c610b2474a23e
app.UseAuthorization();

app.MapControllers();

app.Run();

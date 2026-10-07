using FluentValidation;
using FluentValidation.AspNetCore;
using full_stack_project_backend.Data;
using full_stack_project_backend.Mapping;
using full_stack_project_backend.Repository;
using full_stack_project_backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);



// Add services to the container.
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ICourseServices, CourseServices>();
builder.Services.AddScoped<IProgramRepository, ProgramRepository>();
builder.Services.AddScoped<IProgramServices, ProgramServices>();
builder.Services.AddScoped<ICareerPathRepository, CareerPathRepository>();
builder.Services.AddScoped<ICareerPathServices, CareerPathServices>();

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

app.UseAuthorization();

app.MapControllers();

app.Run();

using AutoMapper;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using ProgramEntity = full_stack_project_backend.Models.Program;

namespace full_stack_project_backend.Mapping;

public sealed class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Course, CourseDto>()
            .ForCtorParam(
                nameof(CourseDto.ProgramName),
                options => options.MapFrom(course => course.Program.Name))
            .ForCtorParam(
                nameof(CourseDto.CareerPathId),
                options => options.MapFrom(course => course.Program.CareerPathId))
            .ForCtorParam(
                nameof(CourseDto.CareerPathName),
                options => options.MapFrom(course => course.Program.CareerPath.Name));

        CreateMap<Course, ProgramCourseDto>();
        CreateMap<Course, CareerPathCourseDto>();

        CreateMap<ProgramEntity, ProgramDto>()
            .ForCtorParam(
                nameof(ProgramDto.CareerPathName),
                options => options.MapFrom(program => program.CareerPath.Name))
            .ForCtorParam(
                nameof(ProgramDto.Courses),
                options => options.MapFrom(program =>
                    program.Courses.OrderBy(course => course.Name)));

        CreateMap<ProgramEntity, CareerPathProgramDto>()
            .ForCtorParam(
                nameof(CareerPathProgramDto.Courses),
                options => options.MapFrom(program =>
                    program.Courses.OrderBy(course => course.Name)));

        CreateMap<CareerPath, CareerPathDto>()
            .ForCtorParam(
                nameof(CareerPathDto.Skills),
                options => options.MapFrom(careerPath =>
                    careerPath.Skills.OrderBy(skill => skill.Id).Select(skill => skill.Name)))
            .ForCtorParam(
                nameof(CareerPathDto.Programs),
                options => options.MapFrom(careerPath =>
                    careerPath.Programs.OrderBy(program => program.Name)));
    }
}

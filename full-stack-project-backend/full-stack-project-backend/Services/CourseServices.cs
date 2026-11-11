using AutoMapper;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Exceptions;
using full_stack_project_backend.Models;
using full_stack_project_backend.Repository;

namespace full_stack_project_backend.Services
{
    public class CourseServices : ICourseServices
    {
        private readonly ICourseRepository _courseRepository;

        private readonly IProgramRepository _programRepository;
        private readonly IMapper _mapper;

        public CourseServices(ICourseRepository courseRepository, IMapper mapper, IProgramRepository programRepository)
        {
            _courseRepository = courseRepository;
            _mapper = mapper;
            _programRepository = programRepository;
        }
        public async Task<Pagedresult<CourseDto>> GetCoursesAsync(
            PaginatedParam paginationParams,
            CancellationToken cancellationToken)
        {
            var page = Math.Max(1, paginationParams.Page);
            var pageSize = Math.Clamp(paginationParams.PageSize, 1, 100);
            var (courses, totalCount) = await _courseRepository.GetCoursesAsync(
                paginationParams.Search,
                paginationParams.Category,
                page,
                pageSize,
                cancellationToken);

            return new Pagedresult<CourseDto>
            {
                Data = courses
                    .AsEnumerable()
                    .Select(course => _mapper.Map<CourseDto>(course))
                    .ToArray(),
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task<CourseDto?> GetCourseByIdAsync(
            int id,
            CancellationToken cancellationToken)
        {
            var course = await _courseRepository.GetCourseByIdAsync(id, cancellationToken);
            return course is null ? null : _mapper.Map<CourseDto>(course);
        }

        public async Task<CourseDto> CreateCourseAsync(CreateCourseRequest request, CancellationToken cancellationToken)
        {
            var programExists = await _programRepository.ProgramExistsAsync(
               request.ProgramId,
               cancellationToken);

            if (!programExists)
            {
                throw new KeyNotFoundException("Program not found.");
            }

           
            var course = _mapper.Map<Course>(request);

         
            var createdCourse = await _courseRepository.CreateCourseAsync(
                course,
                cancellationToken);

            return _mapper.Map<CourseDto>(createdCourse);
        }


        public async Task<CourseDto?> UpdateCourseAsync(
            int id,
            UpdateCourseRequest request,
            CancellationToken cancellationToken)
        {
           
            var course = await _courseRepository.GetCourseForUpdateAsync(
                id,
                cancellationToken);

            if (course is null)
            {
                return null;
            }

            
            var programExists = await _programRepository.ProgramExistsAsync(
                request.ProgramId,
                cancellationToken);

            if (!programExists)
            {
                throw new KeyNotFoundException("Program not found.");
            }

          
            _mapper.Map(request, course);

           
            await _courseRepository.UpdateCourseAsync(
                course,
                cancellationToken);

          
            var updatedCourse = await _courseRepository.GetCourseByIdAsync(
                id,
                cancellationToken);

            return updatedCourse is null
                ? null
                : _mapper.Map<CourseDto>(updatedCourse);
        }


        public async Task<bool> DeleteCourseAsync(
            int id,
            CancellationToken cancellationToken)
        {
          
            var course = await _courseRepository.GetCourseForUpdateAsync(
                id,
                cancellationToken);

         
            if (course is null)
            {
                return false;
            }

       
            var hasApplications = await _courseRepository.CourseHasApplicationsAsync( id,cancellationToken);

            if (hasApplications)
            {
                throw new CourseHasApplicationsException(
                    "This course cannot be deleted because it has student applications.");
            }

           
            await _courseRepository.DeleteCourseAsync(
                course,
                cancellationToken);

            return true;
        }


    }
}

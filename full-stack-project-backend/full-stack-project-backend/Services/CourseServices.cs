using AutoMapper;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Repository;

namespace full_stack_project_backend.Services
{
    public class CourseServices : ICourseServices
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IMapper _mapper;

        public CourseServices(ICourseRepository courseRepository, IMapper mapper)
        {
            _courseRepository = courseRepository;
            _mapper = mapper;
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
                Data = _mapper.Map<IReadOnlyList<CourseDto>>(courses),
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
    }
}

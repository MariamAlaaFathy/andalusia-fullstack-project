using AutoMapper;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Repository;

namespace full_stack_project_backend.Services;

public sealed class CareerPathServices(
    ICareerPathRepository careerPathRepository,
    IMapper mapper)
    : ICareerPathServices
{
    private readonly IMapper _mapper = mapper;

    public async Task<Pagedresult<CareerPathDto>> GetCareerPathsAsync(
        PaginatedParam pagination,
        CancellationToken cancellationToken)
    {
        var page = Math.Max(1, pagination.Page);
        var pageSize = Math.Clamp(pagination.PageSize, 1, 100);
        var (items, totalCount) = await careerPathRepository.GetCareerPathsAsync(
            pagination.Search,
            page,
            pageSize,
            cancellationToken);

        return new Pagedresult<CareerPathDto>
        {
            Data = _mapper.Map<IReadOnlyList<CareerPathDto>>(items),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<CareerPathDto?> GetCareerPathByIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var careerPath = await careerPathRepository.GetCareerPathByIdAsync(
            id,
            cancellationToken);
        return careerPath is null ? null : _mapper.Map<CareerPathDto>(careerPath);
    }
}

using AutoMapper;
using full_stack_project_backend.DTOs;
using full_stack_project_backend.Models;
using full_stack_project_backend.Repository;

namespace full_stack_project_backend.Services;

public sealed class ProgramServices(IProgramRepository programRepository, IMapper mapper)
    : IProgramServices
{
    private readonly IMapper _mapper = mapper;

    public async Task<Pagedresult<ProgramDto>> GetProgramsAsync(
        PaginatedParam pagination,
        CancellationToken cancellationToken)
    {
        var page = Math.Max(1, pagination.Page);
        var pageSize = Math.Clamp(pagination.PageSize, 1, 100);
        var (items, totalCount) = await programRepository.GetProgramsAsync(
            pagination.Search,
            page,
            pageSize,
            cancellationToken);

        return new Pagedresult<ProgramDto>
        {
            Data = _mapper.Map<IReadOnlyList<ProgramDto>>(items),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<ProgramDto?> GetProgramByIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var program = await programRepository.GetProgramByIdAsync(id, cancellationToken);
        return program is null ? null : _mapper.Map<ProgramDto>(program);
    }
}

namespace full_stack_project_backend.Models
{
    public class CourseFilterParam
    {
        public string? Search { get; set; }
        public string? Category { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}

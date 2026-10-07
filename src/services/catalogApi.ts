import type { CareerPath } from "../types/CareerPath";
import type { Coursetype } from "../types/Coursetype";
import type { PagedResult } from "../types/PagedResult";
import type { Program } from "../types/Program";

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5075"
).replace(/\/$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isCourse(value: unknown): value is Coursetype {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    typeof value.price === "number" &&
    typeof value.category === "string" &&
    typeof value.programId === "number" &&
    typeof value.programName === "string" &&
    typeof value.careerPathId === "number" &&
    typeof value.careerPathName === "string" &&
    typeof value.duration === "string" &&
    typeof value.level === "string" &&
    isStringArray(value.prerequisites) &&
    isStringArray(value.learningOutcomes)
  );
}

function isProgram(value: unknown): value is Program {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    typeof value.careerPathId === "number" &&
    typeof value.careerPathName === "string"
  );
}

function isCareerPath(value: unknown): value is CareerPath {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    isStringArray(value.skills) &&
    Array.isArray(value.programs) &&
    value.programs.every(
      (program) =>
        isRecord(program) &&
        typeof program.id === "number" &&
        typeof program.name === "string",
    )
  );
}

function isPagedResult<T>(
  value: unknown,
  isItem: (item: unknown) => item is T,
): value is PagedResult<T> {
  return (
    isRecord(value) &&
    Array.isArray(value.data) &&
    value.data.every(isItem) &&
    typeof value.page === "number" &&
    typeof value.pageSize === "number" &&
    typeof value.totalCount === "number" &&
    typeof value.totalPages === "number" &&
    typeof value.hasNextPage === "boolean" &&
    typeof value.hasPreviousPage === "boolean"
  );
}

async function readResponse<T>(
  response: Response,
  isPayload: (value: unknown) => value is T,
): Promise<T> {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      isRecord(payload) &&
      typeof payload.detail === "string"
        ? payload.detail
        : `Request failed with status ${response.status}.`;
    throw new Error(detail);
  }

  if (!isPayload(payload)) {
    throw new Error("The catalog API returned data in an unexpected format.");
  }
  return payload;
}

async function get<T>(
  path: string,
  isPayload: (value: unknown) => value is T,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new Error("Could not connect to the catalog API.", { cause: error });
  }
  return readResponse(response, isPayload);
}

function makeListUrl(
  endpoint: string,
  search: string,
  page: number,
  pageSize = 9,
  category?: string,
) {
  const params = new URLSearchParams({
    search,
    page: String(page),
    pageSize: String(pageSize),
  });
  if (category) params.set("category", category);
  return `/api/${endpoint}?${params.toString()}`;
}

export const catalogApi = {
  getCourses(
    search: string,
    category: string,
    page: number,
    signal?: AbortSignal,
    pageSize = 10,
  ): Promise<PagedResult<Coursetype>> {
    return get(
      makeListUrl("Courses", search, page, pageSize, category),
      (value): value is PagedResult<Coursetype> =>
        isPagedResult(value, isCourse),
      signal,
    );
  },

  getCourse(id: number, signal?: AbortSignal): Promise<Coursetype> {
    return get(`/api/Courses/${id}`, isCourse, signal);
  },

  getPrograms(
    search: string,
    page: number,
    signal?: AbortSignal,
  ): Promise<PagedResult<Program>> {
    return get(
      makeListUrl("Programs", search, page),
      (value): value is PagedResult<Program> =>
        isPagedResult(value, isProgram),
      signal,
    );
  },

  getProgram(id: number, signal?: AbortSignal): Promise<Program> {
    return get(`/api/Programs/${id}`, isProgram, signal);
  },

  getCareerPaths(
    search: string,
    page: number,
    signal?: AbortSignal,
  ): Promise<PagedResult<CareerPath>> {
    return get(
      makeListUrl("CareerPaths", search, page),
      (value): value is PagedResult<CareerPath> =>
        isPagedResult(value, isCareerPath),
      signal,
    );
  },

  getCareerPath(id: number, signal?: AbortSignal): Promise<CareerPath> {
    return get(`/api/CareerPaths/${id}`, isCareerPath, signal);
  },
};

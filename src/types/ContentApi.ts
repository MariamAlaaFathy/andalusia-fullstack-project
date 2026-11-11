const API_URL = import.meta.env.VITE_API_URL ?? "";

export type Lesson = {
  id: number;
  title: string;
  description: string;
  content: string;
  videoUrl: string | null;
  pdfUrl: string | null;
  order: number;
  moduleId: number;
};

export type LessonInput = Omit<Lesson, "id">;

export type CourseModuleSummary = {
  id: number;
  courseId: number;
  title: string;
  order: number;
};

export type LandingPageContent = {
  id: number;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string | null;
  callToActionText: string;
  callToActionUrl: string | null;
  updatedAtUtc: string;
};

export type LandingPageInput = Omit<LandingPageContent, "id" | "updatedAtUtc">;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      message = body?.message ?? body?.title ?? message;
    } catch {
   
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const contentApi = {
  getModules: (signal?: AbortSignal) =>
    request<CourseModuleSummary[]>("/api/content/modules", { signal }),

  getLessons: (signal?: AbortSignal) =>
    request<Lesson[]>("/api/content/lessons", { signal }),
  createLesson: (input: LessonInput) =>
    request<Lesson>("/api/content/lessons", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateLesson: (id: number, input: LessonInput) =>
    request<Lesson>(`/api/content/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteLesson: (id: number) =>
    request<void>(`/api/content/lessons/${id}`, { method: "DELETE" }),

  getLanding: (signal?: AbortSignal) =>
    request<LandingPageContent>("/api/content/landing", { signal }),
  updateLanding: (input: LandingPageInput) =>
    request<LandingPageContent>("/api/content/landing", {
      method: "PUT",
      body: JSON.stringify(input),
    }),
};
import { apiBaseUrl } from "../services/apiConfig";
import { authenticatedFetch } from "../services/authApi";
import type { Coursetype } from "./Coursetype";

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
  description: string;
  order: number;
};

export type CourseModuleInput = {
  courseId: number;
  title: string;
  description: string;
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

export type LandingPageBanner = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  callToActionText: string | null;
  callToActionUrl: string | null;
  order: number;
  isPublished: boolean;
};

export type LandingPageHighlight = {
  id: number;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
};

export type LandingPageTestimonial = {
  id: number;
  quote: string;
  author: string;
  role: string | null;
  order: number;
  isPublished: boolean;
};

export type LandingPageFaq = {
  id: number;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
};

export type LandingPageManagement = {
  banners: LandingPageBanner[];
  highlights: LandingPageHighlight[];
  testimonials: LandingPageTestimonial[];
  faqs: LandingPageFaq[];
};

export type AboutPageBlock = {
  id: number;
  title: string;
  body: string;
  order: number;
};

export type ContactPageSettings = {
  id: number;
  introduction: string;
  address: string;
  email: string;
  phone: string;
  workingHours: string;
  mapUrl: string | null;
};

export type ContactSubmission = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  submittedAtUtc: string;
  isRead: boolean;
};

export type LandingPageResponse = {
  hero: LandingPageContent | null;
  featuredCourses: Coursetype[];
  banners: LandingPageBanner[];
  highlights: LandingPageHighlight[];
  testimonials: LandingPageTestimonial[];
  faqs: LandingPageFaq[];
};

type LessonRequest = Omit<LessonInput, "moduleId">;

function toLessonRequest(input: LessonInput): LessonRequest {
  return {
    title: input.title,
    description: input.description,
    content: input.content,
    videoUrl: input.videoUrl,
    pdfUrl: input.pdfUrl,
    order: input.order,
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
    }
    response = await authenticatedFetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new Error("Could not connect to the content API.", { cause: error });
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body: unknown = await response.json();
      if (typeof body === "object" && body !== null) {
        const payload = body as {
          message?: unknown;
          detail?: unknown;
          title?: unknown;
          errors?: Record<string, unknown>;
        };
        const validationMessage = payload.errors
          ? Object.values(payload.errors)
              .flatMap((value) => (Array.isArray(value) ? value : [value]))
              .find((value): value is string => typeof value === "string")
          : undefined;
        message =
          validationMessage ??
          (typeof payload.message === "string" ? payload.message : undefined) ??
          (typeof payload.detail === "string" ? payload.detail : undefined) ??
          (typeof payload.title === "string" ? payload.title : undefined) ??
          message;
      }
    } catch {
      // Keep the HTTP status message when the server does not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const contentApi = {
  getModules: (signal?: AbortSignal) =>
    request<CourseModuleSummary[]>("/api/course-content/modules", { signal }),

  createModule: (courseId: number, input: Omit<CourseModuleInput, "courseId">) =>
    request<CourseModuleSummary>(
      `/api/course-content/courses/${courseId}/modules`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    ),
  updateModule: (id: number, input: Omit<CourseModuleInput, "courseId">) =>
    request<CourseModuleSummary>(`/api/course-content/modules/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteModule: (id: number) =>
    request<void>(`/api/course-content/modules/${id}`, { method: "DELETE" }),

  getLessons: (signal?: AbortSignal) =>
    request<Lesson[]>("/api/course-content/lessons", { signal }),
  createLesson: (input: LessonInput) => {
    return request<Lesson>(
      `/api/course-content/modules/${input.moduleId}/lessons`,
      {
        method: "POST",
        body: JSON.stringify(toLessonRequest(input)),
      },
    );
  },
  updateLesson: (id: number, input: LessonInput) =>
    request<Lesson>(`/api/course-content/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(toLessonRequest(input)),
    }),
  deleteLesson: (id: number) =>
    request<void>(`/api/course-content/lessons/${id}`, { method: "DELETE" }),

  getLandingPage: (signal?: AbortSignal) =>
    request<LandingPageResponse>("/api/landing-page", { signal }),
  getLanding: async (signal?: AbortSignal) =>
    (
      await request<LandingPageResponse>("/api/landing-page", { signal })
    ).hero,
  updateLanding: (input: LandingPageInput) =>
    request<LandingPageContent>("/api/landing-page/hero", {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  updateFeaturedCourses: (courseIds: number[]) =>
    request<void>("/api/landing-page/featured-courses", {
      method: "PUT",
      body: JSON.stringify({ courseIds }),
    }),

  getLandingManagement: (signal?: AbortSignal) =>
    request<LandingPageManagement>("/api/landing-page/manage", { signal }),
  createBanner: (input: Omit<LandingPageBanner, "id">) =>
    request<LandingPageBanner>("/api/landing-page/banners", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateBanner: (id: number, input: Omit<LandingPageBanner, "id">) =>
    request<LandingPageBanner>(`/api/landing-page/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteBanner: (id: number) =>
    request<void>(`/api/landing-page/banners/${id}`, { method: "DELETE" }),
  createHighlight: (input: Omit<LandingPageHighlight, "id">) =>
    request<LandingPageHighlight>("/api/landing-page/highlights", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateHighlight: (id: number, input: Omit<LandingPageHighlight, "id">) =>
    request<LandingPageHighlight>(`/api/landing-page/highlights/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteHighlight: (id: number) =>
    request<void>(`/api/landing-page/highlights/${id}`, { method: "DELETE" }),
  createTestimonial: (input: Omit<LandingPageTestimonial, "id">) =>
    request<LandingPageTestimonial>("/api/landing-page/testimonials", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateTestimonial: (id: number, input: Omit<LandingPageTestimonial, "id">) =>
    request<LandingPageTestimonial>(`/api/landing-page/testimonials/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteTestimonial: (id: number) =>
    request<void>(`/api/landing-page/testimonials/${id}`, { method: "DELETE" }),
  createFaq: (input: Omit<LandingPageFaq, "id">) =>
    request<LandingPageFaq>("/api/landing-page/faqs", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateFaq: (id: number, input: Omit<LandingPageFaq, "id">) =>
    request<LandingPageFaq>(`/api/landing-page/faqs/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteFaq: (id: number) =>
    request<void>(`/api/landing-page/faqs/${id}`, { method: "DELETE" }),

  getAbout: (signal?: AbortSignal) =>
    request<AboutPageBlock[]>("/api/site-content/about", { signal }),
  createAboutBlock: (input: Omit<AboutPageBlock, "id">) =>
    request<AboutPageBlock>("/api/site-content/about/blocks", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateAboutBlock: (id: number, input: Omit<AboutPageBlock, "id">) =>
    request<AboutPageBlock>(`/api/site-content/about/blocks/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteAboutBlock: (id: number) =>
    request<void>(`/api/site-content/about/blocks/${id}`, { method: "DELETE" }),

  getContactSettings: (signal?: AbortSignal) =>
    request<ContactPageSettings>("/api/site-content/contact", { signal }),
  updateContactSettings: (input: Omit<ContactPageSettings, "id">) =>
    request<ContactPageSettings>("/api/site-content/contact", {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  submitContactMessage: (input: Omit<ContactSubmission, "id" | "submittedAtUtc" | "isRead">) =>
    request<{ message: string }>("/api/site-content/contact/messages", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  getContactMessages: (signal?: AbortSignal) =>
    request<ContactSubmission[]>("/api/site-content/contact/messages", { signal }),
  markContactMessageRead: (id: number, isRead: boolean) =>
    request<void>(`/api/site-content/contact/messages/${id}/read`, {
      method: "PATCH",
      body: JSON.stringify(isRead),
    }),
  deleteContactMessage: (id: number) =>
    request<void>(`/api/site-content/contact/messages/${id}`, { method: "DELETE" }),
};

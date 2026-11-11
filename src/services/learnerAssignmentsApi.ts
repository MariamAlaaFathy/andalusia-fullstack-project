import { authenticatedFetch } from "./authApi";
import { apiBaseUrl } from "./apiConfig";

export type LearnerAssignmentStatus = "NotSubmitted" | "Submitted" | "Graded";

export type LearnerAssignment = {
  id: number;
  title: string;
  description: string;
  dueAt: string;
  status: LearnerAssignmentStatus;
  submission: string | null;
  submittedAt: string | null;
  grade: number | null;
  feedback: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function isLearnerAssignment(value: unknown): value is LearnerAssignment {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.dueAt === "string" &&
    (value.status === "NotSubmitted" ||
      value.status === "Submitted" ||
      value.status === "Graded") &&
    isNullableString(value.submission) &&
    isNullableString(value.submittedAt) &&
    (typeof value.grade === "number" || value.grade === null) &&
    isNullableString(value.feedback)
  );
}

async function request<T>(
  path: string,
  isPayload: (value: unknown) => value is T,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await authenticatedFetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    throw new Error("Could not connect to the assignments API.", {
      cause: error,
    });
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch (error) {
    if (response.ok) {
      throw new Error("The assignments API returned an unreadable response.", {
        cause: error,
      });
    }
  }

  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : isRecord(payload) && typeof payload.detail === "string"
          ? payload.detail
          : `Assignment request failed with status ${response.status}.`;
    throw new Error(message);
  }
  if (!isPayload(payload)) {
    throw new Error("The assignments API returned data in an unexpected format.");
  }
  return payload;
}

export const learnerAssignmentsApi = {
  getForCourse(courseId: number, signal?: AbortSignal) {
    return request(
      `/api/courses/${courseId}/assignments`,
      (value): value is LearnerAssignment[] =>
        Array.isArray(value) && value.every(isLearnerAssignment),
      { signal },
    );
  },

  submit(courseId: number, assignmentId: number, content: string) {
    return request(
      `/api/courses/${courseId}/assignments/${assignmentId}/submit`,
      (value): value is {
        id: number;
        content: string;
        status: "Submitted";
        submittedAt: string;
        grade: number | null;
        feedback: string | null;
      } =>
        isRecord(value) &&
        typeof value.id === "number" &&
        typeof value.content === "string" &&
        value.status === "Submitted" &&
        typeof value.submittedAt === "string" &&
        (typeof value.grade === "number" || value.grade === null) &&
        isNullableString(value.feedback),
      { method: "POST", body: JSON.stringify({ content }) },
    );
  },
};

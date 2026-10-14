import { authenticatedFetch } from "./authApi";
import { apiBaseUrl } from "./apiConfig";

export type EnrollmentPayment = {
  id: number;
  amount: number;
  currency: string;
  status: "Pending" | "Paid" | "Failed";
  paidAt: string | null;
};

export type CourseApplication = {
  id: number;
  courseId: number;
  courseName: string;
  amount: number;
  status: "AwaitingPayment" | "Enrolled";
  createdAt: string;
  payment: EnrollmentPayment | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPayment(value: unknown): value is EnrollmentPayment {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.amount === "number" &&
    typeof value.currency === "string" &&
    (value.status === "Pending" ||
      value.status === "Paid" ||
      value.status === "Failed") &&
    (typeof value.paidAt === "string" || value.paidAt === null)
  );
}

function isApplication(value: unknown): value is CourseApplication {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.courseId === "number" &&
    typeof value.courseName === "string" &&
    typeof value.amount === "number" &&
    (value.status === "AwaitingPayment" || value.status === "Enrolled") &&
    typeof value.createdAt === "string" &&
    (value.payment === null || isPayment(value.payment))
  );
}

async function request<T>(
  path: string,
  isPayload: (payload: unknown) => payload is T,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await authenticatedFetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    throw new Error("Could not connect to the enrollment API.", {
      cause: error,
    });
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch (error) {
    if (response.ok) {
      throw new Error("The enrollment API returned an unreadable response.", {
        cause: error,
      });
    }
  }

  if (!response.ok) {
    const detail =
      isRecord(payload) && typeof payload.detail === "string"
        ? payload.detail
        : isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : response.status === 401
            ? "Please sign in again to continue."
            : `Enrollment request failed with status ${response.status}.`;
    throw new Error(detail);
  }

  if (!isPayload(payload)) {
    throw new Error("The enrollment API returned data in an unexpected format.");
  }
  return payload;
}

export const enrollmentApi = {
  getMine(signal?: AbortSignal) {
    return request(
      "/api/applications/me",
      (value): value is CourseApplication[] =>
        Array.isArray(value) && value.every(isApplication),
      { signal },
    );
  },

  create(courseId: number) {
    return request("/api/applications", isApplication, {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  },

  completeDemoPayment(applicationId: number) {
    return request(
      `/api/payments/application/${encodeURIComponent(applicationId)}/demo-payment`,
      isApplication,
      { method: "POST" },
    );
  },
};

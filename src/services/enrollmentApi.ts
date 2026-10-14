const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5075"
).replace(/\/$/, "");

export type EnrollmentPayment = {
  id: string;
  amount: number;
  currency: string;
  status: "Pending" | "Paid" | "Failed";
  paidAt: string | null;
};

export type CourseApplication = {
  id: string;
  courseId: number;
  courseName: string;
  amount: number;
  status: "AwaitingPayment" | "Enrolled";
  createdAt: string;
  payment: EnrollmentPayment | null;
};

type CheckoutResponse = {
  checkoutUrl: string | null;
  application: CourseApplication;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPayment(value: unknown): value is EnrollmentPayment {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
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
    typeof value.id === "string" &&
    typeof value.courseId === "number" &&
    typeof value.courseName === "string" &&
    typeof value.amount === "number" &&
    (value.status === "AwaitingPayment" || value.status === "Enrolled") &&
    typeof value.createdAt === "string" &&
    (value.payment === null || isPayment(value.payment))
  );
}

function isCheckoutResponse(value: unknown): value is CheckoutResponse {
  return (
    isRecord(value) &&
    (typeof value.checkoutUrl === "string" || value.checkoutUrl === null) &&
    isApplication(value.application)
  );
}

async function request<T>(
  path: string,
  accessToken: string,
  isPayload: (payload: unknown) => payload is T,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
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
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      typeof payload.detail === "string"
        ? payload.detail
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
  getMine(accessToken: string, signal?: AbortSignal) {
    return request(
      "/api/applications/me",
      accessToken,
      (value): value is CourseApplication[] =>
        Array.isArray(value) && value.every(isApplication),
      { signal },
    );
  },

  create(courseId: number, accessToken: string) {
    return request(
      "/api/applications",
      accessToken,
      isApplication,
      { method: "POST", body: JSON.stringify({ courseId }) },
    );
  },

  startCheckout(applicationId: string, accessToken: string) {
    return request(
      `/api/payments/application/${encodeURIComponent(applicationId)}/checkout`,
      accessToken,
      isCheckoutResponse,
      { method: "POST" },
    );
  },

  confirmCheckout(sessionId: string, accessToken: string) {
    return request(
      "/api/payments/confirm",
      accessToken,
      isApplication,
      { method: "POST", body: JSON.stringify({ sessionId }) },
    );
  },
};

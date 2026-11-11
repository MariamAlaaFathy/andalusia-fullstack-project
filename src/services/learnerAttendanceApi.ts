import { authenticatedFetch } from "./authApi";
import { apiBaseUrl } from "./apiConfig";

export type LearnerAttendanceSession = {
  id: number;
  title: string;
  startsAt: string;
  status: "Present" | "Absent" | "Not recorded";
};

export type LearnerAttendanceSummary = {
  courseId: number;
  courseProgress: number;
  totalSessions: number;
  presentSessions: number;
  sessions: LearnerAttendanceSession[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSession(value: unknown): value is LearnerAttendanceSession {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.startsAt === "string" &&
    (value.status === "Present" ||
      value.status === "Absent" ||
      value.status === "Not recorded")
  );
}

function isSummary(value: unknown): value is LearnerAttendanceSummary {
  return (
    isRecord(value) &&
    typeof value.courseId === "number" &&
    typeof value.courseProgress === "number" &&
    typeof value.totalSessions === "number" &&
    typeof value.presentSessions === "number" &&
    Array.isArray(value.sessions) &&
    value.sessions.every(isSession)
  );
}

export async function getLearnerAttendance(
  courseId: number,
  signal?: AbortSignal,
): Promise<LearnerAttendanceSummary> {
  let response: Response;
  try {
    response = await authenticatedFetch(
      `${apiBaseUrl}/api/courses/${courseId}/attendance`,
      { headers: { Accept: "application/json" }, signal },
    );
  } catch (error) {
    throw new Error("Could not connect to the attendance API.", {
      cause: error,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (response.ok) {
      throw new Error("The attendance API returned an unreadable response.", {
        cause: error,
      });
    }
    payload = null;
  }

  if (!response.ok) {
    const message =
      isRecord(payload) && typeof payload.detail === "string"
        ? payload.detail
        : response.status === 401
          ? "Please sign in again to view attendance."
          : `Attendance request failed with status ${response.status}.`;
    throw new Error(message);
  }
  if (!isSummary(payload)) {
    throw new Error("The attendance API returned data in an unexpected format.");
  }
  return payload;
}

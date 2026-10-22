import { authenticatedFetch } from "./authApi";
import { apiBaseUrl } from "./apiConfig";

export type InstructorCourse = {
  courseId: number;
  courseName: string;
  studentCount: number;
  upcomingSessionCount: number;
  assignmentCount: number;
};

export type InstructorStudent = {
  studentId: number;
  name: string;
  email: string;
  progress: number;
  presentCount: number;
  sessionCount: number;
};

export type InstructorSession = {
  id: number;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
};

export type InstructorAssignment = {
  id: number;
  title: string;
  description: string;
  dueAt: string;
  submissionCount: number;
};

export type AssignmentSubmission = {
  id: number;
  studentId: number;
  studentName: string;
  content: string;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInstructorCourse(value: unknown): value is InstructorCourse {
  return (
    isRecord(value) &&
    typeof value.courseId === "number" &&
    typeof value.courseName === "string" &&
    typeof value.studentCount === "number" &&
    typeof value.upcomingSessionCount === "number" &&
    typeof value.assignmentCount === "number"
  );
}

function isInstructorStudent(value: unknown): value is InstructorStudent {
  return (
    isRecord(value) &&
    typeof value.studentId === "number" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.progress === "number" &&
    typeof value.presentCount === "number" &&
    typeof value.sessionCount === "number"
  );
}

function isInstructorSession(value: unknown): value is InstructorSession {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.startsAt === "string" &&
    typeof value.endsAt === "string" &&
    typeof value.location === "string"
  );
}

function isInstructorAssignment(value: unknown): value is InstructorAssignment {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.dueAt === "string" &&
    typeof value.submissionCount === "number"
  );
}

function isAssignmentSubmission(value: unknown): value is AssignmentSubmission {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.studentId === "number" &&
    typeof value.studentName === "string" &&
    typeof value.content === "string" &&
    typeof value.submittedAt === "string" &&
    (typeof value.grade === "number" || value.grade === null) &&
    (typeof value.feedback === "string" || value.feedback === null)
  );
}

async function request<T>(
  path: string,
  isPayload: (value: unknown) => value is T,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await authenticatedFetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    throw new Error("Could not connect to the instructor API.", {
      cause: error,
    });
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      isRecord(payload) && typeof payload.detail === "string"
        ? payload.detail
        : response.status === 403
          ? "This account does not have instructor access."
          : `Instructor request failed with status ${response.status}.`;
    throw new Error(detail);
  }
  if (!isPayload(payload)) {
    throw new Error("The instructor API returned data in an unexpected format.");
  }
  return payload;
}

function isArrayOf<T>(
  itemGuard: (item: unknown) => item is T,
): (value: unknown) => value is T[] {
  return (value): value is T[] =>
    Array.isArray(value) && value.every(itemGuard);
}

export const instructorApi = {
  getCourses(signal?: AbortSignal) {
    return request("/api/instructor/courses", isArrayOf(isInstructorCourse), {
      signal,
    });
  },

  getStudents(courseId: number, signal?: AbortSignal) {
    return request(
      `/api/instructor/courses/${courseId}/students`,
      isArrayOf(isInstructorStudent),
      { signal },
    );
  },

  getSessions(courseId: number, signal?: AbortSignal) {
    return request(
      `/api/instructor/courses/${courseId}/sessions`,
      isArrayOf(isInstructorSession),
      { signal },
    );
  },

  createSession(
    courseId: number,
    session: Omit<InstructorSession, "id">,
  ) {
    return request(
      `/api/instructor/courses/${courseId}/sessions`,
      isInstructorSession,
      { method: "POST", body: JSON.stringify(session) },
    );
  },

  recordAttendance(
    sessionId: number,
    studentId: number,
    isPresent: boolean,
  ) {
    return request(
      `/api/instructor/sessions/${sessionId}/attendance`,
      (value): value is { studentId: number; isPresent: boolean }[] =>
        Array.isArray(value) &&
        value.every(
          (item) =>
            isRecord(item) &&
            typeof item.studentId === "number" &&
            typeof item.isPresent === "boolean",
        ),
      {
        method: "POST",
        body: JSON.stringify({ entries: [{ studentId, isPresent }] }),
      },
    );
  },

  updateProgress(courseId: number, studentId: number, progress: number) {
    return request(
      `/api/instructor/courses/${courseId}/students/${studentId}/progress`,
      (value): value is { studentId: number; progress: number } =>
        isRecord(value) &&
        typeof value.studentId === "number" &&
        typeof value.progress === "number",
      { method: "PUT", body: JSON.stringify({ progress }) },
    );
  },

  getAssignments(courseId: number, signal?: AbortSignal) {
    return request(
      `/api/instructor/courses/${courseId}/assignments`,
      isArrayOf(isInstructorAssignment),
      { signal },
    );
  },

  createAssignment(
    courseId: number,
    assignment: Omit<InstructorAssignment, "id" | "submissionCount">,
  ) {
    return request(
      `/api/instructor/courses/${courseId}/assignments`,
      isInstructorAssignment,
      { method: "POST", body: JSON.stringify(assignment) },
    );
  },

  getSubmissions(assignmentId: number, signal?: AbortSignal) {
    return request(
      `/api/instructor/assignments/${assignmentId}/submissions`,
      isArrayOf(isAssignmentSubmission),
      { signal },
    );
  },

  gradeSubmission(
    assignmentId: number,
    submissionId: number,
    grade: number,
    feedback: string,
  ) {
    return request(
      `/api/instructor/assignments/${assignmentId}/submissions/${submissionId}/grade`,
      isAssignmentSubmission,
      { method: "PUT", body: JSON.stringify({ grade, feedback }) },
    );
  },
};

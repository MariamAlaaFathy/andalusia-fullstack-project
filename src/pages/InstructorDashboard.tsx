import { useContext, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import {
  instructorApi,
  type AssignmentSubmission,
  type InstructorCourse,
  type InstructorAssignment,
  type InstructorSession,
  type InstructorStudent,
} from "../services/instructorApi";
import { userContext } from "../types/UserContextType";

function InstructorDashboard() {
  const context = useContext(userContext);
  const instructorId = context?.user?.userId;
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [students, setStudents] = useState<InstructorStudent[]>([]);
  const [rosterCourseId, setRosterCourseId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<InstructorSession[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [loadedInstructorId, setLoadedInstructorId] = useState<number | null>(
    null,
  );
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const isLoading =
    Boolean(context?.isLoading) ||
    (typeof instructorId === "number" &&
      loadedInstructorId !== instructorId);
  const selectedCourse = courses.find(
    (course) => course.courseId === selectedCourseId,
  );
  const editingSession = sessions.find(
    (session) => session.id === editingSessionId,
  );
  const displayedStudents =
    rosterCourseId === selectedCourseId ? students : [];
  const averageProgress = displayedStudents.length
    ? Math.round(
        displayedStudents.reduce((sum, student) => sum + student.progress, 0) /
          displayedStudents.length,
      )
    : 0;
  const totalAttendance = displayedStudents.reduce(
    (sum, student) => sum + student.presentCount,
    0,
  );

  useEffect(() => {
    if (context?.isLoading || typeof instructorId !== "number") return;
    const accountId = instructorId;
    const controller = new AbortController();

    async function loadCourses() {
      try {
        const assignedCourses = await instructorApi.getCourses(controller.signal);
        if (controller.signal.aborted) return;
        setCourses(assignedCourses);
        setSelectedCourseId((current) =>
          assignedCourses.some((course) => course.courseId === current)
            ? current
            : (assignedCourses[0]?.courseId ?? null),
        );
        setStudents([]);
        setRosterCourseId(null);
        setSessions([]);
        setSelectedSessionId(null);
        setEditingSessionId(null);
        setActionError("");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Instructor courses could not be loaded.", error);
        setCourses([]);
        setSelectedCourseId(null);
        setStudents([]);
        setRosterCourseId(null);
        setSessions([]);
        setSelectedSessionId(null);
        setEditingSessionId(null);
        setActionError(
          error instanceof Error
            ? error.message
            : "Instructor data could not be loaded from the database.",
        );
      } finally {
        if (!controller.signal.aborted) setLoadedInstructorId(accountId);
      }
    }

    void loadCourses();
    return () => controller.abort();
  }, [context?.isLoading, instructorId]);

  useEffect(() => {
    if (selectedCourseId === null) return;
    const courseId = selectedCourseId;

    const controller = new AbortController();
    async function loadCourseData() {
      try {
        const [roster, courseSessions] = await Promise.all([
          instructorApi.getStudents(courseId, controller.signal),
          instructorApi.getSessions(courseId, controller.signal),
        ]);
        if (controller.signal.aborted) return;
        setStudents(roster);
        setRosterCourseId(courseId);
        setSessions(courseSessions);
        setSelectedSessionId((current) =>
          courseSessions.some((session) => session.id === current)
            ? current
            : (courseSessions[0]?.id ?? null),
        );
        setEditingSessionId(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Instructor roster could not be loaded.", error);
        setStudents([]);
        setRosterCourseId(null);
        setSessions([]);
        setSelectedSessionId(null);
        setActionError(
          error instanceof Error
            ? error.message
            : "Instructor course data could not be loaded from the database.",
        );
      }
    }
    void loadCourseData();
    return () => controller.abort();
  }, [selectedCourseId]);

  async function updateProgress(studentId: number, progress: number) {
    if (!selectedCourse || progress < 0 || progress > 100) return;
    setActionError("");
    setNotice("");
    try {
      await instructorApi.updateProgress(
        selectedCourse.courseId,
        studentId,
        progress,
      );
      setStudents((current) =>
        current.map((student) =>
          student.studentId === studentId ? { ...student, progress } : student,
        ),
      );
      setNotice("Progress saved.");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Progress could not be saved.",
      );
    }
  }

  async function recordAttendance(studentId: number, isPresent: boolean) {
    if (!selectedSessionId || !selectedCourse) {
      setActionError("Add or select a session before recording attendance.");
      return;
    }
    setActionError("");
    setNotice("");
    try {
      await instructorApi.recordAttendance(
        selectedSessionId,
        studentId,
        isPresent,
      );
      const refreshedRoster = await instructorApi.getStudents(
        selectedCourse.courseId,
      );
      setStudents(refreshedRoster);
      setNotice("Attendance saved.");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Attendance could not be saved.",
      );
    }
  }

  async function createSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCourse) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const startsAt = String(formData.get("startsAt"));
    const endsAt = String(formData.get("endsAt"));
    const session = {
      title: String(formData.get("title")).trim(),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      location: String(formData.get("location")).trim(),
    };
    setActionError("");
    setNotice("");
    try {
      if (editingSessionId !== null) {
        const updated = await instructorApi.updateSession(
          selectedCourse.courseId,
          editingSessionId,
          session,
        );
        setSessions((current) =>
          current
            .map((item) => (item.id === updated.id ? updated : item))
            .sort(
              (left, right) =>
                new Date(left.startsAt).getTime() -
                new Date(right.startsAt).getTime(),
            ),
        );
        setNotice("Session schedule updated. Enrolled learners have been notified.");
        setEditingSessionId(null);
        return;
      }

      const created = await instructorApi.createSession(selectedCourse.courseId, session);
      setSessions((current) =>
        [...current, created].sort(
          (left, right) =>
            new Date(left.startsAt).getTime() -
            new Date(right.startsAt).getTime(),
        ),
      );
      setSelectedSessionId(created.id);
      form.reset();
      setNotice("Session saved.");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Session could not be saved.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#2b2420]">
      <NavBar />
      <main className="mx-auto min-h-[65vh] max-w-[1180px] px-4 py-9 sm:px-6 sm:py-12">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#a55335]">
              Instructor space
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
              Teaching dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#765f52]">
              Check in with your learners, track progress, and get ready for
              upcoming sessions.
            </p>
          </div>
          <Link
            to="/Courses"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#a9694f] px-5 py-2.5 font-semibold text-[#8f5640] transition hover:bg-white"
          >
            View course catalog
          </Link>
        </header>

        {context?.isLoading || isLoading ? (
          <section
            role="status"
            className="rounded-2xl border border-[#dfd2c3] bg-white p-8 text-[#765f52]"
          >
            Loading instructor workspace…
          </section>
        ) : !context?.user ? (
          <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">
              Sign in with an instructor account
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#765f52]">
              Instructor courses and learner records require an authorized
              account.
            </p>
            <Link
              to="/Login"
              state={{ from: "/InstructorDashboard" }}
              className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#a9694f] px-5 py-2.5 font-semibold text-white transition hover:bg-[#8f5640]"
            >
              Go to login
            </Link>
          </section>
        ) : context?.user.role !== "Instructor" ? (
          <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">
              Instructor access required
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#765f52]">
              Sign in with an instructor account to view assigned courses and
              learner records.
            </p>
          </section>
        ) : (
          <>
            {actionError && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-[#e7b7aa] bg-[#f8e9e5] p-4 text-sm text-[#873d2d]"
              >
                {actionError}
              </div>
            )}
            {notice && (
              <div
                role="status"
                className="mb-6 rounded-xl border border-[#dfd2c3] bg-white p-4 text-sm text-[#765f52]"
              >
                {notice}
              </div>
            )}

            <section
              aria-label="Teaching summary"
              className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <MetricCard label="Assigned courses" value={courses.length} />
              <MetricCard
                label="Learners in course"
                value={displayedStudents.length}
              />
              <MetricCard label="Average progress" value={`${averageProgress}%`} />
              <MetricCard
                label="Present marks"
                value={totalAttendance}
              />
            </section>

            {courses.length === 0 ? (
              <section className="rounded-2xl border border-[#dfd2c3] bg-white p-8 text-center">
                <h2 className="font-serif text-2xl font-bold">
                  No courses assigned yet
                </h2>
                <p className="mt-3 text-sm text-[#765f52]">
                  Ask an administrator to assign courses to your instructor
                  account.
                </p>
              </section>
            ) : (
              <>
                <section className="mb-6 rounded-2xl border border-[#dfd2c3] bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
                  <label className="block min-w-0 flex-1 text-sm font-semibold">
                    Assigned course
                    <select
                      value={selectedCourseId ?? ""}
                      onChange={(event) => {
                        setEditingSessionId(null);
                        setSelectedCourseId(Number(event.target.value));
                      }}
                      className="mt-2 min-h-11 w-full rounded-lg border border-[#dfd2c3] bg-white px-3 text-[#2b2420] outline-none focus:border-[#a9694f] focus:ring-2 focus:ring-[#a9694f]/20 sm:max-w-md"
                    >
                      {courses.map((course) => (
                        <option key={course.courseId} value={course.courseId}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="mt-4 text-sm text-[#765f52] sm:mt-0">
                    {selectedCourse?.upcomingSessionCount ?? 0} upcoming
                    sessions · {selectedCourse?.assignmentCount ?? 0} assignments
                  </div>
                </section>

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                  <section className="overflow-hidden rounded-2xl border border-[#dfd2c3] bg-white">
                    <div className="border-b border-[#eee2d5] p-5 sm:px-6">
                      <h2 className="font-serif text-2xl font-bold">
                        Student roster
                      </h2>
                      <p className="mt-1 text-sm text-[#765f52]">
                        Update learner progress and record attendance for a
                        session.
                      </p>
                      <label className="mt-4 block max-w-md text-xs font-semibold uppercase tracking-wide text-[#765f52]">
                        Attendance session
                        <select
                          value={selectedSessionId ?? ""}
                          onChange={(event) =>
                            setSelectedSessionId(Number(event.target.value))
                          }
                          disabled={!sessions.length}
                          className="mt-2 min-h-10 w-full rounded-lg border border-[#dfd2c3] bg-white px-3 text-sm font-medium normal-case tracking-normal text-[#2b2420] disabled:bg-[#f7f1e8]"
                        >
                          {!sessions.length && (
                            <option value="">Add a session first</option>
                          )}
                          {sessions.map((session) => (
                            <option key={session.id} value={session.id}>
                              {session.title} · {formatDate(session.startsAt)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {displayedStudents.length ? (
                      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
                        {displayedStudents.map((student) => (
                          <StudentCard
                            key={`${selectedCourseId}:${student.studentId}`}
                            student={student}
                            onProgressChange={(progress) =>
                              void updateProgress(student.studentId, progress)
                            }
                            onAttendanceChange={(isPresent) =>
                              void recordAttendance(
                                student.studentId,
                                isPresent,
                              )
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="p-8 text-center text-sm text-[#765f52]">
                        No enrolled learners are assigned to this course yet.
                      </p>
                    )}
                  </section>

                  <CreateSessionPanel
                    key={editingSession?.id ?? "new-session"}
                    onSubmit={(event) => void createSession(event)}
                    session={editingSession ?? null}
                    onEditSelected={() => {
                      if (selectedSessionId !== null) {
                        setEditingSessionId(selectedSessionId);
                      }
                    }}
                    onCancelEdit={() => setEditingSessionId(null)}
                    canEdit={selectedSessionId !== null}
                  />
                </div>
                {selectedCourse && (
                  <InstructorAssignmentsPanel
                    key={selectedCourse.courseId}
                    courseId={selectedCourse.courseId}
                    onAssignmentCreated={() =>
                      setCourses((current) =>
                        current.map((course) =>
                          course.courseId === selectedCourse.courseId
                            ? {
                                ...course,
                                assignmentCount: course.assignmentCount + 1,
                              }
                            : course,
                        ),
                      )
                    }
                  />
                )}
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="rounded-2xl border border-[#dfd2c3] bg-white p-5">
      <p className="text-sm font-medium text-[#765f52]">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold">{value}</p>
    </article>
  );
}

function StudentCard({
  student,
  onProgressChange,
  onAttendanceChange,
}: {
  student: InstructorStudent;
  onProgressChange: (progress: number) => void;
  onAttendanceChange: (isPresent: boolean) => void;
}) {
  const [progress, setProgress] = useState(student.progress);
  return (
    <article className="rounded-xl border border-[#eee2d5] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{student.name}</h3>
          <p className="mt-1 truncate text-xs text-[#765f52]">
            {student.email}
          </p>
        </div>
        <span className="rounded-full bg-[#f0e8da] px-2.5 py-1 text-xs font-semibold text-[#765f52]">
          {progress}%
        </span>
      </div>
      <label className="mt-4 block text-xs font-semibold text-[#765f52]">
        Course progress
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          onChange={(event) => setProgress(Number(event.target.value))}
          aria-label={`${student.name} course progress`}
          className="mt-2 w-full accent-[#a9694f]"
        />
      </label>
      <button
        type="button"
        disabled={progress === student.progress}
        onClick={() => onProgressChange(progress)}
        className="mt-2 rounded-lg border border-[#dfd2c3] px-3 py-1.5 text-xs font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save progress
      </button>
      <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#eee2d5] pt-3">
        <span className="text-xs text-[#765f52]">
          {student.presentCount}/{student.sessionCount} attended
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAttendanceChange(true)}
            className="rounded-lg bg-[#e5eee8] px-3 py-2 text-xs font-semibold text-[#166534] transition hover:bg-[#d6e8dc]"
          >
            Present
          </button>
          <button
            type="button"
            onClick={() => onAttendanceChange(false)}
            className="rounded-lg bg-[#f8e9e5] px-3 py-2 text-xs font-semibold text-[#873d2d] transition hover:bg-[#f2d9d2]"
          >
            Absent
          </button>
        </div>
      </div>
    </article>
  );
}

function CreateSessionPanel({
  onSubmit,
  session,
  onEditSelected,
  onCancelEdit,
  canEdit,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  session: InstructorSession | null;
  onEditSelected: () => void;
  onCancelEdit: () => void;
  canEdit: boolean;
}) {
  return (
    <section className="rounded-2xl border border-[#dfd2c3] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold">
            {session ? "Update session" : "Plan a session"}
          </h2>
          <p className="mt-1 text-sm text-[#765f52]">
            {session
              ? "Save schedule changes and learners will be notified."
              : "Add a class to the selected course schedule."}
          </p>
        </div>
        {!session && (
          <button
            type="button"
            disabled={!canEdit}
            onClick={onEditSelected}
            className="shrink-0 rounded-lg border border-[#a9694f] px-3 py-2 text-xs font-semibold text-[#8f5640] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Edit selected
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-[#765f52]">
        {session ? `Editing: ${session.title}` : ""}
      </p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block text-sm font-medium">
          Session title
          <input
            required
            name="title"
            maxLength={200}
            defaultValue={session?.title ?? ""}
            className="mt-1 min-h-10 w-full rounded-lg border border-[#dfd2c3] px-3 outline-none focus:border-[#a9694f] focus:ring-2 focus:ring-[#a9694f]/20"
          />
        </label>
        <label className="block text-sm font-medium">
          Starts
          <input
            required
            name="startsAt"
            type="datetime-local"
            defaultValue={session ? toLocalDateTimeInput(session.startsAt) : ""}
            className="mt-1 min-h-10 w-full rounded-lg border border-[#dfd2c3] px-3 outline-none focus:border-[#a9694f] focus:ring-2 focus:ring-[#a9694f]/20"
          />
        </label>
        <label className="block text-sm font-medium">
          Ends
          <input
            required
            name="endsAt"
            type="datetime-local"
            defaultValue={session ? toLocalDateTimeInput(session.endsAt) : ""}
            className="mt-1 min-h-10 w-full rounded-lg border border-[#dfd2c3] px-3 outline-none focus:border-[#a9694f] focus:ring-2 focus:ring-[#a9694f]/20"
          />
        </label>
        <label className="block text-sm font-medium">
          Location
          <input
            required
            name="location"
            maxLength={300}
            defaultValue={session?.location ?? ""}
            className="mt-1 min-h-10 w-full rounded-lg border border-[#dfd2c3] px-3 outline-none focus:border-[#a9694f] focus:ring-2 focus:ring-[#a9694f]/20"
          />
        </label>
        <button
          type="submit"
          className="min-h-11 w-full rounded-lg bg-[#a9694f] px-4 py-2.5 font-semibold text-white transition hover:bg-[#8f5640]"
        >
          {session ? "Save schedule" : "Create session"}
        </button>
        {session && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="min-h-10 w-full rounded-lg border border-[#dfd2c3] px-4 py-2 text-sm font-semibold text-[#765f52]"
          >
            Cancel
          </button>
        )}
      </form>
    </section>
  );
}

function InstructorAssignmentsPanel({
  courseId,
  onAssignmentCreated,
}: {
  courseId: number;
  onAssignmentCreated: () => void;
}) {
  const [assignments, setAssignments] = useState<InstructorAssignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(
    null,
  );
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loadedSubmissionsAssignmentId, setLoadedSubmissionsAssignmentId] =
    useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void instructorApi
      .getAssignments(courseId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setAssignments(result);
        setSelectedAssignmentId((current) =>
          result.some((assignment) => assignment.id === current)
            ? current
            : null,
        );
        setError("");
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Course assignments could not be loaded.", cause);
        setError(
          cause instanceof Error
            ? cause.message
            : "Course assignments could not be loaded.",
        );
      });

    return () => controller.abort();
  }, [courseId]);

  useEffect(() => {
    if (selectedAssignmentId === null) {
      return;
    }

    const controller = new AbortController();
    void instructorApi
      .getSubmissions(courseId, selectedAssignmentId, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setSubmissions(result);
          setLoadedSubmissionsAssignmentId(selectedAssignmentId);
        }
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Assignment submissions could not be loaded.", cause);
        setError(
          cause instanceof Error
            ? cause.message
            : "Assignment submissions could not be loaded.",
        );
      });

    return () => controller.abort();
  }, [courseId, selectedAssignmentId]);

  async function createAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setError("");
    setNotice("");
    setIsSaving(true);
    try {
      const assignment = await instructorApi.createAssignment(courseId, {
        title: String(formData.get("title")).trim(),
        description: String(formData.get("description")).trim(),
        dueAt: new Date(String(formData.get("dueAt"))).toISOString(),
      });
      setAssignments((current) =>
        [...current, assignment].sort(
          (left, right) =>
            new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime(),
        ),
      );
      onAssignmentCreated();
      setSelectedAssignmentId(assignment.id);
      setNotice("Assignment saved.");
      form.reset();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Assignment could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function gradeSubmission(
    event: FormEvent<HTMLFormElement>,
    submission: AssignmentSubmission,
  ) {
    event.preventDefault();
    if (selectedAssignmentId === null) return;
    const formData = new FormData(event.currentTarget);
    const grade = Number(formData.get("grade"));
    const feedback = String(formData.get("feedback")).trim();
    setError("");
    setNotice("");
    try {
      const updated = await instructorApi.gradeSubmission(
        courseId,
        selectedAssignmentId,
        submission.id,
        grade,
        feedback,
      );
      setSubmissions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice(`Grade saved for ${submission.studentName}.`);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Grade could not be saved.",
      );
    }
  }

  const visibleSubmissions =
    loadedSubmissionsAssignmentId === selectedAssignmentId ? submissions : [];

  return (
    <section className="mt-6 rounded-2xl border border-[#dfd2c3] bg-white p-5 sm:p-6">
      <div>
        <h2 className="font-serif text-2xl font-bold">Assignments</h2>
        <p className="mt-1 text-sm text-[#765f52]">
          Create coursework, review learner submissions, and save scores and feedback.
        </p>
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-[#f8e9e5] p-3 text-sm text-[#873d2d]">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 rounded-lg bg-[#f0e8da] p-3 text-sm text-[#765f52]">
          {notice}
        </p>
      )}
      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(250px,0.8fr)_minmax(0,1.2fr)]">
        <form onSubmit={(event) => void createAssignment(event)} className="space-y-3 rounded-xl border border-[#eee2d5] p-4">
          <h3 className="font-semibold">Create assignment</h3>
          <label className="block text-sm font-medium">
            Title
            <input
              required
              name="title"
              maxLength={200}
              className="mt-1 min-h-10 w-full rounded-lg border border-[#dfd2c3] px-3"
            />
          </label>
          <label className="block text-sm font-medium">
            Instructions
            <textarea
              required
              name="description"
              maxLength={4000}
              rows={4}
              className="mt-1 w-full rounded-lg border border-[#dfd2c3] px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Due date
            <input
              required
              name="dueAt"
              type="datetime-local"
              className="mt-1 min-h-10 w-full rounded-lg border border-[#dfd2c3] px-3"
            />
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className="min-h-10 w-full rounded-lg bg-[#a9694f] px-4 font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Create assignment"}
          </button>
        </form>

        <div className="space-y-3">
          {assignments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#dfd2c3] p-5 text-sm text-[#765f52]">
              No assignments have been created for this course.
            </p>
          ) : (
            assignments.map((assignment) => (
              <article key={assignment.id} className="rounded-xl border border-[#eee2d5] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <p className="mt-1 text-xs text-[#765f52]">
                      Due {formatDate(assignment.dueAt)} · {assignment.submissionCount} submissions
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-expanded={selectedAssignmentId === assignment.id}
                    onClick={() =>
                      setSelectedAssignmentId((current) =>
                        current === assignment.id ? null : assignment.id,
                      )
                    }
                    className="rounded-lg border border-[#a9694f] px-3 py-2 text-xs font-semibold text-[#8f5640]"
                  >
                    {selectedAssignmentId === assignment.id ? "Hide submissions" : "Review submissions"}
                  </button>
                </div>
                {assignment.description && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-[#765f52]">
                    {assignment.description}
                  </p>
                )}
                {selectedAssignmentId === assignment.id && (
                  <div className="mt-4 space-y-3 border-t border-[#eee2d5] pt-4">
                    {visibleSubmissions.length === 0 ? (
                      <p className="text-sm text-[#765f52]">
                        {loadedSubmissionsAssignmentId === selectedAssignmentId
                          ? "No enrolled learners have submitted this assignment yet."
                          : "Loading submissions…"}
                      </p>
                    ) : (
                      visibleSubmissions.map((submission) => (
                        <form
                          key={`${submission.id}:${submission.grade ?? ""}:${submission.feedback ?? ""}`}
                          onSubmit={(event) => void gradeSubmission(event, submission)}
                          className="rounded-lg bg-[#fffdfa] p-3"
                        >
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="font-semibold">{submission.studentName}</span>
                            <span className="text-xs text-[#765f52]">
                              Submitted {formatDate(submission.submittedAt)} · {submission.status}
                            </span>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm">
                            {submission.content}
                          </p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_auto]">
                            <label className="text-xs font-semibold text-[#765f52]">
                              Score (0–100)
                              <input
                                required
                                name="grade"
                                type="number"
                                min={0}
                                max={100}
                                step="0.01"
                                defaultValue={submission.grade ?? ""}
                                className="mt-1 min-h-10 w-full rounded-lg border border-[#dfd2c3] px-2 text-sm text-[#2b2420]"
                              />
                            </label>
                            <label className="text-xs font-semibold text-[#765f52]">
                              Feedback
                              <input
                                name="feedback"
                                maxLength={2000}
                                defaultValue={submission.feedback ?? ""}
                                className="mt-1 min-h-10 w-full rounded-lg border border-[#dfd2c3] px-2 text-sm text-[#2b2420]"
                              />
                            </label>
                            <button
                              type="submit"
                              className="self-end rounded-lg bg-[#a9694f] px-3 py-2.5 text-xs font-semibold text-white"
                            >
                              Save grade
                            </button>
                          </div>
                        </form>
                      ))
                    )}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function toLocalDateTimeInput(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default InstructorDashboard;

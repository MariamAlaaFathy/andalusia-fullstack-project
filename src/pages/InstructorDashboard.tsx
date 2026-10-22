import { useContext, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import {
  instructorApi,
  type InstructorCourse,
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
    try {
      const created = await instructorApi.createSession(
        selectedCourse.courseId,
        session,
      );
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
        error instanceof Error ? error.message : "Session could not be created.",
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
                      onChange={(event) =>
                        setSelectedCourseId(Number(event.target.value))
                      }
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
                    onSubmit={(event) => void createSession(event)}
                  />
                </div>
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
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="rounded-2xl border border-[#dfd2c3] bg-white p-5">
      <h2 className="font-serif text-xl font-bold">Plan a session</h2>
      <p className="mt-1 text-sm text-[#765f52]">
        Add a class to the selected course schedule.
      </p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block text-sm font-medium">
          Session title
          <input
            required
            name="title"
            maxLength={200}
            className="mt-1 min-h-10 w-full rounded-lg border border-[#dfd2c3] px-3 outline-none focus:border-[#a9694f] focus:ring-2 focus:ring-[#a9694f]/20"
          />
        </label>
        <label className="block text-sm font-medium">
          Starts
          <input
            required
            name="startsAt"
            type="datetime-local"
            className="mt-1 min-h-10 w-full rounded-lg border border-[#dfd2c3] px-3 outline-none focus:border-[#a9694f] focus:ring-2 focus:ring-[#a9694f]/20"
          />
        </label>
        <label className="block text-sm font-medium">
          Ends
          <input
            required
            name="endsAt"
            type="datetime-local"
            className="mt-1 min-h-10 w-full rounded-lg border border-[#dfd2c3] px-3 outline-none focus:border-[#a9694f] focus:ring-2 focus:ring-[#a9694f]/20"
          />
        </label>
        <label className="block text-sm font-medium">
          Location
          <input
            required
            name="location"
            maxLength={300}
            className="mt-1 min-h-10 w-full rounded-lg border border-[#dfd2c3] px-3 outline-none focus:border-[#a9694f] focus:ring-2 focus:ring-[#a9694f]/20"
          />
        </label>
        <button
          type="submit"
          className="min-h-11 w-full rounded-lg bg-[#a9694f] px-4 py-2.5 font-semibold text-white transition hover:bg-[#8f5640]"
        >
          Create session
        </button>
      </form>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default InstructorDashboard;

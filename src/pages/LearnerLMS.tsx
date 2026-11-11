import {
  useCallback,
  useContext,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import { enrollmentApi } from "../services/enrollmentApi";
import {
  learnerAssignmentsApi,
  type LearnerAssignment,
} from "../services/learnerAssignmentsApi";
import {
  getLearnerAttendance,
  type LearnerAttendanceSummary,
} from "../services/learnerAttendanceApi";
import { userContext } from "../types/UserContextType";

type LearningCourse = {
  id: number;
  courseId: number;
  name: string;
  program: string;
  progress: number;
  schedule: string;
  location: string;
  materials: { title: string; detail: string; type: string }[];
};

type LearnerTab = "courses" | "programs";

const learningContentTemplates: Omit<
  LearningCourse,
  "id" | "courseId" | "name" | "progress"
>[] = [
  {
    program: "Backend Developer Program",
    schedule: "Tuesdays & Thursdays · 6:00 PM",
    location: "Online · Live classroom",
    materials: [
      { title: "Getting started with C#", detail: "Module 1 · 18 min", type: "Video" },
      { title: "Variables and types", detail: "Module 2 · 24 min", type: "Video" },
      { title: "C# quick reference", detail: "Course handout · PDF", type: "Guide" },
    ],
  },
  {
    program: "Backend Developer Program",
    schedule: "Mondays & Wednesdays · 7:00 PM",
    location: "Online · Live classroom",
    materials: [
      { title: "Your first Web API", detail: "Module 1 · 26 min", type: "Video" },
      { title: "Routing and controllers", detail: "Module 2 · 32 min", type: "Video" },
      { title: "API workshop notes", detail: "Course handout · PDF", type: "Guide" },
    ],
  },
  {
    program: "Data Analyst Program",
    schedule: "Saturdays · 11:00 AM",
    location: "Andalusia Academy · Room 2",
    materials: [
      { title: "Relational databases", detail: "Module 1 · 20 min", type: "Video" },
      { title: "SQL query workbook", detail: "Practice resource · PDF", type: "Workbook" },
    ],
  },
];

function LearnerLMS() {
  const context = useContext(userContext);
  const userId = context?.user?.userId;
  const [courses, setCourses] = useState<LearningCourse[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<LearnerTab>("courses");
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const isLoading =
    Boolean(context?.isLoading) ||
    (typeof userId === "number" && loadedUserId !== userId);

  useEffect(() => {
    if (context?.isLoading) return;
    if (typeof userId !== "number") return;
    const learnerId = userId;

    const controller = new AbortController();

    async function loadCourses() {
      try {
        const applications = await enrollmentApi.getMine(controller.signal);
        if (controller.signal.aborted) return;

        setErrorMessage("");
        setIsOfflineFallback(false);
        const enrolled = applications.filter(
          (application) => application.status === "Enrolled",
        );
        const liveCourses = enrolled.map((application, index) => {
          const template =
            learningContentTemplates[index % learningContentTemplates.length];
          return {
            ...template,
            id: application.id,
            courseId: application.courseId,
            name: application.courseName,
            progress: application.progress,
          };
        });
        setCourses(liveCourses);
        setActiveCourseId((current) =>
          liveCourses.some((course) => course.id === current)
            ? current
            : (liveCourses[0]?.id ?? null),
        );
        setLoadedUserId(learnerId);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Learner course data could not be loaded.", error);
        setCourses([]);
        setActiveCourseId(null);
        setIsOfflineFallback(true);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Learner data is offline. Course attendance could not be loaded.",
        );
        setLoadedUserId(learnerId);
      }
    }

    void loadCourses();
    return () => controller.abort();
  }, [context?.isLoading, userId]);

  const activeCourse = courses.find((course) => course.id === activeCourseId);
  const refreshActiveCourseProgress = useCallback(
    (progress: number) => {
      if (activeCourseId === null) return;
      setCourses((current) =>
        current.map((item) =>
          item.id === activeCourseId ? { ...item, progress } : item,
        ),
      );
    },
    [activeCourseId],
  );
  const programs = Array.from(
    new Set(courses.map((course) => course.program)),
  ).map((name) => {
    const programCourses = courses.filter((course) => course.program === name);
    const progress = Math.round(
      programCourses.reduce((total, course) => total + course.progress, 0) /
        programCourses.length,
    );
    return { name, courses: programCourses, progress };
  });

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#2b2420]">
      <NavBar />
      <main className="mx-auto min-h-[65vh] max-w-[1180px] px-4 py-9 sm:px-6 sm:py-12">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#a55335]">
              Learner space
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
              Your learning, in one place
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#765f52]">
              Pick up where you left off, get ready for your next session, and
              keep an eye on your progress.
            </p>
          </div>
          <Link
            to="/Courses"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#a9694f] px-5 py-2.5 font-semibold text-[#8f5640] transition hover:bg-white"
          >
            Explore courses
          </Link>
        </header>

        {context?.isLoading || isLoading ? (
          <section
            role="status"
            className="rounded-2xl border border-[#dfd2c3] bg-white p-8 text-[#765f52]"
          >
            Loading your learning space…
          </section>
        ) : !context?.user ? (
          <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">
              Sign in to open your learning space
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#765f52]">
              Your courses, assignments, and attendance are private to your
              learner account.
            </p>
            <Link
              to="/Login"
              state={{ from: "/LearnerLMS" }}
              className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#a9694f] px-5 py-2.5 font-semibold text-white transition hover:bg-[#8f5640]"
            >
              Go to login
            </Link>
          </section>
        ) : (
          <>
            {isOfflineFallback && (
              <div
                role="status"
                className="mb-6 rounded-xl border border-[#dfd2c3] bg-[#f0e8da] p-4 text-sm text-[#765f52]"
              >
                Live learner and attendance data are unavailable.
                <span className="mt-1 block text-xs">{errorMessage}</span>
              </div>
            )}

            <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-[#dfd2c3]">
              <TabButton
                selected={activeTab === "courses"}
                onClick={() => setActiveTab("courses")}
                count={courses.length}
              >
                My Courses
              </TabButton>
              <TabButton
                selected={activeTab === "programs"}
                onClick={() => setActiveTab("programs")}
                count={programs.length}
              >
                My Programs
              </TabButton>
            </div>

            {courses.length === 0 ? (
              <section className="rounded-2xl border border-[#dfd2c3] bg-white p-8 text-center">
                <h2 className="font-serif text-2xl font-bold">
                  Your courses will show up here
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#765f52]">
                  Once your application is approved and payment is complete,
                  you’ll find course materials and sessions in your learning
                  space.
                </p>
                <Link
                  to="/Courses"
                  className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#a9694f] px-5 py-2.5 font-semibold text-white transition hover:bg-[#8f5640]"
                >
                  Browse courses
                </Link>
              </section>
            ) : activeTab === "courses" ? (
              <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
                <section aria-label="My courses" className="space-y-3">
                  {courses.map((course) => (
                    <button
                      type="button"
                      key={course.id}
                      aria-pressed={course.id === activeCourse?.id}
                      onClick={() => setActiveCourseId(course.id)}
                      className={`w-full rounded-2xl border bg-white p-5 text-left transition ${
                        course.id === activeCourse?.id
                          ? "border-[#a9694f] shadow-sm"
                          : "border-[#dfd2c3] hover:border-[#c8aa98]"
                      }`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-[#a55335]">
                        {course.program}
                      </span>
                      <span className="mt-2 block font-serif text-lg font-bold">
                        {course.name}
                      </span>
                      <ProgressMeter progress={course.progress} />
                    </button>
                  ))}
                </section>
                {activeCourse && (
                  <CourseLearningView
                    course={activeCourse}
                    onProgressRefreshed={refreshActiveCourseProgress}
                  />
                )}
              </div>
            ) : (
              <section aria-label="My programs" className="grid gap-4 md:grid-cols-2">
                {programs.map((program) => (
                  <article
                    key={program.name}
                    className="rounded-2xl border border-[#dfd2c3] bg-white p-6"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#a55335]">
                      Learning program
                    </p>
                    <h2 className="mt-2 font-serif text-2xl font-bold">
                      {program.name}
                    </h2>
                    <ProgressMeter progress={program.progress} />
                    <ul className="mt-5 divide-y divide-[#eee2d5]">
                      {program.courses.map((course) => (
                        <li
                          key={course.id}
                          className="flex items-center justify-between gap-4 py-3 text-sm"
                        >
                          <span className="font-medium">{course.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCourseId(course.id);
                              setActiveTab("courses");
                            }}
                            className="shrink-0 font-semibold text-[#8f5640] hover:underline"
                          >
                            Open course
                          </button>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function TabButton({
  children,
  count,
  onClick,
  selected,
}: {
  children: string;
  count: number;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
        selected
          ? "border-[#a9694f] text-[#8f5640]"
          : "border-transparent text-[#765f52] hover:text-[#8f5640]"
      }`}
    >
      {children}
      <span className="ml-2 rounded-full bg-[#f0e8da] px-2 py-0.5 text-xs">
        {count}
      </span>
    </button>
  );
}

function ProgressMeter({ progress }: { progress: number }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-[#765f52]">Course progress</span>
        <span className="font-semibold text-[#2b2420]">{progress}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[#eee2d5]"
        role="progressbar"
        aria-label="Course progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="h-full rounded-full bg-[#a9694f]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function CourseLearningView({
  course,
  onProgressRefreshed,
}: {
  course: LearningCourse;
  onProgressRefreshed: (progress: number) => void;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#a55335]">
          {course.program}
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold">{course.name}</h2>
        <p className="mt-2 text-xs text-[#765f52]">
          Schedule and materials are sample LMS content.
        </p>
        <ProgressMeter progress={course.progress} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoCard label="Schedule" value={course.schedule} />
          <InfoCard label="Location" value={course.location} />
        </div>
      </section>

      <CourseAttendance
        courseId={course.courseId}
        onProgressRefreshed={onProgressRefreshed}
      />

      <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6">
        <SectionHeading title="Learning materials" detail="Pick up where you left off" />
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {course.materials.map((material) => (
            <li
              key={material.title}
              className="rounded-xl border border-[#eee2d5] bg-[#fffdfa] p-4"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-[#a55335]">
                {material.type}
              </span>
              <h3 className="mt-2 font-semibold">{material.title}</h3>
              <p className="mt-1 text-sm text-[#765f52]">{material.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <CourseAssignments courseId={course.courseId} />
    </div>
  );
}

function CourseAttendance({
  courseId,
  onProgressRefreshed,
}: {
  courseId: number;
  onProgressRefreshed: (progress: number) => void;
}) {
  const context = useContext(userContext);
  const learnerId = context?.user?.userId;
  const [state, setState] = useState<{
    courseId: number;
    learnerId: number;
    summary: LearnerAttendanceSummary;
    error: string;
  } | null>(null);
  const currentState =
    state?.courseId === courseId && state.learnerId === learnerId
      ? state
      : null;
  const summary = currentState?.summary;
  const isLoading =
    !context?.isLoading &&
    context?.user?.role === "Learner" &&
    typeof learnerId === "number" &&
    courseId > 0 &&
    currentState === null;

  useEffect(() => {
    if (
      context?.isLoading ||
      context?.user?.role !== "Learner" ||
      typeof learnerId !== "number" ||
      courseId <= 0
    ) {
      return;
    }

    const controller = new AbortController();
    const refreshAttendance = async () => {
      try {
        const result = await getLearnerAttendance(courseId, controller.signal);
        if (controller.signal.aborted) return;
        setState({ courseId, learnerId, summary: result, error: "" });
        onProgressRefreshed(result.courseProgress);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        console.error("Course attendance could not be loaded.", error);
        setState((current) => {
          const existing =
            current?.courseId === courseId && current.learnerId === learnerId
              ? current.summary
              : null;
          return {
            courseId,
            learnerId,
            summary: existing ?? {
              courseId,
              courseProgress: 0,
              totalSessions: 0,
              presentSessions: 0,
              sessions: [],
            },
            error:
              error instanceof Error
                ? error.message
                : "Course attendance could not be loaded.",
          };
        });
      }
    };

    void refreshAttendance();
    const refreshTimer = window.setInterval(() => {
      void refreshAttendance();
    }, 15000);

    return () => {
      controller.abort();
      window.clearInterval(refreshTimer);
    };
  }, [
    context?.isLoading,
    context?.user?.role,
    courseId,
    learnerId,
    onProgressRefreshed,
  ]);

  const totalSessions = summary
    ? Math.max(summary.totalSessions, summary.sessions.length)
    : 0;
  const presentSessions = summary
    ? Math.max(
        summary.presentSessions,
        summary.sessions.filter((session) => session.status === "Present")
          .length,
      )
    : 0;
  const attendancePercentage =
    totalSessions > 0
      ? Math.round((presentSessions / totalSessions) * 100)
      : 0;

  return (
    <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6">
      <SectionHeading
        title="Sessions and attendance"
        detail="Completed sessions and attendance marks recorded by your instructor"
      />
      {context?.user?.role !== "Learner" ? (
        <p className="mt-4 text-sm text-[#765f52]">
          Attendance is available to enrolled learners.
        </p>
      ) : courseId <= 0 ? (
        <p className="mt-4 text-sm text-[#765f52]">
          Live attendance is shown for courses linked to your learner account.
        </p>
      ) : isLoading ? (
        <p className="mt-4 text-sm text-[#765f52]" role="status">
          Loading attendance…
        </p>
      ) : currentState?.error ? (
        <p className="mt-4 text-sm text-[#873d2d]" role="alert">
          {currentState.error}
        </p>
      ) : summary ? (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <StatusPill
              label={`${presentSessions} of ${totalSessions} sessions attended`}
              tone={
                totalSessions > 0 && presentSessions === totalSessions
                  ? "green"
                  : "neutral"
              }
            />
            <span className="text-sm text-[#765f52]">
              {attendancePercentage}% attendance
            </span>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-[#eee2d5]"
            role="progressbar"
            aria-label="Attendance"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={attendancePercentage}
          >
            <div
              className="h-full rounded-full bg-[#a9694f] transition-[width]"
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
          {summary.sessions.length === 0 ? (
            <p className="mt-4 text-sm text-[#765f52]">
              No sessions have taken place yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#eee2d5]">
              {summary.sessions.map((session) => (
                <li
                  key={session.id}
                  className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-medium">{session.title}</h3>
                    <p className="mt-1 text-sm text-[#765f52]">
                      {formatAssignmentDate(session.startsAt)}
                    </p>
                  </div>
                  <StatusPill
                    label={session.status}
                    tone={
                      session.status === "Present"
                        ? "green"
                        : session.status === "Absent"
                          ? "rose"
                          : "neutral"
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </section>
  );
}

function CourseAssignments({ courseId }: { courseId: number }) {
  const context = useContext(userContext);
  const learnerId = context?.user?.userId;
  const [assignmentState, setAssignmentState] = useState<{
    courseId: number;
    learnerId: number;
    assignments: LearnerAssignment[];
    error: string;
  } | null>(null);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<number | null>(
    null,
  );
  const [submissionError, setSubmissionError] = useState("");
  const currentState =
    assignmentState?.courseId === courseId &&
    assignmentState.learnerId === learnerId
      ? assignmentState
      : null;
  const assignments = currentState?.assignments ?? [];
  const isLoading =
    !context?.isLoading &&
    context?.user?.role === "Learner" &&
    typeof learnerId === "number" &&
    courseId > 0 &&
    currentState === null;

  useEffect(() => {
    if (
      context?.isLoading ||
      context?.user?.role !== "Learner" ||
      typeof learnerId !== "number" ||
      courseId <= 0
    ) {
      return;
    }

    const controller = new AbortController();
    void learnerAssignmentsApi
      .getForCourse(courseId, controller.signal)
      .then((records) => {
        if (!controller.signal.aborted) {
          setAssignmentState({
            courseId,
            learnerId,
            assignments: records,
            error: "",
          });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Course assignments could not be loaded.", error);
        setAssignmentState({
          courseId,
          learnerId,
          assignments: [],
          error:
            error instanceof Error
              ? error.message
              : "Course assignments could not be loaded.",
        });
      });

    return () => controller.abort();
  }, [context?.isLoading, context?.user?.role, courseId, learnerId]);

  async function submitAssignment(
    event: FormEvent<HTMLFormElement>,
    assignmentId: number,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const content = String(formData.get("submission") ?? "").trim();
    if (!content || typeof learnerId !== "number") return;

    setSubmissionError("");
    setSubmittingAssignmentId(assignmentId);
    try {
      const submitted = await learnerAssignmentsApi.submit(
        courseId,
        assignmentId,
        content,
      );
      setAssignmentState((current) =>
        current &&
        current.courseId === courseId &&
        current.learnerId === learnerId
          ? {
              ...current,
              assignments: current.assignments.map((assignment) =>
                assignment.id === assignmentId
                  ? {
                      ...assignment,
                      status: submitted.status,
                      submission: submitted.content,
                      submittedAt: submitted.submittedAt,
                      grade: submitted.grade,
                      feedback: submitted.feedback,
                    }
                  : assignment,
              ),
            }
          : current,
      );
    } catch (error) {
      console.error("Assignment submission could not be saved.", error);
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Assignment submission could not be saved.",
      );
    } finally {
      setSubmittingAssignmentId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6">
      <SectionHeading
        title="Assignments"
        detail="Submit your work and track grading feedback"
      />
      {context?.user?.role !== "Learner" ? (
        <p className="mt-4 text-sm text-[#765f52]">
          Assignment submissions are available to enrolled learners.
        </p>
      ) : courseId <= 0 ? (
        <p className="mt-4 text-sm text-[#765f52]">
          Sign in while the assignment service is available to view course assignments.
        </p>
      ) : isLoading ? (
        <p className="mt-4 text-sm text-[#765f52]" role="status">
          Loading assignments…
        </p>
      ) : currentState?.error ? (
        <p className="mt-4 text-sm text-[#873d2d]" role="alert">
          {currentState.error}
        </p>
      ) : assignments.length === 0 ? (
        <p className="mt-4 text-sm text-[#765f52]">
          There are no assignments for this course yet.
        </p>
      ) : (
        <>
          {submissionError && (
            <p className="mt-4 rounded-lg border border-[#e7b7aa] bg-[#f8e9e5] p-3 text-sm text-[#873d2d]" role="alert">
              {submissionError}
            </p>
          )}
          <ul className="mt-4 divide-y divide-[#eee2d5]">
            {assignments.map((assignment) => (
              <li key={assignment.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#765f52]">
                      {assignment.description}
                    </p>
                    <p className="mt-2 text-xs text-[#765f52]">
                      Due {formatAssignmentDate(assignment.dueAt)}
                    </p>
                  </div>
                  <StatusPill
                    label={
                      assignment.status === "NotSubmitted"
                        ? "Not submitted"
                        : assignment.status
                    }
                    tone={assignment.status === "NotSubmitted" ? "neutral" : "green"}
                  />
                </div>

                {assignment.status === "NotSubmitted" ? (
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={(event) => void submitAssignment(event, assignment.id)}
                  >
                    <label className="block text-sm font-medium">
                      Your work or repository link
                      <textarea
                        name="submission"
                        required
                        maxLength={8000}
                        rows={4}
                        placeholder="Paste a repository URL or describe your completed work."
                        className="mt-2 w-full rounded-lg border border-[#dfd2c3] bg-white p-3 text-sm outline-none focus:border-[#a9694f] focus:ring-2 focus:ring-[#a9694f]/20"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={submittingAssignmentId !== null}
                      className="min-h-10 rounded-lg bg-[#a9694f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8f5640] disabled:cursor-wait disabled:opacity-60"
                    >
                      {submittingAssignmentId === assignment.id
                        ? "Submitting…"
                        : "Submit assignment"}
                    </button>
                  </form>
                ) : (
                  <div className="mt-4 rounded-xl bg-[#f7f1e8] p-4">
                    <p className="text-sm font-semibold">
                      {assignment.status}
                      {assignment.submittedAt
                        ? ` · ${formatAssignmentDate(assignment.submittedAt)}`
                        : ""}
                    </p>
                    {assignment.submission && (
                      <p className="mt-2 break-words whitespace-pre-wrap text-sm text-[#765f52]">
                        {assignment.submission}
                      </p>
                    )}
                    {assignment.grade !== null && (
                      <p className="mt-3 text-sm font-semibold text-[#166534]">
                        Score: {assignment.grade}/100
                      </p>
                    )}
                    {assignment.feedback && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-[#765f52]">
                        Feedback: {assignment.feedback}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function formatAssignmentDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f7f1e8] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#765f52]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-relaxed">{value}</p>
    </div>
  );
}

function SectionHeading({ title, detail }: { title: string; detail: string }) {
  return (
    <div>
      <h2 className="font-serif text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-[#765f52]">{detail}</p>
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "neutral" | "rose";
}) {
  const tones = {
    green: "bg-[#e5eee8] text-[#166534]",
    neutral: "bg-[#f0e8da] text-[#765f52]",
    rose: "bg-[#f8e9e5] text-[#873d2d]",
  };
  return (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {label}
    </span>
  );
}

export default LearnerLMS;

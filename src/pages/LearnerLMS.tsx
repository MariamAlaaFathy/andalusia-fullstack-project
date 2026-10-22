import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import { enrollmentApi } from "../services/enrollmentApi";
import { userContext } from "../types/UserContextType";

type SessionStatus = "Completed" | "Upcoming";
type AssignmentStatus = "Submitted" | "In progress" | "Not started";

type LearningCourse = {
  id: number;
  name: string;
  program: string;
  progress: number;
  schedule: string;
  location: string;
  materials: { title: string; detail: string; type: string }[];
  sessions: { title: string; date: string; time: string; status: SessionStatus }[];
  assignments: { title: string; due: string; status: AssignmentStatus }[];
  attendance: { date: string; session: string; status: "Present" | "Absent" }[];
};

type LearnerTab = "courses" | "programs";

const mockCourses: LearningCourse[] = [
  {
    id: -1,
    name: "C# Basics",
    program: "Backend Developer Program",
    progress: 68,
    schedule: "Tuesdays & Thursdays · 6:00 PM",
    location: "Online · Live classroom",
    materials: [
      { title: "Getting started with C#", detail: "Module 1 · 18 min", type: "Video" },
      { title: "Variables and types", detail: "Module 2 · 24 min", type: "Video" },
      { title: "C# quick reference", detail: "Course handout · PDF", type: "Guide" },
    ],
    sessions: [
      { title: "Methods and parameters", date: "Oct 20, 2026", time: "6:00 PM", status: "Completed" },
      { title: "Collections and loops", date: "Oct 24, 2026", time: "6:00 PM", status: "Upcoming" },
      { title: "Working with classes", date: "Oct 27, 2026", time: "6:00 PM", status: "Upcoming" },
    ],
    assignments: [
      { title: "Build a simple calculator", due: "Due Oct 25", status: "In progress" },
      { title: "Practice: arrays and lists", due: "Submitted Oct 16", status: "Submitted" },
      { title: "Object-oriented basics", due: "Due Oct 30", status: "Not started" },
    ],
    attendance: [
      { date: "Oct 20, 2026", session: "Methods and parameters", status: "Present" },
      { date: "Oct 15, 2026", session: "Control flow", status: "Present" },
      { date: "Oct 13, 2026", session: "Data types", status: "Absent" },
    ],
  },
  {
    id: -2,
    name: "ASP.NET Core",
    program: "Backend Developer Program",
    progress: 32,
    schedule: "Mondays & Wednesdays · 7:00 PM",
    location: "Online · Live classroom",
    materials: [
      { title: "Your first Web API", detail: "Module 1 · 26 min", type: "Video" },
      { title: "Routing and controllers", detail: "Module 2 · 32 min", type: "Video" },
      { title: "API workshop notes", detail: "Course handout · PDF", type: "Guide" },
    ],
    sessions: [
      { title: "REST API fundamentals", date: "Oct 19, 2026", time: "7:00 PM", status: "Completed" },
      { title: "Dependency injection", date: "Oct 23, 2026", time: "7:00 PM", status: "Upcoming" },
    ],
    assignments: [
      { title: "Create your first endpoint", due: "Due Oct 26", status: "In progress" },
      { title: "API design checklist", due: "Due Oct 30", status: "Not started" },
    ],
    attendance: [
      { date: "Oct 19, 2026", session: "REST API fundamentals", status: "Present" },
      { date: "Oct 14, 2026", session: "Project setup", status: "Present" },
    ],
  },
  {
    id: -3,
    name: "SQL Fundamentals",
    program: "Data Analyst Program",
    progress: 14,
    schedule: "Saturdays · 11:00 AM",
    location: "Andalusia Academy · Room 2",
    materials: [
      { title: "Relational databases", detail: "Module 1 · 20 min", type: "Video" },
      { title: "SQL query workbook", detail: "Practice resource · PDF", type: "Workbook" },
    ],
    sessions: [
      { title: "Tables and relationships", date: "Oct 24, 2026", time: "11:00 AM", status: "Upcoming" },
      { title: "Your first SELECT query", date: "Oct 31, 2026", time: "11:00 AM", status: "Upcoming" },
    ],
    assignments: [
      { title: "Explore a sample database", due: "Due Oct 29", status: "Not started" },
    ],
    attendance: [
      { date: "Oct 17, 2026", session: "Database foundations", status: "Present" },
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
          const template = mockCourses[index % mockCourses.length];
          return { ...template, id: application.id, name: application.courseName };
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
        setCourses(mockCourses);
        setActiveCourseId((current) =>
          mockCourses.some((course) => course.id === current)
            ? current
            : mockCourses[0].id,
        );
        setIsOfflineFallback(true);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Learner data is offline. Showing sample course content.",
        );
        setLoadedUserId(learnerId);
      }
    }

    void loadCourses();
    return () => controller.abort();
  }, [context?.isLoading, userId]);

  const activeCourse = courses.find((course) => course.id === activeCourseId);
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
                Showing sample learner data while the LMS API is unavailable.
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
                {activeCourse && <CourseLearningView course={activeCourse} />}
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

function CourseLearningView({ course }: { course: LearningCourse }) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#a55335]">
          {course.program}
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold">{course.name}</h2>
        <p className="mt-2 text-xs text-[#765f52]">
          Schedule, materials, assignments, and attendance are sample LMS
          content.
        </p>
        <ProgressMeter progress={course.progress} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoCard label="Schedule" value={course.schedule} />
          <InfoCard label="Location" value={course.location} />
        </div>
      </section>

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

      <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6">
        <SectionHeading title="Sessions" detail="Your live and recorded classes" />
        <ul className="mt-4 divide-y divide-[#eee2d5]">
          {course.sessions.map((session) => (
            <li
              key={`${session.date}-${session.title}`}
              className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold">{session.title}</h3>
                <p className="mt-1 text-sm text-[#765f52]">
                  {session.date} · {session.time}
                </p>
              </div>
              <StatusPill
                label={session.status}
                tone={session.status === "Completed" ? "green" : "neutral"}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6">
        <SectionHeading title="Assignments" detail="Keep track of your next steps" />
        <ul className="mt-4 divide-y divide-[#eee2d5]">
          {course.assignments.map((assignment) => (
            <li
              key={assignment.title}
              className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold">{assignment.title}</h3>
                <p className="mt-1 text-sm text-[#765f52]">{assignment.due}</p>
              </div>
              <StatusPill
                label={assignment.status}
                tone={assignment.status === "Submitted" ? "green" : "neutral"}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6">
        <SectionHeading title="Attendance history" detail="Your recent class record" />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#eee2d5] text-xs uppercase tracking-wide text-[#765f52]">
                <th className="py-3 pr-3 font-semibold">Date</th>
                <th className="py-3 pr-3 font-semibold">Session</th>
                <th className="py-3 font-semibold">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {course.attendance.map((record) => (
                <tr
                  key={`${record.date}-${record.session}`}
                  className="border-b border-[#eee2d5] last:border-0"
                >
                  <td className="py-3 pr-3 text-[#765f52]">{record.date}</td>
                  <td className="py-3 pr-3 font-medium">{record.session}</td>
                  <td className="py-3">
                    <StatusPill
                      label={record.status}
                      tone={record.status === "Present" ? "green" : "rose"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
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

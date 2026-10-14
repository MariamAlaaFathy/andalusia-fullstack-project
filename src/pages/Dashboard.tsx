import { useContext, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import {
  enrollmentApi,
  type CourseApplication,
} from "../services/enrollmentApi";
import { formatPrice } from "../utils/formatPrice";
import { userContext } from "../types/UserContextType";

type DashboardSection = "applications" | "payments";

function Dashboard() {
  const context = useContext(userContext);
  const userId = context?.user?.userId;
  const hasDashboard = Boolean(context?.user);
  const [applications, setApplications] = useState<CourseApplication[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<number>();
  const [errorMessage, setErrorMessage] = useState("");
  const [section, setSection] = useState<DashboardSection>("applications");
  const isLoading = typeof userId === "number" && loadedUserId !== userId;

  useEffect(() => {
    if (context?.isLoading) return;
    if (typeof userId !== "number") return;

    const controller = new AbortController();

    async function loadApplications() {
      setErrorMessage("");
      try {
        const records = await enrollmentApi.getMine(controller.signal);
        if (controller.signal.aborted) return;
        setApplications(records);
        setLoadedUserId(userId);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Dashboard data could not be loaded.", error);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Dashboard data could not be loaded.",
        );
        setLoadedUserId(userId);
      }
    }

    void loadApplications();
    return () => controller.abort();
  }, [context?.isLoading, userId]);

  const enrolledCount = applications.filter(
    (application) => application.status === "Enrolled",
  ).length;
  const pendingCount = applications.filter(
    (application) => application.status === "AwaitingPayment",
  ).length;
  const payments = applications.flatMap((application) =>
    application.payment
      ? [{ application, payment: application.payment }]
      : [],
  );

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
              My dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#765f52]">
              Keep track of your course applications, enrollments, and payment
              history.
            </p>
          </div>
          <Link
            to="/Courses"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#a9694f] px-5 py-2.5 font-semibold text-white transition hover:bg-[#8f5640] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
          >
            Explore courses
          </Link>
        </header>

        {context?.isLoading && (
          <p role="status" className="mb-6 text-sm text-[#765f52]">
            Checking your session…
          </p>
        )}

        {!context?.isLoading && !context?.user && (
          <section className="mb-6 rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">
              Sign in to view your dashboard
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#765f52]">
              Your applications, enrollments, and payment history are private
              to your account.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/Login"
                state={{ from: "/Dashboard" }}
                className="inline-flex min-h-11 items-center rounded-lg border border-[#a9694f] px-5 py-2.5 font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8]"
              >
                Go to login
              </Link>
              <Link
                to="/Signup"
                state={{ from: "/Dashboard" }}
                className="inline-flex min-h-11 items-center rounded-lg bg-[#a9694f] px-5 py-2.5 font-semibold text-white transition hover:bg-[#8f5640]"
              >
                Create an account
              </Link>
            </div>
          </section>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-[#e7b7aa] bg-[#f8e9e5] p-4 text-sm text-[#873d2d]"
          >
            {errorMessage}
          </div>
        )}

        <section
          aria-label="Enrollment overview"
          className={`mb-8 grid gap-4 sm:grid-cols-3 ${
            hasDashboard ? "" : "hidden"
          }`}
        >
          <OverviewCard label="Applications" value={applications.length} />
          <OverviewCard label="Awaiting payment" value={pendingCount} />
          <OverviewCard label="Enrolled courses" value={enrolledCount} />
        </section>

        <section
          className={`overflow-hidden rounded-2xl border border-[#dfd2c3] bg-white ${
            hasDashboard ? "" : "hidden"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-[#eee2d5] p-4 sm:px-6">
            <SectionButton
              selected={section === "applications"}
              onClick={() => setSection("applications")}
            >
              My applications
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {applications.length}
              </span>
            </SectionButton>
            <SectionButton
              selected={section === "payments"}
              onClick={() => setSection("payments")}
            >
              My payments
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {payments.length}
              </span>
            </SectionButton>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <p className="py-10 text-center text-sm text-[#765f52]" role="status">
                Loading your dashboard…
              </p>
            ) : errorMessage ? (
              <p className="py-8 text-center text-sm text-[#765f52]">
                Dashboard records could not be loaded.
              </p>
            ) : section === "applications" ? (
              applications.length ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <article
                      key={application.id}
                      className="flex flex-col gap-4 rounded-xl border border-[#eee2d5] p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#a55335]">
                          Applied {formatDate(application.createdAt)}
                        </p>
                        <h2 className="mt-1 break-words font-serif text-xl font-bold">
                          {application.courseName}
                        </h2>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <StatusBadge status={application.status} />
                          <span className="text-sm text-[#765f52]">
                            {formatPrice(application.amount)}
                          </span>
                        </div>
                      </div>
                      {application.status === "AwaitingPayment" ? (
                        <Link
                          to={`/Apply/${application.courseId}`}
                          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-[#a9694f] px-4 py-2 font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
                        >
                          Continue enrollment
                        </Link>
                      ) : (
                        <span className="shrink-0 text-sm font-semibold text-[#166534]">
                          Ready to learn
                        </span>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Your learning journey starts here"
                  description="When you apply to a course, you’ll find your application status and enrollment details here."
                  action="Find a course"
                />
              )
            ) : payments.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#eee2d5] text-xs uppercase tracking-wide text-[#765f52]">
                      <th className="px-3 py-3 font-semibold sm:px-4">
                        Course
                      </th>
                      <th className="px-3 py-3 font-semibold sm:px-4">
                        Date
                      </th>
                      <th className="px-3 py-3 font-semibold sm:px-4">
                        Amount
                      </th>
                      <th className="px-3 py-3 font-semibold sm:px-4">
                        Status
                      </th>
                      <th className="px-3 py-3 font-semibold sm:px-4">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(({ application, payment }) => (
                      <tr
                        key={payment.id}
                        className="border-b border-[#eee2d5] last:border-0"
                      >
                        <td className="break-words px-3 py-4 font-semibold sm:px-4">
                          {application.courseName}
                        </td>
                        <td className="px-3 py-4 text-sm text-[#765f52] sm:px-4">
                          {payment.paidAt
                            ? formatDate(payment.paidAt)
                            : "—"}
                        </td>
                        <td className="px-3 py-4 font-semibold sm:px-4">
                          {formatPrice(payment.amount)}
                        </td>
                        <td className="px-3 py-4 sm:px-4">
                          <StatusBadge status={payment.status} />
                        </td>
                        <td className="px-3 py-4 font-mono text-xs text-[#765f52] sm:px-4">
                          {payment.id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 text-xs leading-relaxed text-[#765f52]">
                  Payment records show transaction status and do not include
                  card details.
                </p>
              </div>
            ) : (
              <EmptyState
                title="No payments to show"
                description="Payments appear here after you complete checkout for an enrolled course."
                action="Browse courses"
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function OverviewCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-[#dfd2c3] bg-white p-5">
      <p className="text-sm font-medium text-[#765f52]">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold">{value}</p>
    </article>
  );
}

function SectionButton({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-11 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f] ${
        selected
          ? "bg-[#a9694f] text-white"
          : "text-[#765f52] hover:bg-[#f7f1e8]"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const enrolled =
    status === "Enrolled" || status === "Paid";
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        enrolled
          ? "bg-[#e5eee8] text-[#166534]"
          : status === "Failed"
            ? "bg-[#f8e9e5] text-[#873d2d]"
            : "bg-[#f3e7d8] text-[#8a5a2b]"
      }`}
    >
      {status}
    </span>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: string;
}) {
  return (
    <div className="mx-auto max-w-lg py-9 text-center">
      <span
        aria-hidden="true"
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1e0d6] text-xl text-[#8f5640]"
      >
        ✦
      </span>
      <h2 className="mt-4 font-serif text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#765f52]">
        {description}
      </p>
      <Link
        to="/Courses"
        className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-[#d8cabc] bg-white px-5 py-2.5 font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
      >
        {action}
      </Link>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export default Dashboard;

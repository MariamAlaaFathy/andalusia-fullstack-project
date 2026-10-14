import { useContext, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CatalogEmpty } from "../Components/CatalogFeedback";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import { catalogApi } from "../services/catalogApi";
import {
  enrollmentApi,
  type CourseApplication,
} from "../services/enrollmentApi";
import { formatPrice } from "../utils/formatPrice";
import type { Coursetype } from "../types/Coursetype";
import { userContext } from "../types/UserContextType";

type FlowStep = "application" | "payment" | "complete";

function createPreviewCourse(id: number): Coursetype {
  return {
    id,
    name: id === 2 ? "ASP.NET Core" : "C# Basics",
    description:
      id === 2
        ? "Learn how to build web applications with ASP.NET Core."
        : "Learn programming fundamentals with C#.",
    price: id === 2 ? 200 : 100,
    category: "Programming",
    programId: 2,
    programName: "Backend Developer Program",
    careerPathId: 2,
    careerPathName: "Backend Developer",
    duration: id === 2 ? "8 weeks" : "6 weeks",
    level: id === 2 ? "Intermediate" : "Beginner",
    prerequisites: [],
    learningOutcomes: [],
  };
}

function Application() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const context = useContext(userContext);
  const accessToken = context?.user.accessToken;
  const previewMode =
    !accessToken && searchParams.get("preview") === "true";
  const id = Number(courseId);
  const validId = Number.isSafeInteger(id) && id > 0;
  const [course, setCourse] = useState<Coursetype | null>(null);
  const [application, setApplication] = useState<CourseApplication | null>(
    null,
  );
  const [step, setStep] = useState<FlowStep>("application");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourse() {
      setIsLoading(true);
      setErrorMessage("");
      if (!validId || (!accessToken && !previewMode)) {
        setIsLoading(false);
        return;
      }

      try {
        if (previewMode) {
          setCourse(createPreviewCourse(id));
          setIsLoading(false);
          return;
        }
        if (!accessToken) return;

        const loadedCourse = await catalogApi.getCourse(id, controller.signal);
        if (controller.signal.aborted) return;
        setCourse(loadedCourse);

        const checkoutStatus = searchParams.get("checkout");
        const sessionId = searchParams.get("session_id");
        if (checkoutStatus === "success" && sessionId) {
          const confirmed = await enrollmentApi.confirmCheckout(
            sessionId,
            accessToken,
          );
          if (controller.signal.aborted) return;
          setApplication(confirmed);
          setStep("complete");
          return;
        }

        const applications = await enrollmentApi.getMine(
          accessToken,
          controller.signal,
        );
        if (controller.signal.aborted) return;
        const existing = applications.find(
          (item) => item.courseId === loadedCourse.id,
        );
        if (existing) {
          setApplication(existing);
          setStep(existing.status === "Enrolled" ? "complete" : "payment");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("The application could not be loaded.", error);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "The course could not be loaded. Please try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadCourse();
    return () => controller.abort();
  }, [accessToken, id, previewMode, searchParams, validId]);

  async function submitApplication() {
    if (!course) return;
    if (previewMode) {
      setApplication({
        id: "preview-application",
        courseId: course.id,
        courseName: course.name,
        amount: course.price,
        status: course.price === 0 ? "Enrolled" : "AwaitingPayment",
        createdAt: new Date().toISOString(),
        payment: null,
      });
      setStep(course.price === 0 ? "complete" : "payment");
      return;
    }
    if (!accessToken) return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const created = await enrollmentApi.create(course.id, accessToken);
      setApplication(created);
      setStep(created.status === "Enrolled" ? "complete" : "payment");
    } catch (error) {
      console.error("The application could not be saved.", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Your application could not be saved. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function completePayment() {
    if (!application) return;
    if (previewMode) {
      setApplication({
        ...application,
        status: "Enrolled",
        payment: {
          id: "preview-payment",
          amount: application.amount,
          currency: "usd",
          status: "Paid",
          paidAt: new Date().toISOString(),
        },
      });
      setStep("complete");
      return;
    }
    if (!accessToken) return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const checkout = await enrollmentApi.startCheckout(
        application.id,
        accessToken,
      );
      setApplication(checkout.application);
      if (checkout.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl);
      } else if (checkout.application.status === "Enrolled") {
        setStep("complete");
      }
    } catch (error) {
      console.error("Secure checkout could not be started.", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Secure checkout could not be started. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepNumber = step === "application" ? 1 : step === "payment" ? 2 : 3;

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#2b2420]">
      <NavBar />
      <main className="mx-auto min-h-[65vh] max-w-[1180px] px-4 py-9 sm:px-6 sm:py-12">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#a55335]">
            Course application
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
            Apply &amp; enroll
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#765f52]">
            Submit your application, review the demo checkout, and track your
            enrollment from your dashboard.
          </p>
        </header>

        {previewMode && (
          <aside
            role="status"
            className="mb-6 max-w-3xl rounded-xl border border-[#d8cabc] bg-[#f3e7d8] p-4 text-sm text-[#765f52]"
          >
            Enrollment flow preview: the buttons below only advance sample
            stages. Nothing is submitted, charged, or saved.
          </aside>
        )}

        {!accessToken && !previewMode ? (
          <section className="max-w-xl rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">
              Sign in to apply
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#765f52]">
              Course applications and payment records are linked to your
              authenticated learner account.
            </p>
            <Link
              to="/Login"
              className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#a9694f] px-5 py-2.5 font-semibold text-white transition hover:bg-[#8f5640]"
            >
              Go to login
            </Link>
          </section>
        ) : isLoading ? (
          <div
            className="rounded-2xl border border-[#dfd2c3] bg-white p-8 text-[#765f52]"
            role="status"
          >
            Loading course details…
          </div>
        ) : course ? (
          <>
            <ol
              aria-label="Enrollment progress"
              className="mb-7 grid max-w-3xl grid-cols-3 gap-3"
            >
              {(["Application", "Payment", "Enrollment"] as const).map(
                (label, index) => {
                  const current = index + 1 === stepNumber;
                  const complete = index + 1 < stepNumber;
                  return (
                    <li
                      key={label}
                      aria-current={current ? "step" : undefined}
                      className={`border-b-2 pb-3 ${
                        current || complete
                          ? "border-[#a9694f] text-[#8f5640]"
                          : "border-[#dfd2c3] text-[#765f52]"
                      }`}
                    >
                      <span className="block text-xs font-bold">
                        STEP 0{index + 1}
                      </span>
                      <span className="mt-1 block text-sm font-semibold">
                        {label}
                      </span>
                    </li>
                  );
                },
              )}
            </ol>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
                {errorMessage && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-[#e7b7aa] bg-[#f8e9e5] p-4 text-sm text-[#873d2d]"
                  >
                    {errorMessage}
                  </div>
                )}

                {step === "application" && (
                  <>
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#a55335]">
                      Step 1 of 3
                    </p>
                    <h2 className="mt-2 font-serif text-2xl font-bold">
                      Ready to start learning?
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-[#765f52]">
                      Submit an application for this course. You can review the
                      payment step before confirming your enrollment.
                    </p>
                    <button
                      type="button"
                      onClick={() => void submitApplication()}
                      disabled={isSubmitting}
                      className="mt-7 min-h-12 w-full rounded-lg bg-[#a9694f] px-5 py-3 font-bold text-white transition hover:bg-[#8f5640] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                    >
                      {previewMode
                        ? "Preview next stage"
                        : isSubmitting
                          ? "Submitting…"
                          : "Submit application"}
                    </button>
                  </>
                )}

                {step === "payment" && (
                  <>
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#a55335]">
                      Step 2 of 3
                    </p>
                    <h2 className="mt-2 font-serif text-2xl font-bold">
                      Review your payment
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-[#765f52]">
                      {previewMode
                        ? "This preview simulates the payment stage only. It will not open Stripe or charge a card."
                        : "You’ll enter your card details on Stripe’s secure hosted checkout page. Card numbers and security codes are never sent to or stored by Andalusia Academy."}
                    </p>
                    <div className="mt-6 rounded-xl bg-[#f7f1e8] p-5">
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-[#765f52]">Course fee</span>
                        <span className="font-semibold">
                          {formatPrice(course.price)}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-between gap-4 border-t border-[#dfd2c3] pt-4">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-[#8f5640]">
                          {formatPrice(course.price)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void completePayment()}
                      disabled={isSubmitting}
                      className="mt-6 min-h-12 w-full rounded-lg bg-[#a9694f] px-5 py-3 font-bold text-white transition hover:bg-[#8f5640] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f] disabled:cursor-wait disabled:opacity-60"
                    >
                      {isSubmitting
                        ? "Confirming…"
                        : previewMode
                          ? "Preview enrollment confirmation"
                        : course.price === 0
                          ? "Confirm free enrollment"
                          : `Continue to secure card payment · ${formatPrice(course.price)}`}
                    </button>
                    {!previewMode && (
                      <p className="mt-3 text-center text-xs text-[#765f52]">
                        Payments are processed securely by Stripe.
                      </p>
                    )}
                  </>
                )}

                {step === "complete" && (
                  <div className="py-4 text-center sm:py-8">
                    <span
                      aria-hidden="true"
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e5eee8] text-2xl font-bold text-[#166534]"
                    >
                      ✓
                    </span>
                    <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-[#166534]">
                      Enrollment confirmed
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-bold">
                      You’re in!
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#765f52]">
                      {previewMode
                        ? `This preview shows the confirmation stage for ${course.name}. It has not been saved.`
                        : `Your enrollment in ${course.name} is saved. Find your application and payment status on your dashboard.`}
                    </p>
                    <Link
                      to={previewMode ? "/Dashboard?preview=true" : "/Dashboard"}
                      className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#a9694f] px-6 py-3 font-bold text-white transition hover:bg-[#8f5640] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
                    >
                      Go to dashboard
                    </Link>
                  </div>
                )}
              </section>

              <aside className="overflow-hidden rounded-2xl border border-[#dfd2c3] bg-white">
                <div
                  aria-hidden="true"
                  className="h-32 bg-gradient-to-br from-[#f1e0d6] via-[#f0e8da] to-[#e7d4c6]"
                />
                <div className="p-6">
                  <span className="rounded-full bg-[#f1e0d6] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#8f5640]">
                    {course.category}
                  </span>
                  <h2 className="mt-4 break-words font-serif text-xl font-bold">
                    {course.name}
                  </h2>
                  <p className="mt-2 text-sm text-[#765f52]">
                    {course.duration || "Self-paced"} ·{" "}
                    {course.level || "All levels"}
                  </p>
                  <div className="mt-5 border-t border-[#eee2d5] pt-4">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-[#765f52]">Course fee</span>
                      <span className="font-bold">{formatPrice(course.price)}</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-[#dfd2c3] bg-white p-8">
            {errorMessage ? (
              <div
                role="alert"
                className="rounded-xl border border-[#e7b7aa] bg-[#f8e9e5] p-4 text-sm text-[#873d2d]"
              >
                {errorMessage}
              </div>
            ) : (
              <CatalogEmpty label="course" />
            )}
            <Link
              to="/Courses"
              className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[#a9694f] px-5 py-2.5 font-semibold text-white transition hover:bg-[#8f5640]"
            >
              Browse courses
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Application;

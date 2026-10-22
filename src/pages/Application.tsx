import { useContext, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
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

function Application() {
  const { courseId } = useParams();
  const context = useContext(userContext);
  const userId = context?.user?.userId;
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

  // New Credit Card Input and Validation States
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardErrors, setCardErrors] = useState<{
    number?: string;
    expiry?: string;
    cvc?: string;
  }>({});

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourse() {
      setIsLoading(true);
      setErrorMessage("");
      if (context?.isLoading) return;
      if (!validId || typeof userId !== "number") {
        setIsLoading(false);
        return;
      }

      try {
        const loadedCourse = await catalogApi.getCourse(id, controller.signal);
        if (controller.signal.aborted) return;
        setCourse(loadedCourse);

        const applications = await enrollmentApi.getMine(controller.signal);
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
  }, [context?.isLoading, id, userId, validId]);

  async function submitApplication() {
    if (!course || typeof userId !== "number") return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const created = await enrollmentApi.create(course.id);
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

  // Credit Card Validation Logic
  function validateCardFields() {
    const errors: { number?: string; expiry?: string; cvc?: string } = {};

    // Clean spaces and dashes from card number
    const cleanNumber = cardNumber.replace(/[\s-]/g, "");
    // Standard cards are between 13 and 19 digits (Visa/Mastercard/Amex)
    if (!/^\d{13,19}$/.test(cleanNumber)) {
      errors.number = "Enter a valid 13 to 19 digit card number.";
    }

    // Clean expiry and check MM/YY format (e.g., 12/28)
    const cleanExpiry = cardExpiry.trim();
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cleanExpiry)) {
      errors.expiry = "Use MM/YY format (e.g. 12/28).";
    }

    // CVC check (3 or 4 digits)
    const cleanCvc = cardCvc.trim();
    if (!/^\d{3,4}$/.test(cleanCvc)) {
      errors.cvc = "Invalid CVC (3-4 digits).";
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function completePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!application || typeof userId !== "number") return;

    // Run validation check before submitting payment
    if (!validateCardFields()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const paid = await enrollmentApi.completeDemoPayment(application.id);
      setApplication(paid);
      setStep("complete");
    } catch (error) {
      console.error("Demo payment could not be completed.", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Demo payment could not be completed. Please try again.",
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
            Submit your application, complete payment when required, and track
            your enrollment from your dashboard.
          </p>
        </header>

        {context?.isLoading || isLoading ? (
          <div
            className="rounded-2xl border border-[#dfd2c3] bg-white p-8 text-[#765f52]"
            role="status"
          >
            Loading course details…
          </div>
        ) : !context?.user ? (
          <section className="max-w-xl rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">Sign in to apply</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#765f52]">
              Course applications and payment records are linked to your
              authenticated learner account.
            </p>
            <Link
              to="/Login"
              state={{ from: `/Apply/${id}` }}
              className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#a9694f] px-5 py-2.5 font-semibold text-white transition hover:bg-[#8f5640]"
            >
              Go to login
            </Link>
            <Link
              to="/Signup"
              state={{ from: `/Apply/${id}` }}
              className="ml-3 mt-6 inline-flex min-h-11 items-center rounded-lg border border-[#a9694f] px-5 py-2.5 font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8]"
            >
              Create an account
            </Link>
          </section>
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
                      {isSubmitting ? "Submitting…" : "Submit application"}
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
                    {import.meta.env.DEV ? (
                      <form
                        onSubmit={(event) => void completePayment(event)}
                        autoComplete="off"
                      >
                        <fieldset
                          disabled={isSubmitting}
                          className="mt-5 space-y-4"
                        >
                          <legend className="mb-3 text-sm font-semibold text-[#2b2420]">
                            Card details
                          </legend>

                          <label className="block text-sm font-medium text-[#765f52]">
                            Card number
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="off"
                              maxLength={23}
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className={`mt-1 min-h-11 w-full rounded-lg border px-3 text-[#2b2420] outline-none focus:ring-2 ${
                                cardErrors.number
                                  ? "border-red-500 focus:ring-red-200"
                                  : "border-[#dfd2c3] focus:border-[#a9694f] focus:ring-[#a9694f]/20"
                              }`}
                            />
                            {cardErrors.number && (
                              <span className="mt-1 text-xs text-red-600 block">
                                {cardErrors.number}
                              </span>
                            )}
                          </label>

                          <div className="grid grid-cols-2 gap-4">
                            <label className="block text-sm font-medium text-[#765f52]">
                              Expiry
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="MM/YY"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className={`mt-1 min-h-11 w-full rounded-lg border px-3 text-[#2b2420] outline-none focus:ring-2 ${
                                  cardErrors.expiry
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-[#dfd2c3] focus:border-[#a9694f] focus:ring-[#a9694f]/20"
                                }`}
                              />
                              {cardErrors.expiry && (
                                <span className="mt-1 text-xs text-red-600 block">
                                  {cardErrors.expiry}
                                </span>
                              )}
                            </label>

                            <label className="block text-sm font-medium text-[#765f52]">
                              CVC
                              <input
                                type="password"
                                inputMode="numeric"
                                autoComplete="off"
                                maxLength={4}
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                className={`mt-1 min-h-11 w-full rounded-lg border px-3 text-[#2b2420] outline-none focus:ring-2 ${
                                  cardErrors.cvc
                                    ? "border-red-500 focus:ring-red-200"
                                    : "border-[#dfd2c3] focus:border-[#a9694f] focus:ring-[#a9694f]/20"
                                }`}
                              />
                              {cardErrors.cvc && (
                                <span className="mt-1 text-xs text-red-600 block">
                                  {cardErrors.cvc}
                                </span>
                              )}
                            </label>
                          </div>
                        </fieldset>

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
                          type="submit"
                          disabled={isSubmitting}
                          className="mt-6 min-h-12 w-full rounded-lg bg-[#a9694f] px-5 py-3 font-bold text-white transition hover:bg-[#8f5640] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f] disabled:cursor-wait disabled:opacity-60"
                        >
                          {isSubmitting
                            ? "Recording demo payment…"
                            : `Accept demo payment · ${formatPrice(course.price)}`}
                        </button>
                      </form>
                    ) : (
                      <p
                        role="status"
                        className="mt-5 rounded-xl border border-[#dfd2c3] bg-[#f7f1e8] p-4 text-sm text-[#765f52]"
                      >
                        Checkout is not configured for this environment.
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
                      Your enrollment in {course.name} is saved. Find your
                      application and payment status on your dashboard.
                    </p>
                    <Link
                      to="/Dashboard"
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
                      <span className="font-bold">
                        {formatPrice(course.price)}
                      </span>
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

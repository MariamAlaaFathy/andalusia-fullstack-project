import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CatalogEmpty, CatalogLoading } from "../Components/CatalogFeedback";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import { catalogApi } from "../services/catalogApi";
import type { Coursetype } from "../types/Coursetype";

function CourseDetail() {
  const { courseId } = useParams();
  const id = Number(courseId);
  const validId = Number.isSafeInteger(id) && id > 0;
  const [course, setCourse] = useState<Coursetype | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourse() {
      setIsLoading(true);
      setCourse(null);

      if (!validId) {
        setIsLoading(false);
        return;
      }

      try {
        setCourse(await catalogApi.getCourse(id, controller.signal));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Course could not be loaded.", error);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadCourse();
    return () => controller.abort();
  }, [id, validId]);

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#2b2420]">
      <NavBar />
      <main className="mx-auto min-h-[65vh] max-w-[1180px] px-4 py-9 sm:px-6 sm:py-12">
        {isLoading ? (
          <CatalogLoading />
        ) : course ? (
          <article>
            <nav
              aria-label="Breadcrumb"
              className="mb-5 break-words text-sm text-[#765f52]"
            >
              <Link
                className="font-semibold text-[#8f5640] hover:underline"
                to="/Courses"
              >
                Courses
              </Link>
              <span aria-hidden="true"> / </span>
              <span>{course.name}</span>
            </nav>

            <header className="overflow-hidden rounded-2xl border border-[#dfd2c3] bg-white shadow-sm">
              <div className="h-40 bg-gradient-to-br from-[#f1e0d6] via-[#f0e8da] to-[#e7d4c6] sm:h-56" />
              <div className="p-6 sm:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#f1e0d6] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#8f5640]">
                    {course.category}
                  </span>
                  <span className="rounded-full bg-[#e5eee8] px-4 py-1.5 text-xs font-semibold text-[#166534]">
                    Available
                  </span>
                </div>
                <h1 className="mt-4 break-words font-serif text-3xl font-bold leading-tight sm:text-5xl">
                  {course.name}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#765f52]">
                  {course.description}
                </p>
              </div>
            </header>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-6">
                <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
                  <h2 className="font-serif text-2xl font-bold">
                    What you’ll learn
                  </h2>
                  {course.learningOutcomes.length ? (
                    <ul className="mt-5 space-y-3">
                      {course.learningOutcomes.map((outcome) => (
                        <li
                          key={outcome}
                          className="flex gap-3 text-sm leading-relaxed text-[#765f52]"
                        >
                          <span
                            aria-hidden="true"
                            className="font-bold text-[#a55335]"
                          >
                            ✓
                          </span>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-[#765f52]">
                      Learning outcomes will be added soon.
                    </p>
                  )}
                </section>

                <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
                  <h2 className="font-serif text-2xl font-bold">
                    Before you start
                  </h2>
                  {course.prerequisites.length ? (
                    <ul className="mt-5 list-inside list-disc space-y-2 text-sm leading-relaxed text-[#765f52] marker:text-[#a55335]">
                      {course.prerequisites.map((prerequisite) => (
                        <li key={prerequisite}>{prerequisite}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-[#765f52]">
                      No prerequisites are listed for this course.
                    </p>
                  )}
                </section>
              </div>

              <aside className="h-fit rounded-2xl border border-[#dfd2c3] bg-white p-6">
                <h2 className="font-serif text-xl font-bold">
                  Course at a glance
                </h2>
                <dl className="mt-5 divide-y divide-[#eee2d5] text-sm">
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-[#765f52]">Duration</dt>
                    <dd className="min-w-0 break-words text-right font-semibold">
                      {course.duration || "Not specified"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-[#765f52]">Level</dt>
                    <dd className="min-w-0 break-words text-right font-semibold">
                      {course.level || "Not specified"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-[#765f52]">Category</dt>
                    <dd className="min-w-0 break-words text-right font-semibold">
                      {course.category}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-3">
                    <dt className="text-[#765f52]">Price</dt>
                    <dd className="text-right text-lg font-bold text-[#8f5640]">
                      {course.price === 0 ? "Free" : `$${course.price}`}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 border-t border-[#eee2d5] pt-4">
                  <h3 className="text-sm font-semibold">Part of this program</h3>
                  <Link
                    to={`/Programs/${course.programId}`}
                    className="mt-1 block font-semibold text-[#a55335] hover:underline"
                  >
                    {course.programName}
                  </Link>
                  <h3 className="mt-4 text-sm font-semibold">Career path</h3>
                  <Link
                    to={`/Careerpath/${course.careerPathId}`}
                    className="mt-1 block font-semibold text-[#a55335] hover:underline"
                  >
                    {course.careerPathName}
                  </Link>
                </div>
              </aside>
            </div>

            <Link
              to="/Courses"
              className="mt-6 inline-flex rounded-lg border border-[#d8cabc] bg-white px-5 py-2.5 font-semibold text-[#765f52] transition hover:bg-[#eee2d5]"
            >
              Back to courses
            </Link>
          </article>
        ) : (
          <CatalogEmpty label="course" />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default CourseDetail;

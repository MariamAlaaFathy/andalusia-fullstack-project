import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CatalogEmpty,
  CatalogLoading,
} from "../Components/CatalogFeedback";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import Search from "../Components/Search";
import { catalogApi } from "../services/catalogApi";
import type { Coursetype } from "../types/Coursetype";
import type { PagedResult } from "../types/PagedResult";

const pageSize = 10;
const categories = [
  "Web Development",
  "Backend Development",
  "Data",
] as const;

const emptyCourses: PagedResult<Coursetype> = {
  data: [],
  page: 1,
  pageSize,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function Courses() {
  const [courses, setCourses] = useState(emptyCourses);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      setIsLoading(true);
      try {
        const result = await catalogApi.getCourses(
          search,
          category,
          page,
          controller.signal,
          pageSize,
        );
        setCourses(result);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Courses could not be loaded.", error);
        setCourses({
          ...emptyCourses,
          page,
        });
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadCourses();
    return () => controller.abort();
  }, [category, page, search]);

  function selectCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#2b2420]">
      <NavBar />
      <main className="mx-auto min-h-[65vh] max-w-[1300px] px-4 py-10 sm:px-8">
        <header className="mb-8">
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">Courses</h1>
          <p className="mt-3 text-[17px] text-[#765f52]">
            {courses.totalCount} courses across 4 categories
          </p>
        </header>

        <section
          aria-label="Filter courses"
          className="mb-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
        >
          <div className="min-w-0 flex-1">
            <Search
              setSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <CategoryButton
              label="All"
              selected={category === ""}
              onClick={() => selectCategory("")}
            />
            {categories.map((item) => (
              <CategoryButton
                key={item}
                label={item}
                selected={category === item}
                onClick={() => selectCategory(item)}
              />
            ))}
          </div>
          <select
            aria-label="Sort courses"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="h-11 w-full rounded-xl border-2 border-[#171717] bg-white px-4 text-base outline-none sm:w-auto sm:px-5"
          >
            <option>Newest</option>
            <option>Oldest</option>
          </select>
        </section>

        {isLoading ? (
          <CatalogLoading />
        ) : courses.data.length ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {courses.data.map((course) => (
              <Link
                to={`/Courses/${course.id}`}
                key={course.id}
                className="block min-w-0 overflow-hidden rounded-xl border border-[#dfd2c3] bg-white text-inherit no-underline transition hover:-translate-y-1 hover:border-[#b36d4c] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
              >
                <div aria-hidden="true" className="h-[115px] bg-[#eee2d5]" />
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-[14px] font-medium uppercase text-[#a55335]">
                      {course.category}
                    </span>
                    <span className="rounded-full bg-[#e5eee8] px-3 py-1 text-[13px] font-medium text-[#166534]">
                      Active
                    </span>
                  </div>
                  <h2 className="break-words font-serif text-[23px] font-bold leading-tight">
                    {course.name}
                  </h2>
                  <p className="mt-5 font-bold text-[15px]">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <CatalogEmpty label="course" />
        )}
        {!isLoading && (
          <nav
            aria-label="Course pages"
            className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-[#765f52] sm:gap-5"
          >
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage - 1)}
              disabled={page <= 1}
              className="min-h-11 rounded-lg border border-[#d8cabc] bg-white px-3 py-2 transition hover:bg-[#eee2d5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
            >
              Previous
            </button>
            <span aria-live="polite" className="px-1 text-center">
              Page {page} of {Math.max(courses.totalPages, 1)}
            </span>
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={page >= courses.totalPages}
              className="min-h-11 rounded-lg border border-[#d8cabc] bg-white px-3 py-2 transition hover:bg-[#eee2d5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
            >
              Next
            </button>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
}

function CategoryButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-11 whitespace-nowrap rounded-full border px-4 py-2 text-base transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f] ${
        selected
          ? "border-[#b36d4c] bg-[#b36d4c] text-white"
          : "border-[#dfd2c3] bg-white text-[#765f52] hover:bg-[#f1e7db]"
      }`}
    >
      {label}
    </button>
  );
}

export default Courses;

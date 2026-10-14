import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CatalogEmpty,
  CatalogLoading,
  CatalogPagination,
} from "../Components/CatalogFeedback";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import Search from "../Components/Search";
import { catalogApi } from "../services/catalogApi";
import type { CareerPath } from "../types/CareerPath";
import type { PagedResult } from "../types/PagedResult";

const pageSize = 9;

function Careerpath() {
  const { careerPathId } = useParams();
  const detailId = careerPathId ? Number(careerPathId) : undefined;
  const validDetailId =
    detailId !== undefined && Number.isSafeInteger(detailId) && detailId > 0
      ? detailId
      : undefined;
  const [careerPaths, setCareerPaths] = useState<PagedResult<CareerPath>>({
    data: [],
    page: 1,
    pageSize,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [selectedCareerPath, setSelectedCareerPath] =
    useState<CareerPath | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setIsLoading(true);
      try {
        if (validDetailId !== undefined) {
          setSelectedCareerPath(null);
          const result = await catalogApi.getCareerPath(
            validDetailId,
            controller.signal,
          );
          setSelectedCareerPath(result);
        } else if (careerPathId) {
          setSelectedCareerPath(null);
        } else {
          setSelectedCareerPath(null);
          const result = await catalogApi.getCareerPaths(
            search,
            page,
            controller.signal,
          );
          setCareerPaths(result);
        }
      } catch (requestError) {
        if (controller.signal.aborted) return;
        console.error("Career paths could not be loaded.", requestError);
        if (validDetailId !== undefined) {
          setSelectedCareerPath(null);
        } else if (!careerPathId) {
          setCareerPaths({
            data: [],
            page,
            pageSize,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          });
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [careerPathId, page, search, validDetailId]);

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#2b2420]">
      <NavBar />
      <main className="mx-auto min-h-[65vh] max-w-[1180px] px-4 py-9 sm:px-6 sm:py-12">
        {validDetailId !== undefined ? (
          isLoading && !selectedCareerPath ? (
            <CatalogLoading />
          ) : selectedCareerPath ? (
            <CareerPathDetail careerPath={selectedCareerPath} />
          ) : (
            <CatalogEmpty label="career path" />
          )
        ) : careerPathId ? (
          <CatalogEmpty label="career path" />
        ) : (
          <>
            <header className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a9694f]">
                Andalusia Academy
              </p>
              <h1 className="font-serif text-4xl font-bold sm:text-5xl">
                Career Paths
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#765f52]">
                Explore the skills and programs that can take you from your
                first step to your next role.
              </p>
            </header>

            <div className="mb-6">
              <Search
                setSearch={(value) => {
                  setIsLoading(true);
                  setSearch(value);
                  setPage(1);
                }}
                placeholder="Search career paths"
              />
            </div>

            {isLoading ? (
              <CatalogLoading />
            ) : careerPaths.data.length ? (
              <>
                <p className="mb-4 text-sm text-[#765f52]">
                  {careerPaths.totalCount}{" "}
                  {careerPaths.totalCount === 1 ? "career path" : "career paths"}
                </p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {careerPaths.data.map((careerPath) => (
                    <CareerPathCard
                      key={careerPath.id}
                      careerPath={careerPath}
                    />
                  ))}
                </div>
                <CatalogPagination
                  page={careerPaths.page}
                  totalPages={careerPaths.totalPages}
                  onChange={(nextPage) => {
                    setIsLoading(true);
                    setPage(nextPage);
                  }}
                />
              </>
            ) : (
              <CatalogEmpty label="career path" />
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function CareerPathCard({ careerPath }: { careerPath: CareerPath }) {
  return (
    <Link
      to={`/Careerpath/${careerPath.id}`}
      className="group flex min-h-56 flex-col overflow-hidden rounded-xl border border-[#dfd2c3] bg-white transition hover:-translate-y-1 hover:border-[#b36d4c] hover:shadow-lg"
    >
      <div className="h-24 bg-gradient-to-br from-[#f1e0d6] via-[#f0e8da] to-[#e7d4c6]" />
      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#a55335]">
          {careerPath.programs.length}{" "}
          {careerPath.programs.length === 1 ? "program" : "programs"}
        </span>
        <h2 className="mt-2 font-serif text-2xl font-bold leading-tight group-hover:text-[#8f5640]">
          {careerPath.name}
        </h2>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-[#765f52]">
          {careerPath.description}
        </p>
        <span className="mt-5 text-sm font-semibold text-[#a55335]">
          Explore path <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

function CareerPathDetail({ careerPath }: { careerPath: CareerPath }) {
  return (
    <article>
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-[#765f52]">
        <Link
          className="font-semibold text-[#8f5640] hover:underline"
          to="/Careerpath"
        >
          Career Paths
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{careerPath.name}</span>
      </nav>
      <header className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a9694f]">
          Career path
        </p>
        <h1 className="font-serif text-3xl font-bold leading-tight sm:text-5xl">
          {careerPath.name}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#765f52]">
          {careerPath.description}
        </p>

        <section className="mt-8 border-t border-[#eee2d5] pt-6">
          <h2 className="font-serif text-2xl font-bold">Skills you’ll develop</h2>
          {careerPath.skills.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {careerPath.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full bg-[#f1e0d6] px-4 py-2 text-sm font-semibold text-[#8f5640]"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#765f52]">
              Skills for this path will be added soon.
            </p>
          )}
        </section>

        <section className="mt-8 border-t border-[#eee2d5] pt-6">
          <h2 className="font-serif text-2xl font-bold">Related programs</h2>
          {careerPath.programs.length ? (
            <ul className="mt-3 divide-y divide-[#eee2d5]">
              {careerPath.programs.map((program) => (
                <li key={program.id}>
                  <Link
                    to={`/Programs/${program.id}`}
                    className="block pt-4 font-semibold text-[#a55335] hover:underline"
                  >
                    {program.name} <span aria-hidden="true">→</span>
                  </Link>
                  {program.courses.length ? (
                    <ul className="pb-4 pl-4">
                      {program.courses.map((course) => (
                        <li key={course.id}>
                          <Link
                            to={`/Courses/${course.id}`}
                            className="block py-1 text-sm text-[#765f52] hover:text-[#a55335] hover:underline"
                          >
                            {course.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#765f52]">
              Related programs will be added soon.
            </p>
          )}
        </section>
      </header>
      <Link
        to="/Careerpath"
        className="mt-6 inline-flex rounded-lg border border-[#d8cabc] bg-white px-5 py-2.5 font-semibold text-[#765f52] transition hover:bg-[#eee2d5]"
      >
        Back to career paths
      </Link>
    </article>
  );
}

export default Careerpath;

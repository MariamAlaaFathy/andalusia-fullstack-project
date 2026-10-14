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
import type { PagedResult } from "../types/PagedResult";
import type { Program } from "../types/Program";

const pageSize = 9;

function Programs() {
  const { programId } = useParams();
  const detailId = programId ? Number(programId) : undefined;
  const validDetailId =
    detailId !== undefined && Number.isSafeInteger(detailId) && detailId > 0
      ? detailId
      : undefined;
  const [programs, setPrograms] = useState<PagedResult<Program>>({
    data: [],
    page: 1,
    pageSize,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setIsLoading(true);
      try {
        if (validDetailId !== undefined) {
          setSelectedProgram(null);
          const result = await catalogApi.getProgram(
            validDetailId,
            controller.signal,
          );
          setSelectedProgram(result);
        } else if (programId) {
          setSelectedProgram(null);
        } else {
          setSelectedProgram(null);
          const result = await catalogApi.getPrograms(
            search,
            page,
            controller.signal,
          );
          setPrograms(result);
        }
      } catch (requestError) {
        if (controller.signal.aborted) return;
        console.error("Programs could not be loaded.", requestError);
        if (validDetailId !== undefined) {
          setSelectedProgram(null);
        } else if (!programId) {
          setPrograms({
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
  }, [page, programId, search, validDetailId]);

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#2b2420]">
      <NavBar />
      <main className="mx-auto min-h-[65vh] max-w-[1180px] px-4 py-9 sm:px-6 sm:py-12">
        {validDetailId !== undefined ? (
          isLoading && !selectedProgram ? (
            <CatalogLoading />
          ) : selectedProgram ? (
            <ProgramDetail program={selectedProgram} />
          ) : (
            <CatalogEmpty label="program" />
          )
        ) : programId ? (
          <CatalogEmpty label="program" />
        ) : (
          <>
            <header className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a9694f]">
                Andalusia Academy
              </p>
              <h1 className="font-serif text-4xl font-bold sm:text-5xl">
                Programs
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#765f52]">
                Follow a structured learning plan and turn your goals into
                meaningful progress.
              </p>
            </header>

            <div className="mb-6">
              <Search
                setSearch={(value) => {
                  setIsLoading(true);
                  setSearch(value);
                  setPage(1);
                }}
                placeholder="Search programs"
              />
            </div>

            {isLoading ? (
              <CatalogLoading />
            ) : programs.data.length ? (
              <>
                <p className="mb-4 text-sm text-[#765f52]">
                  {programs.totalCount}{" "}
                  {programs.totalCount === 1 ? "program" : "programs"}
                </p>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {programs.data.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
                <CatalogPagination
                  page={programs.page}
                  totalPages={programs.totalPages}
                  onChange={(nextPage) => {
                    setIsLoading(true);
                    setPage(nextPage);
                  }}
                />
              </>
            ) : (
              <CatalogEmpty label="program" />
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function ProgramCard({ program }: { program: Program }) {
  return (
    <Link
      to={`/Programs/${program.id}`}
      className="group flex min-h-56 flex-col overflow-hidden rounded-xl border border-[#dfd2c3] bg-white transition hover:-translate-y-1 hover:border-[#b36d4c] hover:shadow-lg"
    >
      <div className="h-24 bg-gradient-to-br from-[#f1e0d6] via-[#f0e8da] to-[#e7d4c6]" />
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#a55335]">
          Career path · {program.careerPathName}
        </p>
        <h2 className="font-serif text-2xl font-bold leading-tight group-hover:text-[#8f5640]">
          {program.name}
        </h2>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-[#765f52]">
          {program.description}
        </p>
        <span className="mt-5 text-sm font-semibold text-[#a55335]">
          View program <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

function ProgramDetail({ program }: { program: Program }) {
  return (
    <article>
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-[#765f52]">
        <Link className="font-semibold text-[#8f5640] hover:underline" to="/Programs">
          Programs
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{program.name}</span>
      </nav>
      <header className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a9694f]">
          Learning program
        </p>
        <h1 className="font-serif text-3xl font-bold leading-tight sm:text-5xl">
          {program.name}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#765f52]">
          {program.description}
        </p>
        <div className="mt-7 border-t border-[#eee2d5] pt-5">
          <p className="text-sm text-[#765f52]">Designed for this career path</p>
          <Link
            to={`/Careerpath/${program.careerPathId}`}
            className="mt-1 inline-block font-semibold text-[#a55335] hover:underline"
          >
            {program.careerPathName} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>
      <section className="mt-6 rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-bold">Courses in this program</h2>
        {program.courses.length ? (
          <ul className="mt-3 divide-y divide-[#eee2d5]">
            {program.courses.map((course) => (
              <li key={course.id}>
                <Link
                  to={`/Courses/${course.id}`}
                  className="block py-4 font-semibold text-[#a55335] hover:underline"
                >
                  {course.name} <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[#765f52]">
            Courses for this program will be added soon.
          </p>
        )}
      </section>
      <Link
        to="/Programs"
        className="mt-6 inline-flex rounded-lg border border-[#d8cabc] bg-white px-5 py-2.5 font-semibold text-[#765f52] transition hover:bg-[#eee2d5]"
      >
        Back to programs
      </Link>
    </article>
  );
}

export default Programs;

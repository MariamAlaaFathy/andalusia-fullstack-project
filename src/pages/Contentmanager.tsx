import {
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import { userContext } from "../types/UserContextType";
import {
  contentApi,
  type CourseModuleSummary,
  type LandingPageContent,
  type LandingPageInput,
  type Lesson,
  type LessonInput,
} from "../types/ContentApi";

type Tab = "lessons" | "landing";

const emptyLesson: LessonInput = {
  title: "",
  description: "",
  content: "",
  videoUrl: "",
  pdfUrl: "",
  order: 1,
  moduleId: 0,
};

const inputClass =
  "w-full rounded-lg border border-[#d8cabc] bg-white px-4 py-2.5 text-sm text-[#2b2420] placeholder:text-[#a99a8d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]";
const primaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-[#a9694f] px-5 py-2.5 font-semibold text-white transition hover:bg-[#8f5640] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-[#a9694f] px-4 py-2 font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]";

function ContentManager() {
  const context = useContext(userContext);
  const [tab, setTab] = useState<Tab>("lessons");

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#2b2420]">
      <NavBar />
      <main className="mx-auto min-h-[65vh] max-w-[1180px] px-4 py-9 sm:px-6 sm:py-12">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#a55335]">
            Content manager
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
            Manage content
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#765f52]">
            Create and edit lessons, and update the text and image shown on the
            landing page.
          </p>
        </header>

        {context?.isLoading && (
          <p role="status" className="mb-6 text-sm text-[#765f52]">
            Checking your session…
          </p>
        )}

        {!context?.isLoading && !context?.user && (
          <section className="mb-6 rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">
              Sign in to manage content
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#765f52]">
              This area is available to content managers only.
            </p>
            <Link
              to="/Login"
              state={{ from: "/ContentManager" }}
              className={`${secondaryButton} mt-6`}
            >
              Go to login
            </Link>
          </section>
        )}

        {context?.user && (
          <section className="overflow-hidden rounded-2xl border border-[#dfd2c3] bg-white">
            <div className="flex flex-wrap items-center gap-2 border-b border-[#eee2d5] p-4 sm:px-6">
              <TabButton selected={tab === "lessons"} onClick={() => setTab("lessons")}>
                Lessons
              </TabButton>
              <TabButton selected={tab === "landing"} onClick={() => setTab("landing")}>
                Landing page
              </TabButton>
            </div>
            <div className="p-4 sm:p-6">
              {tab === "lessons" ? <LessonsPanel /> : <LandingPanel />}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

/* ---------------------------- Lessons ---------------------------- */

function LessonsPanel() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<CourseModuleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [moduleFilter, setModuleFilter] = useState<number | "all">("all");
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<LessonInput>(emptyLesson);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const [lessonRecords, moduleRecords] = await Promise.all([
          contentApi.getLessons(controller.signal),
          contentApi.getModules(controller.signal),
        ]);
        if (controller.signal.aborted) return;
        setLessons(lessonRecords);
        setModules(moduleRecords);
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Lessons could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  const moduleTitle = (id: number) =>
    modules.find((m) => m.id === id)?.title ?? `Module ${id}`;

  const visibleLessons = useMemo(
    () =>
      lessons
        .filter((l) => moduleFilter === "all" || l.moduleId === moduleFilter)
        .sort((a, b) => a.moduleId - b.moduleId || a.order - b.order),
    [lessons, moduleFilter],
  );

  function startNew() {
    setNotice("");
    setErrorMessage("");
    setForm({
      ...emptyLesson,
      moduleId:
        moduleFilter !== "all" ? moduleFilter : (modules[0]?.id ?? 0),
    });
    setEditingId("new");
  }

  function startEdit(lesson: Lesson) {
    setNotice("");
    setErrorMessage("");
    setForm({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      videoUrl: lesson.videoUrl ?? "",
      pdfUrl: lesson.pdfUrl ?? "",
      order: lesson.order,
      moduleId: lesson.moduleId,
    });
    setEditingId(lesson.id);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (editingId === null) return;
    if (!form.moduleId) {
      setErrorMessage("Select a module for this lesson.");
      return;
    }

    const payload: LessonInput = {
      ...form,
      videoUrl: form.videoUrl?.trim() || null,
      pdfUrl: form.pdfUrl?.trim() || null,
    };

    setIsSaving(true);
    setErrorMessage("");
    try {
      if (editingId === "new") {
        const created = await contentApi.createLesson(payload);
        setLessons((current) => [...current, created]);
        setNotice("Lesson created.");
      } else {
        const updated = await contentApi.updateLesson(editingId, payload);
        setLessons((current) =>
          current.map((l) => (l.id === updated.id ? updated : l)),
        );
        setNotice("Lesson updated.");
      }
      setEditingId(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "The lesson could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(lesson: Lesson) {
    if (!window.confirm(`Delete "${lesson.title}"? This cannot be undone.`)) return;
    setErrorMessage("");
    setNotice("");
    try {
      await contentApi.deleteLesson(lesson.id);
      setLessons((current) => current.filter((l) => l.id !== lesson.id));
      setNotice("Lesson deleted.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "The lesson could not be deleted.",
      );
    }
  }

  if (isLoading) {
    return (
      <p role="status" className="py-10 text-center text-sm text-[#765f52]">
        Loading lessons…
      </p>
    );
  }

  return (
    <div>
      <Feedback error={errorMessage} notice={notice} />

      {editingId !== null ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="font-serif text-2xl font-bold">
            {editingId === "new" ? "New lesson" : "Edit lesson"}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" htmlFor="lesson-title">
              <input
                id="lesson-title"
                required
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>
            <Field label="Module" htmlFor="lesson-module">
              <select
                id="lesson-module"
                required
                className={inputClass}
                value={form.moduleId}
                onChange={(e) =>
                  setForm({ ...form, moduleId: Number(e.target.value) })
                }
              >
                <option value={0} disabled>
                  Select a module
                </option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description" htmlFor="lesson-description">
            <input
              id="lesson-description"
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>

          <Field label="Content" htmlFor="lesson-content">
            <textarea
              id="lesson-content"
              rows={8}
              className={inputClass}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Video URL" htmlFor="lesson-video">
              <input
                id="lesson-video"
                type="url"
                className={inputClass}
                placeholder="https://"
                value={form.videoUrl ?? ""}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              />
            </Field>
            <Field label="PDF URL" htmlFor="lesson-pdf">
              <input
                id="lesson-pdf"
                type="url"
                className={inputClass}
                placeholder="https://"
                value={form.pdfUrl ?? ""}
                onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
              />
            </Field>
            <Field label="Order" htmlFor="lesson-order">
              <input
                id="lesson-order"
                type="number"
                min={1}
                required
                className={inputClass}
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: Number(e.target.value) })
                }
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={isSaving} className={primaryButton}>
              {isSaving ? "Saving…" : "Save lesson"}
            </button>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => setEditingId(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="sm:w-72">
              <label htmlFor="module-filter" className="sr-only">
                Filter by module
              </label>
              <select
                id="module-filter"
                className={inputClass}
                value={moduleFilter}
                onChange={(e) =>
                  setModuleFilter(
                    e.target.value === "all" ? "all" : Number(e.target.value),
                  )
                }
              >
                <option value="all">All modules</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={startNew} className={primaryButton}>
              Add lesson
            </button>
          </div>

          {visibleLessons.length ? (
            <div className="space-y-4">
              {visibleLessons.map((lesson) => (
                <article
                  key={lesson.id}
                  className="flex flex-col gap-4 rounded-xl border border-[#eee2d5] p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#a55335]">
                      {moduleTitle(lesson.moduleId)} · Lesson {lesson.order}
                    </p>
                    <h2 className="mt-1 break-words font-serif text-xl font-bold">
                      {lesson.title}
                    </h2>
                    {lesson.description && (
                      <p className="mt-2 text-sm text-[#765f52]">
                        {lesson.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {lesson.videoUrl && <Tag>Video</Tag>}
                      {lesson.pdfUrl && <Tag>PDF</Tag>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      className={secondaryButton}
                      onClick={() => startEdit(lesson)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#e7b7aa] px-4 py-2 font-semibold text-[#873d2d] transition hover:bg-[#f8e9e5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#873d2d]"
                      onClick={() => void handleDelete(lesson)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-lg py-9 text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1e0d6] text-xl text-[#8f5640]"
              >
                ✦
              </span>
              <h2 className="mt-4 font-serif text-2xl font-bold">No lessons yet</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#765f52]">
                Add a lesson to a module and it will appear here.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* -------------------------- Landing page -------------------------- */

const emptyLanding: LandingPageInput = {
  heroTitle: "",
  heroSubtitle: "",
  heroImageUrl: "",
  callToActionText: "",
  callToActionUrl: "",
};

function LandingPanel() {
  const [form, setForm] = useState<LandingPageInput>(emptyLanding);
  const [updatedAt, setUpdatedAt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  function apply(content: LandingPageContent) {
    setForm({
      heroTitle: content.heroTitle,
      heroSubtitle: content.heroSubtitle,
      heroImageUrl: content.heroImageUrl ?? "",
      callToActionText: content.callToActionText,
      callToActionUrl: content.callToActionUrl ?? "",
    });
    setUpdatedAt(content.updatedAtUtc);
  }

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const content = await contentApi.getLanding(controller.signal);
        if (!controller.signal.aborted) apply(content);
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Landing page content could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setNotice("");
    try {
      const saved = await contentApi.updateLanding({
        ...form,
        heroImageUrl: form.heroImageUrl?.trim() || null,
        callToActionUrl: form.callToActionUrl?.trim() || null,
      });
      apply(saved);
      setNotice("Landing page updated.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Changes could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <p role="status" className="py-10 text-center text-sm text-[#765f52]">
        Loading landing page content…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold">Landing page</h2>
        {updatedAt && (
          <p className="mt-1 text-xs text-[#765f52]">
            Last updated {formatDateTime(updatedAt)}
          </p>
        )}
      </div>

      <Feedback error={errorMessage} notice={notice} />

      <Field label="Hero title" htmlFor="hero-title">
        <input
          id="hero-title"
          required
          className={inputClass}
          value={form.heroTitle}
          onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
        />
      </Field>

      <Field label="Hero subtitle" htmlFor="hero-subtitle">
        <textarea
          id="hero-subtitle"
          rows={3}
          className={inputClass}
          value={form.heroSubtitle}
          onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
        />
      </Field>

      <Field label="Hero image URL" htmlFor="hero-image">
        <input
          id="hero-image"
          className={inputClass}
          placeholder="landscape2.jpg or https://"
          value={form.heroImageUrl ?? ""}
          onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
        />
      </Field>

      {form.heroImageUrl && (
        <img
          src={form.heroImageUrl}
          alt="Hero preview"
          className="h-48 w-full rounded-xl border border-[#eee2d5] object-cover"
        />
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Button text" htmlFor="cta-text">
          <input
            id="cta-text"
            required
            className={inputClass}
            value={form.callToActionText}
            onChange={(e) =>
              setForm({ ...form, callToActionText: e.target.value })
            }
          />
        </Field>
        <Field label="Button link" htmlFor="cta-url">
          <input
            id="cta-url"
            className={inputClass}
            placeholder="/Programs"
            value={form.callToActionUrl ?? ""}
            onChange={(e) =>
              setForm({ ...form, callToActionUrl: e.target.value })
            }
          />
        </Field>
      </div>

      <button type="submit" disabled={isSaving} className={primaryButton}>
        {isSaving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}



function TabButton({
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

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-[#765f52]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-[#f3e7d8] px-3 py-1 text-xs font-bold text-[#8a5a2b]">
      {children}
    </span>
  );
}

function Feedback({ error, notice }: { error: string; notice: string }) {
  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-[#e7b7aa] bg-[#f8e9e5] p-4 text-sm text-[#873d2d]"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-[#b9d3c2] bg-[#e5eee8] p-4 text-sm text-[#166534]"
        >
          {notice}
        </div>
      )}
    </>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "date unavailable"
    : date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default ContentManager;
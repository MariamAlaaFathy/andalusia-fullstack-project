import {
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../Components/ConfirmDialog";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import { userContext } from "../types/UserContextType";
import {
  contentApi,
  type CourseModuleInput,
  type CourseModuleSummary,
  type LandingPageContent,
  type LandingPageInput,
  type Lesson,
  type LessonInput,
} from "../types/ContentApi";
import { catalogApi } from "../services/catalogApi";
import {
  AboutBlocksPanel,
  CatalogManagementPanel,
  ContactInboxPanel,
  ContactSettingsPanel,
  LandingItemsPanel,
} from "./ContentManagementPanels";

type Tab = "lessons" | "landing" | "catalog" | "about" | "contact" | "inbox";

const emptyLesson: LessonInput = {
  title: "",
  description: "",
  content: "",
  videoUrl: "",
  pdfUrl: "",
  order: 1,
  moduleId: 0,
};
const emptyModule: CourseModuleInput = {
  courseId: 0,
  title: "",
  description: "",
  order: 1,
};

const inputClass =
  "w-full rounded-lg border border-[#d8cabc] bg-white px-4 py-2.5 text-sm text-[#2b2420] placeholder:text-[#a99a8d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]";
const primaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-[#a9694f] px-5 py-2.5 font-semibold text-white transition hover:bg-[#8f5640] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-[#a9694f] px-4 py-2 font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]";

function ContentManager() {
  const context = useContext(userContext);
  const hasAccess =
    context?.user?.role === "Content Manager" || context?.user?.role === "Admin";
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
            Manage the landing page, catalog, About and Contact pages, lessons,
            and visitor messages.
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

        {context?.user && !hasAccess && (
          <section className="mb-6 rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">Access restricted</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#765f52]">
              This area is available to content managers and administrators.
            </p>
          </section>
        )}

        {context?.user && hasAccess && (
          <section className="overflow-hidden rounded-2xl border border-[#dfd2c3] bg-white">
            <div className="flex flex-wrap items-center gap-2 border-b border-[#eee2d5] p-4 sm:px-6">
              {([
                ["lessons", "Lessons"],
                ["landing", "Landing page"],
                ["catalog", "Catalog"],
                ["about", "About page"],
                ["contact", "Contact page"],
                ["inbox", "Messages"],
              ] as const).map(([id, label]) => (
                <TabButton key={id} selected={tab === id} onClick={() => setTab(id)}>
                  {label}
                </TabButton>
              ))}
            </div>
            <div className="p-4 sm:p-6">
              {tab === "lessons" && <LessonsPanel />}
              {tab === "landing" && (
                <div className="space-y-10">
                  <LandingPanel />
                  <LandingItemsPanel />
                </div>
              )}
              {tab === "catalog" && <CatalogManagementPanel />}
              {tab === "about" && <AboutBlocksPanel />}
              {tab === "contact" && <ContactSettingsPanel />}
              {tab === "inbox" && <ContactInboxPanel />}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

/* ---------------------------- Lessons ---------------------------- */

type LessonDeleteTarget =
  | { type: "module"; module: CourseModuleSummary }
  | { type: "lesson"; lesson: Lesson };

function LessonsPanel() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<CourseModuleSummary[]>([]);
  const [courses, setCourses] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [moduleFilter, setModuleFilter] = useState<number | "all">("all");
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<LessonInput>(emptyLesson);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [moduleEditingId, setModuleEditingId] = useState<number | null>(null);
  const [moduleForm, setModuleForm] = useState<CourseModuleInput>(emptyModule);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LessonDeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const [lessonRecords, moduleRecords, courseRecords] = await Promise.all([
          contentApi.getLessons(controller.signal),
          contentApi.getModules(controller.signal),
          catalogApi.getCourses("", "", 1, controller.signal, 100),
        ]);
        if (controller.signal.aborted) return;
        setLessons(lessonRecords);
        setModules(moduleRecords);
        setCourses(
          courseRecords.data.map(({ id, name }) => ({ id, name })),
        );
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
    setIsCreatingModule(false);
    setModuleEditingId(null);
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
    setIsCreatingModule(false);
    setModuleEditingId(null);
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

  function startCreateModule() {
    setNotice("");
    setErrorMessage("");
    setEditingId(null);
    setModuleEditingId(null);
    setModuleForm({ ...emptyModule, courseId: courses[0]?.id ?? 0 });
    setIsCreatingModule(true);
  }

  function startEditModule(module: CourseModuleSummary) {
    setNotice("");
    setErrorMessage("");
    setEditingId(null);
    setModuleEditingId(module.id);
    setModuleForm({
      courseId: module.courseId,
      title: module.title,
      description: module.description,
      order: module.order,
    });
    setIsCreatingModule(true);
  }

  async function handleCreateModule(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setNotice("");
    try {
      const input = {
        title: moduleForm.title,
        description: moduleForm.description,
        order: moduleForm.order,
      };
      const saved = moduleEditingId === null
        ? await contentApi.createModule(moduleForm.courseId, input)
        : await contentApi.updateModule(moduleEditingId, input);
      setModules((current) => moduleEditingId === null
        ? [...current, saved]
        : current.map((module) => module.id === saved.id ? saved : module));
      setModuleFilter(saved.id);
      setIsCreatingModule(false);
      setNotice(moduleEditingId === null ? "Module created." : "Module updated.");
      setModuleEditingId(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "The module could not be created.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteModule(module: CourseModuleSummary) {
    setIsDeleting(true);
    setErrorMessage("");
    setNotice("");
    try {
      await contentApi.deleteModule(module.id);
      setModules((current) => current.filter((item) => item.id !== module.id));
      setLessons((current) => current.filter((lesson) => lesson.moduleId !== module.id));
      if (moduleFilter === module.id) setModuleFilter("all");
      setNotice("Module and its lessons deleted.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The module could not be deleted.");
    } finally {
      setDeleteTarget(null);
      setIsDeleting(false);
    }
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
    setIsDeleting(true);
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
    } finally {
      setDeleteTarget(null);
      setIsDeleting(false);
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

      {isCreatingModule ? (
        <form onSubmit={handleCreateModule} className="space-y-5">
          <h2 className="font-serif text-2xl font-bold">
            {moduleEditingId === null ? "New module" : "Edit module"}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Course" htmlFor="module-course">
              <select
                id="module-course"
                required
                disabled={moduleEditingId !== null}
                className={inputClass}
                value={moduleForm.courseId}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, courseId: Number(e.target.value) })
                }
              >
                <option value={0} disabled>
                  Select a course
                </option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title" htmlFor="module-title">
              <input
                id="module-title"
                required
                maxLength={200}
                className={inputClass}
                value={moduleForm.title}
                onChange={(e) =>
                  setModuleForm({ ...moduleForm, title: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Description" htmlFor="module-description">
            <input
              id="module-description"
              maxLength={2000}
              className={inputClass}
              value={moduleForm.description}
              onChange={(e) =>
                setModuleForm({ ...moduleForm, description: e.target.value })
              }
            />
          </Field>
          <Field label="Order" htmlFor="module-order">
            <input
              id="module-order"
              type="number"
              min={1}
              required
              className={inputClass}
              value={moduleForm.order}
              onChange={(e) =>
                setModuleForm({ ...moduleForm, order: Number(e.target.value) })
              }
            />
          </Field>
          {!courses.length && (
            <p className="text-sm text-[#765f52]">
              Create a course before adding a module.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving || !courses.length}
              className={primaryButton}
            >
              {isSaving ? "Saving…" : moduleEditingId === null ? "Create module" : "Save module"}
            </button>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => {
                setIsCreatingModule(false);
                setModuleEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : editingId !== null ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="font-serif text-2xl font-bold">
            {editingId === "new" ? "New lesson" : "Edit lesson"}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" htmlFor="lesson-title">
              <input
                id="lesson-title"
                required
                maxLength={200}
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
              maxLength={2000}
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>

          <Field label="Content" htmlFor="lesson-content">
            <textarea
              id="lesson-content"
              maxLength={20000}
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
                maxLength={2048}
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
                maxLength={2048}
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
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={startCreateModule}
                className={secondaryButton}
              >
                Add module
              </button>
              <button
                type="button"
                onClick={startNew}
                disabled={!modules.length}
                className={primaryButton}
              >
                Add lesson
              </button>
            </div>
          </div>

          {modules.length > 0 && (
            <section className="mb-6 space-y-3">
              <h2 className="font-serif text-xl font-bold">Course modules</h2>
              {modules
                .filter((module) => moduleFilter === "all" || module.id === moduleFilter)
                .map((module) => (
                  <article key={module.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#eee2d5] p-4">
                    <div>
                      <p className="font-semibold">{module.title}</p>
                      <p className="text-xs text-[#765f52]">
                        {courses.find((course) => course.id === module.courseId)?.name ?? `Course ${module.courseId}`} · Module {module.order}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className={secondaryButton} onClick={() => startEditModule(module)}>Edit</button>
                      <button type="button" className="rounded-lg border border-[#e7b7aa] px-4 py-2 text-sm font-semibold text-[#873d2d]" onClick={() => setDeleteTarget({ type: "module", module })}>Delete</button>
                    </div>
                  </article>
                ))}
            </section>
          )}

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
                      onClick={() => setDeleteTarget({ type: "lesson", lesson })}
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
      {deleteTarget && (
        <ConfirmDialog
          title={deleteTarget.type === "module" ? "Delete module and lessons?" : "Delete this lesson?"}
          message={
            deleteTarget.type === "module"
              ? `The module "${deleteTarget.module.title}" and every lesson inside it will be permanently deleted.`
              : `The lesson "${deleteTarget.lesson.title}" will be permanently deleted from its module.`
          }
          confirmLabel={deleteTarget.type === "module" ? "Delete module and lessons" : "Delete lesson"}
          isBusy={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() =>
            void (deleteTarget.type === "module"
              ? handleDeleteModule(deleteTarget.module)
              : handleDelete(deleteTarget.lesson))
          }
        />
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
  const [courses, setCourses] = useState<Array<{ id: number; name: string }>>([]);
  const [featuredCourseIds, setFeaturedCourseIds] = useState<number[]>([]);
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
        const [content, coursePage] = await Promise.all([
          contentApi.getLandingPage(controller.signal),
          catalogApi.getCourses("", "", 1, controller.signal, 100),
        ]);
        if (controller.signal.aborted) return;
        if (content.hero) apply(content.hero);
        setFeaturedCourseIds(content.featuredCourses.map((course) => course.id));
        const courseOptions = new Map(
          [...coursePage.data, ...content.featuredCourses].map((course) => [
            course.id,
            { id: course.id, name: course.name },
          ]),
        );
        setCourses([...courseOptions.values()]);
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

  async function handleFeaturedCoursesSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setNotice("");
    try {
      await contentApi.updateFeaturedCourses(featuredCourseIds);
      setNotice("Featured courses updated.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Featured courses could not be updated.",
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
    <div className="space-y-10">
      <Feedback error={errorMessage} notice={notice} />
      <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold">Landing page</h2>
        {updatedAt && (
          <p className="mt-1 text-xs text-[#765f52]">
            Last updated {formatDateTime(updatedAt)}
          </p>
        )}
      </div>

      <Field label="Hero title" htmlFor="hero-title">
        <input
          id="hero-title"
          required
          maxLength={160}
          className={inputClass}
          value={form.heroTitle}
          onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
        />
      </Field>

      <Field label="Hero subtitle" htmlFor="hero-subtitle">
        <textarea
          id="hero-subtitle"
          required
          maxLength={500}
          rows={3}
          className={inputClass}
          value={form.heroSubtitle}
          onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
        />
      </Field>

      <Field label="Hero image URL" htmlFor="hero-image">
        <input
          id="hero-image"
          maxLength={2048}
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
            maxLength={80}
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
            maxLength={2048}
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

      <form onSubmit={handleFeaturedCoursesSubmit} className="space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-bold">Featured courses</h2>
          <p className="mt-1 text-sm text-[#765f52]">
            Select courses to display on the public homepage.
          </p>
        </div>
        {courses.length ? (
          <fieldset className="space-y-3">
            <legend className="sr-only">Choose featured courses</legend>
            {courses.map((course) => (
              <label
                key={course.id}
                className="flex items-center gap-3 rounded-lg border border-[#eee2d5] p-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={featuredCourseIds.includes(course.id)}
                  onChange={(event) =>
                    setFeaturedCourseIds((current) =>
                      event.target.checked
                        ? [...current, course.id]
                        : current.filter((id) => id !== course.id),
                    )
                  }
                  className="h-4 w-4 accent-[#a9694f]"
                />
                <span>{course.name}</span>
              </label>
            ))}
          </fieldset>
        ) : (
          <p className="text-sm text-[#765f52]">
            No courses are available to feature.
          </p>
        )}
        <button
          type="submit"
          disabled={isSaving || !courses.length}
          className={primaryButton}
        >
          {isSaving ? "Saving…" : "Save featured courses"}
        </button>
      </form>
    </div>
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
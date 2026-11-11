import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import ConfirmDialog from "../Components/ConfirmDialog";
import {
  contentApi,
  type AboutPageBlock,
  type ContactPageSettings,
  type ContactSubmission,
  type LandingPageBanner,
  type LandingPageFaq,
  type LandingPageHighlight,
  type LandingPageManagement,
  type LandingPageTestimonial,
} from "../types/ContentApi";
import {
  catalogApi,
  type CareerPathInput,
  type CourseInput,
  type ProgramInput,
} from "../services/catalogApi";
import type { CareerPath } from "../types/CareerPath";
import type { Program } from "../types/Program";
import type { Coursetype } from "../types/Coursetype";

const inputClass =
  "w-full rounded-lg border border-[#d8cabc] bg-white px-4 py-2.5 text-sm text-[#2b2420] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]";
const buttonClass =
  "inline-flex min-h-10 items-center justify-center rounded-lg bg-[#a9694f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60";

type OrderedItem = { id: number; order: number };

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-semibold text-[#765f52]">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Feedback({ error, notice }: { error: string; notice: string }) {
  return (
    <>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    </>
  );
}

function CollectionEditor<T extends OrderedItem>({
  title,
  items,
  setItems,
  empty,
  create,
  update,
  remove,
  summary,
  renderFields,
}: {
  title: string;
  items: T[];
  setItems: (updater: (current: T[]) => T[]) => void;
  empty: Omit<T, "id">;
  create: (input: Omit<T, "id">) => Promise<T>;
  update: (id: number, input: Omit<T, "id">) => Promise<T>;
  remove: (id: number) => Promise<void>;
  summary: (item: T) => string;
  renderFields: (
    form: Omit<T, "id">,
    setForm: Dispatch<SetStateAction<Omit<T, "id">>>,
  ) => ReactNode;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<T, "id">>(empty);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  function startCreate() {
    setEditingId(null);
    setForm(empty);
    setError("");
    setNotice("");
  }

  function startEdit(item: T) {
    setEditingId(item.id);
    setForm(item);
    setError("");
    setNotice("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = editingId === null
        ? await create(form)
        : await update(editingId, form);
      setItems((current) =>
        editingId === null
          ? [...current, saved].sort((a, b) => a.order - b.order)
          : current.map((item) => item.id === saved.id ? saved : item)
              .sort((a, b) => a.order - b.order),
      );
      setEditingId(null);
      setNotice(editingId === null ? `${title} created.` : `${title} updated.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `${title} could not be saved.`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    setError("");
    setNotice("");
    try {
      await remove(target.id);
      setItems((current) => current.filter((value) => value.id !== target.id));
      setNotice(`${title} deleted.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `${title} could not be deleted.`);
    } finally {
      setDeleteTarget(null);
      setDeleting(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-[#eee2d5] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-serif text-xl font-bold">{title}</h3>
        <button type="button" className={buttonClass} onClick={startCreate}>
          Add {title.toLowerCase()}
        </button>
      </div>
      <Feedback error={error} notice={notice} />
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#faf7f2] p-3">
              <span className="min-w-0 flex-1 text-sm">{summary(item)}</span>
              <div className="flex gap-2">
                <button type="button" className="rounded-md border px-3 py-1.5 text-sm" onClick={() => startEdit(item)}>
                  Edit
                </button>
                <button type="button" className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700" onClick={() => setDeleteTarget(item)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {(editingId !== null || notice === "") && (
        <form onSubmit={(event) => void submit(event)} className="grid gap-4 border-t border-[#eee2d5] pt-4 sm:grid-cols-2">
          {renderFields(form, setForm)}
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className={buttonClass} disabled={saving}>
              {saving ? "Saving…" : editingId === null ? "Create" : "Save"}
            </button>
            {editingId !== null && (
              <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={startCreate}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete this content?"
          message={`"${summary(deleteTarget)}" will be permanently removed from Content Manager and cannot be recovered.`}
          confirmLabel="Delete content"
          isBusy={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void deleteItem()}
        />
      )}
    </section>
  );
}

const emptyManagement: LandingPageManagement = {
  banners: [],
  highlights: [],
  testimonials: [],
  faqs: [],
};

export function LandingItemsPanel() {
  const [data, setData] = useState(emptyManagement);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void contentApi.getLandingManagement(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Landing items could not be loaded.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  if (loading) return <p role="status">Loading landing page sections…</p>;

  return (
    <div className="space-y-8">
      <Feedback error={error} notice="" />
      <CollectionEditor<LandingPageBanner>
        title="Promotional banner"
        items={data.banners}
        setItems={(updater) => setData((current) => ({ ...current, banners: updater(current.banners) }))}
        empty={{ title: "", description: "", imageUrl: null, callToActionText: null, callToActionUrl: null, order: 0, isPublished: true }}
        create={contentApi.createBanner}
        update={contentApi.updateBanner}
        remove={contentApi.deleteBanner}
        summary={(item) => `${item.title}${item.isPublished ? "" : " (draft)"}`}
        renderFields={(form, setForm) => (
          <>
            <Field label="Title"><input className={inputClass} required maxLength={160} value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} /></Field>
            <Field label="Description"><textarea className={inputClass} required maxLength={1000} value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} /></Field>
            <Field label="Image URL"><input className={inputClass} maxLength={2048} value={form.imageUrl ?? ""} onChange={(e) => setForm((current) => ({ ...current, imageUrl: e.target.value || null }))} /></Field>
            <Field label="Button text"><input className={inputClass} maxLength={80} value={form.callToActionText ?? ""} onChange={(e) => setForm((current) => ({ ...current, callToActionText: e.target.value || null }))} /></Field>
            <Field label="Button link"><input className={inputClass} maxLength={2048} value={form.callToActionUrl ?? ""} onChange={(e) => setForm((current) => ({ ...current, callToActionUrl: e.target.value || null }))} /></Field>
            <OrderAndPublish form={form} setForm={setForm} />
          </>
        )}
      />
      <CollectionEditor<LandingPageHighlight>
        title="Public highlight"
        items={data.highlights}
        setItems={(updater) => setData((current) => ({ ...current, highlights: updater(current.highlights) }))}
        empty={{ title: "", description: "", order: 0, isPublished: true }}
        create={contentApi.createHighlight}
        update={contentApi.updateHighlight}
        remove={contentApi.deleteHighlight}
        summary={(item) => `${item.title}${item.isPublished ? "" : " (draft)"}`}
        renderFields={(form, setForm) => (
          <>
            <Field label="Title"><input className={inputClass} required maxLength={160} value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} /></Field>
            <Field label="Description"><textarea className={inputClass} required maxLength={1000} value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} /></Field>
            <OrderAndPublish form={form} setForm={setForm} />
          </>
        )}
      />
      <CollectionEditor<LandingPageTestimonial>
        title="Testimonial"
        items={data.testimonials}
        setItems={(updater) => setData((current) => ({ ...current, testimonials: updater(current.testimonials) }))}
        empty={{ quote: "", author: "", role: null, order: 0, isPublished: true }}
        create={contentApi.createTestimonial}
        update={contentApi.updateTestimonial}
        remove={contentApi.deleteTestimonial}
        summary={(item) => `${item.author}${item.isPublished ? "" : " (draft)"}`}
        renderFields={(form, setForm) => (
          <>
            <Field label="Quote"><textarea className={inputClass} required maxLength={2000} value={form.quote} onChange={(e) => setForm((current) => ({ ...current, quote: e.target.value }))} /></Field>
            <Field label="Author"><input className={inputClass} required maxLength={120} value={form.author} onChange={(e) => setForm((current) => ({ ...current, author: e.target.value }))} /></Field>
            <Field label="Role (optional)"><input className={inputClass} maxLength={160} value={form.role ?? ""} onChange={(e) => setForm((current) => ({ ...current, role: e.target.value || null }))} /></Field>
            <OrderAndPublish form={form} setForm={setForm} />
          </>
        )}
      />
      <CollectionEditor<LandingPageFaq>
        title="FAQ"
        items={data.faqs}
        setItems={(updater) => setData((current) => ({ ...current, faqs: updater(current.faqs) }))}
        empty={{ question: "", answer: "", order: 0, isPublished: true }}
        create={contentApi.createFaq}
        update={contentApi.updateFaq}
        remove={contentApi.deleteFaq}
        summary={(item) => `${item.question}${item.isPublished ? "" : " (draft)"}`}
        renderFields={(form, setForm) => (
          <>
            <Field label="Question"><input className={inputClass} required maxLength={500} value={form.question} onChange={(e) => setForm((current) => ({ ...current, question: e.target.value }))} /></Field>
            <Field label="Answer"><textarea className={inputClass} required maxLength={4000} value={form.answer} onChange={(e) => setForm((current) => ({ ...current, answer: e.target.value }))} /></Field>
            <OrderAndPublish form={form} setForm={setForm} />
          </>
        )}
      />
    </div>
  );
}

function OrderAndPublish<T extends { order: number; isPublished: boolean }>({
  form,
  setForm,
}: {
  form: T;
  setForm: Dispatch<SetStateAction<T>>;
}) {
  return (
    <>
      <Field label="Display order">
        <input type="number" min={0} className={inputClass} value={form.order} onChange={(e) => setForm((current) => ({ ...current, order: Number(e.target.value) }))} />
      </Field>
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((current) => ({ ...current, isPublished: e.target.checked }))} />
        Published
      </label>
    </>
  );
}

export function AboutBlocksPanel() {
  const [items, setItems] = useState<AboutPageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void contentApi.getAbout(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setItems(result);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "About blocks could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  if (loading) return <p role="status">Loading About page blocks…</p>;
  return (
    <div className="space-y-4">
      <Feedback error={error} notice="" />
      <CollectionEditor<AboutPageBlock>
        title="About block"
        items={items}
        setItems={setItems}
        empty={{ title: "", body: "", order: items.length }}
        create={contentApi.createAboutBlock}
        update={contentApi.updateAboutBlock}
        remove={contentApi.deleteAboutBlock}
        summary={(item) => item.title}
        renderFields={(form, setForm) => (
          <>
            <Field label="Heading"><input className={inputClass} required maxLength={160} value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} /></Field>
            <Field label="Content"><textarea className={inputClass} required maxLength={4000} rows={5} value={form.body} onChange={(e) => setForm((current) => ({ ...current, body: e.target.value }))} /></Field>
            <Field label="Display order"><input type="number" min={0} className={inputClass} value={form.order} onChange={(e) => setForm((current) => ({ ...current, order: Number(e.target.value) }))} /></Field>
          </>
        )}
      />
    </div>
  );
}

export function ContactSettingsPanel() {
  const [settings, setSettings] = useState<Omit<ContactPageSettings, "id">>({
    introduction: "",
    address: "",
    email: "",
    phone: "",
    workingHours: "",
    mapUrl: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void contentApi.getContactSettings(controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setSettings(contactSettingsInput(value));
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Contact settings could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = await contentApi.updateContactSettings(settings);
      setSettings(contactSettingsInput(saved));
      setNotice("Contact information updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Contact information could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p role="status">Loading contact settings…</p>;
  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <Feedback error={error} notice={notice} />
      <Field label="Introduction"><textarea className={inputClass} required maxLength={1000} value={settings.introduction} onChange={(e) => setSettings((current) => ({ ...current, introduction: e.target.value }))} /></Field>
      <Field label="Address"><textarea className={inputClass} required maxLength={500} value={settings.address} onChange={(e) => setSettings((current) => ({ ...current, address: e.target.value }))} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email"><input type="email" className={inputClass} required maxLength={254} value={settings.email} onChange={(e) => setSettings((current) => ({ ...current, email: e.target.value }))} /></Field>
        <Field label="Phone"><input className={inputClass} required maxLength={64} value={settings.phone} onChange={(e) => setSettings((current) => ({ ...current, phone: e.target.value }))} /></Field>
      </div>
      <Field label="Working hours"><textarea className={inputClass} required maxLength={500} value={settings.workingHours} onChange={(e) => setSettings((current) => ({ ...current, workingHours: e.target.value }))} /></Field>
      <Field label="Map link (optional)"><input className={inputClass} maxLength={2048} value={settings.mapUrl ?? ""} onChange={(e) => setSettings((current) => ({ ...current, mapUrl: e.target.value || null }))} /></Field>
      <button type="submit" className={buttonClass} disabled={saving}>{saving ? "Saving…" : "Save contact information"}</button>
    </form>
  );
}

function contactSettingsInput(
  value: ContactPageSettings,
): Omit<ContactPageSettings, "id"> {
  return {
    introduction: value.introduction,
    address: value.address,
    email: value.email,
    phone: value.phone,
    workingHours: value.workingHours,
    mapUrl: value.mapUrl,
  };
}

export function ContactInboxPanel() {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ContactSubmission | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void contentApi.getContactMessages(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setMessages(result);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Messages could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function toggleRead(message: ContactSubmission) {
    setError("");
    try {
      await contentApi.markContactMessageRead(message.id, !message.isRead);
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, isRead: !item.isRead } : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Message status could not be updated.");
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    setError("");
    setNotice("");
    try {
      await contentApi.deleteContactMessage(target.id);
      setMessages((current) => current.filter((item) => item.id !== target.id));
      setNotice("Message deleted from the inbox.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Message could not be deleted.");
    } finally {
      setDeleteTarget(null);
      setDeleting(false);
    }
  }

  if (loading) return <p role="status">Loading contact messages…</p>;
  return (
    <div className="space-y-4">
      <Feedback error={error} notice={notice} />
      {!messages.length && <p className="text-sm text-[#765f52]">No messages have been received.</p>}
      {messages.map((message) => (
        <article key={message.id} className="space-y-3 rounded-xl border border-[#eee2d5] p-4">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{message.subject || "No subject"} {message.isRead ? "" : "(unread)"}</h3>
              <p className="text-sm text-[#765f52]">
                {message.name} · <a className="underline" href={`mailto:${message.email}`}>{message.email}</a>
              </p>
            </div>
            <time className="text-xs text-[#765f52]" dateTime={message.submittedAtUtc}>
              {new Date(message.submittedAtUtc).toLocaleString()}
            </time>
          </header>
          <p className="whitespace-pre-line text-sm">{message.message}</p>
          <div className="flex gap-2">
            <button type="button" className="rounded-md border px-3 py-1.5 text-sm" onClick={() => void toggleRead(message)}>
              Mark {message.isRead ? "unread" : "read"}
            </button>
            <button type="button" className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700" onClick={() => setDeleteTarget(message)}>
              Delete
            </button>
          </div>
        </article>
      ))}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete this message?"
          message={`The message from ${deleteTarget.name}${deleteTarget.subject ? ` about "${deleteTarget.subject}"` : ""} will be permanently removed from the inbox.`}
          confirmLabel="Delete message"
          isBusy={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void remove()}
        />
      )}
    </div>
  );
}

type CatalogKind = "courses" | "programs" | "careerPaths";

const emptyCourse: CourseInput = {
  name: "",
  description: "",
  price: 0,
  category: "",
  programId: 0,
  duration: "",
  level: "",
  prerequisites: [],
  learningOutcomes: [],
};
const emptyProgram: ProgramInput = { name: "", description: "", careerPathId: 0 };
const emptyCareerPath: CareerPathInput = { name: "", description: "", skills: [] };

export function CatalogManagementPanel() {
  const [kind, setKind] = useState<CatalogKind>("courses");
  const [courses, setCourses] = useState<Coursetype[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState<CourseInput>(emptyCourse);
  const [programForm, setProgramForm] = useState<ProgramInput>(emptyProgram);
  const [careerPathForm, setCareerPathForm] = useState<CareerPathInput>(emptyCareerPath);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      catalogApi.getCourses("", "", 1, controller.signal, 100),
      catalogApi.getPrograms("", 1, controller.signal, 100),
      catalogApi.getCareerPaths("", 1, controller.signal, 100),
    ])
      .then(([coursePage, programPage, pathPage]) => {
        if (controller.signal.aborted) return;
        setCourses(coursePage.data);
        setPrograms(programPage.data);
        setCareerPaths(pathPage.data);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "The catalog could not be loaded.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  function chooseKind(value: CatalogKind) {
    setKind(value);
    setEditingId(null);
    setError("");
    setNotice("");
    if (value === "courses") {
      setCourseForm({ ...emptyCourse, programId: programs[0]?.id ?? 0 });
    } else if (value === "programs") {
      setProgramForm({ ...emptyProgram, careerPathId: careerPaths[0]?.id ?? 0 });
    } else {
      setCareerPathForm(emptyCareerPath);
    }
  }

  function startCreate() {
    setEditingId(null);
    setError("");
    setNotice("");
    if (kind === "courses") {
      setCourseForm({ ...emptyCourse, programId: programs[0]?.id ?? 0 });
    } else if (kind === "programs") {
      setProgramForm({ ...emptyProgram, careerPathId: careerPaths[0]?.id ?? 0 });
    } else {
      setCareerPathForm(emptyCareerPath);
    }
  }

  function startEditCourse(item: Coursetype) {
    setEditingId(item.id);
    setCourseForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      programId: item.programId,
      duration: item.duration,
      level: item.level,
      prerequisites: item.prerequisites,
      learningOutcomes: item.learningOutcomes,
    });
    setError("");
    setNotice("");
  }

  function startEditProgram(item: Program) {
    setEditingId(item.id);
    setProgramForm({ name: item.name, description: item.description, careerPathId: item.careerPathId });
    setError("");
    setNotice("");
  }

  function startEditCareerPath(item: CareerPath) {
    setEditingId(item.id);
    setCareerPathForm({ name: item.name, description: item.description, skills: item.skills });
    setError("");
    setNotice("");
  }

  async function submitCourse(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = editingId === null
        ? await catalogApi.createCourse(courseForm)
        : await catalogApi.updateCourse(editingId, courseForm);
      setCourses((current) => editingId === null ? [...current, saved] : current.map((item) => item.id === saved.id ? saved : item));
      setEditingId(null);
      setNotice(editingId === null ? "Course created." : "Course updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Course could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function submitProgram(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = editingId === null
        ? await catalogApi.createProgram(programForm)
        : await catalogApi.updateProgram(editingId, programForm);
      setPrograms((current) => editingId === null ? [...current, saved] : current.map((item) => item.id === saved.id ? saved : item));
      setEditingId(null);
      setNotice(editingId === null ? "Program created." : "Program updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Program could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function submitCareerPath(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = editingId === null
        ? await catalogApi.createCareerPath(careerPathForm)
        : await catalogApi.updateCareerPath(editingId, careerPathForm);
      setCareerPaths((current) => editingId === null ? [...current, saved] : current.map((item) => item.id === saved.id ? saved : item));
      setEditingId(null);
      setNotice(editingId === null ? "Career path created." : "Career path updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Career path could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleting(true);
    setError("");
    setNotice("");
    try {
      if (kind === "courses") {
        await catalogApi.deleteCourse(target.id);
        setCourses((current) => current.filter((item) => item.id !== target.id));
      } else if (kind === "programs") {
        await catalogApi.deleteProgram(target.id);
        setPrograms((current) => current.filter((item) => item.id !== target.id));
      } else {
        await catalogApi.deleteCareerPath(target.id);
        setCareerPaths((current) => current.filter((item) => item.id !== target.id));
      }
      setNotice(`${kind === "careerPaths" ? "Career path" : kind.slice(0, -1)} deleted.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Item could not be deleted.");
    } finally {
      setDeleteTarget(null);
      setDeleting(false);
    }
  }

  if (loading) return <p role="status">Loading catalog…</p>;

  return (
    <div className="space-y-5">
      <Feedback error={error} notice={notice} />
      <div className="flex flex-wrap gap-2">
        {(["courses", "programs", "careerPaths"] as const).map((value) => (
          <button key={value} type="button" className={`rounded-lg px-4 py-2 text-sm font-semibold ${kind === value ? "bg-[#a9694f] text-white" : "border"}`} onClick={() => chooseKind(value)}>
            {value === "careerPaths" ? "Career paths" : value}
          </button>
        ))}
        <button type="button" className={`${buttonClass} ml-auto`} onClick={startCreate}>
          Add {kind === "careerPaths" ? "career path" : kind.slice(0, -1)}
        </button>
      </div>
      <div className="space-y-2">
        {(kind === "courses" ? courses : kind === "programs" ? programs : careerPaths).map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#faf7f2] p-3">
            <span className="text-sm font-medium">{item.name}</span>
            <div className="flex gap-2">
              <button type="button" className="rounded-md border px-3 py-1.5 text-sm" onClick={() => {
                if (kind === "courses") {
                  const course = courses.find((value) => value.id === item.id);
                  if (course) startEditCourse(course);
                } else if (kind === "programs") {
                  const program = programs.find((value) => value.id === item.id);
                  if (program) startEditProgram(program);
                } else {
                  const careerPath = careerPaths.find((value) => value.id === item.id);
                  if (careerPath) startEditCareerPath(careerPath);
                }
              }}>Edit</button>
              <button type="button" className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700" onClick={() => setDeleteTarget({ id: item.id, label: item.name })}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editingId !== null || notice === "" ? (
        kind === "courses" ? (
          <form onSubmit={(event) => void submitCourse(event)} className="grid gap-4 border-t pt-5 sm:grid-cols-2">
            <Field label="Course name"><input className={inputClass} required maxLength={200} value={courseForm.name} onChange={(e) => setCourseForm((current) => ({ ...current, name: e.target.value }))} /></Field>
            <Field label="Category"><input className={inputClass} required maxLength={100} value={courseForm.category} onChange={(e) => setCourseForm((current) => ({ ...current, category: e.target.value }))} /></Field>
            <Field label="Program"><select className={inputClass} required value={courseForm.programId} onChange={(e) => setCourseForm((current) => ({ ...current, programId: Number(e.target.value) }))}><option value={0} disabled>Select a program</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></Field>
            <Field label="Price"><input type="number" min={0} className={inputClass} required value={courseForm.price} onChange={(e) => setCourseForm((current) => ({ ...current, price: Number(e.target.value) }))} /></Field>
            <Field label="Duration"><input className={inputClass} required value={courseForm.duration} onChange={(e) => setCourseForm((current) => ({ ...current, duration: e.target.value }))} /></Field>
            <Field label="Level"><input className={inputClass} required value={courseForm.level} onChange={(e) => setCourseForm((current) => ({ ...current, level: e.target.value }))} /></Field>
            <Field label="Description"><textarea className={inputClass} required maxLength={4000} value={courseForm.description} onChange={(e) => setCourseForm((current) => ({ ...current, description: e.target.value }))} /></Field>
            <Field label="Prerequisites (one per line)"><textarea className={inputClass} value={courseForm.prerequisites.join("\n")} onChange={(e) => setCourseForm((current) => ({ ...current, prerequisites: e.target.value.split("\n").map((value) => value.trim()).filter(Boolean) }))} /></Field>
            <Field label="Learning outcomes (one per line)"><textarea className={inputClass} value={courseForm.learningOutcomes.join("\n")} onChange={(e) => setCourseForm((current) => ({ ...current, learningOutcomes: e.target.value.split("\n").map((value) => value.trim()).filter(Boolean) }))} /></Field>
            <button type="submit" className={`${buttonClass} sm:col-span-2`} disabled={saving || !programs.length}>{saving ? "Saving…" : editingId === null ? "Create course" : "Save course"}</button>
          </form>
        ) : kind === "programs" ? (
          <form onSubmit={(event) => void submitProgram(event)} className="grid gap-4 border-t pt-5 sm:grid-cols-2">
            <Field label="Program name"><input className={inputClass} required maxLength={160} value={programForm.name} onChange={(e) => setProgramForm((current) => ({ ...current, name: e.target.value }))} /></Field>
            <Field label="Career path"><select className={inputClass} required value={programForm.careerPathId} onChange={(e) => setProgramForm((current) => ({ ...current, careerPathId: Number(e.target.value) }))}><option value={0} disabled>Select a career path</option>{careerPaths.map((path) => <option key={path.id} value={path.id}>{path.name}</option>)}</select></Field>
            <Field label="Description"><textarea className={inputClass} required maxLength={4000} value={programForm.description} onChange={(e) => setProgramForm((current) => ({ ...current, description: e.target.value }))} /></Field>
            <button type="submit" className={`${buttonClass} self-end`} disabled={saving || !careerPaths.length}>{saving ? "Saving…" : editingId === null ? "Create program" : "Save program"}</button>
          </form>
        ) : (
          <form onSubmit={(event) => void submitCareerPath(event)} className="grid gap-4 border-t pt-5 sm:grid-cols-2">
            <Field label="Career path name"><input className={inputClass} required maxLength={160} value={careerPathForm.name} onChange={(e) => setCareerPathForm((current) => ({ ...current, name: e.target.value }))} /></Field>
            <Field label="Skills (one per line)"><textarea className={inputClass} value={careerPathForm.skills.join("\n")} onChange={(e) => setCareerPathForm((current) => ({ ...current, skills: e.target.value.split("\n").map((value) => value.trim()).filter(Boolean) }))} /></Field>
            <Field label="Description"><textarea className={inputClass} required maxLength={4000} value={careerPathForm.description} onChange={(e) => setCareerPathForm((current) => ({ ...current, description: e.target.value }))} /></Field>
            <button type="submit" className={`${buttonClass} self-end`} disabled={saving}>{saving ? "Saving…" : editingId === null ? "Create career path" : "Save career path"}</button>
          </form>
        )
      ) : null}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete this catalog item?"
          message={`Delete "${deleteTarget.label}"? If existing records depend on this item, deletion will be blocked and it will remain in the catalog.`}
          confirmLabel={`Delete ${kind === "careerPaths" ? "career path" : kind.slice(0, -1)}`}
          isBusy={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void deleteItem()}
        />
      )}
    </div>
  );
}

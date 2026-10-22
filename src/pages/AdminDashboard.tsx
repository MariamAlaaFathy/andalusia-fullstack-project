import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import {
  adminApi,
  type AdminUser,
  type UserPayload,
} from "../services/AdminApi";
import { userContext } from "../types/UserContextType";

// Adjust to the roles your backend accepts.
const ROLE_OPTIONS = ["Learner", "Admin"];

type FormState =
  | { mode: "create" }
  | { mode: "edit"; user: AdminUser }
  | null;

function AdminDashboard() {
  const context = useContext(userContext);
  const currentEmail = context?.user?.email?.trim().toLowerCase();
  const hasAccess = context?.user?.role === "Admin";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (context?.isLoading) return;
    if (!hasAccess) return;

    const controller = new AbortController();

    async function loadUsers() {
      setErrorMessage("");
      setIsLoading(true);
      try {
        const records = await adminApi.getUsers(controller.signal);
        if (controller.signal.aborted) return;
        setUsers(records);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Users could not be loaded.", error);
        setErrorMessage(
          error instanceof Error ? error.message : "Users could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadUsers();
    return () => controller.abort();
  }, [context?.isLoading, currentEmail, hasAccess]);

  const adminCount = users.filter((user) => user.isAdmin).length;
  const learnerCount = users.length - adminCount;

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term),
    );
  }, [users, query]);

  function replaceUser(updated: AdminUser) {
    setUsers((current) =>
      current.map((user) => (user.userId === updated.userId ? updated : user)),
    );
  }

  async function handleSave(payload: UserPayload) {
    if (!form) return;
    if (form.mode === "create") {
      const created = await adminApi.createUser(payload);
      setUsers((current) => [created, ...current]);
      setNotice(`${created.name} was added.`);
    } else {
      const updated = await adminApi.updateUser(form.user.userId, payload);
      replaceUser(updated);
      setNotice(`${updated.name} was updated.`);
    }
    setErrorMessage("");
    setForm(null);
  }

  async function handleRoleChange(user: AdminUser, role: string) {
    setBusyId(user.userId);
    setNotice("");
    setErrorMessage("");
    try {
      const updated = await adminApi.assignRole(
        user.userId,
        role,
        role === "Admin",
      );
      replaceUser(updated);
      setNotice(`${user.name} is now ${role}.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "The role could not be changed.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setBusyId(target.userId);
    setNotice("");
    setErrorMessage("");
    try {
      await adminApi.deleteUser(target.userId);
      setUsers((current) =>
        current.filter((user) => user.userId !== target.userId),
      );
      setNotice(`${target.name} was deleted.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "The user could not be deleted.",
      );
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#2b2420]">
      <NavBar />
      <main className="mx-auto min-h-[65vh] max-w-[1180px] px-4 py-9 sm:px-6 sm:py-12">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#a55335]">
              Admin space
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
              Manage users
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#765f52]">
              Add accounts, update details, assign roles, and remove users from
              the platform.
            </p>
          </div>
          {hasAccess && (
            <button
              type="button"
              onClick={() => setForm({ mode: "create" })}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#a9694f] px-5 py-2.5 font-semibold text-white transition hover:bg-[#8f5640] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
            >
              Add user
            </button>
          )}
        </header>

        {context?.isLoading && (
          <p role="status" className="mb-6 text-sm text-[#765f52]">
            Checking your session…
          </p>
        )}

        {!context?.isLoading && !hasAccess && (
          <section className="mb-6 rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">
              {context?.user
                ? "Administrator access required"
                : "Sign in to manage users"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#765f52]">
              This area is restricted to administrator accounts.
            </p>
            {!context?.user && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/Login"
                  state={{ from: "/AdminDashboard" }}
                  className="inline-flex min-h-11 items-center rounded-lg border border-[#a9694f] px-5 py-2.5 font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8]"
                >
                  Go to login
                </Link>
              </div>
            )}
          </section>
        )}

        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-[#b9d3c2] bg-[#e5eee8] p-4 text-sm text-[#166534]"
          >
            {notice}
          </div>
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
          aria-label="User overview"
          className={`mb-8 grid gap-4 sm:grid-cols-3 ${
            hasAccess ? "" : "hidden"
          }`}
        >
          <OverviewCard label="Total users" value={users.length} />
          <OverviewCard label="Administrators" value={adminCount} />
          <OverviewCard label="Learners" value={learnerCount} />
        </section>

        <section
          className={`overflow-hidden rounded-2xl border border-[#dfd2c3] bg-white ${
            hasAccess ? "" : "hidden"
          }`}
        >
          <div className="flex flex-col gap-3 border-b border-[#eee2d5] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <h2 className="font-serif text-xl font-bold">
              All users
              <span className="ml-2 rounded-full bg-[#f3e7d8] px-2 py-0.5 text-xs font-bold text-[#8a5a2b]">
                {filteredUsers.length}
              </span>
            </h2>
            <label className="block w-full sm:max-w-xs">
              <span className="sr-only">Search users</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, email, or role"
                className="min-h-11 w-full rounded-lg border border-[#d8cabc] bg-white px-4 py-2 text-sm placeholder:text-[#9a8577] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
              />
            </label>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <p
                className="py-10 text-center text-sm text-[#765f52]"
                role="status"
              >
                Loading users…
              </p>
            ) : filteredUsers.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#eee2d5] text-xs uppercase tracking-wide text-[#765f52]">
                      <th className="px-3 py-3 font-semibold sm:px-4">User</th>
                      <th className="px-3 py-3 font-semibold sm:px-4">Role</th>
                      <th className="px-3 py-3 font-semibold sm:px-4">
                        Access
                      </th>
                      <th className="px-3 py-3 text-right font-semibold sm:px-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const isSelf = user.email.trim().toLowerCase() === currentEmail;
                      const isBusy = busyId === user.userId;
                      return (
                        <tr
                          key={user.userId}
                          className="border-b border-[#eee2d5] last:border-0"
                        >
                          <td className="px-3 py-4 sm:px-4">
                            <p className="break-words font-semibold">
                              {user.name}
                              {isSelf && (
                                <span className="ml-2 text-xs font-medium text-[#765f52]">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="break-all text-sm text-[#765f52]">
                              {user.email}
                            </p>
                          </td>
                          <td className="px-3 py-4 sm:px-4">
                            <label>
                              <span className="sr-only">
                                Role for {user.name}
                              </span>
                              <select
                                value={user.role}
                                disabled={isSelf || isBusy}
                                onChange={(event) =>
                                  void handleRoleChange(user, event.target.value)
                                }
                                className="min-h-11 rounded-lg border border-[#d8cabc] bg-white px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
                              >
                                {ROLE_OPTIONS.map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </td>
                          <td className="px-3 py-4 sm:px-4">
                            <StatusBadge isAdmin={user.isAdmin} />
                          </td>
                          <td className="px-3 py-4 sm:px-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setForm({ mode: "edit", user })}
                                className="inline-flex min-h-11 items-center rounded-lg border border-[#a9694f] px-4 py-2 text-sm font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={isSelf || isBusy}
                                onClick={() => setDeleteTarget(user)}
                                className="inline-flex min-h-11 items-center rounded-lg border border-[#e7b7aa] px-4 py-2 text-sm font-semibold text-[#873d2d] transition hover:bg-[#f8e9e5] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#873d2d]"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title={query ? "No users match your search" : "No users yet"}
                description={
                  query
                    ? "Try a different name, email address, or role."
                    : "Accounts you add will appear here."
                }
              />
            )}
          </div>
        </section>
      </main>
      <Footer />

      {form && (
        <UserFormDialog
          key={form.mode === "edit" ? form.user.userId : "new"}
          state={form}
          onClose={() => setForm(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <Dialog
          title="Delete this user?"
          onClose={() => setDeleteTarget(null)}
        >
          <p className="text-sm leading-relaxed text-[#765f52]">
            {deleteTarget.name} ({deleteTarget.email}) will lose access to the
            platform. This action cannot be undone.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="inline-flex min-h-11 items-center rounded-lg border border-[#d8cabc] bg-white px-5 py-2.5 font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
            >
              Keep user
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="inline-flex min-h-11 items-center rounded-lg bg-[#873d2d] px-5 py-2.5 font-semibold text-white transition hover:bg-[#6e3124] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#873d2d]"
            >
              Delete user
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function UserFormDialog({
  state,
  onClose,
  onSave,
}: {
  state: NonNullable<FormState>;
  onClose: () => void;
  onSave: (payload: UserPayload) => Promise<void>;
}) {
  const editing = state.mode === "edit";
  const initial = state.mode === "edit" ? state.user : null;
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState(initial?.role ?? ROLE_OPTIONS[0]);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        role,
        isAdmin: role === "Admin",
        ...(password ? { password } : {}),
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "The user could not be saved.",
      );
      setSubmitting(false);
    }
  }

  return (
    <Dialog title={editing ? "Edit user" : "Add user"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-[#e7b7aa] bg-[#f8e9e5] p-3 text-sm text-[#873d2d]"
          >
            {formError}
          </div>
        )}
        <Field label="Full name">
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Email address">
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Role">
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className={inputClass}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label={editing ? "New password" : "Password"}
          hint={editing ? "Leave blank to keep the current password." : undefined}
        >
          <input
            required={!editing}
            type="password"
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-lg border border-[#d8cabc] bg-white px-5 py-2.5 font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 items-center rounded-lg bg-[#a9694f] px-5 py-2.5 font-semibold text-white transition hover:bg-[#8f5640] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
          >
            {submitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-[#d8cabc] bg-white px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-xs text-[#765f52]">{hint}</span>
      )}
    </label>
  );
}

function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2420]/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#dfd2c3] bg-white p-6 outline-none sm:p-8"
      >
        <h2 className="mb-4 font-serif text-2xl font-bold">{title}</h2>
        {children}
      </div>
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

function StatusBadge({ isAdmin }: { isAdmin: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        isAdmin
          ? "bg-[#e5eee8] text-[#166534]"
          : "bg-[#f3e7d8] text-[#8a5a2b]"
      }`}
    >
      {isAdmin ? "Administrator" : "Standard"}
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
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
    </div>
  );
}

export default AdminDashboard;
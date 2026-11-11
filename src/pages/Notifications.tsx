import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { notificationsContext } from "../context/NotificationsContext";
import { userContext } from "../types/UserContextType";
import Footer from "../Components/Footer";
import NavBar from "../Components/NavBar";
import { notificationsApi, type NotificationItem } from "../services/notificationsApi";

function Notifications() {
  const auth = useContext(userContext);
  const notifications = useContext(notificationsContext);
  const userId = auth?.user?.userId;
  const isLearner = auth?.user?.role === "Learner";
  const [loadState, setLoadState] = useState<{
    userId: number;
    items: NotificationItem[];
    error: string;
  } | null>(null);
  const [actionError, setActionError] = useState("");
  const currentState = loadState?.userId === userId ? loadState : null;
  const items = currentState?.items ?? [];
  const errorMessage = actionError || currentState?.error || "";
  const isLoading =
    !auth?.isLoading &&
    isLearner &&
    typeof userId === "number" &&
    currentState === null;

  useEffect(() => {
    if (auth?.isLoading || !isLearner || typeof userId !== "number") return;
    const controller = new AbortController();

    void notificationsApi
      .getMine(controller.signal)
      .then((records) => {
        if (!controller.signal.aborted) {
          setLoadState({ userId, items: records, error: "" });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Notifications could not be loaded.", error);
        setLoadState({
          userId,
          items: [],
          error:
            error instanceof Error
              ? error.message
              : "Notifications could not be loaded.",
        });
      });

    return () => controller.abort();
  }, [auth?.isLoading, isLearner, userId]);

  async function markAsRead(notificationId: number) {
    setActionError("");
    try {
      await notificationsApi.markAsRead(notificationId);
      setLoadState((current) =>
        current && current.userId === userId
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === notificationId ? { ...item, isRead: true } : item,
              ),
            }
          : current,
      );
      await notifications?.refreshUnreadCount();
    } catch (error) {
      console.error("The notification could not be marked as read.", error);
      setActionError(
        error instanceof Error
          ? error.message
          : "The notification could not be marked as read.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f1e8] text-[#2b2420]">
      <NavBar />
      <main className="mx-auto min-h-[65vh] max-w-[1000px] px-4 py-9 sm:px-6 sm:py-12">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#a55335]">
            Learner space
          </p>
          <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">
            Notifications
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#765f52]">
            Stay up to date with your applications, sessions, payments, and coursework.
          </p>
        </header>

        {auth?.isLoading ? (
          <p className="rounded-2xl border border-[#dfd2c3] bg-white p-8 text-[#765f52]" role="status">
            Checking your session…
          </p>
        ) : !auth?.user ? (
          <section className="rounded-2xl border border-[#dfd2c3] bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-bold">Sign in to view your notifications</h2>
            <Link className="mt-5 inline-flex rounded-lg bg-[#a9694f] px-5 py-3 font-semibold text-white" to="/Login">
              Go to login
            </Link>
          </section>
        ) : !isLearner ? (
          <p className="rounded-2xl border border-[#dfd2c3] bg-white p-8 text-[#765f52]">
            Notifications are available to learner accounts.
          </p>
        ) : errorMessage ? (
          <p role="alert" className="rounded-xl border border-[#e7b7aa] bg-[#f8e9e5] p-4 text-sm text-[#873d2d]">
            {errorMessage}
          </p>
        ) : isLoading ? (
          <p className="rounded-2xl border border-[#dfd2c3] bg-white p-8 text-[#765f52]" role="status">
            Loading your notifications…
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-[#dfd2c3] bg-white p-8 text-[#765f52]">
            You’re all caught up. New updates will appear here.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${
                  item.isRead ? "border-[#dfd2c3]" : "border-[#c99c84]"
                }`}
              >
                <div className="min-w-0">
                  <p className="leading-relaxed">{item.text}</p>
                  <time
                    className="mt-2 block text-sm text-[#765f52]"
                    dateTime={item.date}
                  >
                    {formatDate(item.date)}
                  </time>
                </div>
                {item.isRead ? (
                  <span className="shrink-0 text-sm text-[#765f52]">Read</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void markAsRead(item.id)}
                    className="min-h-10 shrink-0 rounded-lg border border-[#a9694f] px-4 py-2 text-sm font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f]"
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

export default Notifications;

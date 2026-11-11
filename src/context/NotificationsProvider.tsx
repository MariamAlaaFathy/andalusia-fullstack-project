import {
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { notificationsApi } from "../services/notificationsApi";
import { notificationsContext } from "./NotificationsContext";
import { userContext } from "../types/UserContextType";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const auth = useContext(userContext);
  const userId = auth?.user?.userId;
  const [countState, setCountState] = useState<{
    userId: number;
    count: number;
  } | null>(null);
  const unreadCount =
    typeof userId === "number" && countState?.userId === userId
      ? countState.count
      : 0;

  const refreshUnreadCount = useCallback(async () => {
    if (typeof userId !== "number") {
      return;
    }
    setCountState({
      userId,
      count: await notificationsApi.getUnreadCount(),
    });
  }, [userId]);

  useEffect(() => {
    if (auth?.isLoading) return;
    if (typeof userId !== "number") {
      return;
    }

    let active = true;
    const refresh = () => {
      void notificationsApi
        .getUnreadCount()
        .then((count) => {
          if (active) setCountState({ userId, count });
        })
        .catch((error: unknown) => {
          if (active) {
            console.error("Unread notifications could not be refreshed.", error);
          }
        });
    };

    refresh();
    const intervalId = window.setInterval(refresh, 15000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [auth?.isLoading, userId]);

  return (
    <notificationsContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </notificationsContext.Provider>
  );
}

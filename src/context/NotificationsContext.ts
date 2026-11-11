import { createContext } from "react";

type NotificationsContextType = {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
};

export const notificationsContext =
  createContext<NotificationsContextType | null>(null);

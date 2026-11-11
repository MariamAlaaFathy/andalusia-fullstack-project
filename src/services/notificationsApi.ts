import { authenticatedFetch } from "./authApi";
import { apiBaseUrl } from "./apiConfig";

export type NotificationItem = {
  id: number;
  userId: number;
  text: string;
  date: string;
  isRead: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNotification(value: unknown): value is NotificationItem {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.userId === "number" &&
    typeof value.text === "string" &&
    typeof value.date === "string" &&
    typeof value.isRead === "boolean"
  );
}

async function readError(response: Response): Promise<string> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (isRecord(payload)) {
    if (typeof payload.detail === "string") return payload.detail;
    if (typeof payload.message === "string") return payload.message;
    if (typeof payload.title === "string") return payload.title;
  }
  return `Notification request failed with status ${response.status}.`;
}

async function getNotifications(signal?: AbortSignal): Promise<NotificationItem[]> {
  let response: Response;
  try {
    response = await authenticatedFetch(`${apiBaseUrl}/api/notifications`, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    throw new Error("Could not connect to the notifications API.", {
      cause: error,
    });
  }

  if (!response.ok) throw new Error(await readError(response));

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error("The notifications API returned an unreadable response.", {
      cause: error,
    });
  }
  if (!Array.isArray(payload) || !payload.every(isNotification)) {
    throw new Error("The notifications API returned data in an unexpected format.");
  }
  return payload;
}

async function getUnreadCount(): Promise<number> {
  let response: Response;
  try {
    response = await authenticatedFetch(
      `${apiBaseUrl}/api/notifications/unread-count`,
      { headers: { Accept: "application/json" } },
    );
  } catch (error) {
    throw new Error("Could not connect to the notifications API.", {
      cause: error,
    });
  }

  if (!response.ok) throw new Error(await readError(response));
  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error("The notifications API returned an unreadable response.", {
      cause: error,
    });
  }
  if (!isRecord(payload) || typeof payload.count !== "number") {
    throw new Error("The notifications API returned an invalid unread count.");
  }
  return payload.count;
}

async function markAsRead(notificationId: number): Promise<void> {
  let response: Response;
  try {
    response = await authenticatedFetch(
      `${apiBaseUrl}/api/notifications/${notificationId}/read`,
      { method: "PATCH", headers: { Accept: "application/json" } },
    );
  } catch (error) {
    throw new Error("Could not connect to the notifications API.", {
      cause: error,
    });
  }
  if (!response.ok) throw new Error(await readError(response));
}

export const notificationsApi = {
  getMine: getNotifications,
  getUnreadCount,
  markAsRead,
};

import { authenticatedFetch } from "../types/Authapi";
import { apiBaseUrl } from "../types/Apiconfig";

export type AdminUser = {
  userId: number;
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
};

export type UserPayload = {
  name: string;
  email: string;
  role: string;
  isAdmin: boolean;
  password?: string;
};

const USERS_PATH = "/api/admin/users";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// The backend DTO field names are not fixed here, so common variants are accepted.
function normalizeUser(raw: unknown): AdminUser {
  if (!isRecord(raw)) {
    throw new Error("The admin API returned a user in an unexpected format.");
  }
  const id = raw.userId ?? raw.id;
  const name = raw.name ?? raw.username ?? raw.userName;
  const email = raw.email;
  if (typeof id !== "number" || typeof name !== "string" || typeof email !== "string") {
    throw new Error("The admin API returned a user in an unexpected format.");
  }
  const isAdmin =
    typeof raw.isAdmin === "boolean" ? raw.isAdmin : raw.role === "Admin";
  const role =
    typeof raw.role === "string" ? raw.role : isAdmin ? "Admin" : "Learner";
  return { userId: id, name, email, role, isAdmin };
}

// Both "name" and "username" are sent so either DTO property binds.
function toBody(user: UserPayload) {
  return JSON.stringify({ ...user, username: user.name });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await authenticatedFetch(`${apiBaseUrl}${USERS_PATH}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    throw new Error("Could not connect to the admin API.", { cause: error });
  }

  let payload: unknown = null;
  if (response.status !== 204) {
    try {
      payload = await response.json();
    } catch (error) {
      if (response.ok) {
        throw new Error("The admin API returned an unreadable response.", {
          cause: error,
        });
      }
    }
  }

  if (!response.ok) {
    const detail =
      isRecord(payload) && typeof payload.detail === "string"
        ? payload.detail
        : isRecord(payload) && typeof payload.message === "string"
          ? payload.message
          : response.status === 401
            ? "Please sign in again to continue."
            : response.status === 403
              ? "You do not have permission to manage users."
              : response.status === 404
                ? "This user no longer exists."
                : `Admin request failed with status ${response.status}.`;
    throw new Error(detail);
  }

  return payload as T;
}

export const adminApi = {
  async getUsers(signal?: AbortSignal): Promise<AdminUser[]> {
    const payload = await request<unknown>("", { signal });
    if (!Array.isArray(payload)) {
      throw new Error("The admin API returned data in an unexpected format.");
    }
    return payload.map(normalizeUser);
  },

  async createUser(user: UserPayload): Promise<AdminUser> {
    return normalizeUser(
      await request<unknown>("", { method: "POST", body: toBody(user) }),
    );
  },

  async updateUser(id: number, user: UserPayload): Promise<AdminUser> {
    return normalizeUser(
      await request<unknown>(`/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: toBody(user),
      }),
    );
  },

  async assignRole(
    id: number,
    role: string,
    isAdmin: boolean,
  ): Promise<AdminUser> {
    return normalizeUser(
      await request<unknown>(`/${encodeURIComponent(id)}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role, isAdmin }),
      }),
    );
  },

  deleteUser(id: number) {
    return request<void>(`/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};
import type { User } from "../types/User";
import type { Credentials, Registration } from "../types/UserContextType";
import { apiBaseUrl } from "./apiConfig";

type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresInMinutes: number;
  user: User;
};

const refreshTokenKey = "andalusia.refreshToken";
let accessToken: string | null = null;
let refreshInProgress: Promise<AuthSession | null> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUser(value: unknown): value is User {
  return (
    isRecord(value) &&
    typeof value.userId === "number" &&
    typeof value.username === "string" &&
    typeof value.email === "string" &&
    typeof value.role === "string"
  );
}

function isAuthSession(value: unknown): value is AuthSession {
  return (
    isRecord(value) &&
    typeof value.accessToken === "string" &&
    typeof value.refreshToken === "string" &&
    typeof value.expiresInMinutes === "number" &&
    isUser(value.user)
  );
}

async function readPayload(response: Response): Promise<unknown> {
  return response.json().catch(() => null) as Promise<unknown>;
}

function getErrorMessage(payload: unknown, status: number): string {
  if (isRecord(payload)) {
    if (typeof payload.message === "string") return payload.message;
    if (typeof payload.detail === "string") return payload.detail;
    if (typeof payload.title === "string") return payload.title;
  }
  return `The request failed with status ${status}.`;
}

async function request<T>(
  path: string,
  body: unknown,
  isPayload: (payload: unknown) => payload is T,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error("Could not connect to the user API.", { cause: error });
  }

  const payload = await readPayload(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status));
  }
  if (!isPayload(payload)) {
    throw new Error("The user API returned data in an unexpected format.");
  }
  return payload;
}

function storeSession(session: AuthSession): AuthSession {
  accessToken = session.accessToken;
  sessionStorage.setItem(refreshTokenKey, session.refreshToken);
  return session;
}

function clearSession(): void {
  accessToken = null;
  sessionStorage.removeItem(refreshTokenKey);
}

async function performRefresh(): Promise<AuthSession | null> {
  const refreshToken = sessionStorage.getItem(refreshTokenKey);
  if (!refreshToken) return null;

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/users/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    throw new Error("Could not connect to the user API to refresh the session.", {
      cause: error,
    });
  }

  const payload = await readPayload(response);
  if (response.status === 401) {
    clearSession();
    return null;
  }
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status));
  }
  if (!isAuthSession(payload)) {
    throw new Error("The user API returned an unexpected refresh response.");
  }
  return storeSession(payload);
}

function refreshSession(): Promise<AuthSession | null> {
  if (!refreshInProgress) {
    refreshInProgress = performRefresh().finally(() => {
      refreshInProgress = null;
    });
  }
  return refreshInProgress;
}

export const authApi = {
  async login(credentials: Credentials): Promise<AuthSession> {
    const session = await request(
      "/api/users/login",
      credentials,
      isAuthSession,
    );
    return storeSession(session);
  },

  async register(registration: Registration): Promise<void> {
    await request(
      "/api/users",
      registration,
      (payload): payload is User => isUser(payload),
    );
  },

  restoreSession: refreshSession,

  async logout(): Promise<void> {
    let response: Response | null = null;
    try {
      if (accessToken) {
        response = await authenticatedFetch(`${apiBaseUrl}/api/users/logout`, {
          method: "POST",
          headers: { Accept: "application/json" },
        });
      }
      if (response && !response.ok && response.status !== 401) {
        const payload = await readPayload(response);
        throw new Error(getErrorMessage(payload, response.status));
      }
    } finally {
      clearSession();
    }
  },
};

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const originalRequest = new Request(input, init);

  const sendWithCurrentToken = (request: Request) => {
    const headers = new Headers(request.headers);
    if (accessToken) {
      headers.set("Authorization", "Bearer " + accessToken);
    }
    return fetch(new Request(request, { headers }));
  };

  const response = await sendWithCurrentToken(originalRequest.clone());
  if (
    response.status !== 401 ||
    !sessionStorage.getItem(refreshTokenKey)
  ) {
    return response;
  }

  const session = await refreshSession();
  if (!session) return response;
  return sendWithCurrentToken(originalRequest.clone());
}

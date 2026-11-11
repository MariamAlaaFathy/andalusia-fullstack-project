import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/User";
import {
  userContext,
  type Credentials,
  type Registration,
} from "../types/UserContextType";
import { authApi } from "../services/authApi";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void authApi
      .restoreSession()
      .then((session) => {
        if (isMounted) setUser(session?.user ?? null);
      })
      .catch((error: unknown) => {
        console.error("Could not restore the user session.", error);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(credentials: Credentials): Promise<User> {
    const session = await authApi.login(credentials);
    setUser(session.user);
    return session.user;
  }

  async function register(registration: Registration): Promise<void> {
    await authApi.register(registration);
    await login({
      email: registration.email,
      password: registration.password,
    });
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }

  return (
    <userContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </userContext.Provider>
  );
}

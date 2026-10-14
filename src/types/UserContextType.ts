import { createContext } from "react";
import type { User } from "./User";

type Credentials = {
  email: string;
  password: string;
};

type Registration = Credentials & {
  username: string;
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  register: (registration: Registration) => Promise<void>;
  logout: () => Promise<void>;
};

export const userContext = createContext<UserContextType | null>(null);

export type { Credentials, Registration, UserContextType };

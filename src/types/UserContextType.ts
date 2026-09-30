import { createContext } from "react";
import type { User } from "./User";

type UserContextType={

    user: User,
    setUser: React.Dispatch<React.SetStateAction<User>>
}

export const userContext = createContext<UserContextType |null>(null);

export type {UserContextType};
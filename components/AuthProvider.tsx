"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getSession,
  isModerator,
  login,
  logout,
  notifyAuthChange,
  signUp,
} from "@/lib/auth";
import { AuthSession } from "@/lib/types";

type AuthContextValue = {
  session: AuthSession | null;
  isModerator: boolean;
  mounted: boolean;
  signIn: (username: string, password: string) => string | null;
  register: (username: string, password: string) => string | null;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setSession(getSession());
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
    window.addEventListener("kraft-auth-updated", refresh);
    return () => window.removeEventListener("kraft-auth-updated", refresh);
  }, [refresh]);

  function signIn(username: string, password: string): string | null {
    const result = login(username, password);
    if ("error" in result) return result.error;
    setSession(result);
    notifyAuthChange();
    return null;
  }

  function register(username: string, password: string): string | null {
    const result = signUp(username, password);
    if ("error" in result) return result.error;
    setSession(result);
    notifyAuthChange();
    return null;
  }

  function signOut() {
    logout();
    setSession(null);
    notifyAuthChange();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isModerator: isModerator(session),
        mounted,
        signIn,
        register,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

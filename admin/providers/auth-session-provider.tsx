"use client";

import type { UserDto } from "@platform/shared";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getAccessToken, setAccessToken } from "@platform/api-client";
import { routes } from "@/config/routes";
import { tryRefreshSession } from "@/lib/refresh-session";

type AuthSessionContextValue = {
  user: UserDto | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

const AUTH_PUBLIC_PATHS = [
  routes.signIn,
  routes.forgotPassword,
  routes.resetPassword,
];

function isAuthPublicPath(pathname: string): boolean {
  return AUTH_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

async function fetchSessionUser(): Promise<UserDto | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const user = (await response.json()) as UserDto;
    return user.role === "admin" ? user : null;
  } catch {
    return null;
  }
}

type AuthSessionProviderProps = {
  children: ReactNode;
};

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    let sessionUser = await fetchSessionUser();

    if (!sessionUser && (await tryRefreshSession())) {
      sessionUser = await fetchSessionUser();
    }

    if (sessionUser && !getAccessToken()) {
      await tryRefreshSession();
    }

    if (!sessionUser) {
      setAccessToken(null);
    }

    setUser(sessionUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthPublicPath(pathname)) {
      setUser(null);
      setAccessToken(null);
      setLoading(false);
      return;
    }

    void refreshUser();

    function onSessionUpdated() {
      void refreshUser();
    }

    window.addEventListener("auth:session-updated", onSessionUpdated);
    return () => {
      window.removeEventListener("auth:session-updated", onSessionUpdated);
    };
  }, [pathname, refreshUser]);

  return (
    <AuthSessionContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValue {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return context;
}

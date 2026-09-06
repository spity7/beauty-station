"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBusyActionGuard } from "@platform/react-busy";
import { routes } from "@/config/routes";
import { clearSession } from "@/lib/session";
import { Icon } from "@/components/layout/icon";
import { cn } from "@/utils/cn";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { disabled } = useBusyActionGuard({
    active: loggingOut,
    warnOnLeave: false,
  });

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await clearSession();
      router.push(routes.signIn);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <button
      aria-busy={loggingOut}
      aria-label="Logout"
      className={cn(
        "flex w-full items-center gap-3 rounded-base px-2 py-2 text-[14px] text-ink-700 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      disabled={disabled}
      onClick={() => void handleLogout()}
      role="menuitem"
      type="button"
    >
      <Icon className="h-[18px] w-[18px] text-ink-500" name="log-out" />
      <span className="nav-text">
        {loggingOut ? "Signing out…" : "Logout"}
      </span>
    </button>
  );
}

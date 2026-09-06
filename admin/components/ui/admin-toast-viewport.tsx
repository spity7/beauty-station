"use client";

import { Icon } from "@/components/layout/icon";
import { cn } from "@/utils/cn";
import type { AdminToastItem } from "@/providers/toast-provider";

export function AdminToastViewport({ toasts }: { toasts: AdminToastItem[] }) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          className={cn(
            "pointer-events-auto flex items-center gap-3 rounded-base border px-4 py-3 shadow-lift",
            toast.variant === "success" &&
              "border-success-200 bg-success-50 text-success-700",
            toast.variant === "error" &&
              "border-danger-200 bg-danger-50 text-danger-700"
          )}
          key={toast.id}
          role="status"
        >
          <span
            className={cn(
              "grid h-7 w-7 shrink-0 place-items-center rounded-full",
              toast.variant === "success" && "bg-success-100 text-success-600",
              toast.variant === "error" && "bg-danger-100 text-danger-600"
            )}
          >
            <Icon
              className="h-4 w-4"
              name={toast.variant === "error" ? "circle-alert" : "check"}
            />
          </span>
          <p className="min-w-0 flex-1 text-[14px] font-medium leading-snug">
            {toast.message}
          </p>
        </div>
      ))}
    </div>
  );
}

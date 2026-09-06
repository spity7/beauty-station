"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/layout/icon";
import { cn } from "@/utils/cn";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel: string;
  description: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
  titleId: string;
  variant?: "danger" | "default";
};

export function ConfirmDialog({
  cancelLabel = "Stay on page",
  confirmLabel,
  description,
  loading = false,
  loadingLabel,
  onClose,
  onConfirm,
  open,
  title,
  titleId,
  variant = "default",
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [loading, onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink-900/50"
        disabled={loading}
        onClick={loading ? undefined : onClose}
        type="button"
      />
      <div className="relative w-full max-w-md rounded-card bg-surface-card p-6 text-center shadow-lift">
        <button
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-base text-ink-400 transition-colors hover:bg-surface-muted hover:text-ink-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
          onClick={onClose}
          type="button"
        >
          <Icon className="h-4 w-4" name="x" />
        </button>
        <div
          className={cn(
            "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full",
            variant === "danger"
              ? "bg-danger-50 text-danger-500"
              : "bg-warning-50 text-warning-600"
          )}
        >
          <Icon className="h-6 w-6" name="circle-alert" />
        </div>
        <h3 className="text-[20px] font-semibold text-ink-900" id={titleId}>
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-[14px] text-ink-500">
          {description}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            className="h-11 min-w-[88px] rounded-base border border-surface-line px-5 text-[14px] font-semibold text-ink-700 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={onClose}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className={cn(
              "h-11 min-w-[88px] rounded-base px-5 text-[14px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              variant === "danger"
                ? "bg-danger-500 hover:bg-danger-600"
                : "bg-brand-600 hover:bg-brand-700"
            )}
            disabled={loading}
            onClick={onConfirm}
            type="button"
          >
            {loading ? (loadingLabel ?? "Leaving…") : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

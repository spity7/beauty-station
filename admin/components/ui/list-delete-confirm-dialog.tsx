"use client";

import { useEffect } from "react";
import { Icon } from "@/components/layout/icon";
import {
  buildDeleteDialogDescription,
  buildDeleteDialogIntro,
  buildDeleteDialogTitle,
} from "@/lib/list-delete-copy";

const PREVIEW_LIMIT = 5;

type ListDeleteConfirmDialogProps = {
  count: number;
  deleteMessage?: string;
  entityName: string;
  error?: string | null;
  itemLabels: string[];
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
};

export function ListDeleteConfirmDialog({
  count,
  deleteMessage,
  entityName,
  error = null,
  itemLabels,
  loading = false,
  onClose,
  onConfirm,
  open,
}: ListDeleteConfirmDialogProps) {
  const previewLabels = itemLabels.slice(0, PREVIEW_LIMIT);
  const hiddenCount = Math.max(0, count - previewLabels.length);
  const title = buildDeleteDialogTitle(count, entityName, itemLabels[0]);
  const intro = buildDeleteDialogIntro(count, entityName);
  const description =
    deleteMessage ?? buildDeleteDialogDescription(count, entityName);

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
      aria-labelledby="list-delete-confirm-title"
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
      <div className="relative w-full max-w-md rounded-card bg-surface-card p-6 shadow-lift">
        <button
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-base text-ink-400 transition-colors hover:bg-surface-muted hover:text-ink-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
          onClick={onClose}
          type="button"
        >
          <Icon className="h-4 w-4" name="x" />
        </button>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-danger-500">
          <Icon className="h-6 w-6" name="trash-2" />
        </div>
        <h3
          className="text-center text-[20px] font-semibold text-ink-900"
          id="list-delete-confirm-title"
        >
          {title}
        </h3>
        <div className="mx-auto mt-3 max-w-sm text-left">
          <p className="text-[13px] font-medium text-ink-700">{intro}</p>
          {previewLabels.length > 0 ? (
            <ul className="mt-2 max-h-40 overflow-y-auto rounded-base border border-surface-line bg-surface-body/60 px-3 py-2 text-[13px] text-ink-700">
              {previewLabels.map((label, index) => (
                <li
                  className="flex items-start gap-2 py-1"
                  key={`${label}-${index}`}
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400" />
                  <span className="min-w-0 truncate">{label}</span>
                </li>
              ))}
              {hiddenCount > 0 ? (
                <li className="py-1 pl-3.5 text-[12px] text-ink-400">
                  +{hiddenCount} more
                </li>
              ) : null}
            </ul>
          ) : null}
          <p className="mt-3 text-[14px] leading-relaxed text-ink-500">
            {description}
          </p>
          {error ? (
            <p className="mt-2 text-[14px] text-danger-600">{error}</p>
          ) : null}
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            className="h-11 min-w-[88px] rounded-base border border-surface-line px-5 text-[14px] font-semibold text-ink-700 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-11 min-w-[112px] rounded-base bg-danger-500 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-danger-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={onConfirm}
            type="button"
          >
            {loading
              ? "Deleting…"
              : count === 1
                ? "Delete"
                : `Delete ${count} items`}
          </button>
        </div>
      </div>
    </div>
  );
}

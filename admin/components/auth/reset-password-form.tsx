"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  getMissingPasswordRequirements,
  getPasswordStrengthLabel,
  getPasswordValidationError,
} from "@platform/shared";
import { ApiError, resetPassword } from "@platform/api-client";
import { useBusyActionGuard } from "@platform/react-busy";
import { routes } from "@/config/routes";

function passwordStrengthHint(password: string): string {
  const label = getPasswordStrengthLabel(password);
  if (label === "Strong") {
    return "Great! Your password is strong.";
  }
  const missing = getMissingPasswordRequirements(password);
  return missing.length > 0 ? `Add ${missing.join(", ")}.` : "";
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { disabled } = useBusyActionGuard({ active: loading });
  const [done, setDone] = useState(false);

  const strengthLabel = getPasswordStrengthLabel(newPassword);
  const validationError = getPasswordValidationError(
    newPassword,
    confirmPassword
  );
  const strengthHint = passwordStrengthHint(newPassword);

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ token, newPassword });
      setDone(true);
      setTimeout(() => {
        router.push(routes.signIn);
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not reset your password."
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-[440px] rounded-card border border-surface-line bg-surface-card p-6 shadow-card">
        <h1 className="text-[26px] font-semibold text-ink-900">
          Password updated
        </h1>
        <p className="mt-2 text-[14px] text-ink-500">
          Redirecting you to sign in…
        </p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full max-w-[440px] rounded-card border border-surface-line bg-surface-card p-6 shadow-card">
        <h1 className="text-[26px] font-semibold text-ink-900">
          Invalid reset link
        </h1>
        <p className="mt-2 text-[14px] text-ink-500">
          This reset link is invalid or has expired. Request a new one from the
          forgot password page.
        </p>
        <Link
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-base bg-brand-600 text-[14px] font-semibold text-white hover:bg-brand-700"
          href={routes.forgotPassword}
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <form
      aria-busy={loading}
      className="w-full max-w-[440px] rounded-card border border-surface-line bg-surface-card p-6 shadow-card"
      onSubmit={handleResetPassword}
    >
      <div>
        <p className="mb-1 text-[13px] font-semibold uppercase text-brand-600">
          Reset password
        </p>
        <h1 className="text-[26px] font-semibold text-ink-900">
          Choose a new password
        </h1>
        <p className="mt-2 text-[14px] text-ink-500">
          Use at least 8 characters with uppercase, lowercase, a number, and a
          special symbol.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-[14px] font-semibold text-ink-700">
            New password
          </span>
          <input
            autoComplete="new-password"
            className="mt-2 h-11 w-full rounded-base border border-surface-line bg-surface-body px-4 text-[14px] focus:border-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            minLength={8}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            type="password"
            value={newPassword}
          />
          {newPassword.length > 0 ? (
            <p
              className={`mt-2 text-[13px] ${
                strengthLabel === "Strong" ? "text-success-600" : "text-ink-500"
              }`}
            >
              {strengthHint}
            </p>
          ) : null}
        </label>
        <label className="block">
          <span className="text-[14px] font-semibold text-ink-700">
            Confirm password
          </span>
          <input
            autoComplete="new-password"
            className="mt-2 h-11 w-full rounded-base border border-surface-line bg-surface-body px-4 text-[14px] focus:border-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            minLength={8}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 text-[14px] text-danger-600">{error}</p>
      ) : null}

      <button
        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-base bg-brand-600 text-[14px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        disabled={loading || strengthLabel !== "Strong"}
        type="submit"
      >
        {loading ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

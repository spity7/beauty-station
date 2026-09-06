"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, forgotPassword } from "@platform/api-client";
import { useBusyActionGuard } from "@platform/react-busy";
import { routes } from "@/config/routes";
import { adminBrandName } from "@/lib/brand";

type Step = "request" | "sent";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { disabled } = useBusyActionGuard({ active: loading });

  async function handleSendLink(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setDevResetUrl(null);

    try {
      const result = await forgotPassword(email.trim());
      if (result.devResetToken) {
        setDevResetUrl(
          `${routes.resetPassword}?token=${encodeURIComponent(result.devResetToken)}`
        );
      }
      setStep("sent");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not send a password reset link."
      );
    } finally {
      setLoading(false);
    }
  }

  if (step === "sent") {
    return (
      <div className="w-full max-w-[440px] rounded-card border border-surface-line bg-surface-card p-6 shadow-card">
        <div>
          <p className="mb-1 text-[13px] font-semibold uppercase text-brand-600">
            Forgot password
          </p>
          <h1 className="text-[26px] font-semibold text-ink-900">
            Check your email
          </h1>
          <p className="mt-2 text-[14px] text-ink-500">
            If an account exists for <strong>{email}</strong>, we sent a reset
            link. It expires in 15 minutes.
          </p>
        </div>

        {devResetUrl ? (
          <p className="mt-4 text-[13px] text-ink-500">
            Dev reset link:{" "}
            {disabled ? (
              <span className="font-semibold text-ink-400">Open reset page</span>
            ) : (
              <Link className="font-semibold text-brand-600" href={devResetUrl}>
                Open reset page
              </Link>
            )}
          </p>
        ) : null}

        <button
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-base border border-surface-line bg-surface-body text-[14px] font-semibold text-ink-700 hover:bg-surface-line/40 disabled:opacity-60"
          disabled={loading}
          onClick={handleSendLink}
          type="button"
        >
          {loading ? "Sending…" : "Resend link"}
        </button>

        <p className="mt-4 text-center text-[14px] text-ink-500">
          {disabled ? (
            <span className="font-semibold text-ink-400">Back to sign in</span>
          ) : (
            <Link
              className="font-semibold text-brand-600 hover:text-brand-700"
              href={routes.signIn}
            >
              Back to sign in
            </Link>
          )}
        </p>
      </div>
    );
  }

  return (
    <form
      aria-busy={loading}
      className="w-full max-w-[440px] rounded-card border border-surface-line bg-surface-card p-6 shadow-card"
      onSubmit={handleSendLink}
    >
      <div>
        <p className="mb-1 text-[13px] font-semibold uppercase text-brand-600">
          Forgot password
        </p>
        <h1 className="text-[26px] font-semibold text-ink-900">
          Reset {adminBrandName} access
        </h1>
        <p className="mt-2 text-[14px] text-ink-500">
          Enter the email address for your admin account. We&apos;ll send you a
          link to choose a new password.
        </p>
      </div>

      <div className="mt-6">
        <label className="block">
          <span className="text-[14px] font-semibold text-ink-700">
            Email address
          </span>
          <input
            autoComplete="email"
            className="mt-2 h-11 w-full rounded-base border border-surface-line bg-surface-body px-4 text-[14px] focus:border-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 text-[14px] text-danger-600">{error}</p>
      ) : null}

      <button
        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-base bg-brand-600 text-[14px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>

      <p className="mt-4 text-center text-[14px] text-ink-500">
        {disabled ? (
          <span className="font-semibold text-ink-400">Back to sign in</span>
        ) : (
          <Link
            className="font-semibold text-brand-600 hover:text-brand-700"
            href={routes.signIn}
          >
            Back to sign in
          </Link>
        )}
      </p>
    </form>
  );
}

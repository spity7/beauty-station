"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { setAccessToken, ApiError } from "@platform/api-client";
import type { AuthResponse } from "@platform/shared";
import { mergeGuestCartIfNeeded } from "@/lib/guest-cart-merge";
import { completeStorefrontAuthRedirect } from "@/lib/complete-auth-redirect";
import { buildSignUpPath } from "@/lib/auth-redirect";
import { getSiteChromeBranding } from "@/lib/site-branding";
import StorefrontGoogleSignIn from "./storefront-google-sign-in";

export function StorefrontSignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json()) as AuthResponse & {
        error?: string;
      };

      if (!response.ok || !body.accessToken) {
        setError(body.error ?? "Sign in failed. Please try again.");
        return;
      }

      setAccessToken(body.accessToken);
      await mergeGuestCartIfNeeded();

      await completeStorefrontAuthRedirect(router.push);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Sign in failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rbt-input-field-grp">
        <label className="rbt-field-label" htmlFor="signin_email">
          Email <span className="rbt-text-color-danger">*</span>
        </label>
        <input
          className="rbt-input-field"
          type="email"
          id="signin_email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="rbt-input-field-grp mt--16">
        <label className="rbt-field-label" htmlFor="signin_password">
          Password <span className="rbt-text-color-danger">*</span>
        </label>
        <div className="position-relative">
          <input
            className="rbt-input-field"
            type={showPassword ? "text" : "password"}
            id="signin_password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="rbt-password-toggle-btn"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i
              className={`fa-regular ${
                showPassword ? "fa-eye-slash" : "fa-eye"
              }`}
            />
          </button>
        </div>
      </div>
      <p className="text-end mt--8 mb--0 b2">
        <Link className="rbt-switch-btn" href="/forgot-password">
          Forgot password?
        </Link>
      </p>
      {error ? (
        <p className="rbt-text-color-danger mt--12 mb--0 b3">{error}</p>
      ) : null}
      <button
        type="submit"
        className="rbt-btn d-block w-100 mt--24 mb--16"
        disabled={submitting}
      >
        {submitting ? "Signing in…" : "Sign In"}
      </button>
      <div className="rbt-login-system-switch rbt-link-hover">
        Don&apos;t have an account?{" "}
        <Link className="rbt-switch-btn ml--4" href={buildSignUpPath()}>
          <span>Create an account</span>
        </Link>
      </div>
    </form>
  );
}

function PasswordUpdateNotice() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("passwordChanged") === "1") {
      setMessage("Password updated. Please sign in with your new password.");
    } else if (params.get("passwordSet") === "1") {
      setMessage(
        "Password set. Please sign in with your email and new password."
      );
    }

    if (params.has("passwordChanged") || params.has("passwordSet")) {
      params.delete("passwordChanged");
      params.delete("passwordSet");
      const query = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}`
      );
    }
  }, []);

  if (!message) {
    return null;
  }

  return (
    <div className="rbt-transparent-table-one-wrapper rbt-has-bg-gray p--16 mb--16">
      <p className="b3 mb--0">{message}</p>
    </div>
  );
}

export function StorefrontSignInShell() {
  const { siteName: brandName, logo } = getSiteChromeBranding();

  return (
    <div className="rbt-login-form-top">
      <PasswordUpdateNotice />
      <div className="logo">
        <Link href="/">
          <Image
            alt={`${brandName} logo`}
            src={logo}
            width={1487}
            height={334}
          />
        </Link>
      </div>
      <h6 className="rbt-title rbt-text-bold mb--16">Sign In To {brandName}</h6>
      <StorefrontSignInForm />
      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
        <StorefrontGoogleSignIn />
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { setAccessToken, ApiError } from "@platform/api-client";
import { useSubmitBusy } from "@platform/react-busy";
import type { AuthResponse } from "@platform/shared";
import { getPhoneValidationError } from "@platform/shared";
import { mergeGuestCartIfNeeded } from "@/lib/guest-cart-merge";
import { completeStorefrontAuthRedirect } from "@/lib/complete-auth-redirect";
import { buildSignInPath } from "@/lib/auth-redirect";
import { getSiteChromeBranding } from "@/lib/site-branding";
import { getStorefrontDefaultPhoneCountry } from "@/lib/phone";
import StorefrontPhoneInput from "@/components/forms/phone-input";
import StorefrontGoogleSignIn from "./storefront-google-sign-in";

export function StorefrontSignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const defaultPhoneCountry = getStorefrontDefaultPhoneCountry();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { disabled } = useSubmitBusy(submitting);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPhoneError(null);

    const nextPhoneError = getPhoneValidationError(phone);
    if (nextPhoneError) {
      setPhoneError(nextPhoneError);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || undefined,
        }),
      });
      const body = (await response.json()) as AuthResponse & {
        error?: string;
      };

      if (!response.ok || !body.accessToken) {
        setError(body.error ?? "Registration failed. Please try again.");
        return;
      }

      setAccessToken(body.accessToken);
      await mergeGuestCartIfNeeded();

      await completeStorefrontAuthRedirect(router.push, { signupVerify: true });
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form aria-busy={submitting} onSubmit={handleSubmit}>
      <div className="rbt-input-field-grp">
        <label className="rbt-field-label" htmlFor="signup_name">
          Full name <span className="rbt-text-color-danger">*</span>
        </label>
        <input
          className="rbt-input-field"
          disabled={disabled}
          type="text"
          id="signup_name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
        />
      </div>
      <div className="rbt-input-field-grp mt--16">
        <label className="rbt-field-label" htmlFor="signup_email">
          Email <span className="rbt-text-color-danger">*</span>
        </label>
        <input
          className="rbt-input-field"
          disabled={disabled}
          type="email"
          id="signup_email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="mt--16">
        <StorefrontPhoneInput
          disabled={disabled}
          id="signup_phone"
          label="Phone"
          value={phone}
          onChange={(nextValue) => {
            setPhone(nextValue);
            setPhoneError(getPhoneValidationError(nextValue));
          }}
          defaultCountry={defaultPhoneCountry}
          error={phoneError}
          hint="Optional. Used for delivery updates."
        />
      </div>
      <div className="rbt-input-field-grp mt--16">
        <label className="rbt-field-label" htmlFor="signup_password">
          Password <span className="rbt-text-color-danger">*</span>
        </label>
        <div className="position-relative">
          <input
            className="rbt-input-field"
            disabled={disabled}
            type={showPassword ? "text" : "password"}
            id="signup_password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
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
      {error ? (
        <p className="rbt-text-color-danger mt--12 mb--0 b3">{error}</p>
      ) : null}
      <button
        type="submit"
        className="rbt-btn d-block w-100 mt--24 mb--16"
        disabled={submitting}
      >
        {submitting ? "Creating account…" : "Create Account"}
      </button>
      <div className="rbt-login-system-switch rbt-link-hover">
        Already have an account?{" "}
        {disabled ? (
          <span className="rbt-switch-btn ml--4 pe-none opacity-50">
            <span>Sign in</span>
          </span>
        ) : (
          <Link className="rbt-switch-btn ml--4" href={buildSignInPath()}>
            <span>Sign in</span>
          </Link>
        )}
      </div>
    </form>
  );
}

export function StorefrontSignUpShell() {
  const { siteName: brandName, logo } = getSiteChromeBranding();

  return (
    <div className="rbt-login-form-top">
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
      <h6 className="rbt-title rbt-text-bold mb--16">
        Create your {brandName} account
      </h6>
      <StorefrontSignUpForm />
      {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
        <StorefrontGoogleSignIn />
      ) : null}
    </div>
  );
}

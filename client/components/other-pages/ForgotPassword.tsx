"use client";

import Link from "next/link";
import Image from "next/image";
import ReviewSlider from "./ReviewSlider";
import { useState } from "react";
import { ApiError, forgotPassword } from "@platform/api-client";
import { useSubmitBusy } from "@platform/react-busy";
import { useUiElement } from "@/context/uiStore";
import { getStorefrontSiteConfig } from "@/lib/site";

export default function ForgotPassword() {
  const site = getStorefrontSiteConfig();
  if (site.features.customerAuth) {
    return <ForgotPasswordApi />;
  }
  return <ForgotPasswordDemo />;
}

function ForgotPasswordDemo() {
  const { showToaster } = useUiElement();
  const [step, setStep] = useState<"request" | "sent">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleSendLink = () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      showToaster("Reset link sent");
      setStep("sent");
    }, 600);
  };

  return (
    <ForgotPasswordLayout
      step={step}
      email={email}
      setEmail={setEmail}
      error={error}
      loading={loading}
      onSendLink={handleSendLink}
    />
  );
}

function ForgotPasswordApi() {
  const { showToaster } = useUiElement();
  const [step, setStep] = useState<"request" | "sent">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSendLink() {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    setError("");
    setDevResetUrl(null);

    try {
      const result = await forgotPassword(email.trim());
      if (result.devResetToken) {
        setDevResetUrl(
          `/reset-password?token=${encodeURIComponent(result.devResetToken)}`
        );
      }
      showToaster("Reset link sent");
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

  return (
    <ForgotPasswordLayout
      step={step}
      email={email}
      setEmail={setEmail}
      error={error}
      loading={loading}
      onSendLink={handleSendLink}
      devResetUrl={devResetUrl}
    />
  );
}

type ForgotPasswordLayoutProps = {
  step: "request" | "sent";
  email: string;
  setEmail: (value: string) => void;
  error: string;
  loading: boolean;
  onSendLink: () => void;
  devResetUrl?: string | null;
};

function ForgotPasswordLayout({
  step,
  email,
  setEmail,
  error,
  loading,
  onSendLink,
  devResetUrl,
}: ForgotPasswordLayoutProps) {
  const { disabled } = useSubmitBusy(loading);

  return (
    <div className="rbt-component-area rbt-section-gap2Bottom rbt-section-gap2Top">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5 mx-auto">
            <div className="rbt-login-form">
              <div className="rbt-login-form-inner">
                <div className="rbt-login-form-top">
                  <div className="logo">
                    {disabled ? (
                      <span className="d-inline-block pe-none opacity-50">
                        <Image
                          alt="Ecommerce Logo Images"
                          src="/assets/images/logo/logo.webp"
                          width={1487}
                          height={334}
                        />
                      </span>
                    ) : (
                      <Link href={`/`}>
                        <Image
                          alt="Ecommerce Logo Images"
                          src="/assets/images/logo/logo.webp"
                          width={1487}
                          height={334}
                        />
                      </Link>
                    )}
                  </div>
                  <h6 className="rbt-title rbt-text-bold mb--16">
                    Forgot Password
                  </h6>

                  {step === "request" && (
                    <form
                      aria-busy={loading}
                      onSubmit={(e) => {
                        e.preventDefault();
                        onSendLink();
                      }}
                    >
                      <p className="rbt-description mb--16">
                        Enter your email and we will send you a link to reset
                        your password.
                      </p>
                      <div className="rbt-input-field-grp">
                        <label
                          className="rbt-field-label"
                          htmlFor="forgot_page_email"
                        >
                          Your Email
                          <span className="rbt-text-color-danger">*</span>
                        </label>
                        <input
                          className="rbt-input-field"
                          disabled={disabled}
                          type="email"
                          id="forgot_page_email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      {error && (
                        <p className="rbt-form-error mt--8 mb--0">{error}</p>
                      )}
                      <button
                        type="submit"
                        className="rbt-btn d-block w-100 mt--24 mb--16"
                        disabled={loading}
                      >
                        {loading ? "Sending..." : "Send reset link"}
                      </button>
                    </form>
                  )}

                  {step === "sent" && (
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(13,110,253,0.08), rgba(25,135,84,0.06))",
                        border: "1px solid rgba(13,110,253,0.2)",
                        borderRadius: "12px",
                        padding: "18px 16px",
                      }}
                    >
                      <div
                        className="d-flex align-items-center mb--8"
                        style={{ color: "#0d6efd", fontWeight: 700 }}
                      >
                        <i className="fa-regular fa-envelope mr--8" />
                        Check your email
                      </div>
                      <p className="rbt-description mb--0">
                        If an account exists for <strong>{email}</strong>, we
                        sent a password reset link. The link expires in 15
                        minutes.
                      </p>
                      {devResetUrl ? (
                        <p
                          className="b3 mt--12 mb--0"
                          style={{ color: "#0d6efd" }}
                        >
                          Dev reset link:{" "}
                          {disabled ? (
                            <strong>Open reset page</strong>
                          ) : (
                            <Link href={devResetUrl}>
                              <strong>Open reset page</strong>
                            </Link>
                          )}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        className="rbt-btn rbt-btn-border d-block w-100 mt--16"
                        onClick={onSendLink}
                        disabled={loading}
                      >
                        {loading ? "Sending..." : "Resend link"}
                      </button>
                    </div>
                  )}

                  <div className="rbt-login-system-switch rbt-link-hover mt--24">
                    Remember your password?{" "}
                    {disabled ? (
                      <span className="rbt-switch-btn ml--4 pe-none opacity-50">
                        <span>Sign In</span>
                      </span>
                    ) : (
                      <Link className="rbt-switch-btn ml--4" href={`/signin`}>
                        <span>Sign In</span>
                      </Link>
                    )}
                  </div>
                </div>
                <ReviewSlider />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

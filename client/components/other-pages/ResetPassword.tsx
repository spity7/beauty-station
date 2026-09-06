"use client";

import Link from "next/link";
import Image from "next/image";
import ReviewSlider from "./ReviewSlider";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, resetPassword } from "@platform/api-client";
import { useSubmitBusy } from "@platform/react-busy";
import { useUiElement } from "@/context/uiStore";
import {
  getPasswordStrength,
  getPasswordValidationError,
  getMissingPasswordRequirements,
} from "@/lib/passwordValidation";
import PasswordStrengthIndicator from "@/components/common/forms/PasswordStrengthIndicator";
import { getStorefrontSiteConfig } from "@/lib/site";

export default function ResetPassword() {
  const site = getStorefrontSiteConfig();
  if (site.features.customerAuth) {
    return <ResetPasswordApi />;
  }
  return <ResetPasswordDemo />;
}

function ResetPasswordDemo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { showToaster } = useUiElement();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(newPassword);
  const passwordError = getPasswordValidationError(
    newPassword,
    confirmPassword,
    { requireStrong: true }
  );

  const handleReset = () => {
    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      showToaster("Password reset successful");
      setDone(true);
      setTimeout(() => router.push("/signin"), 1200);
    }, 600);
  };

  return (
    <ResetPasswordLayout
      token={token}
      done={done}
      error={error}
      loading={loading}
      newPassword={newPassword}
      setNewPassword={setNewPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      showConfirmPassword={showConfirmPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      strength={strength}
      passwordError={passwordError}
      onReset={handleReset}
    />
  );
}

function ResetPasswordApi() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { showToaster } = useUiElement();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(newPassword);
  const passwordError = getPasswordValidationError(
    newPassword,
    confirmPassword,
    { requireStrong: true }
  );

  async function handleReset() {
    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({ token, newPassword });
      showToaster("Password reset successful");
      setDone(true);
      setTimeout(() => router.push("/signin"), 1200);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not reset your password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResetPasswordLayout
      token={token}
      done={done}
      error={error}
      loading={loading}
      newPassword={newPassword}
      setNewPassword={setNewPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      showConfirmPassword={showConfirmPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      strength={strength}
      passwordError={passwordError}
      onReset={handleReset}
    />
  );
}

type ResetPasswordLayoutProps = {
  token: string;
  done: boolean;
  error: string;
  loading: boolean;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean | ((prev: boolean) => boolean)) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (
    value: boolean | ((prev: boolean) => boolean)
  ) => void;
  strength: ReturnType<typeof getPasswordStrength>;
  passwordError: string | null;
  onReset: () => void;
};

function ResetPasswordLayout({
  token,
  done,
  error,
  loading,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  strength,
  passwordError,
  onReset,
}: ResetPasswordLayoutProps) {
  const { disabled } = useSubmitBusy(loading);
  const missingRequirements = getMissingPasswordRequirements(newPassword);
  const strengthHint =
    strength.label === "Strong"
      ? "Great! Your password is strong."
      : missingRequirements.length > 0
        ? `Add ${missingRequirements.join(", ")}.`
        : "";

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
                    Reset Password
                  </h6>

                  {done ? (
                    <div
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(25,135,84,0.1), rgba(13,110,253,0.08))",
                        border: "1px solid rgba(25,135,84,0.25)",
                        borderRadius: "12px",
                        padding: "18px 16px",
                      }}
                    >
                      <div
                        className="d-flex align-items-center mb--8"
                        style={{ color: "#198754", fontWeight: 700 }}
                      >
                        <i className="fa-regular fa-circle-check mr--8" />
                        Password Updated Successfully
                      </div>
                      <p className="rbt-description mb--0">
                        Redirecting to sign in…
                      </p>
                    </div>
                  ) : !token ? (
                    <div>
                      <p className="rbt-description mb--16">
                        This reset link is invalid or has expired. Request a new
                        one from the forgot password page.
                      </p>
                      <Link
                        className="rbt-btn d-block w-100 text-center"
                        href="/forgot-password"
                      >
                        Request new link
                      </Link>
                    </div>
                  ) : (
                    <form
                      aria-busy={loading}
                      onSubmit={(e) => {
                        e.preventDefault();
                        onReset();
                      }}
                    >
                      <p className="rbt-description mb--16">
                        Choose a new password for your account.
                      </p>
                      <div className="rbt-input-field-grp">
                        <label
                          className="rbt-field-label"
                          htmlFor="reset_page_new_password"
                        >
                          New Password
                          <span className="rbt-text-color-danger">*</span>
                        </label>
                        <div className="position-relative">
                          <input
                            className="rbt-input-field"
                            disabled={disabled}
                            type={showPassword ? "text" : "password"}
                            id="reset_page_new_password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="rbt-password-toggle-btn"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            <i
                              className={`fa-regular ${
                                showPassword ? "fa-eye-slash" : "fa-eye"
                              }`}
                            />
                          </button>
                        </div>
                        {newPassword.length > 0 && (
                          <PasswordStrengthIndicator
                            label={strength.label}
                            hint={strengthHint}
                            compact
                          />
                        )}
                      </div>
                      <div className="rbt-input-field-grp mt--16">
                        <label
                          className="rbt-field-label"
                          htmlFor="reset_page_confirm_password"
                        >
                          Confirm Password
                          <span className="rbt-text-color-danger">*</span>
                        </label>
                        <div className="position-relative">
                          <input
                            className="rbt-input-field"
                            disabled={disabled}
                            type={showConfirmPassword ? "text" : "password"}
                            id="reset_page_confirm_password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            className="rbt-password-toggle-btn"
                            aria-label={
                              showConfirmPassword
                                ? "Hide confirm password"
                                : "Show confirm password"
                            }
                          >
                            <i
                              className={`fa-regular ${
                                showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      {error && (
                        <p className="rbt-form-error mt--12 mb--0">{error}</p>
                      )}
                      <button
                        type="submit"
                        className="rbt-btn d-block w-100 mt--24"
                        disabled={loading || strength.label !== "Strong"}
                      >
                        {loading ? "Updating..." : "Reset password"}
                      </button>
                    </form>
                  )}

                  <div className="rbt-login-system-switch rbt-link-hover mt--24">
                    {disabled ? (
                      <span className="rbt-switch-btn pe-none opacity-50">
                        <span>Back to sign in</span>
                      </span>
                    ) : (
                      <Link className="rbt-switch-btn" href={`/signin`}>
                        <span>Back to sign in</span>
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

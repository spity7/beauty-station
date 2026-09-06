"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, setAccessToken } from "@platform/api-client";
import { useSubmitBusy } from "@platform/react-busy";
import type { AuthResponse } from "@platform/shared";
import { mergeGuestCartIfNeeded } from "@/lib/guest-cart-merge";
import { completeStorefrontAuthRedirect } from "@/lib/complete-auth-redirect";

export default function StorefrontGoogleSignIn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { disabled } = useSubmitBusy(submitting);

  async function handleSuccess(credentialResponse: CredentialResponse) {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setError("Google sign-in did not return a token.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ provider: "google", idToken }),
      });
      const body = (await response.json()) as AuthResponse & { error?: string };

      if (!response.ok || !body.accessToken) {
        setError(body.error ?? "Google sign-in failed.");
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
          : "Google sign-in failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      aria-busy={submitting}
      className={`mt--16${disabled ? " pe-none opacity-60" : ""}`}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError("Google sign-in failed.")}
        text="signin_with"
        width="100%"
      />
      {error ? (
        <p className="rbt-text-color-danger mt--12 mb--0 b3">{error}</p>
      ) : null}
    </div>
  );
}

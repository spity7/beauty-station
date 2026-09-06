"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, type ReactNode } from "react";
import { BusyProvider, BusyViewportOverlay } from "@platform/react-busy";
import { registerUnauthorizedHandler } from "@platform/api-client";
import { isAuthPublicPath } from "@/lib/auth-public-paths";
import { tryRefreshSession } from "@/lib/refresh-session";
import { clearSessionAndRedirectToSignIn } from "@/lib/session";
import { AuthSessionProvider } from "@/providers/auth-session-provider";
import { CartSessionSync } from "@/providers/cart-session-sync";
import { CartSyncErrorListener } from "@/providers/cart-sync-error-listener";
import { WishlistSessionSync } from "@/providers/wishlist-session-sync";
import { WishlistSyncErrorListener } from "@/providers/wishlist-sync-error-listener";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    registerUnauthorizedHandler(async () => {
      const refreshed = await tryRefreshSession();
      if (
        !refreshed &&
        typeof window !== "undefined" &&
        !isAuthPublicPath(window.location.pathname)
      ) {
        await clearSessionAndRedirectToSignIn();
      }
      return refreshed;
    });
  }, []);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const session = (
    <BusyProvider>
      <AuthSessionProvider>
        <CartSessionSync />
        <CartSyncErrorListener />
        <WishlistSessionSync />
        <WishlistSyncErrorListener />
        {children}
      </AuthSessionProvider>
      <BusyViewportOverlay zIndex={1040} />
    </BusyProvider>
  );

  if (!googleClientId) {
    return session;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {session}
    </GoogleOAuthProvider>
  );
}

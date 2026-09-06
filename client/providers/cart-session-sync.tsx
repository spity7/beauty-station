"use client";

import { useEffect } from "react";
import { getAccessToken, setGuestCartId } from "@platform/api-client";
import { getOrCreateGuestCartId } from "@/lib/guest-cart";
import { mergeGuestCartIfNeeded } from "@/lib/guest-cart-merge";
import { loadServerCart } from "@/lib/cart-sync";
import { useStore } from "@/context/store";
import { useAuthSession } from "@/providers/auth-session-provider";

function applyServerCartToStore(
  serverCart: Awaited<ReturnType<typeof loadServerCart>>
): void {
  if (!serverCart) {
    return;
  }

  useStore.setState({
    cartProducts: serverCart,
    totalPrice: serverCart.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    ),
  });
}

function ensureGuestCartIdForApiClient(): void {
  setGuestCartId(getOrCreateGuestCartId());
}

async function syncCartForAuthenticatedUser(): Promise<void> {
  await mergeGuestCartIfNeeded();
  const serverCart = await loadServerCart();
  applyServerCartToStore(serverCart);
}

async function syncCartForGuestUser(): Promise<void> {
  ensureGuestCartIdForApiClient();
  const serverCart = await loadServerCart();
  applyServerCartToStore(serverCart);
}

export function CartSessionSync() {
  const { user, loading } = useAuthSession();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (user) {
      void syncCartForAuthenticatedUser();
      return;
    }

    void syncCartForGuestUser();
  }, [user, loading]);

  useEffect(() => {
    function onSessionUpdated() {
      if (getAccessToken()) {
        void syncCartForAuthenticatedUser();
        return;
      }

      void syncCartForGuestUser();
    }

    window.addEventListener("auth:session-updated", onSessionUpdated);
    return () => {
      window.removeEventListener("auth:session-updated", onSessionUpdated);
    };
  }, []);

  return null;
}

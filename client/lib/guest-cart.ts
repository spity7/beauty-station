import { setGuestCartId } from "@platform/api-client";

const GUEST_CART_KEY = "platform_guest_cart_id";

export function getOrCreateGuestCartId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = localStorage.getItem(GUEST_CART_KEY);
  if (existing) {
    return existing;
  }

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  localStorage.setItem(GUEST_CART_KEY, id);
  setGuestCartId(id);
  return id;
}

export function peekGuestCartId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(GUEST_CART_KEY);
}

export function clearGuestCartId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_CART_KEY);
  }
  setGuestCartId(null);
}

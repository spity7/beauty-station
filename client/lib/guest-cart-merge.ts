import { getAccessToken, mergeGuestCart } from "@platform/api-client";
import { clearGuestCartId, peekGuestCartId } from "@/lib/guest-cart";

let mergeInFlight: Promise<boolean> | null = null;

export async function mergeGuestCartIfNeeded(): Promise<boolean> {
  if (!getAccessToken()) {
    return false;
  }

  const guestSessionId = peekGuestCartId();
  if (!guestSessionId) {
    return false;
  }

  if (mergeInFlight) {
    return mergeInFlight;
  }

  mergeInFlight = (async () => {
    try {
      await mergeGuestCart(guestSessionId);
      clearGuestCartId();
      return true;
    } catch (error) {
      console.warn("Guest cart merge failed; will retry on next auth sync.", error);
      return false;
    } finally {
      mergeInFlight = null;
    }
  })();

  return mergeInFlight;
}

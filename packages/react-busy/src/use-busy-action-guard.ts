"use client";

import { useEffect } from "react";
import { useBusyLock } from "./busy-provider.js";

type UseBusyActionGuardOptions = {
  active: boolean;
  warnOnLeave?: boolean;
};

export function useBusyActionGuard({
  active,
  warnOnLeave = true,
}: UseBusyActionGuardOptions) {
  useBusyLock(active);

  useEffect(() => {
    if (!active || !warnOnLeave) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [active, warnOnLeave]);

  return {
    disabled: active,
  };
}

export function useSubmitBusy(
  submitting: boolean,
  options?: { warnOnLeave?: boolean }
) {
  return useBusyActionGuard({
    active: submitting,
    warnOnLeave: options?.warnOnLeave,
  });
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type UseCatalogFormLeaveGuardOptions = {
  loading: boolean;
  loadingLabel?: string;
};

export function useCatalogFormLeaveGuard({
  loading,
  loadingLabel = "Saving…",
}: UseCatalogFormLeaveGuardOptions) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [loading]);

  const requestLeave = useCallback(
    (href: string) => {
      if (loading) {
        setPendingHref(href);
        return;
      }

      router.push(href);
    },
    [loading, router]
  );

  function closeLeaveDialog() {
    if (!leaving) {
      setPendingHref(null);
    }
  }

  function confirmLeave() {
    if (!pendingHref) {
      return;
    }

    setLeaving(true);
    router.push(pendingHref);
  }

  const leaveDialog = (
    <ConfirmDialog
      cancelLabel="Keep saving"
      confirmLabel="Leave anyway"
      description={`Your changes are still ${loadingLabel.toLowerCase().replace(/…$/, "")}. Leaving now may leave catalog data incomplete.`}
      loading={leaving}
      loadingLabel="Leaving…"
      onClose={closeLeaveDialog}
      onConfirm={confirmLeave}
      open={pendingHref !== null}
      title="Leave without finishing?"
      titleId="catalog-form-leave-title"
      variant="default"
    />
  );

  return {
    disabled: loading,
    leaveDialog,
    requestLeave,
  };
}

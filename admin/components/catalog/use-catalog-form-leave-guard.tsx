"use client";

import { useBusyActionGuard } from "@platform/react-busy";

type UseCatalogFormLeaveGuardOptions = {
  loading: boolean;
};

export function useCatalogFormLeaveGuard({
  loading,
}: UseCatalogFormLeaveGuardOptions) {
  const { disabled } = useBusyActionGuard({ active: loading });

  return {
    disabled,
  };
}

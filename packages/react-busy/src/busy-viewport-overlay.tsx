"use client";

import { useOptionalBusy } from "./busy-provider.js";

type BusyViewportOverlayProps = {
  className?: string;
  zIndex?: number;
};

export function BusyViewportOverlay({
  className,
  zIndex = 45,
}: BusyViewportOverlayProps) {
  const context = useOptionalBusy();

  if (!context?.busy) {
    return null;
  }

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        cursor: "not-allowed",
        background: "transparent",
      }}
    />
  );
}

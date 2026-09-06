"use client";

import type { ReactNode } from "react";

type BusyShieldProps = {
  active: boolean;
  children: ReactNode;
  className?: string;
};

function joinClasses(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function BusyShield({
  active,
  children,
  className,
}: BusyShieldProps) {
  return (
    <div className={joinClasses("relative", className)}>
      {children}
      {active ? (
        <div
          aria-hidden
          className="absolute inset-0 z-10 cursor-not-allowed bg-transparent"
        />
      ) : null}
    </div>
  );
}

export const CrudBusyShield = BusyShield;

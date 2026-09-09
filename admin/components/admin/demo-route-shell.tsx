import Link from "next/link";
import type { ReactNode } from "react";
import { DemoNotice } from "@/components/admin/demo-notice";

type DemoRouteShellProps = {
  children: ReactNode;
  description: string;
  liveHref: string;
  liveLabel: string;
};

export function DemoRouteShell({
  children,
  description,
  liveHref,
  liveLabel,
}: DemoRouteShellProps) {
  return (
    <>
      <DemoNotice description={description} />
      <p className="mb-6 text-[14px] text-ink-600">
        <Link className="font-semibold text-brand-600 hover:text-brand-700" href={liveHref}>
          {liveLabel}
        </Link>
      </p>
      {children}
    </>
  );
}

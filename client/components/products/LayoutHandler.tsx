"use client";

import Tooltip from "@/components/common/ui/Tooltip";
import Link from "next/link";
import { usePathname } from "next/navigation";

type LayoutHandlerProps = {
  column?: number;
  /** Production `/shop`: column toggles stay on page (no demo route links). */
  mode?: "demo-routes" | "grid-columns";
  onColumnChange?: (column: 2 | 3 | 4) => void;
};

export default function LayoutHandler({
  column,
  mode = "demo-routes",
  onColumnChange,
}: LayoutHandlerProps) {
  const pathname = usePathname();

  if (mode === "grid-columns") {
    const columns: { value: 2 | 3 | 4; icon: string; label: string }[] = [
      { value: 2, icon: "fa-regular fa-grid-2", label: "Two Column" },
      { value: 3, icon: "fa-sharp fa-light fa-grid", label: "Three Column" },
      { value: 4, icon: "fa-sharp fa-light fa-grid-4", label: "Four Column" },
    ];

    return (
      <>
        {columns.map((item) => (
          <Tooltip content={item.label} key={item.value} placement="top">
            <a
              href="#"
              role="button"
              className={column === item.value ? "active tooltips" : "tooltips"}
              aria-label={item.label}
              onClick={(event) => {
                event.preventDefault();
                onColumnChange?.(item.value);
              }}
            >
              <i className={item.icon} />
            </a>
          </Tooltip>
        ))}
      </>
    );
  }

  return (
    <>
      <Tooltip content="List Style" placement="top">
        <Link
          href="/shop-filter-list-left-sidebar"
          className={
            pathname === "/shop-filter-list-left-sidebar"
              ? "active tooltips"
              : "tooltips"
          }
        >
          <i className="fa-regular fa-list" />
        </Link>
      </Tooltip>
      <Tooltip content="Two Column" placement="top">
        <Link
          href="/shop-filter-grid-two"
          className={column === 2 ? "active tooltips" : "tooltips"}
        >
          <i className="fa-regular fa-grid-2" />
        </Link>
      </Tooltip>
      <Tooltip content="Three Column" placement="top">
        <Link
          href="/shop-filter-grid-three"
          className={column === 3 ? "active tooltips" : "tooltips"}
        >
          <i className="fa-sharp fa-light fa-grid" />
        </Link>
      </Tooltip>
      <Tooltip content="Four Column" placement="top">
        <Link
          href="/shop-filter-grid-four"
          className={column === 4 ? "active tooltips" : "tooltips"}
        >
          <i className="fa-sharp fa-light fa-grid-4" />
        </Link>
      </Tooltip>
    </>
  );
}

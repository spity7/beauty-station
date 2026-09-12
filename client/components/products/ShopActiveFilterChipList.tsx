"use client";

import type { ShopActiveFilterChip } from "@/lib/shop-active-filters";
import type { ShopCatalogQuery } from "@/lib/shop-query";

type ShopActiveFilterChipListProps = {
  chips: ShopActiveFilterChip[];
  className?: string;
  onClearAll?: () => void;
  onNavigate: (patch: Partial<ShopCatalogQuery>) => void;
  showClearAll?: boolean;
};

export default function ShopActiveFilterChipList({
  chips,
  className = "mt--20",
  onClearAll,
  onNavigate,
  showClearAll = false,
}: ShopActiveFilterChipListProps) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div
      className={`rbt-shop-filter-tag-list rbt-tag-list rbt-tag-list-sm rbt-tag-list-bg-var-one rbt-tag-list-rounded rbt-tag-cancel-var ${className}`.trim()}
    >
      {chips.map((chip) => (
        <a
          className="rbt-text-capitalize"
          href="#"
          key={chip.key}
          onClick={(event) => {
            event.preventDefault();
            onNavigate(chip.removePatch);
          }}
        >
          {chip.label}
          <i className="fa-solid fa-xmark" />
        </a>
      ))}
      {showClearAll && onClearAll ? (
        <a
          className="text-decoration-underline rbt-text-capitalize"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onClearAll();
          }}
        >
          Clear All
        </a>
      ) : null}
    </div>
  );
}

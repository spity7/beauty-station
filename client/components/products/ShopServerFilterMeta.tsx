"use client";

import { buildShopActiveFilterChips } from "@/lib/shop-active-filters";
import type { ShopCatalogQuery } from "@/lib/shop-query";
import type { ShopCatalogFilters } from "@/types/shop-catalog";
import ShopActiveFilterChipList from "./ShopActiveFilterChipList";

type ShopServerFilterMetaProps = {
  catalogFilters: ShopCatalogFilters;
  catalogQuery: ShopCatalogQuery;
  onClearAll: () => void;
  onNavigate: (patch: Partial<ShopCatalogQuery>) => void;
  showBrandFilter?: boolean;
};

export default function ShopServerFilterMeta({
  catalogFilters,
  catalogQuery,
  onClearAll,
  onNavigate,
  showBrandFilter = true,
}: ShopServerFilterMetaProps) {
  const chips = buildShopActiveFilterChips(catalogQuery, catalogFilters, {
    showBrandFilter,
  });

  return (
    <ShopActiveFilterChipList
      chips={chips}
      onClearAll={onClearAll}
      onNavigate={onNavigate}
      showClearAll
    />
  );
}

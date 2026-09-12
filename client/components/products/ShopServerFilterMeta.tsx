"use client";

import type { ShopCatalogQuery } from "@/lib/shop-query";
import type { ShopCatalogFilters } from "@/types/shop-catalog";

type ShopServerFilterMetaProps = {
  catalogFilters: ShopCatalogFilters;
  catalogQuery: ShopCatalogQuery;
  onClearAll: () => void;
  onNavigate: (patch: Partial<ShopCatalogQuery>) => void;
};

function formatPriceLabel(minPrice?: number, maxPrice?: number): string | null {
  if (minPrice === undefined && maxPrice === undefined) {
    return null;
  }
  if (minPrice !== undefined && maxPrice !== undefined) {
    return `$${minPrice} to $${maxPrice}`;
  }
  if (minPrice !== undefined) {
    return `$${minPrice} and above`;
  }
  return `Up to $${maxPrice}`;
}

export default function ShopServerFilterMeta({
  catalogFilters,
  catalogQuery,
  onClearAll,
  onNavigate,
}: ShopServerFilterMetaProps) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (catalogQuery.search) {
    chips.push({
      key: "search",
      label: `Search: ${catalogQuery.search}`,
      onRemove: () => onNavigate({ search: undefined }),
    });
  }

  if (catalogQuery.categoryId) {
    const category = catalogFilters.categories.find(
      (item) => item.id === catalogQuery.categoryId
    );
    chips.push({
      key: "category",
      label: category?.name ?? "Category",
      onRemove: () => onNavigate({ categoryId: undefined }),
    });
  }

  if (catalogQuery.brandId) {
    const brand = catalogFilters.brands.find(
      (item) => item.id === catalogQuery.brandId
    );
    chips.push({
      key: "brand",
      label: brand?.name ?? "Brand",
      onRemove: () => onNavigate({ brandId: undefined }),
    });
  }

  const priceLabel = formatPriceLabel(
    catalogQuery.minPrice,
    catalogQuery.maxPrice
  );
  if (priceLabel) {
    chips.push({
      key: "price",
      label: priceLabel,
      onRemove: () => onNavigate({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="rbt-shop-filter-tag-list rbt-tag-list rbt-tag-list-sm rbt-tag-list-bg-var-one rbt-tag-list-rounded rbt-tag-cancel-var mt--20">
      {chips.map((chip) => (
        <a
          className="rbt-text-capitalize"
          href="#"
          key={chip.key}
          onClick={(event) => {
            event.preventDefault();
            chip.onRemove();
          }}
        >
          {chip.label}
          <i className="fa-solid fa-xmark" />
        </a>
      ))}
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
    </div>
  );
}

"use client";

import ShopActiveFilterChipList from "./ShopActiveFilterChipList";
import {
  buildShopActiveFilterChips,
  getShopEmptyStateCopy,
} from "@/lib/shop-active-filters";
import {
  buildShopCatalogHref,
  createShopCatalogQuery,
  type ShopCatalogQuery,
} from "@/lib/shop-query";
import type { ShopCatalogFilters } from "@/types/shop-catalog";
import Link from "next/link";

export { getShopEmptyStateCopy } from "@/lib/shop-active-filters";

type ShopCatalogEmptyStateProps = {
  catalogFilters?: ShopCatalogFilters;
  catalogQuery?: ShopCatalogQuery;
  onClearAll: () => void;
  onNavigate?: (patch: Partial<ShopCatalogQuery>) => void;
  showBrandFilter?: boolean;
  variant?: "server" | "demo";
};

function getCategorySuggestions(
  catalogQuery: ShopCatalogQuery | undefined,
  catalogFilters: ShopCatalogFilters | undefined
) {
  if (!catalogFilters?.categories.length) {
    return [];
  }
  return catalogFilters.categories
    .filter(
      (category) =>
        (category.productCount ?? 0) > 0 &&
        category.id !== catalogQuery?.categoryId
    )
    .slice(0, 6);
}

export default function ShopCatalogEmptyState({
  catalogFilters,
  catalogQuery,
  onClearAll,
  onNavigate,
  showBrandFilter = true,
  variant = "server",
}: ShopCatalogEmptyStateProps) {
  const copy = getShopEmptyStateCopy(catalogQuery, catalogFilters, {
    showBrandFilter,
  });
  const { title, description, useSearchIcon, loosenAction } = copy;
  const suggestions = getCategorySuggestions(catalogQuery, catalogFilters);
  const isServer = variant === "server" && catalogQuery && onNavigate;
  const activeChips =
    isServer && catalogFilters
      ? buildShopActiveFilterChips(catalogQuery, catalogFilters, {
          showBrandFilter,
        })
      : [];

  return (
    <div className="col-12 mt--24">
      <div className="rbt-shop-catalog-empty" role="status" aria-live="polite">
        <div className="rbt-shop-catalog-empty__layout">
          <div
            aria-hidden
            className={`rbt-shop-catalog-empty__icon${useSearchIcon ? " rbt-shop-catalog-empty__icon--search" : ""}`}
          >
            <i
              className={
                useSearchIcon
                  ? "fa-regular fa-magnifying-glass"
                  : "fa-regular fa-box-open"
              }
            />
          </div>

          <div className="rbt-shop-catalog-empty__body">
            <h5 className="rbt-shop-catalog-empty__title">{title}</h5>
            <p className="rbt-shop-catalog-empty__description">{description}</p>

            {isServer && activeChips.length > 0 ? (
              <div className="rbt-shop-catalog-empty__filters">
                <span className="rbt-shop-catalog-empty__filters-label">
                  Active filters
                </span>
                <ShopActiveFilterChipList
                  chips={activeChips}
                  className="rbt-shop-catalog-empty__filter-list"
                  onNavigate={onNavigate}
                />
              </div>
            ) : null}

            {isServer && suggestions.length > 0 ? (
              <div className="rbt-shop-catalog-empty__suggestions">
                <span className="rbt-shop-catalog-empty__suggestions-label">
                  Browse categories with products
                </span>
                <div className="rbt-shop-catalog-empty__suggestion-list">
                  {suggestions.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className="rbt-shop-catalog-empty__suggestion-chip"
                      onClick={() =>
                        onNavigate({
                          categoryId: category.id,
                          page: 1,
                        })
                      }
                    >
                      <span className="rbt-shop-catalog-empty__suggestion-name">
                        {category.name}
                      </span>
                      {category.productCount !== undefined ? (
                        <span className="rbt-shop-catalog-empty__suggestion-count">
                          {category.productCount}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rbt-shop-catalog-empty__actions">
              {isServer && loosenAction ? (
                <button
                  type="button"
                  className="rbt-btn rbt-btn-sm"
                  onClick={() => onNavigate(loosenAction.patch)}
                >
                  {loosenAction.label}
                </button>
              ) : null}
              <button
                type="button"
                className={`rbt-btn rbt-btn-sm${isServer && loosenAction ? " rbt-btn-border" : ""}`}
                onClick={onClearAll}
              >
                Clear all filters
              </button>
              {isServer ? (
                <Link
                  className="rbt-btn rbt-btn-sm rbt-btn-border"
                  href={buildShopCatalogHref(
                    createShopCatalogQuery({
                      page: 1,
                      limit: catalogQuery.limit,
                    })
                  )}
                >
                  View full catalog
                </Link>
              ) : (
                <Link
                  className="rbt-btn rbt-btn-sm rbt-btn-border"
                  href="/shop"
                >
                  Browse shop
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

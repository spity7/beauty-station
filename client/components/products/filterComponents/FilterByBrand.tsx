"use client";

import Image from "next/image";
import type { Product } from "@/types";
import type { ShopBrandFilterOption } from "@/types/shop-catalog";

const fallbackBrands: ShopBrandFilterOption[] = [
  {
    id: "1",
    name: "Acme",
    initials: "AC",
    tileClass: "bg-brand-50 text-brand-600",
  },
  {
    id: "2",
    name: "Aurarts",
    initials: "AU",
    tileClass: "bg-success-50 text-success-600",
  },
  {
    id: "3",
    name: "Hamofy",
    initials: "HA",
    tileClass: "bg-warning-50 text-warning-600",
  },
  {
    id: "4",
    name: "Starwalks",
    initials: "ST",
    tileClass: "bg-accent-50 text-accent-700",
  },
  {
    id: "5",
    name: "Massive",
    initials: "MA",
    tileClass: "bg-danger-50 text-danger-500",
  },
  {
    id: "6",
    name: "Superga",
    initials: "SU",
    tileClass: "bg-surface-muted text-ink-600",
  },
];

export default function FilterByBrand({
  brands = fallbackBrands,
  selectedItems,
  selectedId,
  serverMode = false,
  onChange,
  onSelectId,
  getFilterCount,
}: {
  brands?: ShopBrandFilterOption[];
  selectedItems: string[];
  selectedId?: string;
  serverMode?: boolean;
  onChange: (value: string) => void;
  onSelectId?: (id: string | undefined) => void;
  getFilterCount: (fn: (product: Product) => boolean) => number;
}) {
  const items = brands.length > 0 ? brands : fallbackBrands;

  return (
    <>
      {items.map((brand) => {
        const isActive = serverMode
          ? selectedId === brand.id
          : selectedItems.includes(brand.name);
        const inputId = `brand-checkbox-${brand.id}`;

        return (
          <li
            className={`rbt-check-group ${isActive ? "active" : ""}`}
            key={brand.id}
          >
            <input
              checked={isActive}
              id={inputId}
              name="brand"
              onChange={() => {
                if (serverMode) {
                  onSelectId?.(isActive ? undefined : brand.id);
                  return;
                }
                onChange(brand.name);
              }}
              type="checkbox"
            />
            <label htmlFor={inputId}>
              <span className="rbt-label-content">
                <span className="rbt-label-img">
                  {brand.initials ? (
                    <span
                      className={`d-inline-flex align-items-center justify-content-center rounded-circle text-uppercase fw-semibold ${brand.tileClass ?? "bg-surface-muted text-ink-600"}`}
                      style={{ height: 48, width: 48, fontSize: 12 }}
                    >
                      {brand.initials}
                    </span>
                  ) : (
                    <Image
                      alt={`${brand.name} logo`}
                      height={49}
                      loading="lazy"
                      src="/assets/images/sidebar/catagory-brand/catagory-brand-img-01.webp"
                      width={48}
                    />
                  )}
                </span>
                <span className="rbt-label-text">{brand.name}</span>
              </span>
              <span className="rbt-label-count">
                (
                {brand.productCount ??
                  getFilterCount(
                    (product) =>
                      !!(
                        product.filterBrands?.includes(brand.name) ||
                        product.brandId === brand.id
                      )
                  )}
                )
              </span>
            </label>
          </li>
        );
      })}
    </>
  );
}

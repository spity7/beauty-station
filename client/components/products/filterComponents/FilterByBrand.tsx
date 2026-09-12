"use client";

import Image from "next/image";
import type { Product } from "@/types";
import type { ShopBrandFilterOption } from "@/types/shop-catalog";

export default function FilterByBrand({
  brands,
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
  const items = brands ?? [];

  if (items.length === 0) {
    return (
      <li className="rbt-text-color-body px--8 py--8">
        {serverMode ? "No brands available." : "No brands to filter by."}
      </li>
    );
  }

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
                      className={`${brand.avatarClass ?? "rbt-shop-brand-avatar"} text-uppercase`}
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

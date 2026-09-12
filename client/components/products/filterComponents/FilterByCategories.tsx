"use client";

import type { Product } from "@/types";
import type { ShopCategoryFilterOption } from "@/types/shop-catalog";

export default function FilterByCategories({
  categories,
  selectedItems,
  selectedId,
  serverMode = false,
  onChange,
  onSelectId,
  getFilterCount,
}: {
  categories?: ShopCategoryFilterOption[];
  selectedItems: string[];
  selectedId?: string;
  serverMode?: boolean;
  onChange: (value: string) => void;
  onSelectId?: (id: string | undefined) => void;
  getFilterCount: (fn: (product: Product) => boolean) => number;
}) {
  const items = categories ?? [];

  if (items.length === 0) {
    return (
      <li className="rbt-text-color-body px--8 py--8">
        {serverMode
          ? "No categories available."
          : "No categories to filter by."}
      </li>
    );
  }

  return (
    <>
      {items.map((category) => {
        const isChecked = serverMode
          ? selectedId === category.id
          : selectedItems.includes(category.name);
        const inputId = `category-checkbox-${category.id}`;

        return (
          <li
            className={`rbt-check-group ${isChecked ? "active" : ""}`}
            key={category.id}
          >
            <input
              checked={isChecked}
              id={inputId}
              name="category"
              onChange={() => {
                if (serverMode) {
                  onSelectId?.(isChecked ? undefined : category.id);
                  return;
                }
                onChange(category.name);
              }}
              type="checkbox"
            />
            <label htmlFor={inputId}>
              <span className="rbt-label-content">
                <span className="rbt-label-text">{category.name}</span>
                <span className="rbt-label-count">
                  (
                  {category.productCount ??
                    getFilterCount(
                      (product) =>
                        !!(
                          product.filterCategory?.includes(category.name) ||
                          product.categoryId === category.id
                        )
                    )}
                  )
                </span>
              </span>
            </label>
          </li>
        );
      })}
    </>
  );
}

"use client";

import type { Product } from "@/types";
import type { ShopCategoryFilterOption } from "@/types/shop-catalog";

const fallbackCategories: ShopCategoryFilterOption[] = [
  { id: "1", name: "Accessories" },
  { id: "2", name: "Best seller" },
  { id: "3", name: "Computers & Tablets" },
  { id: "4", name: "Home Audio & Theatre" },
  { id: "5", name: "Home Theatre Accessories" },
  { id: "6", name: "Media Streamers" },
];

export default function FilterByCategories({
  categories = fallbackCategories,
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
  const items = categories.length > 0 ? categories : fallbackCategories;

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

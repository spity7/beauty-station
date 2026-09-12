"use client";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useEffect, useState } from "react";

import { Product } from "@/types";

const priceRanges = [
  { id: 1, label: "Under $25", min: 0, max: 24 },
  { id: 2, label: "$25 to $50", min: 25, max: 50 },
  { id: 3, label: "$50 to $100", min: 50, max: 100 },
  { id: 4, label: "$100 to $200", min: 100, max: 200 },
  { id: 5, label: "$200 & Above", min: 200, max: Infinity },
];

export default function FilterByPrice({
  priceRange,
  onChange,
  onServerPriceChange,
  selectedMin,
  selectedMax,
  serverMode = false,
  getFilterCount,
}: {
  priceRange: [number, number];
  onChange: (value: [number, number]) => void;
  onServerPriceChange?: (minPrice?: number, maxPrice?: number) => void;
  selectedMin?: number;
  selectedMax?: number;
  serverMode?: boolean;
  getFilterCount: (fn: (product: Product) => boolean) => number;
}) {
  const [serverDraftMin, setServerDraftMin] = useState(selectedMin ?? 0);
  const [serverDraftMax, setServerDraftMax] = useState(selectedMax ?? 1000);

  useEffect(() => {
    setServerDraftMin(selectedMin ?? 0);
    setServerDraftMax(selectedMax ?? 1000);
  }, [selectedMax, selectedMin]);

  const handleRangeChange = (range: number | number[]) => {
    const arr = Array.isArray(range) ? range : [range, range];
    onChange([arr[0], arr[1]] as [number, number]);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    handleRangeChange([value, priceRange[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    handleRangeChange([priceRange[0], value]);
  };

  const handleServerDraftRangeChange = (range: number | number[]) => {
    const arr = Array.isArray(range) ? range : [range, range];
    setServerDraftMin(arr[0]);
    setServerDraftMax(arr[1]);
  };

  function applyServerPriceRange() {
    onServerPriceChange?.(
      serverDraftMin > 0 ? serverDraftMin : undefined,
      serverDraftMax < 1000 ? serverDraftMax : undefined
    );
  }

  return (
    <>
      <ul className="rbt-sidebar-list-wrapper rbt-categories-list-check">
        {priceRanges.map((range) => {
          const isChecked = serverMode
            ? selectedMin === range.min &&
              (range.max === Infinity
                ? selectedMax === undefined
                : selectedMax === range.max)
            : priceRange[0] === range.min && priceRange[1] === range.max;
          const inputId = `price-checkbox-${range.id}`;

          return (
            <li
              key={range.id}
              className={`rbt-check-group ${isChecked ? "active" : ""}`}
            >
              <input
                id={inputId}
                type="checkbox"
                name={inputId}
                checked={isChecked}
                onChange={() => {
                  if (serverMode) {
                    onServerPriceChange?.(
                      isChecked ? undefined : range.min,
                      isChecked
                        ? undefined
                        : range.max === Infinity
                          ? undefined
                          : range.max
                    );
                    return;
                  }
                  handleRangeChange([range.min, range.max]);
                }}
              />
              <label htmlFor={inputId}>
                {range.label}
                {!serverMode ? (
                  <span className="rbt-label-count">
                    (
                    {getFilterCount(
                      (product) =>
                        product.price >= range.min && product.price <= range.max
                    )}
                    )
                  </span>
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>

      {serverMode && onServerPriceChange ? (
        <>
          <div className="rbt-price-range-slider">
            <Slider
              range
              value={[serverDraftMin, serverDraftMax]}
              onChange={handleServerDraftRangeChange}
              max={1000}
              min={0}
              step={15}
            />
            <p className="rbt-range-value">
              <input
                type="text"
                readOnly
                value={`$${serverDraftMin} - $${serverDraftMax}`}
              />
            </p>
          </div>
          <div className="rbt-price-input-grp">
            <input
              type="number"
              min={0}
              placeholder="$ Min"
              value={serverDraftMin}
              onChange={(event) => {
                const value = parseFloat(event.target.value) || 0;
                setServerDraftMin(value);
              }}
            />
            <input
              type="number"
              min={0}
              placeholder="$ Max"
              value={serverDraftMax}
              onChange={(event) => {
                const value = parseFloat(event.target.value) || 0;
                setServerDraftMax(value);
              }}
            />
            <button
              type="button"
              className="rbt-btn"
              onClick={applyServerPriceRange}
            >
              Go
            </button>
          </div>
        </>
      ) : null}

      {!serverMode ? (
        <>
          <div className="rbt-price-range-slider">
            <Slider
              range
              value={priceRange}
              onChange={handleRangeChange}
              max={1000}
              min={0}
              step={15}
            />
            <p className="rbt-range-value">
              <input
                type="text"
                id="amount"
                readOnly
                value={`$${priceRange[0]} - $${priceRange[1]}`}
              />
            </p>
          </div>

          <div className="rbt-price-input-grp">
            <input
              type="number"
              min={0}
              placeholder="$ Min"
              value={priceRange[0]}
              onChange={handleMinChange}
            />
            <input
              type="number"
              min={0}
              placeholder="$ Max"
              value={priceRange[1]}
              onChange={handleMaxChange}
            />
            <button type="button" className="rbt-btn">
              $Go
            </button>
          </div>
        </>
      ) : null}
    </>
  );
}

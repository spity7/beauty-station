"use client";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useEffect, useState } from "react";
import {
  DEFAULT_SHOP_PRICE_RANGE_PRESETS,
  formatPriceInputDisplay,
  formatPriceRangeSummary,
  parsePriceInput,
  presetToServerPrices,
  serverPricesMatchPreset,
  SHOP_PRICE_SLIDER_MIN,
  SHOP_PRICE_SLIDER_STEP,
  type ShopPriceFilterMeta,
} from "@/lib/shop-price-ranges";
import { Product } from "@/types";

export default function FilterByPrice({
  priceRange,
  onChange,
  onServerPriceChange,
  selectedMin,
  selectedMax,
  serverMode = false,
  serverPriceFilter,
  getFilterCount,
}: {
  priceRange: [number, number];
  onChange: (value: [number, number]) => void;
  onServerPriceChange?: (minPrice?: number, maxPrice?: number) => void;
  selectedMin?: number;
  selectedMax?: number;
  serverMode?: boolean;
  serverPriceFilter?: ShopPriceFilterMeta;
  getFilterCount: (fn: (product: Product) => boolean) => number;
}) {
  const demoSliderMax = 1000;
  const demoSliderStep = 15;
  const serverSliderMax = serverPriceFilter?.sliderMax ?? demoSliderMax;
  const serverSliderStep = SHOP_PRICE_SLIDER_STEP;
  const sliderMax = serverMode ? serverSliderMax : demoSliderMax;
  const sliderStep = serverMode ? serverSliderStep : demoSliderStep;
  const serverPresets =
    serverPriceFilter?.presets ?? DEFAULT_SHOP_PRICE_RANGE_PRESETS;

  const [serverDraftMin, setServerDraftMin] = useState(
    selectedMin ?? SHOP_PRICE_SLIDER_MIN
  );
  const [serverDraftMax, setServerDraftMax] = useState(
    selectedMax ?? serverSliderMax
  );
  const [minInput, setMinInput] = useState(
    formatPriceInputDisplay(selectedMin ?? SHOP_PRICE_SLIDER_MIN)
  );
  const [maxInput, setMaxInput] = useState(
    formatPriceInputDisplay(selectedMax ?? serverSliderMax)
  );

  useEffect(() => {
    const nextMin = selectedMin ?? SHOP_PRICE_SLIDER_MIN;
    const nextMax = selectedMax ?? serverSliderMax;
    setServerDraftMin(nextMin);
    setServerDraftMax(nextMax);
    setMinInput(formatPriceInputDisplay(nextMin));
    setMaxInput(formatPriceInputDisplay(nextMax));
  }, [selectedMax, selectedMin, serverSliderMax]);

  const handleRangeChange = (range: number | number[]) => {
    const arr = Array.isArray(range) ? range : [range, range];
    onChange([arr[0], arr[1]] as [number, number]);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parsePriceInput(e.target.value);
    handleRangeChange([value, priceRange[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parsePriceInput(e.target.value);
    handleRangeChange([priceRange[0], value]);
  };

  const handleServerDraftRangeChange = (range: number | number[]) => {
    const arr = Array.isArray(range) ? range : [range, range];
    const nextMin = arr[0];
    const nextMax = arr[1];
    setServerDraftMin(nextMin);
    setServerDraftMax(nextMax);
    setMinInput(formatPriceInputDisplay(nextMin));
    setMaxInput(formatPriceInputDisplay(nextMax));
  };

  function syncMinInputFromDraft() {
    const normalized = parsePriceInput(minInput);
    const clamped = Math.min(
      Math.max(normalized, SHOP_PRICE_SLIDER_MIN),
      serverDraftMax
    );
    setServerDraftMin(clamped);
    setMinInput(formatPriceInputDisplay(clamped));
  }

  function syncMaxInputFromDraft() {
    const normalized = parsePriceInput(maxInput);
    const clamped = Math.min(
      Math.max(normalized, serverDraftMin),
      serverSliderMax
    );
    setServerDraftMax(clamped);
    setMaxInput(formatPriceInputDisplay(clamped));
  }

  function applyServerPriceRange() {
    const min = parsePriceInput(minInput);
    const max = parsePriceInput(maxInput);
    const clampedMin = Math.min(Math.max(min, SHOP_PRICE_SLIDER_MIN), max);
    const clampedMax = Math.min(Math.max(max, clampedMin), serverSliderMax);
    setServerDraftMin(clampedMin);
    setServerDraftMax(clampedMax);
    setMinInput(formatPriceInputDisplay(clampedMin));
    setMaxInput(formatPriceInputDisplay(clampedMax));
    onServerPriceChange?.(
      clampedMin > SHOP_PRICE_SLIDER_MIN ? clampedMin : undefined,
      clampedMax < serverSliderMax ? clampedMax : undefined
    );
  }

  const presets = serverMode
    ? serverPresets
    : DEFAULT_SHOP_PRICE_RANGE_PRESETS.map((preset) => ({
        ...preset,
        max: preset.max ?? sliderMax,
      }));

  return (
    <>
      <ul className="rbt-sidebar-list-wrapper rbt-categories-list-check">
        {presets.map((range) => {
          const isChecked = serverMode
            ? serverPricesMatchPreset(range, selectedMin, selectedMax)
            : priceRange[0] === range.min &&
              priceRange[1] === (range.max ?? sliderMax);
          const inputId = `price-checkbox-${range.id}`;
          const presetMax = range.max ?? sliderMax;

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
                    if (isChecked) {
                      onServerPriceChange?.(undefined, undefined);
                      return;
                    }
                    const { minPrice, maxPrice } = presetToServerPrices(range);
                    onServerPriceChange?.(minPrice, maxPrice);
                    return;
                  }
                  handleRangeChange([range.min, presetMax]);
                }}
              />
              <label htmlFor={inputId}>
                {range.label}
                {!serverMode ? (
                  <span className="rbt-label-count">
                    (
                    {getFilterCount(
                      (product) =>
                        product.price >= range.min && product.price <= presetMax
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
              max={serverSliderMax}
              min={SHOP_PRICE_SLIDER_MIN}
              step={serverSliderStep}
            />
            <p className="rbt-range-value">
              <input
                type="text"
                readOnly
                value={formatPriceRangeSummary(serverDraftMin, serverDraftMax)}
              />
            </p>
          </div>
          <div className="rbt-price-input-grp">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Min"
              aria-label="Minimum price"
              value={minInput}
              onChange={(event) =>
                setMinInput(event.target.value.replace(/\D/g, ""))
              }
              onBlur={syncMinInputFromDraft}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Max"
              aria-label="Maximum price"
              value={maxInput}
              onChange={(event) =>
                setMaxInput(event.target.value.replace(/\D/g, ""))
              }
              onBlur={syncMaxInputFromDraft}
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
                value={formatPriceRangeSummary(priceRange[0], priceRange[1])}
              />
            </p>
          </div>

          <div className="rbt-price-input-grp">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={priceRange[0]}
              onChange={handleMinChange}
            />
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={priceRange[1]}
              onChange={handleMaxChange}
            />
            <button type="button" className="rbt-btn">
              Go
            </button>
          </div>
        </>
      ) : null}
    </>
  );
}

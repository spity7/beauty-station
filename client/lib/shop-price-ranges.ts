export type ShopPriceRangePreset = {
  id: number;
  label: string;
  min: number;
  max: number | null;
};

export type ShopPriceFilterMeta = {
  catalogMax: number;
  catalogMin: number;
  presets: ShopPriceRangePreset[];
  sliderMax: number;
};

/** Fallback when the catalog has no published prices yet. */
export const DEFAULT_SHOP_PRICE_RANGE_PRESETS: ShopPriceRangePreset[] = [
  { id: 1, label: "Under $25", min: 0, max: 24 },
  { id: 2, label: "$25 to $50", min: 25, max: 50 },
  { id: 3, label: "$50 to $75", min: 50, max: 75 },
  { id: 4, label: "$75 & above", min: 75, max: null },
];

export const SHOP_PRICE_SLIDER_MIN = 0;
export const SHOP_PRICE_SLIDER_MAX = 150;
export const SHOP_PRICE_SLIDER_STEP = 5;

function priceStepFor(value: number): number {
  if (value <= 40) {
    return 5;
  }
  if (value <= 100) {
    return 10;
  }
  if (value <= 500) {
    return 25;
  }
  return 50;
}

function roundUpToStep(value: number): number {
  if (value <= 0) {
    return 0;
  }
  const step = priceStepFor(value);
  return Math.ceil(value / step) * step;
}

function roundDownToStep(value: number): number {
  if (value <= 0) {
    return 0;
  }
  const step = priceStepFor(value);
  return Math.floor(value / step) * step;
}

/**
 * Build sidebar price presets from published catalog min/max (inclusive API bounds).
 */
export function buildDynamicPriceFilterMeta(
  catalogMin: number,
  catalogMax: number
): ShopPriceFilterMeta {
  const minPrice = Math.floor(Math.max(0, catalogMin));
  const maxPrice = Math.ceil(Math.max(catalogMin, catalogMax));
  const sliderMax = Math.max(
    roundUpToStep(maxPrice),
    SHOP_PRICE_SLIDER_MIN + SHOP_PRICE_SLIDER_STEP
  );

  if (maxPrice <= 0 || !Number.isFinite(maxPrice)) {
    return {
      catalogMin: 0,
      catalogMax: 0,
      presets: [...DEFAULT_SHOP_PRICE_RANGE_PRESETS],
      sliderMax: SHOP_PRICE_SLIDER_MAX,
    };
  }

  if (minPrice >= maxPrice) {
    return {
      catalogMin: minPrice,
      catalogMax: maxPrice,
      presets: [
        {
          id: 1,
          label: `$${formatPriceInputDisplay(maxPrice)}`,
          min: 0,
          max: maxPrice,
        },
      ],
      sliderMax,
    };
  }

  const span = maxPrice - minPrice;

  if (span < 10) {
    const mid = roundUpToStep((minPrice + maxPrice) / 2);
    return {
      catalogMin: minPrice,
      catalogMax: maxPrice,
      presets: [
        {
          id: 1,
          label: `Under $${mid + 1}`,
          min: 0,
          max: mid,
        },
        {
          id: 2,
          label: `$${mid + 1} & above`,
          min: mid + 1,
          max: null,
        },
      ],
      sliderMax,
    };
  }

  const interiorBucketCount = span <= 35 ? 2 : 3;
  const cutCount = interiorBucketCount;
  const rawCuts: number[] = [];

  for (let index = 1; index <= cutCount; index += 1) {
    const position = minPrice + (span * index) / (cutCount + 1);
    rawCuts.push(roundUpToStep(position));
  }

  let previous = minPrice - 1;
  const cuts: number[] = [];
  for (const raw of rawCuts) {
    const next = Math.min(maxPrice - 1, Math.max(previous + 1, raw));
    cuts.push(next);
    previous = next;
  }

  const presets: ShopPriceRangePreset[] = [];
  let presetId = 1;

  const firstMax = cuts[0];
  presets.push({
    id: presetId,
    label: `Under $${firstMax + 1}`,
    min: 0,
    max: firstMax,
  });
  presetId += 1;

  for (let index = 1; index < cuts.length; index += 1) {
    const low = cuts[index - 1] + 1;
    const high = cuts[index];
    presets.push({
      id: presetId,
      label: `$${low} to $${high}`,
      min: low,
      max: high,
    });
    presetId += 1;
  }

  const topLow = cuts[cuts.length - 1] + 1;
  presets.push({
    id: presetId,
    label: `$${topLow} & above`,
    min: topLow,
    max: null,
  });

  return {
    catalogMin: minPrice,
    catalogMax: maxPrice,
    presets,
    sliderMax,
  };
}

export function formatPriceInputDisplay(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return "";
  }
  return String(Math.round(value));
}

export function parsePriceInput(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) {
    return 0;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function presetToServerPrices(preset: ShopPriceRangePreset): {
  minPrice?: number;
  maxPrice?: number;
} {
  return {
    minPrice: preset.min > 0 ? preset.min : undefined,
    maxPrice: preset.max ?? undefined,
  };
}

export function serverPricesMatchPreset(
  preset: ShopPriceRangePreset,
  selectedMin?: number,
  selectedMax?: number
): boolean {
  const effectiveMin = selectedMin ?? 0;

  if (preset.max === null) {
    return effectiveMin === preset.min && selectedMax === undefined;
  }

  return effectiveMin === preset.min && selectedMax === preset.max;
}

export function formatPriceRangeSummary(min: number, max: number): string {
  return `$${formatPriceInputDisplay(min)} – $${formatPriceInputDisplay(max)}`;
}

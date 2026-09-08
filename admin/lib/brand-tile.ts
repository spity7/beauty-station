export type BrandTileClassOption = {
  label: string;
  shortLabel: string;
  value: string;
};

export const BRAND_TILE_CLASS_OPTIONS: readonly BrandTileClassOption[] = [
  {
    label: "Brand (blue)",
    shortLabel: "Blue",
    value: "bg-brand-50 text-brand-600",
  },
  {
    label: "Success (green)",
    shortLabel: "Green",
    value: "bg-success-50 text-success-600",
  },
  {
    label: "Success (mint)",
    shortLabel: "Mint",
    value: "bg-success-100 text-success-700",
  },
  {
    label: "Warning (amber)",
    shortLabel: "Amber",
    value: "bg-warning-50 text-warning-600",
  },
  {
    label: "Warning (gold)",
    shortLabel: "Gold",
    value: "bg-warning-100 text-warning-600",
  },
  {
    label: "Accent (coral)",
    shortLabel: "Coral",
    value: "bg-accent-50 text-accent-700",
  },
  {
    label: "Accent (orange)",
    shortLabel: "Orange",
    value: "bg-accent-100 text-accent-600",
  },
  {
    label: "Danger (red)",
    shortLabel: "Red",
    value: "bg-danger-50 text-danger-500",
  },
  {
    label: "Danger (rose)",
    shortLabel: "Rose",
    value: "bg-danger-100 text-danger-600",
  },
  {
    label: "Admin (teal)",
    shortLabel: "Teal",
    value: "bg-brand-50 text-admin-teal",
  },
  {
    label: "Neutral (slate)",
    shortLabel: "Slate",
    value: "bg-surface-muted text-ink-600",
  },
  {
    label: "Neutral (dark)",
    shortLabel: "Dark",
    value: "bg-ink-800 text-white",
  },
];

export const DEFAULT_BRAND_TILE_CLASS = BRAND_TILE_CLASS_OPTIONS[0]!.value;

export function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function normalizeBrandInitials(value: string): string {
  return value.trim().toUpperCase().slice(0, 4);
}

export function resolveBrandInitials(explicit: string, name: string): string {
  const normalized = normalizeBrandInitials(explicit);
  if (normalized) {
    return normalized;
  }
  return deriveInitials(name);
}

export function brandTileClassOptions(
  currentValue?: string
): BrandTileClassOption[] {
  const options: BrandTileClassOption[] = [...BRAND_TILE_CLASS_OPTIONS];
  const value = currentValue?.trim();

  if (value && !options.some((option) => option.value === value)) {
    options.push({
      label: `Custom (${value})`,
      shortLabel: "Custom",
      value,
    });
  }

  return options;
}

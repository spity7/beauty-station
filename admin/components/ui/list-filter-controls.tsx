"use client";

import { Icon } from "@/components/layout/icon";
import { AppSelect, type AppSelectOption } from "@/components/ui/app-select";
import { cn } from "@/utils/cn";

export const listFilterActiveClass =
  "border-brand-600 bg-brand-50/50 ring-2 ring-brand-600/15";

function ListFilterMarker() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -right-1 -top-1 z-10 h-2.5 w-2.5 rounded-full border-2 border-surface-card bg-brand-600"
    />
  );
}

type ListSearchFieldProps = {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
};

export function ListSearchField({
  label,
  onChange,
  placeholder,
  value,
}: ListSearchFieldProps) {
  const isActive = value.trim().length > 0;

  return (
    <label className="relative block w-[200px] max-w-full shrink-0">
      <span className="sr-only">{label}</span>
      <Icon
        className={cn(
          "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2",
          isActive ? "text-brand-600" : "text-ink-400"
        )}
        name="search"
      />
      <input
        aria-label={label}
        className={cn(
          "h-11 w-full rounded-base border border-surface-line bg-surface-body pl-11 text-[14px] transition-colors focus:border-brand-600",
          isActive ? cn(listFilterActiveClass, "pr-10") : "pr-4"
        )}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        role="searchbox"
        type="text"
        value={value}
      />
      {isActive ? (
        <>
          <ListFilterMarker />
          <button
            aria-label="Clear search"
            className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-base text-ink-400 transition-colors hover:bg-surface-muted hover:text-ink-700"
            onClick={() => onChange("")}
            type="button"
          >
            <Icon className="h-3.5 w-3.5" name="x" />
          </button>
        </>
      ) : null}
    </label>
  );
}

export function ListClearFiltersButton({
  active,
  onClear,
}: {
  active: boolean;
  onClear: () => void;
}) {
  if (!active) {
    return null;
  }

  return (
    <button
      aria-label="Clear all filters"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-base border border-danger-200 bg-danger-50 text-danger-600 transition-colors hover:border-danger-300 hover:bg-danger-100 hover:text-danger-700"
      onClick={onClear}
      title="Clear all filters"
      type="button"
    >
      <Icon className="h-4 w-4" name="filter-x" />
    </button>
  );
}

type ListFilterSelectProps = {
  ariaLabel?: string;
  className?: string;
  defaultValue: string;
  onValueChange: (value: string) => void;
  options: readonly AppSelectOption[] | readonly string[];
  size?: "default" | "lg" | "sm";
  value: string;
};

export function ListFilterSelect({
  ariaLabel,
  className,
  defaultValue,
  onValueChange,
  options,
  size = "lg",
  value,
}: ListFilterSelectProps) {
  const isActive = value !== defaultValue;

  return (
    <div className={cn("relative", className)}>
      <AppSelect
        ariaLabel={ariaLabel}
        onValueChange={onValueChange}
        options={options}
        size={size}
        triggerClassName={isActive ? listFilterActiveClass : undefined}
        value={value}
      />
      {isActive ? <ListFilterMarker /> : null}
    </div>
  );
}

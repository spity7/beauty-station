"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AssignedProductsSection,
  BrandTileStylePicker,
  CatalogFormFooter,
  ControlledField,
  ControlledSelect,
  getCatalogFieldErrors,
  StatusDot,
  type AssignedProductPreview,
} from "@/components/catalog/catalog-form-primitives";
import { FormCard } from "@/components/forms/admin-form-primitives";
import { routes } from "@/config/routes";
import { addProductPath, productsListPath } from "@/lib/paths";
import {
  catalogSaveButtonLabel,
  finishCatalogSave,
} from "@/lib/catalog-feedback";
import { useToast } from "@/providers/toast-provider";
import { useCatalogFormLeaveGuard } from "@/components/catalog/use-catalog-form-leave-guard";
import {
  brandTileClassOptions,
  DEFAULT_BRAND_TILE_CLASS,
  normalizeBrandInitials,
  resolveBrandInitials,
} from "@/lib/brand-tile";
import { createBrandApi, updateBrandApi } from "@platform/api-client";
import type { BrandDto } from "@platform/shared";

type FormState = {
  error: string | null;
  loading: boolean;
};

type BrandCatalogFormProps = {
  assignedProducts?: AssignedProductPreview[];
  initial?: BrandDto;
  linkedProductCount?: number;
  mode: "add" | "edit";
};

export function BrandCatalogForm({
  assignedProducts = [],
  initial,
  linkedProductCount,
  mode,
}: BrandCatalogFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [initials, setInitials] = useState(
    normalizeBrandInitials(initial?.initials ?? "")
  );
  const [tileClass, setTileClass] = useState(
    initial?.tileClass ?? DEFAULT_BRAND_TILE_CLASS
  );
  const [visibility, setVisibility] = useState<BrandDto["visibility"]>(
    initial?.visibility ?? "Standard"
  );
  const [status, setStatus] = useState<BrandDto["status"]>(
    initial?.status ?? "draft"
  );
  const [formState, setFormState] = useState<FormState>({
    error: null,
    loading: false,
  });

  const previewInitials = useMemo(
    () => resolveBrandInitials(initials, name),
    [initials, name]
  );
  const tileClassOptions = useMemo(
    () => brandTileClassOptions(tileClass),
    [tileClass]
  );
  const statusHelp = useMemo(() => {
    switch (status) {
      case "published":
        return "Published brands can appear in storefront catalog views.";
      case "archived":
        return "Archived brands are kept for reference but hidden from storefront views.";
      default:
        return "Draft brands are hidden from published storefront views.";
    }
  }, [status]);
  const statusOptions = useMemo(
    () => [
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
      ...(mode === "edit"
        ? [{ label: "Archived", value: "archived" as const }]
        : []),
    ],
    [mode]
  );

  const fieldErrors = useMemo(
    () => getCatalogFieldErrors(formState.error),
    [formState.error]
  );
  const { disabled } = useCatalogFormLeaveGuard({
    loading: formState.loading,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState({ error: null, loading: true });

    const payload = {
      name,
      website,
      status,
      visibility,
      initials: normalizeBrandInitials(initials) || undefined,
      tileClass,
    };

    try {
      if (mode === "add") {
        await createBrandApi(payload);
      } else if (initial) {
        await updateBrandApi(initial.id, payload);
      }
      finishCatalogSave({
        entity: "brand",
        listHref: routes.brands,
        mode,
        name,
        router,
        showToast,
      });
    } catch (error) {
      setFormState({
        error: error instanceof Error ? error.message : "Save failed",
        loading: false,
      });
    }
  }

  return (
    <form
      aria-busy={formState.loading}
      className="min-w-0 max-w-full space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="grid min-w-0 max-w-full items-start gap-4 lg:grid-cols-2">
        <FormCard title="General">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ControlledField
                disabled={disabled}
                error={fieldErrors.name}
                label="Brand name"
                onChange={(value) => {
                  setName(value);
                  setFormState((current) => ({ ...current, error: null }));
                }}
                placeholder="Brand name"
                required
                value={name}
              />
              <ControlledField
                disabled={disabled}
                help="Leave blank to auto-generate from the brand name."
                label="Initials"
                maxLength={4}
                onChange={(value) => setInitials(normalizeBrandInitials(value))}
                placeholder="e.g. BS"
                value={initials}
              />
            </div>
            <BrandTileStylePicker
              disabled={disabled}
              initials={previewInitials}
              onChange={setTileClass}
              options={tileClassOptions}
              value={tileClass}
            />
          </div>
        </FormCard>
        <FormCard title="Publishing & links">
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-ink-700">
                  Status
                </span>
                <StatusDot active={status === "published"} variant={status} />
              </div>
              <ControlledSelect
                disabled={disabled}
                help={statusHelp}
                hideLabel
                label="Status"
                onChange={(value) => setStatus(value as BrandDto["status"])}
                options={statusOptions}
                value={status}
              />
            </div>
            <ControlledSelect
              disabled={disabled}
              help="Controls how prominently the brand appears in admin merchandising."
              label="Visibility"
              onChange={(value) =>
                setVisibility(value as BrandDto["visibility"])
              }
              options={[
                { label: "Featured", value: "Featured" },
                { label: "Standard", value: "Standard" },
                { label: "Hidden", value: "Hidden" },
              ]}
              value={visibility}
            />
            <ControlledField
              disabled={disabled}
              label="Website"
              onChange={setWebsite}
              placeholder="https://example.com"
              value={website}
            />
          </div>
        </FormCard>
      </div>
      <CatalogFormFooter
        cancelHref={routes.brands}
        error={formState.error}
        loading={formState.loading}
        saveLabel={catalogSaveButtonLabel("brand", mode)}
        showDividerAboveActions={mode === "add"}
      />
      {mode === "edit" && initial ? (
        <div className="mt-6 border-t border-surface-line pt-6">
          <AssignedProductsSection
            addProductHref={addProductPath({ brandId: initial.id })}
            count={linkedProductCount ?? initial.productCount}
            disabled={disabled}
            emptyDescription="Add a product and choose this brand in the product form."
            entityLabel="brand"
            products={assignedProducts}
            productsHref={productsListPath({ brandId: initial.id })}
            productsListFilter={{ brandId: initial.id }}
          />
        </div>
      ) : null}
    </form>
  );
}

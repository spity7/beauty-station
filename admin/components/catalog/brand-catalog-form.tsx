"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AssignedProductsSection,
  BrandTilePreview,
  CatalogFormFooter,
  CatalogFormLayout,
  ControlledField,
  ControlledSelect,
  deriveInitials,
  getCatalogFieldErrors,
  StatusDot,
  type AssignedProductPreview,
} from "@/components/catalog/catalog-form-primitives";
import { FormCard } from "@/components/forms/admin-form-primitives";
import { routes } from "@/config/routes";
import { addProductPath, productsListPath } from "@/lib/paths";
import { finishCatalogSave } from "@/lib/catalog-feedback";
import { useToast } from "@/providers/toast-provider";
import { useCatalogFormLeaveGuard } from "@/components/catalog/use-catalog-form-leave-guard";
import { createBrandApi, updateBrandApi } from "@platform/api-client";
import type { BrandDto } from "@platform/shared";

const TILE_CLASS_OPTIONS = [
  { label: "Brand (gold)", value: "bg-brand-50 text-brand-600" },
  { label: "Success (green)", value: "bg-success-50 text-success-600" },
  { label: "Warning (amber)", value: "bg-warning-50 text-warning-600" },
  { label: "Neutral", value: "bg-surface-muted text-ink-600" },
];

type FormState = {
  error: string | null;
  loading: boolean;
};

type BrandCatalogFormProps = {
  assignedProducts?: AssignedProductPreview[];
  initial?: BrandDto;
  mode: "add" | "edit";
};

export function BrandCatalogForm({
  assignedProducts = [],
  initial,
  mode,
}: BrandCatalogFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [website, setWebsite] = useState(initial?.website ?? "");
  const [initials, setInitials] = useState(initial?.initials ?? "");
  const [tileClass, setTileClass] = useState(
    initial?.tileClass ?? TILE_CLASS_OPTIONS[0].value
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

  const previewInitials = useMemo(() => {
    if (initials.trim()) {
      return initials.trim().slice(0, 4).toUpperCase();
    }
    return deriveInitials(name);
  }, [initials, name]);

  const fieldErrors = useMemo(
    () => getCatalogFieldErrors(formState.error),
    [formState.error]
  );
  const { disabled, leaveDialog, requestLeave } = useCatalogFormLeaveGuard({
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
      initials: initials.trim() || undefined,
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
      <CatalogFormLayout
        aside={
          <>
            <BrandTilePreview
              initials={previewInitials}
              tileClass={tileClass}
            />
            <FormCard
              title="Status"
              titleEnd={
                <StatusDot active={status === "published"} variant={status} />
              }
            >
              <ControlledSelect
                disabled={disabled}
                help="Draft brands are hidden from published storefront views."
                hideLabel
                label="Status"
                onChange={(value) => setStatus(value as BrandDto["status"])}
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Published", value: "published" },
                  { label: "Archived", value: "archived" },
                ]}
                value={status}
              />
            </FormCard>
          </>
        }
      >
        <div className="grid items-start gap-4 md:grid-cols-2">
          <FormCard title="General">
            <div className="space-y-4">
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
              <div className="grid gap-4 md:grid-cols-2">
                <ControlledField
                  disabled={disabled}
                  help="Shown in brand tiles (max 4 characters)."
                  label="Initials"
                  maxLength={4}
                  onChange={setInitials}
                  placeholder="e.g. BS"
                  value={initials}
                />
                <ControlledSelect
                  disabled={disabled}
                  label="Tile style"
                  onChange={setTileClass}
                  options={TILE_CLASS_OPTIONS}
                  value={tileClass}
                />
              </div>
            </div>
          </FormCard>
          <div className="grid items-start gap-4 sm:grid-cols-2 md:grid-cols-1">
            <FormCard title="Storefront placement">
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
            </FormCard>
            <FormCard title="Brand links">
              <ControlledField
                disabled={disabled}
                label="Website"
                onChange={setWebsite}
                placeholder="https://example.com"
                value={website}
              />
            </FormCard>
          </div>
        </div>
      </CatalogFormLayout>
      {mode === "edit" && initial ? (
        <AssignedProductsSection
          addProductHref={addProductPath({ brandId: initial.id })}
          count={initial.productCount}
          disabled={disabled}
          emptyDescription="Add a product and choose this brand in the product form."
          entityLabel="brand"
          onRequestLeave={requestLeave}
          products={assignedProducts}
          productsHref={productsListPath({ brandId: initial.id })}
        />
      ) : null}
      <CatalogFormFooter
        cancelHref={routes.brands}
        error={formState.error}
        loading={formState.loading}
        onRequestLeave={requestLeave}
      />
      {leaveDialog}
    </form>
  );
}

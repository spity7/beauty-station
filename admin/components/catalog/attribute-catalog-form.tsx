"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AssignedProductsSection,
  AttributeValuesEditor,
  CatalogFormFooter,
  ControlledField,
  ControlledSelect,
  ControlledTextarea,
  createAttributeValueRows,
  getCatalogFieldErrors,
  StatusDot,
  type AssignedProductPreview,
  type AttributeValueRow,
} from "@/components/catalog/catalog-form-primitives";
import { FormCard } from "@/components/forms/admin-form-primitives";
import { routes } from "@/config/routes";
import { productsListPath } from "@/lib/paths";
import { finishCatalogSave } from "@/lib/catalog-feedback";
import { useToast } from "@/providers/toast-provider";
import { useCatalogFormLeaveGuard } from "@/components/catalog/use-catalog-form-leave-guard";
import { cn } from "@/utils/cn";
import { createAttributeApi, updateAttributeApi } from "@platform/api-client";
import type { AttributeDto } from "@platform/shared";

type FormState = {
  error: string | null;
  loading: boolean;
};

type AttributeCatalogFormProps = {
  assignedProducts?: AssignedProductPreview[];
  initial?: AttributeDto;
  mode: "add" | "edit";
};

export function AttributeCatalogForm({
  assignedProducts = [],
  initial,
  mode,
}: AttributeCatalogFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [displayType, setDisplayType] = useState<AttributeDto["displayType"]>(
    initial?.displayType ?? "Dropdown"
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<AttributeDto["status"]>(
    initial?.status ?? "draft"
  );
  const [valueRows, setValueRows] = useState<AttributeValueRow[]>(() =>
    createAttributeValueRows(initial?.values ?? [])
  );
  const [formState, setFormState] = useState<FormState>({
    error: null,
    loading: false,
  });

  const usesPredefinedValues = displayType !== "Text";

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

    const values = usesPredefinedValues
      ? valueRows.map((row) => row.value.trim()).filter(Boolean)
      : [];

    const payload = {
      name,
      displayType,
      description,
      status,
      values,
    };

    try {
      if (mode === "add") {
        await createAttributeApi(payload);
      } else if (initial) {
        await updateAttributeApi(initial.id, payload);
      }
      finishCatalogSave({
        entity: "attribute",
        listHref: routes.attributes,
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
      <div
        className={cn(
          "grid min-w-0 max-w-full items-start gap-4 md:grid-cols-2",
          usesPredefinedValues
            ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]"
            : "lg:grid-cols-[minmax(0,1fr)_280px]"
        )}
      >
        <FormCard title="General">
          <div className="grid gap-4 sm:grid-cols-2">
            <ControlledField
              disabled={disabled}
              error={fieldErrors.name}
              help="Attribute names appear in product option controls."
              label="Attribute name"
              onChange={(value) => {
                setName(value);
                setFormState((current) => ({ ...current, error: null }));
              }}
              placeholder="e.g. Color"
              required
              value={name}
            />
            <ControlledSelect
              disabled={disabled}
              help="How values should be displayed in admin forms."
              label="Display type"
              onChange={(value) =>
                setDisplayType(value as AttributeDto["displayType"])
              }
              options={[
                { label: "Dropdown", value: "Dropdown" },
                { label: "Swatch", value: "Swatch" },
                { label: "Text", value: "Text" },
              ]}
              value={displayType}
            />
          </div>
          <div className="mt-4">
            <ControlledTextarea
              disabled={disabled}
              help="Optional internal note for admins."
              label="Description"
              minRows={4}
              onChange={setDescription}
              placeholder="Optional internal note for admins."
              value={description}
            />
          </div>
        </FormCard>
        {usesPredefinedValues ? (
          <AttributeValuesEditor
            disabled={disabled}
            onRowsChange={setValueRows}
            rows={valueRows}
          />
        ) : null}
        <aside className="min-w-0 space-y-4">
          <FormCard
            title="Status"
            titleEnd={
              <StatusDot active={status === "published"} variant={status} />
            }
          >
            <ControlledSelect
              disabled={disabled}
              help="Draft attributes are hidden from product forms. Published attributes appear in the product attribute picker."
              hideLabel
              label="Status"
              onChange={(value) => setStatus(value as AttributeDto["status"])}
              options={[
                { label: "Draft", value: "draft" },
                { label: "Published", value: "published" },
              ]}
              value={status}
            />
          </FormCard>
        </aside>
      </div>
      {mode === "edit" && initial ? (
        <AssignedProductsSection
          addProductHref={routes.addProduct}
          count={initial.productCount}
          disabled={disabled}
          emptyDescription="Products will appear here once this attribute is set on a product."
          entityLabel="attribute"
          products={assignedProducts}
          productsHref={productsListPath({ attributeSlug: initial.slug })}
          title="Product usage"
        />
      ) : null}
      <CatalogFormFooter
        cancelHref={routes.attributes}
        error={formState.error}
        loading={formState.loading}
      />
    </form>
  );
}

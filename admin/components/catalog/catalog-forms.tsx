"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CatalogFormFooter,
  CatalogFormLayout,
  CatalogMediaUploadField,
  ControlledField,
  ControlledSelect,
  ControlledTextarea,
  collectRemovedHostedImages,
  createPendingCatalogFile,
  deleteHostedCatalogImages,
  getCatalogFieldErrors,
  getSavedCatalogImageUrls,
  hasPendingCatalogImages,
  isHostedCatalogImageUrl,
  ProductAttributesFields,
  ReadOnlyField,
  revokePendingCatalogFile,
  StatusDot,
  uploadPendingCatalogImageUrls,
  type CatalogImagePreview,
  type PendingCatalogFile,
  type ProductFormAttribute,
} from "@/components/catalog/catalog-form-primitives";
import { FormCard } from "@/components/forms/admin-form-primitives";
import { routes } from "@/config/routes";
import { finishCatalogSave } from "@/lib/catalog-feedback";
import { useToast } from "@/providers/toast-provider";
import { useCatalogFormLeaveGuard } from "@/components/catalog/use-catalog-form-leave-guard";
import { createProductApi, updateProductApi } from "@platform/api-client";
import type { ProductDto } from "@platform/shared";

export { AttributeCatalogForm } from "./attribute-catalog-form";
export { BrandCatalogForm } from "./brand-catalog-form";
export { CategoryCatalogForm } from "./category-catalog-form";

type FormState = {
  error: string | null;
  loading: boolean;
};

type ProductCatalogFormProps = {
  attributes: ProductFormAttribute[];
  brands: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  defaultBrandId?: string;
  defaultCategoryId?: string;
  initial?: ProductDto;
  mode: "add" | "edit";
};

function initialAttributeValues(
  attributes: ProductFormAttribute[],
  initial?: ProductDto
): Record<string, string> {
  const source = initial?.attributes ?? {};
  return Object.fromEntries(
    attributes.map((attribute) => {
      const raw = source[attribute.slug];
      const value =
        typeof raw === "string"
          ? raw
          : Array.isArray(raw)
            ? (raw[0] ?? "")
            : "";
      return [attribute.slug, value];
    })
  );
}

function toSavedImageEntry(url: string): CatalogImagePreview {
  return {
    id: `saved-${url}`,
    kind: "saved",
    url,
  };
}

function toPendingImageEntry(pending: PendingCatalogFile): CatalogImagePreview {
  return {
    id: pending.id,
    kind: "pending",
    file: pending.file,
    previewUrl: pending.previewUrl,
  };
}

function revokeImageEntry(entry: CatalogImagePreview): void {
  if (entry.kind === "pending") {
    revokePendingCatalogFile({
      file: entry.file,
      id: entry.id,
      previewUrl: entry.previewUrl,
    });
  }
}

export function ProductCatalogForm({
  attributes,
  brands,
  categories,
  defaultBrandId,
  defaultCategoryId,
  initial,
  mode,
}: ProductCatalogFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [compareAtPrice, setCompareAtPrice] = useState(
    initial?.compareAtPrice != null ? String(initial.compareAtPrice) : ""
  );
  const [stock, setStock] = useState(String(initial?.stock ?? 0));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<ProductDto["status"]>(
    initial?.status ?? "draft"
  );
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? defaultCategoryId ?? ""
  );
  const [brandId, setBrandId] = useState(
    initial?.brandId ?? defaultBrandId ?? ""
  );
  const [imageEntries, setImageEntries] = useState<CatalogImagePreview[]>(() =>
    (initial?.images ?? []).map(toSavedImageEntry)
  );
  const [attributeValues, setAttributeValues] = useState(() =>
    initialAttributeValues(attributes, initial)
  );
  const [formState, setFormState] = useState<FormState>({
    error: null,
    loading: false,
  });
  const initialHostedImages = useMemo(
    () => (initial?.images ?? []).filter(isHostedCatalogImageUrl),
    [initial?.images]
  );

  const fieldErrors = useMemo(
    () => getCatalogFieldErrors(formState.error),
    [formState.error]
  );
  const { disabled } = useCatalogFormLeaveGuard({
    loading: formState.loading,
  });

  const imagePreviews = imageEntries;
  const imageEntriesRef = useRef(imageEntries);
  imageEntriesRef.current = imageEntries;

  useEffect(() => {
    return () => {
      for (const entry of imageEntriesRef.current) {
        revokeImageEntry(entry);
      }
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormState({ error: null, loading: true });

    const attributesPayload = Object.fromEntries(
      Object.entries(attributeValues).filter(([, value]) => value.trim())
    );
    let uploadedInThisAttempt: string[] = [];

    try {
      const pendingEntries = imageEntries.filter(
        (entry): entry is Extract<CatalogImagePreview, { kind: "pending" }> =>
          entry.kind === "pending"
      );
      const savedImages = getSavedCatalogImageUrls(imageEntries);
      const payload = {
        name,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        stock: Number(stock),
        description,
        status,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        images: savedImages,
        attributes: attributesPayload,
      };

      let productId: string;
      if (mode === "add") {
        const created = await createProductApi(payload);
        productId = created.id;
      } else if (initial) {
        await updateProductApi(initial.id, payload);
        productId = initial.id;
      } else {
        throw new Error("Save failed");
      }

      let finalImages = savedImages;
      if (hasPendingCatalogImages(imageEntries)) {
        const uploaded = await uploadPendingCatalogImageUrls(
          imageEntries,
          "products"
        );
        uploadedInThisAttempt = uploaded.uploadedUrls;
        finalImages = uploaded.urls;
        await updateProductApi(productId, { images: finalImages });

        for (const entry of pendingEntries) {
          revokeImageEntry(entry);
        }
        setImageEntries(finalImages.map(toSavedImageEntry));
      }

      await deleteHostedCatalogImages(
        collectRemovedHostedImages(initialHostedImages, finalImages)
      );

      finishCatalogSave({
        entity: "product",
        listHref: routes.products,
        mode,
        name,
        router,
        showToast,
      });
    } catch (error) {
      if (uploadedInThisAttempt.length > 0) {
        await deleteHostedCatalogImages(uploadedInThisAttempt);
      }
      setFormState({
        error: error instanceof Error ? error.message : "Save failed",
        loading: false,
      });
    }
  }

  function handleAddImages(files: File[]) {
    setFormState((current) => ({ ...current, error: null }));
    setImageEntries((previous) => [
      ...previous,
      ...files.map((file) =>
        toPendingImageEntry(createPendingCatalogFile(file))
      ),
    ]);
  }

  function handleRemoveImage(id: string) {
    setImageEntries((previous) => {
      const target = previous.find((entry) => entry.id === id);
      if (target) {
        revokeImageEntry(target);
      }
      return previous.filter((entry) => entry.id !== id);
    });
  }

  function handleReorderImages(nextImages: CatalogImagePreview[]) {
    setImageEntries(nextImages);
  }

  return (
    <form aria-busy={formState.loading} onSubmit={handleSubmit}>
      <CatalogFormLayout
        aside={
          <>
            <FormCard
              title="Status"
              titleEnd={
                <StatusDot active={status === "published"} variant={status} />
              }
            >
              <ControlledSelect
                disabled={disabled}
                help="Draft products are hidden from published storefront views."
                hideLabel
                label="Status"
                onChange={(value) => setStatus(value as ProductDto["status"])}
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Published", value: "published" },
                  { label: "Archived", value: "archived" },
                ]}
                value={status}
              />
            </FormCard>
            <ProductAttributesFields
              attributes={attributes}
              disabled={disabled}
              onChange={setAttributeValues}
              values={attributeValues}
            />
          </>
        }
      >
        <FormCard title="General">
          <ControlledField
            disabled={disabled}
            error={fieldErrors.name}
            label="Product name"
            onChange={(value) => {
              setName(value);
              setFormState((current) => ({ ...current, error: null }));
            }}
            placeholder="Product name"
            required
            value={name}
          />
          {mode === "edit" && initial ? (
            <div className="mt-4">
              <ReadOnlyField
                help="Generated on create and used for inventory tracking."
                label="SKU"
                value={initial.sku}
              />
            </div>
          ) : (
            <p className="mt-2 text-[12px] text-ink-400">
              SKU will be generated automatically when you save.
            </p>
          )}
        </FormCard>
        <div className="grid gap-4 md:grid-cols-2">
          <FormCard title="Pricing & inventory">
            <div className="grid gap-4 sm:grid-cols-3">
              <ControlledField
                disabled={disabled}
                label="Price"
                onChange={setPrice}
                placeholder="0.00"
                required
                type="number"
                value={price}
              />
              <ControlledField
                disabled={disabled}
                help="Optional strikethrough price."
                label="Compare at price"
                onChange={setCompareAtPrice}
                placeholder="0.00"
                type="number"
                value={compareAtPrice}
              />
              <ControlledField
                disabled={disabled}
                label="Stock"
                onChange={setStock}
                placeholder="0"
                required
                type="number"
                value={stock}
              />
            </div>
          </FormCard>
          <FormCard title="Merchandising">
            <div className="grid gap-4 sm:grid-cols-2">
              <ControlledSelect
                disabled={disabled}
                label="Category"
                onChange={setCategoryId}
                options={[
                  { label: "None", value: "" },
                  ...categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  })),
                ]}
                value={categoryId}
              />
              <ControlledSelect
                disabled={disabled}
                label="Brand"
                onChange={setBrandId}
                options={[
                  { label: "None", value: "" },
                  ...brands.map((brand) => ({
                    label: brand.name,
                    value: brand.id,
                  })),
                ]}
                value={brandId}
              />
            </div>
          </FormCard>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormCard title="Media">
            <CatalogMediaUploadField
              disabled={disabled}
              helperText={
                formState.loading
                  ? "Saving…"
                  : imagePreviews.length > 0
                    ? `${imagePreviews.length} image${imagePreviews.length === 1 ? "" : "s"} selected. Files upload to storage when you save.`
                    : "Add PNG, JPG, or WebP images. Uploads on save."
              }
              images={imagePreviews}
              onAddFiles={handleAddImages}
              onRemove={handleRemoveImage}
              onReorder={handleReorderImages}
            />
          </FormCard>
          <FormCard title="Description">
            <ControlledTextarea
              disabled={disabled}
              help="Shown on the product detail page."
              label="Product description"
              minRows={5}
              onChange={setDescription}
              placeholder="Describe the product…"
              value={description}
            />
          </FormCard>
        </div>
      </CatalogFormLayout>
      <CatalogFormFooter
        cancelHref={routes.products}
        error={formState.error}
        loading={formState.loading}
      />
    </form>
  );
}

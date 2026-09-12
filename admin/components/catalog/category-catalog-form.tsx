"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AssignedProductsSection,
  CatalogFormFooter,
  ControlledField,
  ControlledSelect,
  collectRemovedHostedImages,
  deleteHostedCatalogImages,
  getCatalogFieldErrors,
  getThumbnailPreviewState,
  isHostedCatalogImageUrl,
  revokeBlobPreviewUrl,
  StatusDot,
  ThumbnailUploadCard,
  uploadCatalogImage,
  type AssignedProductPreview,
} from "@/components/catalog/catalog-form-primitives";
import { FormCard } from "@/components/forms/admin-form-primitives";
import { routes } from "@/config/routes";
import { addProductPath, productsListPath } from "@/lib/paths";
import {
  catalogSaveButtonLabel,
  finishCatalogSave,
} from "@/lib/catalog-feedback";
import { useCatalogFormLeaveGuard } from "@/components/catalog/use-catalog-form-leave-guard";
import { useToast } from "@/providers/toast-provider";
import { createCategoryApi, updateCategoryApi } from "@platform/api-client";
import type { CategoryDto } from "@platform/shared";

type FormState = {
  error: string | null;
  loading: boolean;
};

type CategoryCatalogFormProps = {
  assignedProducts?: AssignedProductPreview[];
  initial?: CategoryDto;
  linkedProductCount?: number;
  mode: "add" | "edit";
};

function hasCategoryImage(
  savedImageUrl: string,
  pendingImageFile: File | null
): boolean {
  return Boolean(savedImageUrl.trim() || pendingImageFile);
}

export function CategoryCatalogForm({
  assignedProducts = [],
  initial,
  linkedProductCount,
  mode,
}: CategoryCatalogFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [savedImageUrl, setSavedImageUrl] = useState(initial?.image ?? "");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.image ?? "");
  const [status, setStatus] = useState<CategoryDto["status"]>(
    initial?.status ?? "draft"
  );
  const [formState, setFormState] = useState<FormState>({
    error: null,
    loading: false,
  });
  const initialHostedImage =
    mode === "edit" && initial && isHostedCatalogImageUrl(initial.image)
      ? initial.image
      : "";

  const previewState = useMemo(
    () => getThumbnailPreviewState(savedImageUrl, pendingImageFile !== null),
    [pendingImageFile, savedImageUrl]
  );

  const fieldErrors = useMemo(
    () => getCatalogFieldErrors(formState.error),
    [formState.error]
  );
  const { disabled } = useCatalogFormLeaveGuard({
    loading: formState.loading,
  });

  useEffect(() => {
    return () => {
      if (pendingImageFile) {
        revokeBlobPreviewUrl(previewUrl);
      }
    };
  }, [pendingImageFile, previewUrl]);

  function handleImageUpload(file: File) {
    setFormState((current) => ({ ...current, error: null }));
    if (pendingImageFile) {
      revokeBlobPreviewUrl(previewUrl);
    }
    setPendingImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasCategoryImage(savedImageUrl, pendingImageFile)) {
      setFormState({
        error: "Category image is required",
        loading: false,
      });
      return;
    }

    setFormState({ error: null, loading: true });

    let finalImage = savedImageUrl.trim();
    const uploadedInThisAttempt: string[] = [];

    try {
      if (pendingImageFile) {
        finalImage = await uploadCatalogImage(pendingImageFile, "categories");
        uploadedInThisAttempt.push(finalImage);
        revokeBlobPreviewUrl(previewUrl);
        setPendingImageFile(null);
        setPreviewUrl(finalImage);
        setSavedImageUrl(finalImage);
      }

      const payload = { name, image: finalImage, status };

      if (mode === "add") {
        await createCategoryApi(payload);
      } else if (initial) {
        await updateCategoryApi(initial.id, payload);
      } else {
        throw new Error("Save failed");
      }

      await deleteHostedCatalogImages(
        collectRemovedHostedImages(
          initialHostedImage ? [initialHostedImage] : [],
          finalImage ? [finalImage] : []
        )
      );

      finishCatalogSave({
        entity: "category",
        listHref: routes.categories,
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

  return (
    <form
      aria-busy={formState.loading}
      className="min-w-0 max-w-full space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="grid min-w-0 max-w-full items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FormCard title="General">
          <ControlledField
            disabled={disabled}
            error={fieldErrors.name}
            help="A category name is required and should be unique."
            label="Category name"
            onChange={(value) => {
              setName(value);
              setFormState((current) => ({ ...current, error: null }));
            }}
            placeholder="Category name"
            required
            value={name}
          />
        </FormCard>
        <FormCard
          title="Status"
          titleEnd={
            <StatusDot active={status === "published"} variant={status} />
          }
        >
          <ControlledSelect
            disabled={disabled}
            help="Draft categories are hidden from published storefront views."
            hideLabel
            label="Status"
            onChange={(value) => setStatus(value as CategoryDto["status"])}
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
            ]}
            value={status}
          />
        </FormCard>
        <ThumbnailUploadCard
          alt={name || "Category thumbnail"}
          disabled={disabled}
          error={fieldErrors.image}
          onUpload={handleImageUpload}
          previewState={previewState}
          previewUrl={previewUrl}
          required
        />
      </div>
      <CatalogFormFooter
        cancelHref={routes.categories}
        error={formState.error}
        loading={formState.loading}
        saveLabel={catalogSaveButtonLabel("category", mode)}
        showDividerAboveActions={mode === "add"}
      />
      {mode === "edit" && initial ? (
        <div className="mt-6 border-t border-surface-line pt-6">
          <AssignedProductsSection
            addProductHref={addProductPath({ categoryId: initial.id })}
            count={linkedProductCount ?? initial.productCount}
            disabled={disabled}
            emptyDescription="Add a product and choose this category in the product form."
            entityLabel="category"
            products={assignedProducts}
            productsHref={productsListPath({ categoryId: initial.id })}
            productsListFilter={{ categoryId: initial.id }}
          />
        </div>
      ) : null}
    </form>
  );
}

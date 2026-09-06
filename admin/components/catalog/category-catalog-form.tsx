"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CatalogFormActions,
  CatalogFormError,
  ControlledField,
  ControlledSelect,
  collectRemovedHostedImages,
  deleteHostedCatalogImages,
  getThumbnailPreviewState,
  isHostedCatalogImageUrl,
  ProductCountCard,
  revokeBlobPreviewUrl,
  StatusDot,
  ThumbnailUploadCard,
  uploadCatalogImage,
} from "@/components/catalog/catalog-form-primitives";
import { FormCard } from "@/components/forms/admin-form-primitives";
import { routes } from "@/config/routes";
import { createCategoryApi, updateCategoryApi } from "@platform/api-client";
import type { CategoryDto } from "@platform/shared";

type FormState = {
  error: string | null;
  loading: boolean;
};

type CategoryCatalogFormProps = {
  initial?: CategoryDto;
  mode: "add" | "edit";
};

export function CategoryCatalogForm({
  initial,
  mode,
}: CategoryCatalogFormProps) {
  const router = useRouter();
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

  function handleRemoveImage() {
    if (pendingImageFile) {
      revokeBlobPreviewUrl(previewUrl);
      setPendingImageFile(null);
    }
    setSavedImageUrl("");
    setPreviewUrl("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      }

      await deleteHostedCatalogImages(
        collectRemovedHostedImages(
          initialHostedImage ? [initialHostedImage] : [],
          finalImage ? [finalImage] : []
        )
      );

      router.push(routes.categories);
      router.refresh();
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
    <form onSubmit={handleSubmit}>
      <div className="grid min-w-0 max-w-full items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        <FormCard title="General">
          <ControlledField
            help="A category name is required and should be unique."
            label="Category name"
            onChange={setName}
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
          disabled={formState.loading}
          onClear={handleRemoveImage}
          onUpload={handleImageUpload}
          previewState={previewState}
          previewUrl={previewUrl}
        />
      </div>
      {mode === "edit" && initial ? (
        <div className="mt-4">
          <ProductCountCard
            count={initial.productCount}
            productsHref={routes.products}
          />
        </div>
      ) : null}
      <CatalogFormError message={formState.error} />
      <CatalogFormActions
        cancelHref={routes.categories}
        loading={formState.loading}
      />
    </form>
  );
}

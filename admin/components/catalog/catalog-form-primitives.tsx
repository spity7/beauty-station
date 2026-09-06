"use client";

import Image from "next/image";
import Link from "next/link";
import type { DragEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { FormCard } from "@/components/forms/admin-form-primitives";
import { Icon } from "@/components/layout/icon";
import { platformInstance } from "@platform/api-client";
import { cn } from "@/utils/cn";

export const CATALOG_IMAGE_ACCEPT = ".png,.jpg,.jpeg,.webp";

const CATALOG_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function isCatalogImageFile(file: File): boolean {
  return CATALOG_IMAGE_MIME_TYPES.has(file.type);
}

export function getCatalogImageFilesFromDataTransfer(
  dataTransfer: DataTransfer
): File[] {
  return [...dataTransfer.files].filter(isCatalogImageFile);
}

function reorderList<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) {
    return items;
  }
  next.splice(toIndex, 0, moved);
  return next;
}

export function useCatalogImageDropHandlers(options: {
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  single?: boolean;
}) {
  const { disabled = false, onFiles, single = false } = options;
  const dragDepthRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  function hasFilePayload(dataTransfer: DataTransfer): boolean {
    return [...dataTransfer.types].includes("Files");
  }

  function handleDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || !hasFilePayload(event.dataTransfer)) {
      return;
    }
    dragDepthRef.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || !hasFilePayload(event.dataTransfer)) {
      return;
    }
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setIsDragging(false);
    if (disabled) {
      return;
    }

    const files = getCatalogImageFilesFromDataTransfer(event.dataTransfer);
    if (files.length === 0) {
      return;
    }

    onFiles(single ? files.slice(0, 1) : files);
  }

  return {
    isDragging,
    dropZoneProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}

function CatalogDropOverlay({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-[inherit] bg-brand-50/90 p-3 text-center">
      <div>
        <Icon className="mx-auto h-5 w-5 text-brand-600" name="upload" />
        <p className="mt-2 text-[12px] font-semibold text-brand-700">{label}</p>
      </div>
    </div>
  );
}

export type ThumbnailPreviewState = "none" | "saved" | "pending";

export function getThumbnailPreviewState(
  savedImageUrl: string,
  hasPendingFile: boolean
): ThumbnailPreviewState {
  if (hasPendingFile) {
    return "pending";
  }
  if (savedImageUrl.trim()) {
    return "saved";
  }
  return "none";
}

export type PendingCatalogFile = {
  file: File;
  id: string;
  previewUrl: string;
};

export type CatalogImagePreview =
  | { id: string; kind: "saved"; url: string }
  | { id: string; kind: "pending"; file: File; previewUrl: string };

export function createPendingCatalogFile(file: File): PendingCatalogFile {
  return {
    id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export function revokePendingCatalogFile(pending: PendingCatalogFile): void {
  URL.revokeObjectURL(pending.previewUrl);
}

export function revokePendingCatalogFiles(
  pendingFiles: PendingCatalogFile[]
): void {
  for (const pending of pendingFiles) {
    revokePendingCatalogFile(pending);
  }
}

export function revokeBlobPreviewUrl(url: string): void {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export async function uploadCatalogImage(
  file: File,
  folder: "categories" | "brands" | "products"
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const result = await platformInstance.post<{ publicUrl: string }>(
    "/api/uploads",
    formData
  );
  return result.data.publicUrl;
}

export async function uploadCatalogImages(
  files: File[],
  folder: "categories" | "brands" | "products"
): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }
  return Promise.all(files.map((file) => uploadCatalogImage(file, folder)));
}

export function isHostedCatalogImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "storage.googleapis.com" &&
      /\/(categories|brands|products)\//.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export function collectRemovedHostedImages(
  previousUrls: string[],
  nextUrls: string[]
): string[] {
  const nextSet = new Set(nextUrls);
  return previousUrls.filter(
    (url) => isHostedCatalogImageUrl(url) && !nextSet.has(url)
  );
}

export async function deleteCatalogImage(url: string): Promise<void> {
  await platformInstance.delete("/api/uploads", { data: { url } });
}

export async function deleteHostedCatalogImages(urls: string[]): Promise<void> {
  const hosted = urls.filter(isHostedCatalogImageUrl);
  if (hosted.length === 0) {
    return;
  }

  const results = await Promise.allSettled(
    hosted.map((url) => deleteCatalogImage(url))
  );
  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length > 0) {
    console.warn(
      "Failed to remove one or more replaced catalog images from storage."
    );
  }
}

export function CatalogFormError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return <p className="text-[14px] text-danger-600">{message}</p>;
}

export function CatalogFormActions({
  cancelHref,
  loading,
  saveLabel = "Save",
}: {
  cancelHref: string;
  loading: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-end gap-3 border-t border-surface-line pt-5">
      <Link
        className="inline-flex h-10 items-center gap-2 rounded-base border border-surface-line px-5 text-[14px] font-semibold text-ink-700 hover:bg-surface-muted"
        href={cancelHref}
      >
        Cancel
      </Link>
      <button
        className="inline-flex h-10 items-center gap-2 rounded-base bg-brand-600 px-5 text-[14px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        <Icon className="h-4 w-4" name="save" />
        {loading ? "Saving…" : saveLabel}
      </button>
    </div>
  );
}

export function StatusDot({
  active,
  variant = "published",
}: {
  active: boolean;
  variant?: "published" | "draft" | "archived" | "active";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "h-2.5 w-2.5 rounded-full",
        !active && "bg-warning-500",
        active &&
          (variant === "archived"
            ? "bg-surface-muted"
            : variant === "draft"
              ? "bg-warning-500"
              : "bg-success-500")
      )}
    />
  );
}

type ControlledFieldProps = {
  help?: string;
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
};

export function ControlledField({
  help,
  label,
  maxLength,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: ControlledFieldProps) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-ink-700">
        {label} {required ? <span className="text-danger-500">*</span> : null}
      </span>
      <input
        className="mt-1.5 h-10 w-full rounded-base border border-surface-line bg-surface-body px-3 text-[14px] placeholder:text-ink-400 focus:border-brand-600"
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
      {help ? <p className="mt-1 text-[12px] text-ink-400">{help}</p> : null}
    </label>
  );
}

type ControlledSelectProps = {
  help?: string;
  hideLabel?: boolean;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
};

export function ControlledSelect({
  help,
  hideLabel,
  label,
  onChange,
  options,
  value,
}: ControlledSelectProps) {
  return (
    <label className="block">
      {hideLabel ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="text-[13px] font-semibold text-ink-700">{label}</span>
      )}
      <select
        className={cn(
          "h-10 w-full rounded-base border border-surface-line bg-surface-body px-3 text-[14px] focus:border-brand-600",
          hideLabel ? "mt-0" : "mt-1.5"
        )}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help ? <p className="mt-1 text-[12px] text-ink-400">{help}</p> : null}
    </label>
  );
}

type ControlledTextareaProps = {
  help?: string;
  label: string;
  minRows?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function ReadOnlyField({
  help,
  label,
  value,
}: {
  help?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="block">
      <span className="text-[13px] font-semibold text-ink-700">{label}</span>
      <p className="mt-1.5 flex h-10 items-center rounded-base border border-surface-line bg-surface-muted px-3 text-[14px] text-ink-600">
        {value}
      </p>
      {help ? <p className="mt-1 text-[12px] text-ink-400">{help}</p> : null}
    </div>
  );
}

export function ControlledTextarea({
  help,
  label,
  minRows = 4,
  onChange,
  placeholder,
  value,
}: ControlledTextareaProps) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-ink-700">{label}</span>
      <textarea
        className="mt-1.5 w-full rounded-base border border-surface-line bg-surface-body px-3 py-2 text-[14px] placeholder:text-ink-400 focus:border-brand-600"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={minRows}
        value={value}
      />
      {help ? <p className="mt-1 text-[12px] text-ink-400">{help}</p> : null}
    </label>
  );
}

export function ThumbnailUploadCard({
  alt,
  disabled = false,
  onClear,
  onUpload,
  previewState,
  previewUrl,
  title = "Thumbnail",
}: {
  alt: string;
  disabled?: boolean;
  onClear?: () => void;
  onUpload: (file: File) => void;
  previewState: ThumbnailPreviewState;
  previewUrl: string;
  title?: string;
}) {
  const hasImage = previewState !== "none" && Boolean(previewUrl);
  const isRemote = previewUrl.startsWith("http");
  const isBlobPreview = previewUrl.startsWith("blob:");

  const helperText =
    previewState === "pending"
      ? "Preview only — the file uploads to storage when you save."
      : previewState === "saved"
        ? "Drag a new image here or click to replace. Uploads on save."
        : "Drag and drop a square PNG, JPG, or WebP image, or click to browse.";

  const { isDragging, dropZoneProps } = useCatalogImageDropHandlers({
    disabled,
    onFiles: (files) => {
      const file = files[0];
      if (file) {
        onUpload(file);
      }
    },
    single: true,
  });

  return (
    <FormCard title={title}>
      <div className="flex flex-col items-center text-center">
        <label
          {...dropZoneProps}
          className={cn(
            "group relative grid h-36 w-36 place-items-center overflow-hidden rounded-base bg-surface-card shadow-soft transition-shadow",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:shadow-lift",
            isDragging && "ring-2 ring-brand-500 ring-offset-2"
          )}
        >
          {isDragging ? (
            <CatalogDropOverlay label="Drop image to upload" />
          ) : null}
          {!disabled ? (
            <span className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-surface-card text-ink-400 shadow-card transition-colors group-hover:text-brand-600">
              <Icon className="h-3.5 w-3.5" name="pencil" />
            </span>
          ) : null}
          {hasImage ? (
            <Image
              alt={alt}
              className="absolute inset-0 h-full w-full object-cover p-2"
              height={144}
              src={previewUrl}
              unoptimized={isRemote || isBlobPreview}
              width={144}
            />
          ) : (
            <span className="grid h-20 w-20 -rotate-6 place-items-center rounded-base bg-brand-50 text-brand-200">
              <Icon className="h-10 w-10" name="image" />
            </span>
          )}
          <input
            accept={CATALOG_IMAGE_ACCEPT}
            aria-label={`Upload ${title.toLowerCase()}`}
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              onUpload(file);
              event.target.value = "";
            }}
            type="file"
          />
        </label>
        <p className="mt-4 text-[12px] text-ink-400">
          {disabled ? "Saving…" : helperText}
        </p>
        {hasImage && onClear ? (
          <button
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-base border border-surface-line px-4 text-[13px] font-semibold text-ink-700 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled}
            onClick={onClear}
            type="button"
          >
            <Icon className="h-3.5 w-3.5" name="x" />
            Remove image
          </button>
        ) : null}
      </div>
    </FormCard>
  );
}

export function BrandTilePreview({
  initials,
  tileClass,
}: {
  initials: string;
  tileClass: string;
}) {
  return (
    <FormCard title="Brand tile">
      <div className="flex flex-col items-center text-center">
        <span
          className={cn(
            "grid h-36 w-36 place-items-center rounded-base text-[28px] font-semibold shadow-soft",
            tileClass
          )}
        >
          {initials || "?"}
        </span>
        <p className="mt-4 text-[12px] text-ink-400">
          Preview of how this brand appears in admin lists.
        </p>
      </div>
    </FormCard>
  );
}

export function ProductCountCard({
  count,
  productsHref,
}: {
  count: number;
  productsHref: string;
}) {
  return (
    <FormCard title="Assigned products">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] text-ink-500">Products in catalog</span>
        <span className="text-[18px] font-semibold text-ink-900">{count}</span>
      </div>
      <Link
        className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-base bg-brand-50 text-[13px] font-semibold text-brand-600 hover:bg-brand-100"
        href={productsHref}
      >
        View products
        <Icon className="h-3.5 w-3.5" name="arrow-up-right" />
      </Link>
    </FormCard>
  );
}

export type AttributeValueRow = {
  id: string;
  value: string;
};

export function AttributeValuesEditor({
  onRowsChange,
  rows,
}: {
  onRowsChange: (rows: AttributeValueRow[]) => void;
  rows: AttributeValueRow[];
}) {
  return (
    <FormCard title="Values">
      <div className="space-y-3">
        {rows.map((item, index) => (
          <div className="flex items-center gap-2" key={item.id}>
            <input
              aria-label={`Attribute value ${index + 1}`}
              className="h-10 flex-1 rounded-base border border-surface-line bg-surface-body px-3 text-[14px] focus:border-brand-600"
              onChange={(event) => {
                onRowsChange(
                  rows.map((row) =>
                    row.id === item.id
                      ? { ...row, value: event.target.value }
                      : row
                  )
                );
              }}
              placeholder="Value"
              value={item.value}
            />
            <button
              aria-label="Remove value"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-base border border-danger-100 bg-danger-50 text-danger-500 hover:bg-danger-100"
              onClick={() => {
                if (rows.length <= 1) {
                  onRowsChange([{ id: item.id, value: "" }]);
                  return;
                }
                onRowsChange(rows.filter((row) => row.id !== item.id));
              }}
              type="button"
            >
              <Icon className="h-4 w-4" name="x" />
            </button>
          </div>
        ))}
      </div>
      <button
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-base border border-surface-line px-4 text-[13px] font-semibold text-ink-700 hover:bg-surface-muted"
        onClick={() =>
          onRowsChange([...rows, { id: `value-${Date.now()}`, value: "" }])
        }
        type="button"
      >
        <Icon className="h-4 w-4" name="plus" />
        Add value
      </button>
    </FormCard>
  );
}

export function CatalogFormLayout({
  aside,
  children,
}: {
  aside: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-w-0 max-w-full items-start gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-4 xl:order-1">{aside}</aside>
      <div className="min-w-0 space-y-4 xl:order-2">{children}</div>
    </div>
  );
}

export function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function createAttributeValueRows(
  values: string[]
): AttributeValueRow[] {
  const normalized = values.length > 0 ? values : [""];
  return normalized.map((value, index) => ({
    id: `value-${index}-${value}`,
    value,
  }));
}

export type ProductFormAttribute = {
  displayType: "Dropdown" | "Swatch" | "Text";
  inactive?: boolean;
  name: string;
  slug: string;
  values: string[];
};

export function toProductFormAttribute(attribute: {
  displayType: ProductFormAttribute["displayType"];
  name: string;
  slug: string;
  values: string[];
}): ProductFormAttribute {
  return {
    displayType: attribute.displayType,
    name: attribute.name,
    slug: attribute.slug,
    values: attribute.values,
  };
}

export function assignedProductAttributeSlugs(
  attributes: Record<string, string | string[]> | undefined
): string[] {
  if (!attributes) {
    return [];
  }

  return Object.entries(attributes)
    .filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.some((item) => String(item).trim().length > 0);
      }
      return String(value).trim().length > 0;
    })
    .map(([slug]) => slug);
}

export function mergeProductFormAttributes(
  activeAttributes: ProductFormAttribute[],
  catalogAttributes: ProductFormAttribute[],
  assignedSlugs: string[]
): ProductFormAttribute[] {
  const activeSlugs = new Set(
    activeAttributes.map((attribute) => attribute.slug)
  );
  const merged = new Map(
    activeAttributes.map((attribute) => [attribute.slug, attribute])
  );

  for (const slug of assignedSlugs) {
    if (merged.has(slug)) {
      continue;
    }
    const definition = catalogAttributes.find(
      (attribute) => attribute.slug === slug
    );
    if (definition) {
      merged.set(slug, { ...definition, inactive: true });
    }
  }

  return Array.from(merged.values());
}

export function ProductImageList({
  disabled = false,
  images,
  onRemove,
  onReorder,
}: {
  disabled?: boolean;
  images: CatalogImagePreview[];
  onRemove: (id: string) => void;
  onReorder?: (images: CatalogImagePreview[]) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  if (images.length === 0) {
    return null;
  }

  function handleDragStart(id: string, event: DragEvent<HTMLLIElement>) {
    if (disabled || !onReorder) {
      return;
    }
    setDraggedId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(id: string, event: DragEvent<HTMLLIElement>) {
    if (disabled || !onReorder || !draggedId || draggedId === id) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetId(id);
  }

  function handleDrop(id: string, event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
    if (disabled || !onReorder || !draggedId || draggedId === id) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    const fromIndex = images.findIndex((image) => image.id === draggedId);
    const toIndex = images.findIndex((image) => image.id === id);
    onReorder(reorderList(images, fromIndex, toIndex));
    setDraggedId(null);
    setDropTargetId(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDropTargetId(null);
  }

  return (
    <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {images.map((image) => {
        const previewUrl =
          image.kind === "saved" ? image.url : image.previewUrl;
        const fileName =
          image.kind === "saved"
            ? (image.url.split("/").pop() ?? "image")
            : image.file.name;
        const isRemote = previewUrl.startsWith("http");
        const isBlobPreview = previewUrl.startsWith("blob:");
        const isDragging = draggedId === image.id;
        const isDropTarget = dropTargetId === image.id;

        return (
          <li
            className={cn(
              "group relative overflow-hidden rounded-base border bg-surface-body transition-shadow",
              isDragging && "opacity-50",
              isDropTarget
                ? "border-brand-500 ring-2 ring-brand-200"
                : "border-surface-line"
            )}
            draggable={Boolean(onReorder) && !disabled}
            key={image.id}
            onDragEnd={handleDragEnd}
            onDragOver={(event) => handleDragOver(image.id, event)}
            onDragStart={(event) => handleDragStart(image.id, event)}
            onDrop={(event) => handleDrop(image.id, event)}
          >
            {onReorder && !disabled ? (
              <span className="absolute left-1.5 top-1.5 z-10 grid h-7 w-7 cursor-grab place-items-center rounded-full bg-surface-card/95 text-ink-400 shadow-card active:cursor-grabbing">
                <Icon className="h-3.5 w-3.5" name="grip-vertical" />
              </span>
            ) : null}
            {isRemote || previewUrl.startsWith("/") || isBlobPreview ? (
              <Image
                alt={fileName}
                className="aspect-square w-full object-cover"
                height={96}
                src={previewUrl}
                unoptimized={isRemote || isBlobPreview}
                width={96}
              />
            ) : (
              <div className="grid aspect-square place-items-center bg-surface-muted text-[12px] text-ink-400">
                {fileName}
              </div>
            )}
            {image.kind === "pending" ? (
              <span className="absolute bottom-1.5 left-1.5 rounded-full bg-surface-card/95 px-2 py-0.5 text-[10px] font-semibold text-ink-500 shadow-card">
                Pending
              </span>
            ) : null}
            <button
              aria-label={`Remove ${fileName}`}
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-surface-card/95 text-ink-500 opacity-0 shadow-card transition-opacity group-hover:opacity-100 hover:text-danger-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
              onClick={() => onRemove(image.id)}
              type="button"
            >
              <Icon className="h-3.5 w-3.5" name="x" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function CatalogMediaUploadField({
  disabled = false,
  helperText,
  images,
  label = "Product images",
  onAddFiles,
  onRemove,
  onReorder,
}: {
  disabled?: boolean;
  helperText: string;
  images: CatalogImagePreview[];
  label?: string;
  onAddFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onReorder?: (images: CatalogImagePreview[]) => void;
}) {
  const inputId = "catalog-media-upload-input";
  const { isDragging, dropZoneProps } = useCatalogImageDropHandlers({
    disabled,
    onFiles: onAddFiles,
  });

  return (
    <div className="block">
      <span className="text-[13px] font-semibold text-ink-700">{label}</span>
      <div
        {...dropZoneProps}
        className={cn(
          "relative mt-1.5 rounded-base border border-dashed border-surface-line bg-surface-body px-4 py-5 transition-colors",
          !disabled && "hover:border-brand-300 hover:bg-brand-50/40",
          isDragging && "border-brand-500 bg-brand-50/70 ring-2 ring-brand-200"
        )}
      >
        {isDragging ? <CatalogDropOverlay label="Drop images to add" /> : null}
        <div className="relative z-10 flex flex-col items-center text-center">
          <Icon className="h-5 w-5 text-brand-600" name="upload" />
          <p className="mt-2 text-[13px] font-semibold text-ink-700">
            Drag and drop images here
          </p>
          <p className="mt-1 text-[12px] text-ink-400">
            PNG, JPG, or WebP. Uploads on save.
          </p>
          <label
            className={cn(
              "mt-3 inline-flex h-9 cursor-pointer items-center rounded-base bg-brand-50 px-3 text-[13px] font-semibold text-brand-600 hover:bg-brand-100",
              disabled && "cursor-not-allowed opacity-60"
            )}
            htmlFor={inputId}
          >
            Browse files
          </label>
          <input
            accept={CATALOG_IMAGE_ACCEPT}
            className="sr-only"
            disabled={disabled}
            id={inputId}
            multiple
            onChange={(event) => {
              const files = [...(event.target.files ?? [])].filter(
                isCatalogImageFile
              );
              if (files.length > 0) {
                onAddFiles(files);
              }
              event.target.value = "";
            }}
            type="file"
          />
        </div>
      </div>
      <p className="mt-2 text-[12px] text-ink-400">{helperText}</p>
      {images.length > 0 ? (
        <>
          {onReorder ? (
            <p className="mt-3 text-[12px] text-ink-400">
              Drag images to reorder. The first image is used as the primary
              thumbnail.
            </p>
          ) : null}
          <ProductImageList
            disabled={disabled}
            images={images}
            onRemove={onRemove}
            onReorder={onReorder}
          />
        </>
      ) : null}
    </div>
  );
}

export function ProductAttributesFields({
  attributes,
  onChange,
  values,
}: {
  attributes: ProductFormAttribute[];
  onChange: (values: Record<string, string>) => void;
  values: Record<string, string>;
}) {
  if (attributes.length === 0) {
    return null;
  }

  return (
    <FormCard title="Attributes">
      <div className="grid grid-cols-1 gap-4">
        {attributes.map((attribute) => {
          const currentValue = values[attribute.slug] ?? "";
          const inactiveHelp = attribute.inactive
            ? "Inactive attribute — value is preserved on this product."
            : undefined;

          if (attribute.displayType === "Text") {
            return (
              <ControlledField
                help={inactiveHelp}
                key={attribute.slug}
                label={attribute.name}
                onChange={(value) =>
                  onChange({ ...values, [attribute.slug]: value })
                }
                placeholder={`Enter ${attribute.name.toLowerCase()}`}
                value={currentValue}
              />
            );
          }

          return (
            <ControlledSelect
              help={
                inactiveHelp ??
                (attribute.displayType === "Swatch"
                  ? "Choose a predefined swatch value."
                  : undefined)
              }
              key={attribute.slug}
              label={attribute.name}
              onChange={(value) =>
                onChange({ ...values, [attribute.slug]: value })
              }
              options={[
                { label: "None", value: "" },
                ...attribute.values.map((value) => ({
                  label: value,
                  value,
                })),
              ]}
              value={currentValue}
            />
          );
        })}
      </div>
    </FormCard>
  );
}

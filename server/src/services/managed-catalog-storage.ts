import { env } from "../config/env.js";
import { getManagedCatalogObjectPath } from "../utils/managed-catalog-path.js";
import { deleteFileIfExists } from "./storage.service.js";

export { getManagedCatalogObjectPath } from "../utils/managed-catalog-path.js";

export function collectRemovedManagedCatalogImages(
  previousUrls: string[],
  nextUrls: string[]
): string[] {
  const nextSet = new Set(nextUrls);
  return previousUrls.filter((url) => url.trim() && !nextSet.has(url));
}

export async function deleteManagedCatalogImageIfPresent(
  imageUrl: string | undefined
): Promise<void> {
  if (!imageUrl?.trim() || !env.gcs.isConfigured || !env.gcs.bucketName) {
    return;
  }

  const objectPath = getManagedCatalogObjectPath(imageUrl, env.gcs.bucketName);
  if (!objectPath) {
    return;
  }

  try {
    await deleteFileIfExists(objectPath);
  } catch (error) {
    console.error(
      `Failed to delete managed catalog image ${objectPath}:`,
      error
    );
  }
}

export async function deleteManagedCatalogImagesIfPresent(
  imageUrls: string[]
): Promise<void> {
  await Promise.all(
    imageUrls.map((url) => deleteManagedCatalogImageIfPresent(url))
  );
}

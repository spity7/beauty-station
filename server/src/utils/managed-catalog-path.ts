const MANAGED_CATALOG_FOLDERS = ["categories", "brands", "products"] as const;

export type ManagedCatalogFolder = (typeof MANAGED_CATALOG_FOLDERS)[number];

export function isManagedCatalogFolder(
  value: string
): value is ManagedCatalogFolder {
  return (MANAGED_CATALOG_FOLDERS as readonly string[]).includes(value);
}

export function getManagedCatalogObjectPath(
  imageUrl: string,
  bucketName: string
): string | null {
  let url: URL;
  try {
    url = new URL(imageUrl);
  } catch {
    return null;
  }

  if (url.hostname !== "storage.googleapis.com") {
    return null;
  }

  const pathParts = url.pathname.split("/").filter(Boolean);
  if (pathParts.length < 2) {
    return null;
  }

  const [bucket, ...objectParts] = pathParts;
  if (bucket !== bucketName) {
    return null;
  }

  const objectPath = decodeURIComponent(objectParts.join("/"));
  const [folder] = objectPath.split("/");
  if (!folder || !isManagedCatalogFolder(folder)) {
    return null;
  }

  return objectPath;
}

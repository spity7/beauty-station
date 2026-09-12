export function buildCatalogReferenceDeleteError(
  entity: "attribute" | "brand" | "category",
  productCount: number
): string {
  return `Cannot delete ${entity}: ${productCount} product(s) still reference it`;
}

export function resolveCatalogReferenceDeleteError(
  entity: "attribute" | "brand" | "category",
  ids: string[],
  rows: Array<{ id: string; count?: number; products?: number }>
): string | null {
  if (ids.length !== 1) {
    return null;
  }

  const row = rows.find((item) => item.id === ids[0]);
  if (!row) {
    return null;
  }

  const productCount =
    entity === "attribute" ? row.products : row.count;
  if (typeof productCount !== "number" || productCount <= 0) {
    return null;
  }

  return buildCatalogReferenceDeleteError(entity, productCount);
}

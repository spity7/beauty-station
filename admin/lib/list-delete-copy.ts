const ENTITY_PLURALS: Record<string, string> = {
  attribute: "attributes",
  brand: "brands",
  category: "categories",
  customer: "customers",
  product: "products",
};

export function pluralEntityName(singular: string, count: number): string {
  if (count === 1) {
    return singular;
  }

  return ENTITY_PLURALS[singular] ?? `${singular}s`;
}

export function buildDeleteDialogTitle(
  count: number,
  entityName: string,
  firstLabel?: string
): string {
  if (count === 1 && firstLabel) {
    return `Delete “${firstLabel}”?`;
  }

  return `Delete ${count} ${pluralEntityName(entityName, count)}?`;
}

export function buildDeleteDialogIntro(
  count: number,
  entityName: string
): string {
  const plural = pluralEntityName(entityName, count);
  if (count === 1) {
    return `You are about to delete this ${entityName}:`;
  }

  return `You are about to delete these ${count} ${plural}:`;
}

export function buildDeleteDialogDescription(
  count: number,
  entityName: string
): string {
  const plural = pluralEntityName(entityName, count);
  const subject = count === 1 ? `This ${entityName}` : `These ${plural}`;

  if (entityName === "customer") {
    return `${subject} will be removed from the customer directory. Order history will remain, but the profile will no longer appear in admin lists. This action cannot be undone.`;
  }

  if (
    entityName === "category" ||
    entityName === "brand" ||
    entityName === "attribute" ||
    entityName === "product"
  ) {
    return `${subject} will be permanently removed from your catalog. Assigned relationships and storefront listings may be affected. This action cannot be undone.`;
  }

  return `${subject} will be permanently removed. This action cannot be undone.`;
}

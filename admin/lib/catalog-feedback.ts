import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type CatalogEntity = "attribute" | "brand" | "category" | "product";

const ENTITY_LABEL: Record<CatalogEntity, string> = {
  category: "Category",
  brand: "Brand",
  attribute: "Attribute",
  product: "Product",
};

function displayName(name: string, entity: CatalogEntity): string {
  const trimmed = name.trim();
  return trimmed || ENTITY_LABEL[entity];
}

export function catalogSaveToastMessage(
  entity: CatalogEntity,
  mode: "add" | "edit",
  name: string
): string {
  const label = ENTITY_LABEL[entity];
  const value = displayName(name, entity);
  return mode === "add"
    ? `${label} "${value}" created`
    : `${label} "${value}" updated`;
}

export function catalogDeleteToastMessage(
  entity: CatalogEntity,
  count: number
): string {
  const label = ENTITY_LABEL[entity].toLowerCase();
  if (count === 1) {
    return `${ENTITY_LABEL[entity]} deleted`;
  }
  return `${count} ${label}s deleted`;
}

export function finishCatalogSave(options: {
  entity: CatalogEntity;
  listHref: string;
  mode: "add" | "edit";
  name: string;
  router: AppRouterInstance;
  showToast: (message: string) => void;
}): void {
  options.showToast(
    catalogSaveToastMessage(options.entity, options.mode, options.name)
  );
  options.router.push(options.listHref);
  options.router.refresh();
}

export async function finishCatalogDelete(options: {
  count: number;
  entity: CatalogEntity;
  router: AppRouterInstance;
  showToast: (message: string) => void;
}): Promise<void> {
  options.showToast(catalogDeleteToastMessage(options.entity, options.count));
  options.router.refresh();
}

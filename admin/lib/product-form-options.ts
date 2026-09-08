import { fetchBrands, fetchCategories } from "@platform/api-client";
import type { BrandDto, CategoryDto } from "@platform/shared";

export type ProductFormPickOption = {
  id: string;
  inactive?: boolean;
  name: string;
  status: "archived" | "draft" | "published";
};

function mapCategoryOption(category: CategoryDto): ProductFormPickOption {
  return toProductFormPickOption({
    id: category.id,
    name: category.name,
    status: category.status,
  });
}

function mapBrandOption(brand: BrandDto): ProductFormPickOption {
  return toProductFormPickOption({
    id: brand.id,
    name: brand.name,
    status: brand.status,
  });
}

async function loadPublishedAndCatalogCategories(assignedCategoryId?: string) {
  const needsCatalog = Boolean(assignedCategoryId);
  const [publishedRes, catalogRes] = await Promise.all([
    fetchCategories({ limit: 100, status: "published" }),
    needsCatalog
      ? fetchCategories({ limit: 100 })
      : Promise.resolve({ data: [] as CategoryDto[] }),
  ]);

  return mergeProductFormPickOptions(
    publishedRes.data.map(mapCategoryOption),
    catalogRes.data.map(mapCategoryOption),
    assignedCategoryId
  );
}

async function loadPublishedAndCatalogBrands(assignedBrandId?: string) {
  const needsCatalog = Boolean(assignedBrandId);
  const [publishedRes, catalogRes] = await Promise.all([
    fetchBrands({ limit: 100, status: "published" }),
    needsCatalog
      ? fetchBrands({ limit: 100 })
      : Promise.resolve({ data: [] as BrandDto[] }),
  ]);

  return mergeProductFormPickOptions(
    publishedRes.data.map(mapBrandOption),
    catalogRes.data.map(mapBrandOption),
    assignedBrandId
  );
}

export async function loadProductFormCategoryOptions(
  assignedCategoryId?: string
) {
  return loadPublishedAndCatalogCategories(assignedCategoryId);
}

export async function loadProductFormBrandOptions(assignedBrandId?: string) {
  return loadPublishedAndCatalogBrands(assignedBrandId);
}

export function toProductFormPickOption(entity: {
  id: string;
  name: string;
  status: ProductFormPickOption["status"];
}): ProductFormPickOption {
  return {
    id: entity.id,
    name: entity.name,
    status: entity.status,
  };
}

export function mergeProductFormPickOptions(
  published: ProductFormPickOption[],
  catalog: ProductFormPickOption[],
  assignedId?: string
): ProductFormPickOption[] {
  const merged = new Map(published.map((option) => [option.id, option]));

  if (assignedId && !merged.has(assignedId)) {
    const assigned = catalog.find((option) => option.id === assignedId);
    if (assigned) {
      merged.set(assignedId, { ...assigned, inactive: true });
    }
  }

  return Array.from(merged.values()).sort((left, right) =>
    left.name.localeCompare(right.name)
  );
}

export function productFormPickLabel(option: ProductFormPickOption): string {
  if (!option.inactive) {
    return option.name;
  }

  if (option.status === "archived") {
    return `${option.name} (archived)`;
  }

  return `${option.name} (draft)`;
}

export function getPublishLinkError(
  status: string,
  categoryId: string,
  brandId: string,
  categories: ProductFormPickOption[],
  brands: ProductFormPickOption[]
): string | null {
  if (status !== "published") {
    return null;
  }

  if (categoryId) {
    const category = categories.find((option) => option.id === categoryId);
    if (category?.inactive || category?.status !== "published") {
      return `Cannot publish product: category "${category?.name ?? "Unknown"}" is not published.`;
    }
  }

  if (brandId) {
    const brand = brands.find((option) => option.id === brandId);
    if (brand?.inactive || brand?.status !== "published") {
      const detail =
        brand?.status === "archived"
          ? "archived"
          : brand?.status === "draft"
            ? "a draft"
            : "not published";
      return `Cannot publish product: brand "${brand?.name ?? "Unknown"}" is ${detail}.`;
    }
  }

  return null;
}

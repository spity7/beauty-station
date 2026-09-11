import { roundedCategories } from "@/data/categories";
import {
  fetchPublishedCategories,
  fetchStorefrontBrands,
} from "@platform/api-client";
import type { BrandDto } from "@platform/shared";
import {
  mapCategoryDtosToStorefront,
  type StorefrontCategoryItem,
} from "@/lib/mappers/catalog";

export type { StorefrontCategoryItem };

export function buildFallbackStorefrontCategories(): StorefrontCategoryItem[] {
  return roundedCategories.map((category, index) => ({
    id: String(index),
    name: category.title ?? "Category",
    image: category.imgSrc ?? "",
    href: "/shop",
  }));
}

export async function loadPublishedCategories(
  limit = 100
): Promise<StorefrontCategoryItem[]> {
  try {
    const response = await fetchPublishedCategories(limit);
    if (response.data.length === 0) {
      return [];
    }
    return mapCategoryDtosToStorefront(response.data);
  } catch {
    return [];
  }
}

export async function loadStorefrontCategories(
  limit = 100,
  options?: { useFallback?: boolean }
): Promise<StorefrontCategoryItem[]> {
  const categories = await loadPublishedCategories(limit);
  if (categories.length > 0) {
    return categories;
  }
  return options?.useFallback ? buildFallbackStorefrontCategories() : [];
}

export async function loadStorefrontBrands(limit = 100): Promise<BrandDto[]> {
  try {
    const response = await fetchStorefrontBrands(limit);
    return response.data;
  } catch {
    return [];
  }
}

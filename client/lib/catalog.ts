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

export async function loadStorefrontBrands(limit = 100): Promise<BrandDto[]> {
  try {
    const response = await fetchStorefrontBrands(limit);
    return response.data;
  } catch {
    return [];
  }
}

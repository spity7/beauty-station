import type { BrandDto } from "@platform/shared";
import type {
  ShopBrandFilterOption,
  ShopCatalogFilters,
  ShopCategoryFilterOption,
  ShopInitialFilters,
} from "@/types/shop-catalog";
import {
  loadPublishedCategories,
  loadStorefrontBrands,
  type StorefrontCategoryItem,
} from "@/lib/catalog";

export function mapStorefrontCategoriesToFilterOptions(
  categories: StorefrontCategoryItem[]
): ShopCategoryFilterOption[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    productCount: category.productCount,
  }));
}

export function mapStorefrontBrandsToFilterOptions(
  brands: BrandDto[]
): ShopBrandFilterOption[] {
  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    initials: brand.initials,
    tileClass: brand.tileClass,
    productCount: brand.productCount,
  }));
}

export async function loadShopCatalogFilters(): Promise<ShopCatalogFilters> {
  const [categories, brands] = await Promise.all([
    loadPublishedCategories(100),
    loadStorefrontBrands(100),
  ]);

  return {
    categories: mapStorefrontCategoriesToFilterOptions(categories),
    brands: mapStorefrontBrandsToFilterOptions(brands),
  };
}

export function resolveShopInitialFilters(
  catalogFilters: ShopCatalogFilters,
  params: { brandId?: string; categoryId?: string }
): ShopInitialFilters {
  const category = params.categoryId
    ? catalogFilters.categories.find((item) => item.id === params.categoryId)
    : undefined;
  const brand = params.brandId
    ? catalogFilters.brands.find((item) => item.id === params.brandId)
    : undefined;

  return {
    categoryNames: category ? [category.name] : [],
    brandNames: brand ? [brand.name] : [],
  };
}

import {
  fetchPublishedCategories,
  fetchStorefrontBrands,
} from "@platform/api-client";
import {
  mapStorefrontBrandsToFilterOptions,
  mapStorefrontCategoriesToFilterOptions,
} from "@/lib/shop-catalog";
import { mapCategoryDtosToStorefront } from "@/lib/mappers/catalog";
import { mapProductDtosToStorefront } from "@/lib/mappers/product";
import { shopCatalogQueryToProductParams } from "@/lib/shop-query";
import type { ShopCatalogQuery } from "@/lib/shop-query";
import type { Product } from "@/types/product";
import type {
  ShopCatalogFilters,
  ShopCatalogPagination,
} from "@/types/shop-catalog";
import { ApiError, fetchProducts } from "@platform/api-client";
import {
  buildDynamicPriceFilterMeta,
  type ShopPriceFilterMeta,
} from "@/lib/shop-price-ranges";

export type ShopProductsLoadError = "invalid_query" | "unavailable";

export type ShopProductsLoadResult = {
  catalogPagination?: ShopCatalogPagination;
  products: Product[];
  productsLoadError?: ShopProductsLoadError;
};

export type ShopFiltersLoadResult = {
  filters: ShopCatalogFilters;
  filtersLoadError?: boolean;
};

export async function loadShopProductsForPage(
  query: ShopCatalogQuery
): Promise<ShopProductsLoadResult> {
  try {
    const response = await fetchProducts(
      shopCatalogQueryToProductParams(query)
    );
    return {
      products: mapProductDtosToStorefront(response.data),
      catalogPagination: {
        limit: response.limit,
        page: response.page,
        total: response.total,
      },
    };
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status >= 400 &&
      error.status < 500
    ) {
      return {
        products: [],
        productsLoadError: "invalid_query",
      };
    }
    return {
      products: [],
      productsLoadError: "unavailable",
    };
  }
}

export async function loadPublishedProductPriceBounds(): Promise<{
  min: number;
  max: number;
} | null> {
  try {
    const [cheapest, priciest] = await Promise.all([
      fetchProducts({ limit: 1, page: 1, sort: "price_asc" }),
      fetchProducts({ limit: 1, page: 1, sort: "price_desc" }),
    ]);

    if (cheapest.total === 0 || cheapest.data.length === 0) {
      return null;
    }

    const min = cheapest.data[0].price;
    const max = priciest.data[0]?.price ?? min;

    return {
      min: Number.isFinite(min) ? min : 0,
      max: Number.isFinite(max) ? max : min,
    };
  } catch {
    return null;
  }
}

export async function loadShopPriceFilterMeta(): Promise<
  ShopPriceFilterMeta | undefined
> {
  const bounds = await loadPublishedProductPriceBounds();
  if (!bounds) {
    return undefined;
  }
  return buildDynamicPriceFilterMeta(bounds.min, bounds.max);
}

export async function loadShopCatalogFiltersForPage(): Promise<ShopFiltersLoadResult> {
  let categories: ShopCatalogFilters["categories"] = [];
  let brands: ShopCatalogFilters["brands"] = [];
  let priceFilter: ShopCatalogFilters["priceFilter"];
  let filtersLoadError = false;

  const [categoriesResult, brandsResult, priceFilterResult] =
    await Promise.allSettled([
      fetchPublishedCategories(100),
      fetchStorefrontBrands(100),
      loadShopPriceFilterMeta(),
    ]);

  if (categoriesResult.status === "fulfilled") {
    categories = mapStorefrontCategoriesToFilterOptions(
      mapCategoryDtosToStorefront(categoriesResult.value.data)
    );
  } else {
    filtersLoadError = true;
  }

  if (brandsResult.status === "fulfilled") {
    brands = mapStorefrontBrandsToFilterOptions(brandsResult.value.data);
  } else {
    filtersLoadError = true;
  }

  if (priceFilterResult.status === "fulfilled") {
    priceFilter = priceFilterResult.value;
  }

  return {
    filters: { categories, brands, priceFilter },
    filtersLoadError,
  };
}

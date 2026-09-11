import type { ProductSort } from "@platform/shared";

export type ShopCatalogQuery = {
  page: number;
  brandId?: string;
  categoryId?: string;
  search?: string;
  sort?: ProductSort;
  minPrice?: number;
  maxPrice?: number;
};

const SORT_LABELS: Record<ProductSort, string> = {
  newest: "Sort by (Default)",
  price_asc: "Price Ascending",
  price_desc: "Price Descending",
  title_asc: "Title Ascending",
  title_desc: "Title Descending",
};

const LABEL_TO_SORT = Object.fromEntries(
  Object.entries(SORT_LABELS).map(([sort, label]) => [label, sort])
) as Record<string, ProductSort>;

export function sortLabelToApiValue(label: string): ProductSort | undefined {
  return LABEL_TO_SORT[label];
}

export function sortApiValueToLabel(sort: ProductSort | undefined): string {
  if (!sort) {
    return SORT_LABELS.newest;
  }
  return SORT_LABELS[sort] ?? SORT_LABELS.newest;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseSort(value: string | undefined): ProductSort | undefined {
  if (!value) {
    return undefined;
  }
  if (
    value === "newest" ||
    value === "price_asc" ||
    value === "price_desc" ||
    value === "title_asc" ||
    value === "title_desc"
  ) {
    return value;
  }
  return undefined;
}

export function parseShopCatalogQuery(
  params: Record<string, string | undefined>
): ShopCatalogQuery {
  return {
    page: parsePositiveInt(params.page, 1),
    brandId: params.brandId?.trim() || undefined,
    categoryId: params.categoryId?.trim() || undefined,
    search: params.search?.trim() || undefined,
    sort: parseSort(params.sort),
    minPrice: parseOptionalNumber(params.minPrice),
    maxPrice: parseOptionalNumber(params.maxPrice),
  };
}

export function buildShopCatalogSearchParams(
  query: ShopCatalogQuery
): URLSearchParams {
  const params = new URLSearchParams();

  if (query.search) {
    params.set("search", query.search);
  }
  if (query.categoryId) {
    params.set("categoryId", query.categoryId);
  }
  if (query.brandId) {
    params.set("brandId", query.brandId);
  }
  if (query.sort && query.sort !== "newest") {
    params.set("sort", query.sort);
  }
  if (query.minPrice !== undefined) {
    params.set("minPrice", String(query.minPrice));
  }
  if (query.maxPrice !== undefined) {
    params.set("maxPrice", String(query.maxPrice));
  }
  if (query.page > 1) {
    params.set("page", String(query.page));
  }

  return params;
}

export function buildShopCatalogHref(query: ShopCatalogQuery): string {
  const params = buildShopCatalogSearchParams(query);
  const search = params.toString();
  return search ? `/shop?${search}` : "/shop";
}

export function shopCatalogQueryToProductParams(query: ShopCatalogQuery) {
  return {
    page: query.page,
    limit: 15,
    brandId: query.brandId,
    categoryId: query.categoryId,
    search: query.search,
    sort: query.sort,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
  };
}

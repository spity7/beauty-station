export type ShopCategoryFilterOption = {
  id: string;
  name: string;
  productCount?: number;
};

import type { ShopPriceFilterMeta } from "@/lib/shop-price-ranges";

export type ShopBrandFilterOption = {
  avatarClass?: string;
  id: string;
  initials?: string;
  name: string;
  productCount?: number;
  tileClass?: string;
};

export type ShopCatalogFilters = {
  brands: ShopBrandFilterOption[];
  categories: ShopCategoryFilterOption[];
  priceFilter?: ShopPriceFilterMeta;
};

export type ShopInitialFilters = {
  brandId?: string;
  brandNames?: string[];
  categoryId?: string;
  categoryNames?: string[];
  maxPrice?: number;
  minPrice?: number;
  search?: string;
  sort?: import("@platform/shared").ProductSort;
};

export type ShopCatalogPagination = {
  limit: number;
  page: number;
  total: number;
};

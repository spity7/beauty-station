export type ShopCategoryFilterOption = {
  id: string;
  name: string;
  productCount?: number;
};

export type ShopBrandFilterOption = {
  id: string;
  initials?: string;
  name: string;
  productCount?: number;
  tileClass?: string;
};

export type ShopCatalogFilters = {
  brands: ShopBrandFilterOption[];
  categories: ShopCategoryFilterOption[];
};

export type ShopInitialFilters = {
  brandNames?: string[];
  categoryNames?: string[];
};

export type ShopCatalogPagination = {
  limit: number;
  page: number;
  total: number;
};

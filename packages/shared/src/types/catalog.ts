export const PRODUCT_STATUSES = ["draft", "published", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_SORT_OPTIONS = [
  "newest",
  "price_asc",
  "price_desc",
  "title_asc",
  "title_desc",
] as const;
export type ProductSort = (typeof PRODUCT_SORT_OPTIONS)[number];

export const CATEGORY_STATUSES = ["draft", "published"] as const;
export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export const BRAND_STATUSES = ["draft", "published", "archived"] as const;
export type BrandStatus = (typeof BRAND_STATUSES)[number];

export const BRAND_VISIBILITY = ["Featured", "Standard", "Hidden"] as const;
export type BrandVisibility = (typeof BRAND_VISIBILITY)[number];

export const ATTRIBUTE_STATUSES = ["draft", "published"] as const;
export type AttributeStatus = (typeof ATTRIBUTE_STATUSES)[number];

export const ATTRIBUTE_DISPLAY_TYPES = ["Dropdown", "Swatch", "Text"] as const;
export type AttributeDisplayType = (typeof ATTRIBUTE_DISPLAY_TYPES)[number];

export type {
  AttributeDto,
  BrandDto,
  CategoryDto,
  PaginatedResponse,
  ProductDto,
} from "../schemas/dto.js";

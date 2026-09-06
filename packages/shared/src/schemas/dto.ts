import { z } from "../zod.js";
import {
  ATTRIBUTE_DISPLAY_TYPES,
  ATTRIBUTE_STATUSES,
  BRAND_STATUSES,
  BRAND_VISIBILITY,
  CATEGORY_STATUSES,
  PRODUCT_STATUSES,
} from "../types/catalog.js";

export const productDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  sku: z.string(),
  description: z.string(),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  stock: z.number().int(),
  status: z.enum(PRODUCT_STATUSES),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  brandId: z.string().optional(),
  brandName: z.string().optional(),
  images: z.array(z.string()),
  attributes: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const categoryDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string(),
  status: z.enum(CATEGORY_STATUSES),
  productCount: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const brandDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  website: z.string(),
  initials: z.string(),
  tileClass: z.string(),
  visibility: z.enum(BRAND_VISIBILITY),
  status: z.enum(BRAND_STATUSES),
  productCount: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const attributeDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  displayType: z.enum(ATTRIBUTE_DISPLAY_TYPES),
  description: z.string(),
  status: z.enum(ATTRIBUTE_STATUSES),
  values: z.array(z.string()),
  productCount: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const paginatedProductsSchema = z.object({
  data: z.array(productDtoSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export const paginatedCategoriesSchema = z.object({
  data: z.array(categoryDtoSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export const paginatedBrandsSchema = z.object({
  data: z.array(brandDtoSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export const paginatedAttributesSchema = z.object({
  data: z.array(attributeDtoSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export const healthResponseSchema = z.object({
  ok: z.boolean(),
  service: z.string(),
  siteId: z.string(),
  siteName: z.string(),
  environment: z.string(),
  database: z.enum(["connected", "disconnected"]),
  gcs: z.enum(["configured", "not_configured"]),
  mail: z.enum(["configured", "not_configured"]),
  timestamp: z.string().datetime(),
});

export const uploadResponseSchema = z.object({
  fileName: z.string(),
  publicUrl: z.string().url(),
});

export const deleteUploadSchema = z.object({
  url: z.string().url(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});

export const validationErrorResponseSchema = z.object({
  error: z.string(),
  details: z.record(z.string(), z.array(z.string()).optional()),
});

export type ProductDto = z.infer<typeof productDtoSchema>;
export type CategoryDto = z.infer<typeof categoryDtoSchema>;
export type BrandDto = z.infer<typeof brandDtoSchema>;
export type AttributeDto = z.infer<typeof attributeDtoSchema>;

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

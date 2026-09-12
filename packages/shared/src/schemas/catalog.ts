import { z } from "../zod.js";
import { PRODUCT_SORT_OPTIONS } from "../types/catalog.js";
import {
  ATTRIBUTE_DISPLAY_TYPES,
  ATTRIBUTE_STATUSES,
  BRAND_STATUSES,
  BRAND_VISIBILITY,
  CATEGORY_STATUSES,
  PRODUCT_STATUSES,
} from "../types/catalog.js";

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  sku: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional().default(""),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).default(0),
  status: z.enum(PRODUCT_STATUSES).default("draft"),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  images: z.array(z.string()).default([]),
  attributes: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .default({}),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// PATCH bodies must not inherit create defaults — `.partial()` on defaulted fields
// still applies defaults for omitted keys and would overwrite unrelated fields.
export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  sku: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  images: z.array(z.string()).optional(),
  attributes: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const categoryImageSchema = z
  .string()
  .trim()
  .min(1, "Category image is required");

export const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  image: categoryImageSchema,
  status: z.enum(CATEGORY_STATUSES).default("draft"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  image: categoryImageSchema.optional(),
  status: z.enum(CATEGORY_STATUSES).optional(),
});

export const createBrandSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  website: z.string().max(500).default(""),
  initials: z.string().max(4).optional(),
  tileClass: z.string().default("bg-brand-50 text-brand-600"),
  visibility: z.enum(BRAND_VISIBILITY).default("Standard"),
  status: z.enum(BRAND_STATUSES).default("draft"),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  website: z.string().max(500).optional(),
  initials: z.string().max(4).optional(),
  tileClass: z.string().optional(),
  visibility: z.enum(BRAND_VISIBILITY).optional(),
  status: z.enum(BRAND_STATUSES).optional(),
});

export const createAttributeSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  displayType: z.enum(ATTRIBUTE_DISPLAY_TYPES).default("Dropdown"),
  description: z.string().max(1000).default(""),
  status: z.enum(ATTRIBUTE_STATUSES).default("draft"),
  values: z.array(z.string().min(1)).default([]),
});

export const updateAttributeSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  displayType: z.enum(ATTRIBUTE_DISPLAY_TYPES).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(ATTRIBUTE_STATUSES).optional(),
  values: z.array(z.string().min(1)).optional(),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  search: z.string().optional(),
});

export const productListQuerySchema = listQuerySchema.extend({
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(PRODUCT_SORT_OPTIONS).optional(),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

import mongoose from "mongoose";
import type { z } from "zod";
import type { ProductSort } from "@platform/shared";
import type { productListQuerySchema } from "@platform/shared";
import { AppError } from "../middleware/errorHandler.js";

type ProductListQuery = z.infer<typeof productListQuerySchema>;

const MAX_SEARCH_LENGTH = 100;

function parseObjectId(value: string, field: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(400, `Invalid ${field}`);
  }
  return new mongoose.Types.ObjectId(value);
}

/** Escape user input for safe use inside a MongoDB $regex pattern. */
export function escapeRegexSearchTerm(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSearchOrClause(search: string): Record<string, unknown> {
  const trimmed = search.trim().slice(0, MAX_SEARCH_LENGTH);
  if (!trimmed) {
    return {};
  }
  const pattern = {
    $regex: escapeRegexSearchTerm(trimmed),
    $options: "i",
  };
  return {
    $or: [
      { name: pattern },
      { sku: pattern },
      { description: pattern },
      { slug: pattern },
    ],
  };
}

export function buildProductListFilter(
  query: ProductListQuery,
  isAdmin: boolean
): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (isAdmin) {
    if (query.status) {
      filter.status = query.status;
    }
  } else {
    filter.status = "published";
  }

  if (query.search?.trim()) {
    Object.assign(filter, buildSearchOrClause(query.search));
  }

  if (query.categoryId) {
    filter.categoryId = parseObjectId(query.categoryId, "categoryId");
  }

  if (query.brandId) {
    filter.brandId = parseObjectId(query.brandId, "brandId");
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (query.minPrice !== undefined) {
      priceFilter.$gte = query.minPrice;
    }
    if (query.maxPrice !== undefined) {
      priceFilter.$lte = query.maxPrice;
    }
    filter.price = priceFilter;
  }

  return filter;
}

export function buildProductListSort(
  sort: ProductSort | undefined
): Record<string, 1 | -1> {
  switch (sort) {
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "title_asc":
      return { name: 1 };
    case "title_desc":
      return { name: -1 };
    default:
      return { createdAt: -1 };
  }
}

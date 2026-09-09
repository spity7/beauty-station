import mongoose from "mongoose";
import type { z } from "zod";
import type { productListQuerySchema } from "@platform/shared";
import { AppError } from "../middleware/errorHandler.js";

type ProductListQuery = z.infer<typeof productListQuerySchema>;

function parseObjectId(value: string, field: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(400, `Invalid ${field}`);
  }
  return new mongoose.Types.ObjectId(value);
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

  if (query.search) {
    filter.$text = { $search: query.search };
  }

  if (query.categoryId) {
    filter.categoryId = parseObjectId(query.categoryId, "categoryId");
  }

  if (query.brandId) {
    filter.brandId = parseObjectId(query.brandId, "brandId");
  }

  return filter;
}

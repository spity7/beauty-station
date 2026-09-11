import { Router } from "express";
import {
  createBrandSchema,
  listQuerySchema,
  updateBrandSchema,
} from "@platform/shared";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { Brand } from "../models/Brand.js";
import { Product } from "../models/Product.js";
import { syncProductBrandNames } from "../utils/catalog-relations.js";
import { catalogReadRateLimiter } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isUniqueKeyError, toBrandDto } from "../utils/serializers.js";
import { getInitials, slugify } from "../utils/strings.js";

function normalizeInitials(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = value.trim().toUpperCase().slice(0, 4);
  return normalized || undefined;
}

export const brandsRouter = Router();

brandsRouter.get(
  "/",
  catalogReadRateLimiter,
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query);
    const filter: Record<string, unknown> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.name = { $regex: query.search, $options: "i" };
    }

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      Brand.find(filter).sort({ name: 1 }).skip(skip).limit(query.limit),
      Brand.countDocuments(filter),
    ]);

    res.json({
      data: items.map(toBrandDto),
      total,
      page: query.page,
      limit: query.limit,
    });
  })
);

brandsRouter.get(
  "/:id",
  catalogReadRateLimiter,
  asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      throw new AppError(404, "Brand not found");
    }
    res.json(toBrandDto(brand));
  })
);

brandsRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = createBrandSchema.parse(req.body);
    const slug = slugify(payload.name);
    const initials =
      normalizeInitials(payload.initials) ?? getInitials(payload.name);

    try {
      const brand = await Brand.create({
        name: payload.name,
        website: payload.website,
        initials,
        tileClass: payload.tileClass,
        visibility: payload.visibility,
        status: payload.status,
        slug,
      });
      res.status(201).json(toBrandDto(brand));
    } catch (error) {
      if (isUniqueKeyError(error)) {
        throw new AppError(409, "Brand slug already exists");
      }
      throw error;
    }
  })
);

brandsRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = updateBrandSchema.parse(req.body);
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      throw new AppError(404, "Brand not found");
    }

    const previousName = brand.name;

    if (payload.name) {
      brand.name = payload.name;
      brand.slug = slugify(payload.name);
      if (!normalizeInitials(payload.initials)) {
        brand.initials = getInitials(payload.name);
      }
    }
    if (payload.website !== undefined) {
      brand.website = payload.website;
    }
    if (payload.initials !== undefined) {
      brand.initials =
        normalizeInitials(payload.initials) ?? getInitials(brand.name);
    }
    if (payload.tileClass !== undefined) {
      brand.tileClass = payload.tileClass;
    }
    if (payload.visibility !== undefined) {
      brand.visibility = payload.visibility;
    }
    if (payload.status !== undefined) {
      brand.status = payload.status;
    }

    await brand.save();

    if (payload.name && payload.name !== previousName) {
      await syncProductBrandNames(brand._id, brand.name);
    }

    res.json(toBrandDto(brand));
  })
);

brandsRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      throw new AppError(404, "Brand not found");
    }

    const referencingProducts = await Product.countDocuments({
      brandId: brand._id,
    });
    if (referencingProducts > 0) {
      throw new AppError(
        409,
        `Cannot delete brand: ${referencingProducts} product(s) still reference it`
      );
    }

    await brand.deleteOne();
    res.status(204).send();
  })
);

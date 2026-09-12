import { Router } from "express";
import {
  createCategorySchema,
  listQuerySchema,
  updateCategorySchema,
} from "@platform/shared";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import {
  syncCategoryProductCount,
  syncProductCategoryNames,
} from "../utils/catalog-relations.js";
import { catalogReadRateLimiter } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isUniqueKeyError, toCategoryDto } from "../utils/serializers.js";
import { slugify } from "../utils/strings.js";
import {
  collectRemovedManagedCatalogImages,
  deleteManagedCatalogImageIfPresent,
  deleteManagedCatalogImagesIfPresent,
} from "../services/managed-catalog-storage.js";

export const categoriesRouter = Router();

function assertCategoryHasImage(image: string | undefined | null): void {
  if (!image?.trim()) {
    throw new AppError(400, "Category image is required");
  }
}

categoriesRouter.get(
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
      Category.find(filter).sort({ name: 1 }).skip(skip).limit(query.limit),
      Category.countDocuments(filter),
    ]);

    await Promise.all(
      items.map((category) => syncCategoryProductCount(category))
    );

    res.json({
      data: items.map(toCategoryDto),
      total,
      page: query.page,
      limit: query.limit,
    });
  })
);

categoriesRouter.get(
  "/:id",
  catalogReadRateLimiter,
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new AppError(404, "Category not found");
    }
    await syncCategoryProductCount(category);
    res.json(toCategoryDto(category));
  })
);

categoriesRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = createCategorySchema.parse(req.body);
    assertCategoryHasImage(payload.image);
    const slug = slugify(payload.name);

    try {
      const category = await Category.create({
        name: payload.name,
        image: payload.image,
        status: payload.status,
        slug,
      });
      res.status(201).json(toCategoryDto(category));
    } catch (error) {
      if (isUniqueKeyError(error)) {
        throw new AppError(409, "Category slug already exists");
      }
      throw error;
    }
  })
);

categoriesRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = updateCategorySchema.parse(req.body);
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new AppError(404, "Category not found");
    }

    const previousName = category.name;
    const previousImage = category.image;

    if (payload.name) {
      category.name = payload.name;
      category.slug = slugify(payload.name);
    }
    if (payload.image !== undefined) {
      category.image = payload.image;
    }
    if (payload.status !== undefined) {
      category.status = payload.status;
    }

    assertCategoryHasImage(category.image);

    try {
      await category.save();
    } catch (error) {
      if (isUniqueKeyError(error)) {
        throw new AppError(409, "Category slug already exists");
      }
      throw error;
    }

    if (payload.name && payload.name !== previousName) {
      await syncProductCategoryNames(category._id, category.name);
    }

    if (payload.image !== undefined) {
      await deleteManagedCatalogImagesIfPresent(
        collectRemovedManagedCatalogImages(
          previousImage ? [previousImage] : [],
          category.image ? [category.image] : []
        )
      );
    }

    res.json(toCategoryDto(category));
  })
);

categoriesRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new AppError(404, "Category not found");
    }

    const referencingProducts = await Product.countDocuments({
      categoryId: category._id,
    });
    if (referencingProducts > 0) {
      throw new AppError(
        409,
        `Cannot delete category: ${referencingProducts} product(s) still reference it`
      );
    }

    await deleteManagedCatalogImageIfPresent(category.image);
    await category.deleteOne();
    res.status(204).send();
  })
);

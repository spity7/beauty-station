import { Router } from "express";
import {
  createProductSchema,
  productListQuerySchema,
  updateProductSchema,
} from "@platform/shared";
import { AppError } from "../middleware/errorHandler.js";
import {
  optionalAuth,
  requireAuth,
  requireAdmin,
  type AuthenticatedRequest,
} from "../middleware/auth.js";
import { Category } from "../models/Category.js";
import { Brand } from "../models/Brand.js";
import { Product } from "../models/Product.js";
import {
  adjustAttributeProductCounts,
  diffAttributeSlugCounts,
  extractAttributeSlugs,
  requireBrand,
  requireCategory,
  assertPublishableProductLinks,
  validateProductAttributes,
} from "../utils/catalog-relations.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isUniqueKeyError, toProductDto } from "../utils/serializers.js";
import { generateSku, slugify } from "../utils/strings.js";
import {
  collectRemovedManagedCatalogImages,
  deleteManagedCatalogImagesIfPresent,
} from "../services/managed-catalog-storage.js";
import { catalogReadRateLimiter } from "../middleware/rateLimit.js";
import {
  buildProductListFilter,
  buildProductListSort,
} from "../utils/product-list-filter.js";

function isAdminRequest(req: AuthenticatedRequest): boolean {
  return req.auth?.role === "admin";
}

export const productsRouter = Router();

productsRouter.get(
  "/slug/:slug",
  catalogReadRateLimiter,
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: "published",
    });
    if (!product) {
      throw new AppError(404, "Product not found");
    }
    res.json(toProductDto(product));
  })
);

productsRouter.get(
  "/",
  catalogReadRateLimiter,
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const query = productListQuerySchema.parse(req.query);
    const filter = buildProductListFilter(query, isAdminRequest(req));
    const sort = buildProductListSort(query.sort);

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(query.limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      data: items.map(toProductDto),
      total,
      page: query.page,
      limit: query.limit,
    });
  })
);

productsRouter.get(
  "/:id",
  catalogReadRateLimiter,
  optionalAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError(404, "Product not found");
    }
    if (!isAdminRequest(req) && product.status !== "published") {
      throw new AppError(404, "Product not found");
    }
    res.json(toProductDto(product));
  })
);

productsRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = createProductSchema.parse(req.body);
    const slug = slugify(payload.name);
    const attributes = await validateProductAttributes(payload.attributes);
    const sku = payload.sku?.trim() || generateSku(payload.name);

    const category = payload.categoryId
      ? await requireCategory(payload.categoryId)
      : null;
    const brand = payload.brandId ? await requireBrand(payload.brandId) : null;

    await assertPublishableProductLinks({
      status: payload.status,
      categoryId: payload.categoryId,
      brandId: payload.brandId,
    });

    try {
      const product = await Product.create({
        ...payload,
        slug,
        sku,
        attributes,
        categoryName: category?.name ?? "",
        brandName: brand?.name ?? "",
      });

      if (category) {
        await Category.updateOne(
          { _id: category._id },
          { $inc: { productCount: 1 } }
        );
      }
      if (brand) {
        await Brand.updateOne(
          { _id: brand._id },
          { $inc: { productCount: 1 } }
        );
      }

      await adjustAttributeProductCounts(
        Object.fromEntries(
          extractAttributeSlugs(attributes).map((attributeSlug) => [
            attributeSlug,
            1,
          ])
        )
      );

      res.status(201).json(toProductDto(product));
    } catch (error) {
      if (isUniqueKeyError(error)) {
        throw new AppError(409, "Product slug or SKU already exists");
      }
      throw error;
    }
  })
);

productsRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = updateProductSchema.parse(req.body);
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError(404, "Product not found");
    }

    const previousCategoryId = product.categoryId?.toString();
    const previousBrandId = product.brandId?.toString();
    const previousAttributeSlugs = extractAttributeSlugs(
      product.attributes as Record<string, string | string[]>
    );
    const previousImages = [...product.images];

    if (payload.name) {
      product.name = payload.name;
    }

    if (payload.categoryId !== undefined) {
      if (payload.categoryId) {
        const category = await requireCategory(payload.categoryId);
        product.categoryId = category._id;
        product.categoryName = category.name;
      } else {
        product.categoryId = undefined;
        product.categoryName = "";
      }
    }

    if (payload.brandId !== undefined) {
      if (payload.brandId) {
        const brand = await requireBrand(payload.brandId);
        product.brandId = brand._id;
        product.brandName = brand.name;
      } else {
        product.brandId = undefined;
        product.brandName = "";
      }
    }

    if (payload.attributes !== undefined) {
      product.attributes = await validateProductAttributes(payload.attributes);
    }

    const nextStatus = payload.status ?? product.status;
    const publishCategoryId =
      payload.categoryId !== undefined
        ? payload.categoryId || undefined
        : product.categoryId?.toString();
    const publishBrandId =
      payload.brandId !== undefined
        ? payload.brandId || undefined
        : product.brandId?.toString();

    await assertPublishableProductLinks({
      status: nextStatus,
      categoryId: publishCategoryId,
      brandId: publishBrandId,
    });

    const assignable = { ...payload };
    delete assignable.name;
    delete assignable.slug;
    delete assignable.categoryId;
    delete assignable.brandId;
    delete assignable.attributes;
    Object.assign(product, assignable);
    await product.save();

    const nextCategoryId = product.categoryId?.toString();
    const nextBrandId = product.brandId?.toString();
    const nextAttributeSlugs = extractAttributeSlugs(
      product.attributes as Record<string, string | string[]>
    );

    if (previousCategoryId !== nextCategoryId) {
      if (previousCategoryId) {
        await Category.updateOne(
          { _id: previousCategoryId },
          { $inc: { productCount: -1 } }
        );
      }
      if (nextCategoryId) {
        await Category.updateOne(
          { _id: nextCategoryId },
          { $inc: { productCount: 1 } }
        );
      }
    }

    if (previousBrandId !== nextBrandId) {
      if (previousBrandId) {
        await Brand.updateOne(
          { _id: previousBrandId },
          { $inc: { productCount: -1 } }
        );
      }
      if (nextBrandId) {
        await Brand.updateOne(
          { _id: nextBrandId },
          { $inc: { productCount: 1 } }
        );
      }
    }

    await adjustAttributeProductCounts(
      diffAttributeSlugCounts(previousAttributeSlugs, nextAttributeSlugs)
    );

    if (payload.images !== undefined) {
      await deleteManagedCatalogImagesIfPresent(
        collectRemovedManagedCatalogImages(previousImages, product.images)
      );
    }

    res.json(toProductDto(product));
  })
);

productsRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      throw new AppError(404, "Product not found");
    }

    if (product.categoryId) {
      await Category.updateOne(
        { _id: product.categoryId },
        { $inc: { productCount: -1 } }
      );
    }
    if (product.brandId) {
      await Brand.updateOne(
        { _id: product.brandId },
        { $inc: { productCount: -1 } }
      );
    }

    await adjustAttributeProductCounts(
      Object.fromEntries(
        extractAttributeSlugs(
          product.attributes as Record<string, string | string[]>
        ).map((attributeSlug) => [attributeSlug, -1])
      )
    );

    await deleteManagedCatalogImagesIfPresent(product.images);

    res.status(204).send();
  })
);

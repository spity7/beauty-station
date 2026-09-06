import { Router } from "express";
import {
  createProductSchema,
  listQuerySchema,
  updateProductSchema,
} from "@platform/shared";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { Category } from "../models/Category.js";
import { Brand } from "../models/Brand.js";
import { Product } from "../models/Product.js";
import {
  adjustAttributeProductCounts,
  diffAttributeSlugCounts,
  extractAttributeSlugs,
  requireBrand,
  requireCategory,
  validateProductAttributes,
} from "../utils/catalog-relations.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isUniqueKeyError, toProductDto } from "../utils/serializers.js";
import { generateSku, slugify } from "../utils/strings.js";
import {
  collectRemovedManagedCatalogImages,
  deleteManagedCatalogImagesIfPresent,
} from "../services/managed-catalog-storage.js";

export const productsRouter = Router();

productsRouter.get(
  "/slug/:slug",
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      throw new AppError(404, "Product not found");
    }
    res.json(toProductDto(product));
  })
);

productsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listQuerySchema.parse(req.query);
    const filter: Record<string, unknown> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit),
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
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
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

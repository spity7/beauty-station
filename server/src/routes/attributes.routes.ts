import { Router } from "express";
import {
  createAttributeSchema,
  listQuerySchema,
  updateAttributeSchema,
} from "@platform/shared";
import { AppError } from "../middleware/errorHandler.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { Attribute } from "../models/Attribute.js";
import { Product } from "../models/Product.js";
import {
  assertNoProductsUseRemovedAttributeValues,
  countProductsUsingAttributeSlug,
  syncAttributeProductCount,
} from "../utils/catalog-relations.js";
import { catalogReadRateLimiter } from "../middleware/rateLimit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isUniqueKeyError, toAttributeDto } from "../utils/serializers.js";
import { slugify } from "../utils/strings.js";

export const attributesRouter = Router();

attributesRouter.get(
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
      Attribute.find(filter).sort({ name: 1 }).skip(skip).limit(query.limit),
      Attribute.countDocuments(filter),
    ]);

    await Promise.all(
      items.map((attribute) => syncAttributeProductCount(attribute))
    );

    res.json({
      data: items.map(toAttributeDto),
      total,
      page: query.page,
      limit: query.limit,
    });
  })
);

attributesRouter.get(
  "/:id",
  catalogReadRateLimiter,
  asyncHandler(async (req, res) => {
    const attribute = await Attribute.findById(req.params.id);
    if (!attribute) {
      throw new AppError(404, "Attribute not found");
    }
    await syncAttributeProductCount(attribute);
    res.json(toAttributeDto(attribute));
  })
);

attributesRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = createAttributeSchema.parse(req.body);
    const slug = slugify(payload.name);

    try {
      const attribute = await Attribute.create({
        name: payload.name,
        displayType: payload.displayType,
        description: payload.description,
        status: payload.status,
        values: payload.values,
        slug,
      });
      res.status(201).json(toAttributeDto(attribute));
    } catch (error) {
      if (isUniqueKeyError(error)) {
        throw new AppError(409, "Attribute slug already exists");
      }
      throw error;
    }
  })
);

attributesRouter.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = updateAttributeSchema.parse(req.body);
    const attribute = await Attribute.findById(req.params.id);
    if (!attribute) {
      throw new AppError(404, "Attribute not found");
    }

    const previousSlug = attribute.slug;
    const previousValues = [...attribute.values];

    if (payload.name) {
      attribute.name = payload.name;
      attribute.slug = slugify(payload.name);
    }
    if (payload.displayType !== undefined) {
      attribute.displayType = payload.displayType;
    }
    if (payload.description !== undefined) {
      attribute.description = payload.description;
    }
    if (payload.status !== undefined) {
      attribute.status = payload.status;
    }
    if (payload.values !== undefined) {
      await assertNoProductsUseRemovedAttributeValues(
        attribute.slug,
        previousValues,
        payload.values
      );
      attribute.values = payload.values;
    }

    try {
      await attribute.save();
    } catch (error) {
      if (isUniqueKeyError(error)) {
        throw new AppError(409, "Attribute slug already exists");
      }
      throw error;
    }

    if (payload.name && previousSlug !== attribute.slug) {
      await Product.updateMany(
        { [`attributes.${previousSlug}`]: { $exists: true } },
        {
          $rename: {
            [`attributes.${previousSlug}`]: `attributes.${attribute.slug}`,
          },
        }
      );
    }

    res.json(toAttributeDto(attribute));
  })
);

attributesRouter.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const attribute = await Attribute.findById(req.params.id);
    if (!attribute) {
      throw new AppError(404, "Attribute not found");
    }

    const referencingProducts = await countProductsUsingAttributeSlug(
      attribute.slug
    );
    if (referencingProducts > 0) {
      throw new AppError(
        409,
        `Cannot delete attribute: ${referencingProducts} product(s) still reference it`
      );
    }

    await attribute.deleteOne();
    res.status(204).send();
  })
);

import type { Types } from "mongoose";
import { AppError } from "../middleware/errorHandler.js";
import { Attribute } from "../models/Attribute.js";
import { Brand } from "../models/Brand.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";

export type ProductAttributesMap = Record<string, string | string[]>;

export function extractAttributeSlugs(
  attributes: ProductAttributesMap | undefined
): string[] {
  if (!attributes || typeof attributes !== "object") {
    return [];
  }

  return Object.entries(attributes)
    .filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }
      if (Array.isArray(value)) {
        return value.some((item) => String(item).trim().length > 0);
      }
      return String(value).trim().length > 0;
    })
    .map(([slug]) => slug);
}

export function diffAttributeSlugCounts(
  previousSlugs: string[],
  nextSlugs: string[]
): Record<string, number> {
  const delta: Record<string, number> = {};
  const previous = new Set(previousSlugs);
  const next = new Set(nextSlugs);

  for (const slug of previous) {
    if (!next.has(slug)) {
      delta[slug] = (delta[slug] ?? 0) - 1;
    }
  }

  for (const slug of next) {
    if (!previous.has(slug)) {
      delta[slug] = (delta[slug] ?? 0) + 1;
    }
  }

  return delta;
}

export async function adjustAttributeProductCounts(
  deltaBySlug: Record<string, number>
): Promise<void> {
  const updates = Object.entries(deltaBySlug).filter(
    ([, count]) => count !== 0
  );
  if (updates.length === 0) {
    return;
  }

  await Promise.all(
    updates.map(([slug, count]) =>
      Attribute.updateOne({ slug }, { $inc: { productCount: count } })
    )
  );
}

export async function validateProductAttributes(
  attributes: ProductAttributesMap | undefined
): Promise<ProductAttributesMap> {
  if (!attributes || Object.keys(attributes).length === 0) {
    return {};
  }

  const slugs = extractAttributeSlugs(attributes);
  if (slugs.length === 0) {
    return {};
  }

  const definitions = await Attribute.find({ slug: { $in: slugs } });
  const definitionBySlug = new Map(
    definitions.map((attribute) => [attribute.slug, attribute])
  );

  const normalized: ProductAttributesMap = {};

  for (const slug of slugs) {
    const definition = definitionBySlug.get(slug);
    if (!definition) {
      throw new AppError(400, `Unknown attribute: ${slug}`);
    }

    const rawValue = attributes[slug];
    const value = Array.isArray(rawValue)
      ? rawValue.map((item) => String(item).trim()).filter(Boolean)
      : String(rawValue).trim();

    if (Array.isArray(value)) {
      if (value.length === 0) {
        continue;
      }
      for (const item of value) {
        if (definition.values.length > 0 && !definition.values.includes(item)) {
          throw new AppError(
            400,
            `Invalid value "${item}" for attribute "${definition.name}"`
          );
        }
      }
      normalized[slug] = value;
      continue;
    }

    if (definition.values.length > 0 && !definition.values.includes(value)) {
      throw new AppError(
        400,
        `Invalid value "${value}" for attribute "${definition.name}"`
      );
    }

    normalized[slug] = value;
  }

  return normalized;
}

export async function requireCategory(
  categoryId: string
): Promise<{ _id: Types.ObjectId; name: string }> {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError(404, "Category not found");
  }
  return category;
}

export async function requireBrand(
  brandId: string
): Promise<{ _id: Types.ObjectId; name: string }> {
  const brand = await Brand.findById(brandId);
  if (!brand) {
    throw new AppError(404, "Brand not found");
  }
  return brand;
}

export async function syncProductCategoryNames(
  categoryId: Types.ObjectId,
  categoryName: string
): Promise<void> {
  await Product.updateMany({ categoryId }, { $set: { categoryName } });
}

export async function syncProductBrandNames(
  brandId: Types.ObjectId,
  brandName: string
): Promise<void> {
  await Product.updateMany({ brandId }, { $set: { brandName } });
}

export async function countProductsUsingAttributeSlug(
  slug: string
): Promise<number> {
  return Product.countDocuments({
    [`attributes.${slug}`]: { $exists: true, $nin: [null, ""] },
  });
}

export async function assertNoProductsUseRemovedAttributeValues(
  slug: string,
  previousValues: string[],
  nextValues: string[]
): Promise<void> {
  const nextSet = new Set(nextValues);
  const removedValues = previousValues.filter((value) => !nextSet.has(value));
  if (removedValues.length === 0) {
    return;
  }

  for (const value of removedValues) {
    const referencingProducts = await Product.countDocuments({
      $or: [
        { [`attributes.${slug}`]: value },
        { [`attributes.${slug}`]: { $in: [value] } },
      ],
    });

    if (referencingProducts > 0) {
      throw new AppError(
        409,
        `Cannot remove value "${value}": ${referencingProducts} product(s) still use it`
      );
    }
  }
}

import { Attribute } from "../../models/Attribute.js";
import { Brand } from "../../models/Brand.js";
import { Cart } from "../../models/Cart.js";
import { Category } from "../../models/Category.js";
import { Order } from "../../models/Order.js";
import { Product } from "../../models/Product.js";
import { Wishlist } from "../../models/Wishlist.js";
import { extractAttributeSlugs } from "../../utils/catalog-relations.js";
import type { SiteSeedData } from "../seed-data/types.js";

export type SeedCatalogResult = {
  categories: number;
  brands: number;
  attributes: number;
  products: number;
  publishedProducts: number;
};

export async function clearCommerceData(): Promise<void> {
  await Promise.all([
    Cart.deleteMany({}),
    Order.deleteMany({}),
    Wishlist.deleteMany({}),
  ]);
}

export async function clearCatalogData(): Promise<void> {
  await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
    Brand.deleteMany({}),
    Attribute.deleteMany({}),
  ]);
}

export async function seedCatalog(
  seedData: SiteSeedData
): Promise<SeedCatalogResult> {
  const categories = await Category.insertMany(seedData.categories);
  const brands = await Brand.insertMany(seedData.brands);
  await Attribute.insertMany(seedData.attributes);

  const categoryBySlug = new Map(
    categories.map((category) => [category.slug, category])
  );
  const brandBySlug = new Map(brands.map((brand) => [brand.slug, brand]));

  const fallbackCategory =
    categoryBySlug.get(seedData.primaryCategorySlug) ?? categories[0];
  const fallbackBrand = brandBySlug.get(seedData.primaryBrandSlug);

  const products = seedData.products.map((product) => {
    const category =
      categoryBySlug.get(product.categorySlug ?? seedData.primaryCategorySlug) ??
      fallbackCategory;
    const brandSlug = product.brandSlug ?? seedData.primaryBrandSlug;
    const brand = brandBySlug.get(brandSlug);

    return {
      ...product,
      categoryId: category?._id,
      categoryName: category?.name ?? "",
      brandId: brand?._id,
      brandName: brand?.name ?? "",
    };
  });

  await Product.insertMany(products);

  const categoryCounts = new Map<string, number>();
  const brandCounts = new Map<string, number>();

  for (const product of products) {
    if (product.categoryId) {
      const key = String(product.categoryId);
      categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
    }
    if (product.brandId) {
      const key = String(product.brandId);
      brandCounts.set(key, (brandCounts.get(key) ?? 0) + 1);
    }
  }

  await Promise.all([
    ...[...categoryCounts.entries()].map(([categoryId, productCount]) =>
      Category.updateOne({ _id: categoryId }, { $set: { productCount } })
    ),
    ...[...brandCounts.entries()].map(([brandId, productCount]) =>
      Brand.updateOne({ _id: brandId }, { $set: { productCount } })
    ),
  ]);

  const attributeUsage = new Map<string, number>();
  for (const product of products) {
    for (const slug of extractAttributeSlugs(product.attributes ?? {})) {
      attributeUsage.set(slug, (attributeUsage.get(slug) ?? 0) + 1);
    }
  }

  await Promise.all(
    [...attributeUsage.entries()].map(([slug, productCount]) =>
      Attribute.updateOne({ slug }, { $set: { productCount } })
    )
  );

  return {
    categories: categories.length,
    brands: brands.length,
    attributes: seedData.attributes.length,
    products: products.length,
    publishedProducts: products.filter((product) => product.status === "published")
      .length,
  };
}

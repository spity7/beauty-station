import type {
  AttributeDto,
  BrandDto,
  CategoryDto,
  ProductDto,
} from "@platform/shared";
import type { Attribute, Brand, Category } from "@/data/admin/catalog";
import type { Product, ProductStatus } from "@/data/products/data";

const LOW_STOCK_THRESHOLD = 10;
const PLACEHOLDER_IMAGE = "/assets/products/oat-biscuit.svg";

function resolveImage(images: string[]): string {
  return images[0] ?? PLACEHOLDER_IMAGE;
}

export function toAdminProductStatus(product: ProductDto): ProductStatus {
  if (product.status === "archived") {
    return "archived";
  }
  if (product.status === "draft") {
    return "draft";
  }
  if (product.stock <= LOW_STOCK_THRESHOLD) {
    return "low stock";
  }
  return "published";
}

export function mapProductDto(product: ProductDto): Product & { id: string } {
  return {
    id: product.id,
    attributeSlugs: Object.keys(product.attributes ?? {}),
    brand: product.brandName,
    brandId: product.brandId,
    catalogStatus: product.status,
    category: product.categoryName || "Uncategorized",
    categoryId: product.categoryId,
    image: resolveImage(product.images),
    name: product.name,
    price: product.price,
    sku: product.sku,
    status: toAdminProductStatus(product),
    stock: product.stock,
  };
}

export function mapCategoryDto(
  category: CategoryDto
): Category & { id: string } {
  return {
    id: category.id,
    count: category.productCount,
    image: category.image || PLACEHOLDER_IMAGE,
    name: category.name,
    slug: category.slug,
    status: category.status,
  };
}

export function mapBrandDto(brand: BrandDto): Brand & { id: string } {
  return {
    id: brand.id,
    count: brand.productCount,
    initials: brand.initials,
    name: brand.name,
    slug: brand.slug,
    status:
      brand.status === "archived"
        ? "archived"
        : brand.status === "published"
          ? "published"
          : "draft",
    tileClass: brand.tileClass,
    visibility: brand.visibility,
    website: brand.website,
  };
}

export function mapAttributeDto(attribute: AttributeDto): Attribute {
  return {
    name: attribute.name,
    products: attribute.productCount,
    status: attribute.status,
    type: attribute.displayType,
    values: attribute.values,
  };
}

export function mapAttributeRows(
  attributes: AttributeDto[]
): Array<Attribute & { id: string }> {
  return attributes.map((attribute) => ({
    ...mapAttributeDto(attribute),
    id: attribute.id,
  }));
}

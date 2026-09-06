import { fetchProducts } from "@platform/api-client";
import type { ProductDto, ProductStatus } from "@platform/shared";

const PLACEHOLDER_IMAGE = "/assets/products/oat-biscuit.svg";
export const ASSIGNED_PRODUCTS_PAGE_SIZE = 3;
export const ASSIGNED_PRODUCTS_PLACEHOLDER = PLACEHOLDER_IMAGE;
export const LOW_STOCK_THRESHOLD = 10;

export type AssignedProductPreview = {
  id: string;
  image: string;
  name: string;
  status: ProductStatus;
  stock: number;
};

function resolveProductImage(images: string[]): string {
  const first = images.find((url) => url.trim().length > 0);
  return first ?? PLACEHOLDER_IMAGE;
}

function toAssignedProductPreview(product: ProductDto): AssignedProductPreview {
  return {
    id: product.id,
    image: resolveProductImage(product.images),
    name: product.name,
    status: product.status,
    stock: product.stock,
  };
}

export type AssignedProductsSnapshot = {
  products: AssignedProductPreview[];
  total: number;
};

async function fetchAssignedProducts(
  predicate: (product: ProductDto) => boolean
): Promise<AssignedProductsSnapshot> {
  const response = await fetchProducts({ limit: 100 });
  const assigned = response.data.filter(predicate);

  return {
    products: assigned.map(toAssignedProductPreview),
    total: assigned.length,
  };
}

export async function fetchAssignedProductsForCategory(
  categoryId: string
): Promise<AssignedProductsSnapshot> {
  return fetchAssignedProducts((product) => product.categoryId === categoryId);
}

export async function fetchAssignedProductsForBrand(
  brandId: string
): Promise<AssignedProductsSnapshot> {
  return fetchAssignedProducts((product) => product.brandId === brandId);
}

export async function fetchAssignedProductsForAttribute(
  attributeSlug: string
): Promise<AssignedProductsSnapshot> {
  return fetchAssignedProducts((product) =>
    Object.prototype.hasOwnProperty.call(
      product.attributes ?? {},
      attributeSlug
    )
  );
}

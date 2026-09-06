import { pathBuilders, routes } from "@/config/routes";

/**
 * Prefix a path with NEXT_PUBLIC_BASE_URL when the admin app is deployed under a subdirectory.
 * Use for client-side full-page redirects (window.location). Next.js router/link handle basePath automatically.
 */
export function adminPath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.trim() ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (!base) {
    return normalized;
  }

  const baseNorm = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${baseNorm}${normalized}`;
}

export function productEditPath(id: string) {
  return pathBuilders.editProduct(id);
}

export function addProductPath(options?: {
  brandId?: string;
  categoryId?: string;
}) {
  const params = new URLSearchParams();
  if (options?.categoryId) {
    params.set("categoryId", options.categoryId);
  }
  if (options?.brandId) {
    params.set("brandId", options.brandId);
  }
  const query = params.toString();
  return query ? `${routes.addProduct}?${query}` : routes.addProduct;
}

export function productsListPath(options?: {
  attributeSlug?: string;
  brandId?: string;
  categoryId?: string;
}) {
  const params = new URLSearchParams();
  if (options?.categoryId) {
    params.set("categoryId", options.categoryId);
  }
  if (options?.brandId) {
    params.set("brandId", options.brandId);
  }
  if (options?.attributeSlug) {
    params.set("attributeSlug", options.attributeSlug);
  }
  const query = params.toString();
  return query ? `${routes.products}?${query}` : routes.products;
}

export function categoryEditPath(id: string) {
  return pathBuilders.editCategory(id);
}

export function brandEditPath(id: string) {
  return pathBuilders.editBrand(id);
}

export function attributeEditPath(id: string) {
  return pathBuilders.editAttribute(id);
}

import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/layout/icon";
import { PageHeader } from "@/components/layout/page-header";
import { ProductListTable } from "@/components/products/product-list-table";
import { routes } from "@/config/routes";
import type { Product } from "@/data/products/data";
import {
  fetchAttributes,
  fetchBrands,
  fetchCategories,
  fetchProducts,
} from "@platform/api-client";
import {
  mapBrandDto,
  mapCategoryDto,
  mapProductDto,
} from "@/lib/mappers/catalog";
import { getAdminSiteConfig } from "@/lib/site";

const site = getAdminSiteConfig();

export const metadata: Metadata = {
  title: `Products | ${site.name} Admin`,
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    attributeSlug?: string;
    brandId?: string;
    categoryId?: string;
  }>;
}) {
  const { attributeSlug, brandId, categoryId } = await searchParams;
  let products: Array<Product & { id: string }> = [];
  let categoryFilters: Array<{ id: string; name: string }> = [];
  let brandFilters: Array<{ id: string; name: string }> = [];
  let attributeFilters: Array<{ id: string; name: string }> = [];
  let loadError: string | null = null;

  try {
    const [
      productsResponse,
      categoriesResponse,
      brandsResponse,
      attributesResponse,
    ] = await Promise.all([
      fetchProducts({ limit: 100 }),
      fetchCategories({ limit: 100 }),
      fetchBrands({ limit: 100 }),
      fetchAttributes({ limit: 100 }),
    ]);
    products = productsResponse.data.map(mapProductDto);
    categoryFilters = categoriesResponse.data
      .map(mapCategoryDto)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ id, name }) => ({ id, name }));
    brandFilters = brandsResponse.data
      .map(mapBrandDto)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ id, name }) => ({ id, name }));
    attributeFilters = attributesResponse.data
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((attribute) => ({ id: attribute.slug, name: attribute.name }));
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load products from the API.";
  }

  return (
    <>
      <PageHeader
        actions={
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-base bg-brand-600 px-4 text-[14px] font-semibold text-white hover:bg-brand-700"
            href={routes.addProduct}
          >
            <Icon className="h-4 w-4" name="plus" />
            Add Product
          </Link>
        }
        description="Manage catalog items, stock, pricing, and publish state."
        eyebrow="Catalog"
        title="Products"
      />
      {loadError ? (
        <div className="mb-4 rounded-base border border-warning-200 bg-warning-50 px-4 py-3 text-[14px] text-warning-700">
          {loadError} Start the API server and run{" "}
          <code className="rounded bg-white/70 px-1">npm run seed</code> from
          the repo root.
        </div>
      ) : null}
      <ProductListTable
        attributeFilters={attributeFilters}
        brandFilters={brandFilters}
        categoryFilters={categoryFilters}
        initialFilters={{ attributeSlug, brandId, categoryId }}
        products={products}
      />
    </>
  );
}

import type { Metadata } from "next";
import { ProductCatalogForm } from "@/components/catalog/catalog-forms";
import { PageHeader } from "@/components/layout/page-header";
import {
  fetchAttributes,
  fetchBrands,
  fetchCategories,
} from "@platform/api-client";
import { getAdminSiteConfig } from "@/lib/site";

const site = getAdminSiteConfig();

export const metadata: Metadata = {
  title: `Add Product | ${site.name} Admin`,
};

export default async function AddProductPage({
  searchParams,
}: {
  searchParams: Promise<{ brandId?: string; categoryId?: string }>;
}) {
  const { brandId, categoryId } = await searchParams;
  const [categoriesRes, brandsRes, attributesRes] = await Promise.all([
    fetchCategories({ limit: 100 }),
    fetchBrands({ limit: 100 }),
    fetchAttributes({ limit: 100, status: "published" }),
  ]);

  const categories = categoriesRes.data.map((c) => ({
    id: c.id,
    name: c.name,
  }));
  const brands = brandsRes.data.map((b) => ({ id: b.id, name: b.name }));
  const attributes = attributesRes.data.map((attribute) => ({
    slug: attribute.slug,
    name: attribute.name,
    displayType: attribute.displayType,
    values: attribute.values,
  }));

  return (
    <>
      <PageHeader
        description="Create a new catalog product."
        eyebrow="Catalog"
        title="Add Product"
      />
      <ProductCatalogForm
        attributes={attributes}
        brands={brands}
        categories={categories}
        defaultBrandId={brandId}
        defaultCategoryId={categoryId}
        mode="add"
      />
    </>
  );
}

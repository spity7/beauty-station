import type { Metadata } from "next";
import { ProductCatalogForm } from "@/components/catalog/catalog-forms";
import { PageHeader } from "@/components/layout/page-header";
import {
  loadProductFormBrandOptions,
  loadProductFormCategoryOptions,
} from "@/lib/product-form-options";
import { fetchAttributes } from "@platform/api-client";
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
  const [categories, brands, attributesRes] = await Promise.all([
    loadProductFormCategoryOptions(categoryId),
    loadProductFormBrandOptions(brandId),
    fetchAttributes({ limit: 100, status: "published" }),
  ]);
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

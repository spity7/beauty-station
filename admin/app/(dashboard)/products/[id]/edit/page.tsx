import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCatalogForm } from "@/components/catalog/catalog-forms";
import {
  assignedProductAttributeSlugs,
  mergeProductFormAttributes,
  toProductFormAttribute,
  type ProductFormAttribute,
} from "@/lib/product-form-attributes";
import { PageHeader } from "@/components/layout/page-header";
import {
  loadProductFormBrandOptions,
  loadProductFormCategoryOptions,
} from "@/lib/product-form-options";
import { fetchAttributes, fetchProductById } from "@platform/api-client";
import { getAdminSiteConfig } from "@/lib/site";

const site = getAdminSiteConfig();

export const metadata: Metadata = {
  title: `Edit Product | ${site.name} Admin`,
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;
  try {
    product = await fetchProductById(id);
  } catch {
    notFound();
  }

  const [categories, brands, activeAttributesRes, catalogAttributesRes] =
    await Promise.all([
      loadProductFormCategoryOptions(product.categoryId),
      loadProductFormBrandOptions(product.brandId),
      fetchAttributes({ limit: 100, status: "published" }),
      fetchAttributes({ limit: 100 }),
    ]);

  const activeAttributes = activeAttributesRes.data.map(toProductFormAttribute);
  const catalogAttributes = catalogAttributesRes.data.map(
    toProductFormAttribute
  );
  const attributes = mergeProductFormAttributes(
    activeAttributes,
    catalogAttributes,
    assignedProductAttributeSlugs(product.attributes)
  );

  return (
    <>
      <PageHeader
        description="Update product details, pricing, and stock."
        eyebrow="Catalog"
        title="Edit Product"
      />
      <ProductCatalogForm
        attributes={attributes}
        brands={brands}
        categories={categories}
        initial={product}
        mode="edit"
      />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandCatalogForm } from "@/components/catalog/catalog-forms";
import { PageHeader } from "@/components/layout/page-header";
import { fetchAssignedProductsForBrand } from "@/lib/assigned-products";
import { getBrandApi } from "@platform/api-client";
import { getAdminSiteConfig } from "@/lib/site";

const site = getAdminSiteConfig();

export const metadata: Metadata = {
  title: `Edit Brand | ${site.name} Admin`,
};

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let brand;
  let assignedProducts: Awaited<
    ReturnType<typeof fetchAssignedProductsForBrand>
  >["products"] = [];

  try {
    brand = await getBrandApi(id);
    if (brand.productCount > 0) {
      ({ products: assignedProducts } =
        await fetchAssignedProductsForBrand(id));
    }
  } catch {
    notFound();
  }

  return (
    <>
      <PageHeader
        description="Update brand profile and publish state."
        eyebrow="Catalog"
        title="Edit Brand"
      />
      <BrandCatalogForm
        assignedProducts={assignedProducts}
        initial={brand}
        mode="edit"
      />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AttributeCatalogForm } from "@/components/catalog/catalog-forms";
import { PageHeader } from "@/components/layout/page-header";
import { fetchAssignedProductsForAttribute } from "@/lib/assigned-products";
import { getAttributeApi } from "@platform/api-client";
import { getAdminSiteConfig } from "@/lib/site";

const site = getAdminSiteConfig();

export const metadata: Metadata = {
  title: `Edit Attribute | ${site.name} Admin`,
};

export default async function EditAttributePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let attribute;
  let assignedProducts: Awaited<
    ReturnType<typeof fetchAssignedProductsForAttribute>
  >["products"] = [];
  let linkedProductCount = 0;

  try {
    attribute = await getAttributeApi(id);
    ({ products: assignedProducts, total: linkedProductCount } =
      await fetchAssignedProductsForAttribute(attribute.slug));
  } catch {
    notFound();
  }

  return (
    <>
      <PageHeader
        description="Update attribute values and display settings."
        eyebrow="Catalog"
        title="Edit Attribute"
      />
      <AttributeCatalogForm
        assignedProducts={assignedProducts}
        initial={attribute}
        linkedProductCount={linkedProductCount}
        mode="edit"
      />
    </>
  );
}

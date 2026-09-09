import type { Metadata } from "next";
import { DemoRouteShell } from "@/components/admin/demo-route-shell";
import { ProductForm } from "@/components/products/product-form";
import { routes } from "@/config/routes";
import { productFormDefaults } from "@/data/products/data";

export const metadata: Metadata = {
  title: "Edit Product",
};

export default function EditProductPage() {
  return (
    <DemoRouteShell
      description="This legacy template form is for UI preview only. Create and edit live catalog products through the API-backed product form."
      liveHref={routes.products}
      liveLabel="Open live products list"
    >
      <ProductForm mode="edit" {...productFormDefaults.edit} />
    </DemoRouteShell>
  );
}

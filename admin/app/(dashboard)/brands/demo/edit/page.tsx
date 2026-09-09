import { DemoRouteShell } from "@/components/admin/demo-route-shell";
import { BrandForm } from "@/components/catalog/brand-form";
import { routes } from "@/config/routes";

export default function EditBrandPage() {
  return (
    <DemoRouteShell
      description="This legacy template form is for UI preview only. Manage live brands through the API-backed brand catalog form."
      liveHref={routes.brands}
      liveLabel="Open live brands list"
    >
      <BrandForm mode="edit" />
    </DemoRouteShell>
  );
}

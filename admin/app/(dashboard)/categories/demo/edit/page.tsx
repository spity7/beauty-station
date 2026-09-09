import { DemoRouteShell } from "@/components/admin/demo-route-shell";
import { CategoryForm } from "@/components/catalog/category-form";
import { routes } from "@/config/routes";

export default function EditCategoryPage() {
  return (
    <DemoRouteShell
      description="This legacy template form is for UI preview only. Manage live categories through the API-backed category catalog form."
      liveHref={routes.categories}
      liveLabel="Open live categories list"
    >
      <CategoryForm mode="edit" />
    </DemoRouteShell>
  );
}

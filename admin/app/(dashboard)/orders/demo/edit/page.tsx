import { DemoRouteShell } from "@/components/admin/demo-route-shell";
import { OrderForm } from "@/components/orders/order-form";
import { routes } from "@/config/routes";

export default function EditOrderPage() {
  return (
    <DemoRouteShell
      description="This legacy template form is for UI preview only. Edit live orders through the API-backed orders panel."
      liveHref={routes.orders}
      liveLabel="Open live orders list"
    >
      <OrderForm mode="edit" />
    </DemoRouteShell>
  );
}

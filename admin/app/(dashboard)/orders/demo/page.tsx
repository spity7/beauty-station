import { DemoRouteShell } from "@/components/admin/demo-route-shell";
import { OrderDetail } from "@/components/orders/order-detail";
import { routes } from "@/config/routes";

export default function OrderDetailPage() {
  return (
    <DemoRouteShell
      description="This legacy template page is for UI preview only. View live order details through the API-backed orders panel."
      liveHref={routes.orders}
      liveLabel="Open live orders list"
    >
      <OrderDetail />
    </DemoRouteShell>
  );
}

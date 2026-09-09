import { DemoRouteShell } from "@/components/admin/demo-route-shell";
import { CouponForm } from "@/components/coupons/coupon-form";
import { routes } from "@/config/routes";

export default function EditCouponPage() {
  return (
    <DemoRouteShell
      description="This legacy template form is for UI preview only. Coupon management is not connected to the live API yet."
      liveHref={routes.coupons}
      liveLabel="Open coupons list"
    >
      <CouponForm mode="edit" />
    </DemoRouteShell>
  );
}

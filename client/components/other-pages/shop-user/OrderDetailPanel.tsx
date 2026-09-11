"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cancelOrder, fetchOrder } from "@platform/api-client";
import { useSubmitBusy } from "@platform/react-busy";
import type { OrderDto } from "@platform/shared";
import {
  formatOrderDate,
  formatOrderNumber,
  formatOrderStatus,
  formatOrderTotal,
  formatShippingAddress,
  orderStatusClass,
} from "@/lib/order-display";
import { getStorefrontSiteConfig } from "@/lib/site";
import OrderItemsList from "./OrderItemsList";
import Orders from "./Orders";

type OrderDetailPanelProps = {
  orderId: string;
};

export default function OrderDetailPanel({ orderId }: OrderDetailPanelProps) {
  const site = getStorefrontSiteConfig();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(site.features.customerAuth);
  const [error, setError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { disabled: cancelDisabled } = useSubmitBusy(cancelling);
  const canCancel =
    order?.status === "pending" || order?.status === "processing";

  useEffect(() => {
    if (!site.features.customerAuth) {
      return;
    }

    let cancelled = false;

    void fetchOrder(orderId)
      .then((response) => {
        if (!cancelled) {
          setOrder(response);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load this order.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, site.features.customerAuth]);

  if (!site.features.customerAuth) {
    return <Orders />;
  }

  if (loading) {
    return <p className="mb--0">Loading order…</p>;
  }

  async function handleCancelOrder() {
    if (!order || !canCancel) {
      return;
    }

    setCancelError(null);
    setCancelling(true);
    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
    } catch {
      setCancelError("Could not cancel this order. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  if (error || !order) {
    return (
      <div>
        <p className="rbt-text-color-danger mb--16">
          {error ?? "Order not found."}
        </p>
        <Link className="rbt-btn" href="/my-order-history">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="rbt-profile-content-area rbt-scrollable-content">
      <div className="rbt-component-section-title rbt-gap--4 mb--24 p-0 border-0">
        <Link
          href="/my-order-history"
          className="b3 d-inline-flex align-items-center mb--12"
        >
          <i className="fa-regular fa-arrow-left mr--8" />
          Back to orders
        </Link>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <h2 className="rbt-title mb--0">
            Order #{formatOrderNumber(order.id)}
          </h2>
          <span className={orderStatusClass(order.status)}>
            {formatOrderStatus(order.status)}
          </span>
        </div>
        <p className="description mb--0 mt--8">
          Placed {formatOrderDate(order.createdAt)}
        </p>
        {canCancel ? (
          <div className="mt--16">
            <button
              className="rbt-btn rbt-btn-border rbt-btn-sm"
              disabled={cancelDisabled}
              onClick={() => void handleCancelOrder()}
              type="button"
            >
              {cancelling ? "Cancelling…" : "Cancel order"}
            </button>
            {cancelError ? (
              <p className="rbt-text-color-danger mb--0 mt--12">{cancelError}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rbt-transparent-table-one-wrapper rbt-has-bg-gray p--24 mb--24">
        <h5 className="title mb--24">Items</h5>
        <OrderItemsList items={order.items} />
        <hr />
        <p className="mb--0 b2">
          <strong>Total: {formatOrderTotal(order.total)}</strong>
        </p>
      </div>

      <div className="row row--12 mt_dec--24">
        {order.shippingAddress ? (
          <div className="col-12 col-md-6 mt--24">
            <div className="rbt-transparent-table-one-wrapper rbt-has-bg-gray p--24 h-100">
              <h5 className="title mb--16">Shipping address</h5>
              <p
                className="mb--0 b3"
                style={{ whiteSpace: "pre-line" }}
              >
                {formatShippingAddress(order.shippingAddress)}
              </p>
              {order.shippingAddress.phone ? (
                <p className="mb--0 b3 mt--12">
                  Phone: {order.shippingAddress.phone}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="col-12 col-md-6 mt--24">
          <div className="rbt-transparent-table-one-wrapper rbt-has-bg-gray p--24 h-100">
            <h5 className="title mb--16">Payment</h5>
            <p className="mb--0 b3">Cash on delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}

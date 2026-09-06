"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchOrders, platformApi } from "@platform/api-client";
import type { OrderStatus } from "@platform/shared";
import {
  type EntityColumn,
  EntityTable,
} from "@/components/admin/entity-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { routes } from "@/config/routes";
import {
  mapOrderDtoToApiOrderRow,
  type ApiOrderRow,
} from "@/lib/mappers/orders";
import { pathBuilders } from "@/config/routes";

const statusClass: Record<ApiOrderRow["status"], string> = {
  completed: "bg-success-50 text-success-700",
  delivering: "bg-warning-50 text-warning-700",
  failed: "bg-error-50 text-error-700",
};

const API_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function initials(value: string): string {
  return value
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ApiOrdersPanel() {
  const [orders, setOrders] = useState<ApiOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setError(null);
    try {
      const response = await fetchOrders();
      setOrders(response.data.map(mapOrderDtoToApiOrderRow));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load orders from the API."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function handleStatusChange(order: ApiOrderRow, status: OrderStatus) {
    try {
      await platformApi.updateOrder(order.apiId, { status });
      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update order status."
      );
    }
  }

  const columns: EntityColumn<ApiOrderRow>[] = [
    {
      key: "order",
      label: "Order ID",
      render: (order) => (
        <span className="font-semibold text-brand-600">#{order.id}</span>
      ),
      sortValue: (order) => order.id,
    },
    {
      hideable: true,
      key: "customer",
      label: "Customer",
      render: (order) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 rounded-full bg-brand-50 text-[13px] font-semibold text-brand-600 place-items-center">
            {initials(order.customer)}
          </span>
          <div>
            <span className="font-semibold text-ink-900">{order.customer}</span>
            {order.customerEmail ? (
              <p className="text-[13px] text-ink-500">{order.customerEmail}</p>
            ) : null}
          </div>
        </div>
      ),
      sortValue: (order) => order.customer,
    },
    {
      hideable: true,
      key: "status",
      label: "Status",
      render: (order) => (
        <div className="flex flex-col gap-2">
          <StatusBadge
            className={statusClass[order.status]}
            label={capitalize(order.apiStatus)}
          />
          <select
            className="rounded-base border border-ink-200 px-2 py-1 text-[13px]"
            value={order.apiStatus}
            onChange={(event) =>
              handleStatusChange(order, event.target.value as OrderStatus)
            }
          >
            {API_STATUSES.map((status) => (
              <option key={status} value={status}>
                {capitalize(status)}
              </option>
            ))}
          </select>
        </div>
      ),
      sortValue: (order) => order.apiStatus,
    },
    {
      hideable: true,
      key: "total",
      label: "Total",
      render: (order) => (
        <span className="font-semibold text-ink-900">{order.total}</span>
      ),
      sortValue: (order) => Number(order.total.replace(/[$,]/g, "")),
    },
    {
      hideable: true,
      key: "added",
      label: "Date Added",
      render: (order) => order.added,
      sortValue: (order) => order.added,
    },
    {
      hideable: true,
      key: "modified",
      label: "Date Modified",
      render: (order) => order.modified,
      sortValue: (order) => order.modified,
    },
  ];

  if (loading) {
    return <p className="text-[14px] text-ink-600">Loading orders…</p>;
  }

  if (error) {
    return (
      <div className="rounded-base border border-warning-200 bg-warning-50 px-4 py-3 text-[14px] text-warning-700">
        {error} Ensure the API server is running and you are signed in as admin.
      </div>
    );
  }

  return (
    <EntityTable
      columns={columns}
      deleteMessage="Orders cannot be deleted from the admin UI yet."
      editHref={(order) => pathBuilders.orderDetail(order.apiId)}
      enableColumnToggle
      filterOptions={[
        { label: "All", match: () => true, value: "all" },
        {
          label: "Pending",
          match: (row) => row.apiStatus === "pending",
          value: "pending",
        },
        {
          label: "Processing",
          match: (row) => row.apiStatus === "processing",
          value: "processing",
        },
        {
          label: "Delivered",
          match: (row) => row.apiStatus === "delivered",
          value: "delivered",
        },
        {
          label: "Cancelled",
          match: (row) => row.apiStatus === "cancelled",
          value: "cancelled",
        },
      ]}
      items={orders}
      searchLabel="Search orders"
      searchPlaceholder="Search order ID or customer"
      searchText={(order) =>
        `${order.id} ${order.customer} ${order.total} ${order.apiStatus}`
      }
      singularName="order"
    />
  );
}

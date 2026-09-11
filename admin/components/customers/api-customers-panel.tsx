"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAdminUsers, updateAdminUserStatus } from "@platform/api-client";
import type { AdminUserListItem } from "@platform/shared";
import {
  type EntityColumn,
  EntityTable,
} from "@/components/admin/entity-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { useBusyActionGuard } from "@platform/react-busy";

function initials(value: string): string {
  return value
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(value)
  );
}

export function ApiCustomersPanel() {
  const [customers, setCustomers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { disabled } = useBusyActionGuard({ active: Boolean(updatingId) });

  const loadCustomers = useCallback(async () => {
    setError(null);
    try {
      const response = await fetchAdminUsers({ role: "customer", limit: 100 });
      setCustomers(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customers from the API."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  async function toggleCustomerStatus(customer: AdminUserListItem) {
    setUpdatingId(customer.id);
    setError(null);
    try {
      const updated = await updateAdminUserStatus(
        customer.id,
        !customer.isActive
      );
      setCustomers((current) =>
        current.map((row) => (row.id === updated.id ? updated : row))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update customer status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const columns: EntityColumn<AdminUserListItem>[] = [
    {
      key: "customer",
      label: "Customer",
      render: (customer) => (
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 text-[14px] font-semibold text-brand-600">
            {initials(customer.name)}
          </span>
          <div>
            <p className="font-semibold text-ink-900">{customer.name}</p>
            <p className="mt-1 text-[13px] text-ink-400">{customer.email}</p>
          </div>
        </div>
      ),
      sortValue: (customer) => customer.name,
    },
    {
      hideable: true,
      key: "orders",
      label: "Orders",
      render: (customer) => customer.orderCount,
      sortValue: (customer) => customer.orderCount,
    },
    {
      hideable: true,
      key: "verified",
      label: "Email",
      render: (customer) => (customer.emailVerified ? "Verified" : "Pending"),
      sortValue: (customer) => (customer.emailVerified ? 1 : 0),
    },
    {
      hideable: true,
      key: "joined",
      label: "Joined",
      render: (customer) => formatDate(customer.createdAt),
      sortValue: (customer) => customer.createdAt,
    },
    {
      hideable: true,
      key: "status",
      label: "Status",
      render: (customer) => (
        <StatusBadge
          className={
            customer.isActive
              ? "bg-success-50 text-success-700"
              : "bg-error-50 text-error-700"
          }
          label={customer.isActive ? "Active" : "Disabled"}
        />
      ),
      sortValue: (customer) => (customer.isActive ? 1 : 0),
    },
    {
      key: "actions",
      label: "Actions",
      render: (customer) => (
        <button
          className="inline-flex h-9 items-center rounded-base border border-border px-3 text-[13px] font-medium text-ink-700 hover:bg-surface-muted disabled:opacity-60"
          disabled={disabled}
          onClick={() => void toggleCustomerStatus(customer)}
          type="button"
        >
          {customer.isActive ? "Disable" : "Enable"}
        </button>
      ),
    },
  ];

  if (loading) {
    return <p className="text-[14px] text-ink-500">Loading customers…</p>;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-base border border-error-200 bg-error-50 px-4 py-3 text-[14px] text-error-700">
          {error}
        </p>
      ) : null}
      <EntityTable
        columns={columns}
        editHref="/customers"
        filterOptions={[
          { label: "All", match: () => true, value: "all" },
          {
            label: "Active",
            match: (row) => row.isActive,
            value: "active",
          },
          {
            label: "Disabled",
            match: (row) => !row.isActive,
            value: "disabled",
          },
        ]}
        items={customers}
        searchLabel="Search customers"
        searchPlaceholder="Search customers"
        searchText={(customer) =>
          `${customer.name} ${customer.email} ${customer.phone ?? ""}`
        }
        singularName="customer"
      />
    </div>
  );
}

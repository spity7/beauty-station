"use client";

import Link from "next/link";
import {
  type EntityColumn,
  EntityTable,
} from "@/components/admin/entity-table";
import { Icon } from "@/components/layout/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { routes } from "@/config/routes";
import type {
  Coupon,
  CurrencyRate,
  Order,
  ProductReview,
  Role,
  SupportTicket,
  TemplateListItem,
} from "@/data/admin/operations";
import { cn } from "@/utils/cn";

type RoleRow = Role & { id: string };
type OrderRow = Order & { id: string };
type CurrencyRow = CurrencyRate & { id: string };
type CouponRow = Coupon & { id: string };
type ReviewRow = ProductReview & { id: string };
type TicketRow = SupportTicket & { id: string };
type TemplateRow = TemplateListItem & { id: string };

const statusClass = {
  active: "bg-success-50 text-success-600",
  approved: "bg-success-50 text-success-600",
  completed: "bg-success-50 text-success-600",
  delivering: "bg-brand-50 text-brand-600",
  draft: "bg-surface-muted text-ink-600",
  expired: "bg-warning-50 text-warning-600",
  failed: "bg-danger-50 text-danger-500",
  open: "bg-warning-50 text-warning-600",
  pending: "bg-brand-50 text-brand-600",
  resolved: "bg-success-50 text-success-600",
  scheduled: "bg-brand-50 text-brand-600",
};

export function RoleListTable({ roles }: { roles: Role[] }) {
  const rows: RoleRow[] = roles.map((role) => ({
    ...role,
    id: role.name.toLowerCase().replace(/\s+/g, "-"),
  }));
  const columns: EntityColumn<RoleRow>[] = [
    {
      key: "role",
      label: "Role",
      render: (role) => (
        <p className="font-semibold text-ink-900">{role.name}</p>
      ),
      sortValue: (role) => role.name,
    },
    {
      hideable: true,
      key: "users",
      label: "Users",
      render: (role) => role.users,
      sortValue: (role) => Number.parseInt(role.users, 10),
    },
    {
      hideable: true,
      key: "permissions",
      label: "Permissions",
      render: (role) => (
        <span className="text-ink-500">{role.permissions}</span>
      ),
      sortValue: (role) => role.permissions,
    },
    {
      hideable: true,
      key: "status",
      label: "Status",
      render: (role) => (
        <StatusBadge
          className={statusClass[role.status]}
          label={capitalize(role.status)}
        />
      ),
      sortValue: (role) => role.status,
    },
  ];

  return (
    <EntityTable
      enableColumnToggle
      columns={columns}
      deleteMessage="This role will be permanently removed from access control. This action cannot be undone."
      editHref={routes.createRole}
      filterOptions={[
        { label: "All status", match: () => true, value: "all" },
        {
          label: "Active",
          match: (row) => row.status === "active",
          value: "active",
        },
        {
          label: "Draft",
          match: (row) => row.status === "draft",
          value: "draft",
        },
      ]}
      items={rows}
      searchLabel="Search roles"
      searchPlaceholder="Search roles"
      searchText={(role) => `${role.name} ${role.permissions}`}
      singularName="role"
    />
  );
}

export function OrderListTable({ orders }: { orders: Order[] }) {
  const columns: EntityColumn<OrderRow>[] = [
    {
      key: "order",
      label: "Order ID",
      render: (order) => (
        <Link
          className="font-semibold text-brand-600 hover:underline"
          href={routes.orderDetail}
        >
          #{order.id}
        </Link>
      ),
      sortValue: (order) => Number(order.id),
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
          <span className="font-semibold text-ink-900">{order.customer}</span>
        </div>
      ),
      sortValue: (order) => order.customer,
    },
    {
      hideable: true,
      key: "status",
      label: "Status",
      render: (order) => (
        <StatusBadge
          className={statusClass[order.status]}
          label={capitalize(order.status)}
        />
      ),
      sortValue: (order) => order.status,
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

  return (
    <EntityTable
      enableColumnToggle
      columns={columns}
      deleteMessage="This order will be removed from the order list. This action cannot be undone."
      editHref={routes.editOrder}
      filterOptions={[
        { label: "Status", match: () => true, value: "all" },
        {
          label: "Delivering",
          match: (row) => row.status === "delivering",
          value: "delivering",
        },
        {
          label: "Completed",
          match: (row) => row.status === "completed",
          value: "completed",
        },
        {
          label: "Failed",
          match: (row) => row.status === "failed",
          value: "failed",
        },
      ]}
      items={orders}
      searchLabel="Search orders"
      searchPlaceholder="Search Order"
      searchText={(order) => `${order.id} ${order.customer} ${order.total}`}
      singularName="order"
    />
  );
}

export function CurrencyRatesTable({ rates }: { rates: CurrencyRate[] }) {
  const rows: CurrencyRow[] = rates.map((rate) => ({ ...rate, id: rate.code }));
  const columns: EntityColumn<CurrencyRow>[] = [
    {
      key: "currency",
      label: "Currency",
      render: (rate) => (
        <p className="font-semibold text-ink-900">{rate.name}</p>
      ),
      sortValue: (rate) => rate.name,
    },
    {
      hideable: true,
      key: "code",
      label: "Code",
      render: (rate) => rate.code,
      sortValue: (rate) => rate.code,
    },
    {
      hideable: true,
      key: "rate",
      label: "Rate",
      render: (rate) => rate.rate.toFixed(4),
      sortValue: (rate) => rate.rate,
    },
    {
      hideable: true,
      key: "lastUpdated",
      label: "Last Updated",
      render: (rate) => (
        <span className="text-ink-500">{rate.lastUpdated}</span>
      ),
      sortValue: (rate) => rate.lastUpdated,
    },
  ];

  return (
    <EntityTable
      enableColumnToggle
      columns={columns}
      deleteMessage="This currency rate will be removed from localization settings."
      editHref={routes.currencyRates}
      items={rows}
      searchLabel="Search currencies"
      searchPlaceholder="Search currency or code"
      searchText={(rate) => `${rate.name} ${rate.code}`}
      singularName="currency"
    />
  );
}

export function CouponListTable({ coupons }: { coupons: Coupon[] }) {
  const rows: CouponRow[] = coupons.map((coupon) => ({
    ...coupon,
    id: coupon.code,
  }));
  const columns: EntityColumn<CouponRow>[] = [
    {
      key: "coupon",
      label: "Coupon",
      render: (coupon) => (
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-base",
              coupon.iconClass
            )}
          >
            <Icon className="h-5 w-5" name="badge-percent" />
          </span>
          <div>
            <Link
              className="font-semibold text-ink-900 hover:text-brand-600"
              href={routes.editCoupon}
            >
              {coupon.name}
            </Link>
            <p className="mt-1 text-[13px] text-ink-400">{coupon.summary}</p>
          </div>
        </div>
      ),
      sortValue: (coupon) => coupon.name,
    },
    {
      hideable: true,
      key: "code",
      label: "Code",
      render: (coupon) => (
        <span className="font-semibold text-ink-900">{coupon.code}</span>
      ),
      sortValue: (coupon) => coupon.code,
    },
    {
      hideable: true,
      key: "discount",
      label: "Discount",
      render: (coupon) => coupon.discount,
      sortValue: (coupon) => coupon.discount,
    },
    {
      hideable: true,
      key: "validity",
      label: "Validity",
      render: (coupon) => coupon.validity,
      sortValue: (coupon) => coupon.validity,
    },
    {
      hideable: true,
      key: "used",
      label: "Used",
      render: (coupon) => coupon.used,
      sortValue: (coupon) => Number.parseInt(coupon.used.replace(/,/g, ""), 10),
    },
    {
      hideable: true,
      key: "status",
      label: "Status",
      render: (coupon) => (
        <StatusBadge
          className={statusClass[coupon.status]}
          label={capitalize(coupon.status)}
        />
      ),
      sortValue: (coupon) => coupon.status,
    },
  ];

  return (
    <EntityTable
      enableColumnToggle
      columns={columns}
      deleteMessage="This coupon will be permanently removed from marketing campaigns."
      editHref={routes.editCoupon}
      filterOptions={[
        { label: "All status", match: () => true, value: "all" },
        {
          label: "Active",
          match: (row) => row.status === "active",
          value: "active",
        },
        {
          label: "Scheduled",
          match: (row) => row.status === "scheduled",
          value: "scheduled",
        },
        {
          label: "Draft",
          match: (row) => row.status === "draft",
          value: "draft",
        },
        {
          label: "Expired",
          match: (row) => row.status === "expired",
          value: "expired",
        },
      ]}
      items={rows}
      searchLabel="Search coupons"
      searchPlaceholder="Search coupon name or code"
      searchText={(coupon) => `${coupon.name} ${coupon.code} ${coupon.type}`}
      singularName="coupon"
    />
  );
}

export function ProductReviewListTable({
  reviews,
}: {
  reviews: ProductReview[];
}) {
  const rows: ReviewRow[] = reviews.map((review) => ({
    ...review,
    id: `${review.product}-${review.customer}`,
  }));
  const columns: EntityColumn<ReviewRow>[] = [
    {
      key: "product",
      label: "Product",
      render: (review) => (
        <p className="font-semibold text-ink-900">{review.product}</p>
      ),
      sortValue: (review) => review.product,
    },
    {
      hideable: true,
      key: "customer",
      label: "Customer",
      render: (review) => review.customer,
      sortValue: (review) => review.customer,
    },
    {
      hideable: true,
      key: "rating",
      label: "Rating",
      render: (review) => (
        <span className="text-warning-500">{review.rating}/5</span>
      ),
      sortValue: (review) => review.rating,
    },
    {
      hideable: true,
      key: "review",
      label: "Review",
      render: (review) => <span className="text-ink-500">{review.review}</span>,
      sortValue: (review) => review.review,
    },
    {
      hideable: true,
      key: "status",
      label: "Status",
      render: (review) => (
        <StatusBadge
          className={statusClass[review.status]}
          label={capitalize(review.status)}
        />
      ),
      sortValue: (review) => review.status,
    },
  ];

  return (
    <EntityTable
      enableColumnToggle
      columns={columns}
      deleteMessage="This review will be removed from moderation."
      editHref={routes.productReviews}
      filterOptions={[
        { label: "All reviews", match: () => true, value: "all" },
        {
          label: "Pending",
          match: (row) => row.status === "pending",
          value: "pending",
        },
        {
          label: "Approved",
          match: (row) => row.status === "approved",
          value: "approved",
        },
        {
          label: "Draft",
          match: (row) => row.status === "draft",
          value: "draft",
        },
      ]}
      items={rows}
      searchLabel="Search reviews"
      searchPlaceholder="Search product or customer"
      searchText={(review) =>
        `${review.product} ${review.customer} ${review.review}`
      }
      singularName="review"
    />
  );
}

export function SupportTicketListTable({
  tickets,
}: {
  tickets: SupportTicket[];
}) {
  const rows: TicketRow[] = tickets.map((ticket) => ({
    ...ticket,
    id: ticket.title,
  }));
  const columns: EntityColumn<TicketRow>[] = [
    {
      key: "ticket",
      label: "Ticket",
      render: (ticket) => (
        <p className="font-semibold text-ink-900">{ticket.title}</p>
      ),
      sortValue: (ticket) => ticket.title,
    },
    {
      hideable: true,
      key: "customer",
      label: "Customer",
      render: (ticket) => ticket.customer,
      sortValue: (ticket) => ticket.customer,
    },
    {
      hideable: true,
      key: "priority",
      label: "Priority",
      render: (ticket) => (
        <span
          className={
            ticket.priority === "High"
              ? "text-danger-500"
              : ticket.priority === "Medium"
                ? "text-warning-600"
                : "text-ink-500"
          }
        >
          {ticket.priority}
        </span>
      ),
      sortValue: (ticket) => ticket.priority,
    },
    {
      hideable: true,
      key: "assignee",
      label: "Assigned To",
      render: (ticket) => ticket.assignee,
      sortValue: (ticket) => ticket.assignee,
    },
    {
      hideable: true,
      key: "status",
      label: "Status",
      render: (ticket) => (
        <StatusBadge
          className={statusClass[ticket.status]}
          label={capitalize(ticket.status)}
        />
      ),
      sortValue: (ticket) => ticket.status,
    },
  ];

  return (
    <EntityTable
      enableColumnToggle
      columns={columns}
      deleteMessage="This support ticket will be removed from the queue."
      editHref={routes.supportTickets}
      filterOptions={[
        { label: "All status", match: () => true, value: "all" },
        { label: "Open", match: (row) => row.status === "open", value: "open" },
        {
          label: "Pending",
          match: (row) => row.status === "pending",
          value: "pending",
        },
        {
          label: "Resolved",
          match: (row) => row.status === "resolved",
          value: "resolved",
        },
      ]}
      items={rows}
      searchLabel="Search tickets"
      searchPlaceholder="Search tickets"
      searchText={(ticket) =>
        `${ticket.title} ${ticket.customer} ${ticket.assignee}`
      }
      singularName="ticket"
    />
  );
}

export function TemplateListTable({ items }: { items: TemplateListItem[] }) {
  const rows: TemplateRow[] = items.map((item) => ({
    ...item,
    id: item.name,
  }));
  const columns: EntityColumn<TemplateRow>[] = [
    {
      key: "name",
      label: "Name",
      render: (item) => (
        <p className="font-semibold text-ink-900">{item.name}</p>
      ),
      sortValue: (item) => item.name,
    },
    {
      hideable: true,
      key: "owner",
      label: "Owner",
      render: (item) => item.owner,
      sortValue: (item) => item.owner,
    },
    {
      hideable: true,
      key: "updated",
      label: "Updated",
      render: (item) => <span className="text-ink-500">{item.updated}</span>,
      sortValue: (item) => item.updated,
    },
    {
      hideable: true,
      key: "status",
      label: "Status",
      render: (item) => (
        <StatusBadge
          className={statusClass[item.status]}
          label={capitalize(item.status)}
        />
      ),
      sortValue: (item) => item.status,
    },
  ];

  return (
    <EntityTable
      enableColumnToggle
      columns={columns}
      deleteMessage="This item will be removed from the reusable list."
      editHref={routes.listPage}
      filterOptions={[
        { label: "All status", match: () => true, value: "all" },
        {
          label: "Active",
          match: (row) => row.status === "active",
          value: "active",
        },
        {
          label: "Scheduled",
          match: (row) => row.status === "scheduled",
          value: "scheduled",
        },
        {
          label: "Draft",
          match: (row) => row.status === "draft",
          value: "draft",
        },
      ]}
      items={rows}
      searchLabel="Search list items"
      searchPlaceholder="Search list items"
      searchText={(item) => `${item.name} ${item.owner}`}
      singularName="item"
    />
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function initials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("");
}

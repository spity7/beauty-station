"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type EntityColumn,
  EntityTable,
} from "@/components/admin/entity-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { routes } from "@/config/routes";
import {
  categoryEditPath,
  brandEditPath,
  attributeEditPath,
} from "@/lib/paths";
import type {
  Attribute,
  Brand,
  Category,
  Customer,
} from "@/data/admin/catalog";
import { cn } from "@/utils/cn";
import { finishCatalogDelete } from "@/lib/catalog-feedback";
import { useToast } from "@/providers/toast-provider";
import {
  deleteBrandApi,
  deleteCategoryApi,
  deleteAttributeApi,
} from "@platform/api-client";

type CategoryRow = Category & { id: string };
type BrandRow = Brand & { id: string };
type AttributeRow = Attribute & { id: string };
type CustomerRow = Customer & { id: string };

const statusClass = {
  active: "bg-success-50 text-success-600",
  archived: "bg-surface-muted text-ink-600",
  draft: "bg-warning-50 text-warning-600",
  published: "bg-success-50 text-success-600",
  review: "bg-warning-50 text-warning-600",
};

export function CategoryListTable({
  categories,
}: {
  categories: Array<Category & { id: string }>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const rows: CategoryRow[] = categories;
  const columns: EntityColumn<CategoryRow>[] = [
    {
      key: "category",
      label: "Category",
      render: (category) => (
        <div className="flex items-center gap-3">
          <Image
            alt={category.name}
            className="h-12 w-12 rounded-base bg-surface-body object-cover"
            height={48}
            src={category.image}
            width={48}
          />
          <div>
            <Link
              className="font-semibold text-ink-900 hover:text-brand-600"
              href={categoryEditPath(category.id)}
            >
              {category.name}
            </Link>
          </div>
        </div>
      ),
      sortValue: (category) => category.name,
    },
    {
      hideable: true,
      key: "products",
      label: "Products",
      render: (category) => category.count,
      sortValue: (category) => category.count,
    },
    {
      hideable: true,
      key: "status",
      label: "Status",
      render: (category) => (
        <StatusBadge
          className={statusClass[category.status]}
          label={capitalize(category.status)}
        />
      ),
      sortValue: (category) => category.status,
    },
  ];

  return (
    <EntityTable
      columns={columns}
      editHref={(row) => categoryEditPath(row.id)}
      getRowLabel={(row) => row.name}
      onDelete={async (ids) => {
        await Promise.all(ids.map((id) => deleteCategoryApi(id)));
        await finishCatalogDelete({
          count: ids.length,
          entity: "category",
          router,
          showToast,
        });
      }}
      filterOptions={[
        { label: "All", match: () => true, value: "all" },
        {
          label: "Published",
          match: (row) => row.status === "published",
          value: "published",
        },
        {
          label: "Draft",
          match: (row) => row.status === "draft",
          value: "draft",
        },
      ]}
      items={rows}
      searchLabel="Search categories"
      searchPlaceholder="Search categories"
      searchText={(category) => category.name}
      singularName="category"
    />
  );
}

export function BrandListTable({
  brands,
}: {
  brands: Array<Brand & { id: string }>;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const rows: BrandRow[] = brands;
  const columns: EntityColumn<BrandRow>[] = [
    {
      key: "brand",
      label: "Brand",
      render: (brand) => (
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid h-12 w-12 shrink-0 place-items-center rounded-base text-[14px] font-semibold",
              brand.tileClass
            )}
          >
            {brand.initials}
          </span>
          <div>
            <Link
              className="font-semibold text-ink-900 hover:text-brand-600"
              href={brandEditPath(brand.id)}
            >
              {brand.name}
            </Link>
            <p className="mt-1 text-[13px] text-ink-400">{brand.website}</p>
          </div>
        </div>
      ),
      sortValue: (brand) => brand.name,
    },
    {
      hideable: true,
      key: "products",
      label: "Products",
      render: (brand) => brand.count,
      sortValue: (brand) => brand.count,
    },
    {
      hideable: true,
      key: "visibility",
      label: "Visibility",
      render: (brand) => brand.visibility,
      sortValue: (brand) => brand.visibility,
    },
    {
      hideable: true,
      key: "status",
      label: "Status",
      render: (brand) => (
        <StatusBadge
          className={statusClass[brand.status]}
          label={capitalize(brand.status)}
        />
      ),
      sortValue: (brand) => brand.status,
    },
  ];

  return (
    <EntityTable
      columns={columns}
      editHref={(row) => brandEditPath(row.id)}
      getRowLabel={(row) => row.name}
      onDelete={async (ids) => {
        await Promise.all(ids.map((id) => deleteBrandApi(id)));
        await finishCatalogDelete({
          count: ids.length,
          entity: "brand",
          router,
          showToast,
        });
      }}
      filterOptions={[
        { label: "All", match: () => true, value: "all" },
        {
          label: "Published",
          match: (row) => row.status === "published",
          value: "published",
        },
        {
          label: "Draft",
          match: (row) => row.status === "draft",
          value: "draft",
        },
        {
          label: "Archived",
          match: (row) => row.status === "archived",
          value: "archived",
        },
      ]}
      items={rows}
      searchLabel="Search brands"
      searchPlaceholder="Search brands"
      searchText={(brand) => `${brand.name} ${brand.website}`}
      singularName="brand"
    />
  );
}

export function AttributeListTable({
  attributes,
}: {
  attributes: AttributeRow[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const rows = attributes;
  const columns: EntityColumn<AttributeRow>[] = [
    {
      key: "attribute",
      label: "Attribute",
      render: (attribute) => (
        <div>
          <Link
            className="font-semibold text-ink-900 hover:text-brand-600"
            href={attributeEditPath(attribute.id)}
          >
            {attribute.name}
          </Link>
          <p className="mt-1 text-[13px] text-ink-400">
            {attribute.values.join(", ")}
          </p>
        </div>
      ),
      sortValue: (attribute) => attribute.name,
    },
    {
      hideable: true,
      key: "type",
      label: "Type",
      render: (attribute) => attribute.type,
      sortValue: (attribute) => attribute.type,
    },
    {
      hideable: true,
      key: "products",
      label: "Products",
      render: (attribute) => attribute.products,
      sortValue: (attribute) => attribute.products,
    },
    {
      hideable: true,
      key: "status",
      label: "Status",
      render: (attribute) => (
        <StatusBadge
          className={statusClass[attribute.status]}
          label={capitalize(attribute.status)}
        />
      ),
      sortValue: (attribute) => attribute.status,
    },
  ];

  return (
    <EntityTable
      columns={columns}
      editHref={(row) => attributeEditPath(row.id)}
      getRowLabel={(row) => row.name}
      onDelete={async (ids) => {
        await Promise.all(ids.map((id) => deleteAttributeApi(id)));
        await finishCatalogDelete({
          count: ids.length,
          entity: "attribute",
          router,
          showToast,
        });
      }}
      filterGroups={[
        {
          ariaLabel: "Filter by status",
          className: "w-[160px]",
          defaultValue: "all",
          key: "status",
          options: [
            { label: "All statuses", match: () => true, value: "all" },
            {
              label: "Published",
              match: (row) => row.status === "published",
              value: "published",
            },
            {
              label: "Draft",
              match: (row) => row.status === "draft",
              value: "draft",
            },
          ],
        },
        {
          ariaLabel: "Filter by type",
          className: "w-[160px]",
          defaultValue: "all",
          key: "type",
          options: [
            { label: "All types", match: () => true, value: "all" },
            {
              label: "Dropdown",
              match: (row) => row.type === "Dropdown",
              value: "dropdown",
            },
            {
              label: "Swatch",
              match: (row) => row.type === "Swatch",
              value: "swatch",
            },
            {
              label: "Text",
              match: (row) => row.type === "Text",
              value: "text",
            },
          ],
        },
      ]}
      items={rows}
      searchLabel="Search attributes"
      searchPlaceholder="Search attributes"
      searchText={(attribute) =>
        `${attribute.name} ${attribute.type} ${attribute.values.join(" ")}`
      }
      singularName="attribute"
    />
  );
}

export function CustomerListTable({ customers }: { customers: Customer[] }) {
  const rows: CustomerRow[] = customers.map((customer) => ({
    ...customer,
    id: customer.email,
  }));
  const columns: EntityColumn<CustomerRow>[] = [
    {
      key: "customer",
      label: "Customer",
      render: (customer) => (
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid h-12 w-12 shrink-0 place-items-center rounded-full text-[14px] font-semibold",
              customer.avatarClass
            )}
          >
            {customer.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
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
      key: "segment",
      label: "Segment",
      render: (customer) => customer.segment,
      sortValue: (customer) => customer.segment,
    },
    {
      hideable: true,
      key: "orders",
      label: "Orders",
      render: (customer) => customer.orders,
      sortValue: (customer) => customer.orders,
    },
    {
      hideable: true,
      key: "ltv",
      label: "LTV",
      render: (customer) => customer.ltv,
      sortValue: (customer) => Number(customer.ltv.replace(/[$,]/g, "")),
    },
    {
      hideable: true,
      key: "status",
      label: "Status",
      render: (customer) => (
        <StatusBadge
          className={statusClass[customer.status]}
          label={capitalize(customer.status)}
        />
      ),
      sortValue: (customer) => customer.status,
    },
  ];

  return (
    <EntityTable
      columns={columns}
      deleteMessage="This customer profile will be removed from the directory. This action cannot be undone."
      editHref={routes.addUser}
      filterOptions={[
        { label: "All", match: () => true, value: "all" },
        {
          label: "Active",
          match: (row) => row.status === "active",
          value: "active",
        },
        {
          label: "Review",
          match: (row) => row.status === "review",
          value: "review",
        },
      ]}
      items={rows}
      searchLabel="Search customers"
      searchPlaceholder="Search customers"
      searchText={(customer) =>
        `${customer.name} ${customer.email} ${customer.segment}`
      }
      singularName="customer"
    />
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/layout/icon";
import {
  ListClearFiltersButton,
  ListFilterSelect,
  ListSearchField,
} from "@/components/ui/list-filter-controls";
import { ListDeleteConfirmDialog } from "@/components/ui/list-delete-confirm-dialog";
import { CrudBusyShield } from "@/components/ui/crud-busy-shield";
import { StatusBadge } from "@/components/products/status-badge";
import { routes } from "@/config/routes";
import { productEditPath } from "@/lib/paths";
import { finishCatalogDelete } from "@/lib/catalog-feedback";
import { useToast } from "@/providers/toast-provider";
import { useCrudBusyLock } from "@/providers/crud-busy-provider";
import type { Product, ProductStatus } from "@/data/products/data";
import { deleteProductApi } from "@platform/api-client";
import { cn } from "@/utils/cn";

type SortKey = "name" | "price" | "status" | "stock";
type SortDirection = "asc" | "desc";

type CatalogFilterOption = {
  id: string;
  name: string;
};

type ProductListInitialFilters = {
  attributeSlug?: string;
  brandId?: string;
  categoryId?: string;
};

type ProductListTableProps = {
  attributeFilters: CatalogFilterOption[];
  brandFilters: CatalogFilterOption[];
  categoryFilters: CatalogFilterOption[];
  initialFilters?: ProductListInitialFilters;
  products: Product[];
};

function resolveInitialListFilter(
  value: string | undefined,
  options: CatalogFilterOption[]
): string {
  if (value && options.some((option) => option.id === value)) {
    return value;
  }
  return "all";
}

function productKey(product: Product): string {
  return product.id ?? product.sku;
}

const statusClass: Record<ProductStatus, string> = {
  draft: "bg-surface-muted text-ink-600",
  "low stock": "bg-warning-50 text-warning-600",
  published: "bg-success-50 text-success-600",
};

const statusLabel: Record<ProductStatus, string> = {
  draft: "Draft",
  "low stock": "Low stock",
  published: "Published",
};

export function ProductListTable({
  attributeFilters,
  brandFilters,
  categoryFilters,
  initialFilters = {},
  products,
}: ProductListTableProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ProductStatus>("all");
  const [categoryId, setCategoryId] = useState(() =>
    resolveInitialListFilter(initialFilters.categoryId, categoryFilters)
  );
  const [brandId, setBrandId] = useState(() =>
    resolveInitialListFilter(initialFilters.brandId, brandFilters)
  );
  const [attributeSlug, setAttributeSlug] = useState(() =>
    resolveInitialListFilter(initialFilters.attributeSlug, attributeFilters)
  );
  const [sort, setSort] = useState<{ direction: SortDirection; key: SortKey }>({
    direction: "asc",
    key: "name",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [rows, setRows] = useState(products);

  useEffect(() => {
    setRows(products);
  }, [products]);

  useCrudBusyLock(deleting);

  const categoryOptions = useMemo(
    () => [
      { label: "All categories", value: "all" },
      ...categoryFilters.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    ],
    [categoryFilters]
  );

  const brandOptions = useMemo(
    () => [
      { label: "All brands", value: "all" },
      ...brandFilters.map((brand) => ({
        label: brand.name,
        value: brand.id,
      })),
    ],
    [brandFilters]
  );

  const attributeOptions = useMemo(
    () => [
      { label: "All attributes", value: "all" },
      ...attributeFilters.map((attribute) => ({
        label: attribute.name,
        value: attribute.id,
      })),
    ],
    [attributeFilters]
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = rows.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        `${product.name} ${product.sku} ${product.category} ${product.brand ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStatus = status === "all" || product.status === status;
      const matchesCategory =
        categoryId === "all" || product.categoryId === categoryId;
      const matchesBrand = brandId === "all" || product.brandId === brandId;
      const matchesAttribute =
        attributeSlug === "all" ||
        (product.attributeSlugs?.includes(attributeSlug) ?? false);
      return (
        matchesQuery &&
        matchesStatus &&
        matchesCategory &&
        matchesBrand &&
        matchesAttribute
      );
    });

    return [...filtered].sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1;
      if (sort.key === "price" || sort.key === "stock") {
        return (a[sort.key] - b[sort.key]) * direction;
      }

      return String(a[sort.key]).localeCompare(String(b[sort.key])) * direction;
    });
  }, [attributeSlug, brandId, categoryId, query, rows, sort, status]);

  const allVisibleSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product) => selected.has(productKey(product)));

  function toggleSort(key: SortKey) {
    setSort((current) => ({
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
      key,
    }));
  }

  function toggleSelected(product: Product, checked: boolean) {
    const key = productKey(product);
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  function toggleAllVisible(checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const product of filteredProducts) {
        const key = productKey(product);
        if (checked) {
          next.add(key);
        } else {
          next.delete(key);
        }
      }
      return next;
    });
  }

  async function confirmDelete() {
    const ids = Array.from(selected);
    setDeleting(true);
    setDeleteError(null);
    try {
      await Promise.all(ids.map((id) => deleteProductApi(id)));
      setRows((current) =>
        current.filter((product) => !selected.has(productKey(product)))
      );
      setSelected(new Set());
      setConfirmOpen(false);
      await finishCatalogDelete({
        count: ids.length,
        entity: "product",
        router,
        showToast,
      });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const hasActiveFilters =
    query.trim().length > 0 ||
    categoryId !== "all" ||
    brandId !== "all" ||
    attributeSlug !== "all" ||
    status !== "all";

  function clearAllFilters() {
    setQuery("");
    setCategoryId("all");
    setBrandId("all");
    setAttributeSlug("all");
    setStatus("all");
    router.replace(routes.products);
  }

  const selectedLabels = rows
    .filter((product) => selected.has(productKey(product)))
    .map((product) => product.name);

  return (
    <section className="rounded-card border border-surface-line bg-surface-card p-6 shadow-card">
      <CrudBusyShield active={deleting}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <ListSearchField
              label="Search products"
              onChange={setQuery}
              placeholder="Search products"
              value={query}
            />
            <ListFilterSelect
              ariaLabel="Filter by category"
              className="w-[180px]"
              defaultValue="all"
              onValueChange={setCategoryId}
              options={categoryOptions}
              size="lg"
              value={categoryId}
            />
            <ListFilterSelect
              ariaLabel="Filter by brand"
              className="w-[180px]"
              defaultValue="all"
              onValueChange={setBrandId}
              options={brandOptions}
              size="lg"
              value={brandId}
            />
            <ListFilterSelect
              ariaLabel="Filter by attribute"
              className="w-[180px]"
              defaultValue="all"
              onValueChange={setAttributeSlug}
              options={attributeOptions}
              size="lg"
              value={attributeSlug}
            />
            <ListFilterSelect
              ariaLabel="Filter by status"
              className="w-[160px]"
              defaultValue="all"
              onValueChange={(value) =>
                setStatus(value as "all" | ProductStatus)
              }
              options={[
                { label: "All statuses", value: "all" },
                { label: "Published", value: "published" },
                { label: "Draft", value: "draft" },
                { label: "Low stock", value: "low stock" },
              ]}
              size="lg"
              value={status}
            />
            <ListClearFiltersButton
              active={hasActiveFilters}
              onClear={clearAllFilters}
            />
          </div>
          <button
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-base bg-danger-500 px-4 text-[14px] font-semibold text-white transition-colors hover:bg-danger-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={selected.size === 0 || deleting}
            onClick={() => setConfirmOpen(true)}
            type="button"
          >
            <Icon className="h-4 w-4" name="trash-2" />
            Delete (<span>{selected.size}</span>)
          </button>
        </div>

        <div className="dashboard-scrollbar overflow-x-auto">
          <table className="w-full min-w-[880px] text-left">
            <thead>
              <tr className="border-b border-surface-line text-[13px] uppercase text-ink-400">
                <th className="w-10 pb-3 pr-3">
                  <input
                    aria-label="Select all"
                    checked={allVisibleSelected}
                    className="h-4 w-4 rounded border-surface-line text-brand-600 focus:ring-brand-600"
                    onChange={(event) => toggleAllVisible(event.target.checked)}
                    type="checkbox"
                  />
                </th>
                <th className="pb-3 pr-4 font-semibold">
                  <SortButton label="Product" name="name" onSort={toggleSort} />
                </th>
                <th className="pb-3 pr-4 font-semibold">Category</th>
                <th className="pb-3 pr-4 font-semibold">
                  <SortButton label="Price" name="price" onSort={toggleSort} />
                </th>
                <th className="pb-3 pr-4 font-semibold">
                  <SortButton label="Stock" name="stock" onSort={toggleSort} />
                </th>
                <th className="pb-3 pr-4 font-semibold">
                  <SortButton
                    label="Status"
                    name="status"
                    onSort={toggleSort}
                  />
                </th>
                <th className="pb-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {filteredProducts.map((product) => (
                <tr
                  className="border-b border-surface-line hover:bg-surface-body/70"
                  key={productKey(product)}
                >
                  <td className="py-4 pr-3">
                    <input
                      aria-label={`Select ${product.name}`}
                      checked={selected.has(productKey(product))}
                      className="h-4 w-4 rounded border-surface-line text-brand-600 focus:ring-brand-600"
                      onChange={(event) =>
                        toggleSelected(product, event.target.checked)
                      }
                      type="checkbox"
                    />
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <Image
                        alt={product.name}
                        className="h-12 w-12 rounded-base bg-surface-body object-cover"
                        height={48}
                        src={product.image}
                        width={48}
                      />
                      <div>
                        <Link
                          className="font-semibold text-ink-900 hover:text-brand-600"
                          href={productEditPath(String(product.id))}
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1 text-[13px] text-ink-400">
                          SKU: {product.sku}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-ink-700">{product.category}</td>
                  <td className="py-4 pr-4 text-ink-700">
                    ${product.price.toFixed(2)}
                  </td>
                  <td
                    className={cn(
                      "py-4 pr-4",
                      product.status === "low stock"
                        ? "text-warning-600"
                        : "text-ink-700"
                    )}
                  >
                    {product.stock}
                  </td>
                  <td className="py-4 pr-4">
                    <StatusBadge
                      className={statusClass[product.status]}
                      label={statusLabel[product.status]}
                    />
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        aria-label="View product"
                        className="icon-button hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={deleting}
                        type="button"
                      >
                        <Icon className="h-4 w-4" name="eye" />
                      </button>
                      {deleting ? (
                        <button
                          aria-label="Edit product"
                          className="icon-button disabled:cursor-not-allowed disabled:opacity-60"
                          disabled
                          type="button"
                        >
                          <Icon className="h-4 w-4" name="pencil" />
                        </button>
                      ) : (
                        <Link
                          aria-label="Edit product"
                          className="icon-button hover:bg-brand-50 hover:text-brand-600"
                          href={productEditPath(String(product.id))}
                        >
                          <Icon className="h-4 w-4" name="pencil" />
                        </Link>
                      )}
                      <button
                        aria-label="Delete product"
                        className="icon-button hover:bg-danger-50 hover:text-danger-500 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={deleting}
                        onClick={() => {
                          setSelected(new Set([productKey(product)]));
                          setConfirmOpen(true);
                        }}
                        type="button"
                      >
                        <Icon className="h-4 w-4" name="trash-2" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-ink-400">
            No products match your search.
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-ink-500">
            Showing {filteredProducts.length} of {rows.length} products
          </p>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-9 items-center rounded-base border border-surface-line px-3 text-[13px] font-semibold text-ink-700 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              disabled
              type="button"
            >
              Previous
            </button>
            <button
              className="inline-flex h-9 items-center rounded-base border border-surface-line px-3 text-[13px] font-semibold text-ink-700 transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
              disabled
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </CrudBusyShield>

      {confirmOpen ? (
        <ListDeleteConfirmDialog
          count={selected.size}
          entityName="product"
          error={deleteError}
          itemLabels={selectedLabels}
          loading={deleting}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => void confirmDelete()}
          open={confirmOpen}
        />
      ) : null}
    </section>
  );
}

type SortButtonProps = {
  label: string;
  name: SortKey;
  onSort: (key: SortKey) => void;
};

function SortButton({ label, name, onSort }: SortButtonProps) {
  return (
    <button
      className="inline-flex items-center gap-1 uppercase hover:text-ink-700"
      onClick={() => onSort(name)}
      type="button"
    >
      {label} <Icon className="h-3.5 w-3.5" name="chevrons-up-down" />
    </button>
  );
}

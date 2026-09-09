"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/layout/icon";
import {
  ListClearFiltersButton,
  ListFilterSelect,
  ListSearchField,
} from "@/components/ui/list-filter-controls";
import { ListDeleteConfirmDialog } from "@/components/ui/list-delete-confirm-dialog";
import { CrudBusyShield } from "@/components/ui/crud-busy-shield";
import { cn } from "@/utils/cn";
import { useCrudBusyLock } from "@/providers/crud-busy-provider";

export type EntityColumn<T> = {
  hideable?: boolean;
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number | string;
};

type FilterOption<T> = {
  label: string;
  match: (row: T) => boolean;
  value: string;
};

type FilterGroup<T> = {
  ariaLabel: string;
  className?: string;
  defaultValue: string;
  key: string;
  options: FilterOption<T>[];
};

type EntityTableProps<T extends { id: string }> = {
  columns: EntityColumn<T>[];
  deleteMessage?: string;
  editHref: string | ((row: T) => string);
  enableColumnToggle?: boolean;
  filterGroups?: FilterGroup<T>[];
  filterOptions?: FilterOption<T>[];
  getRowLabel?: (row: T) => string;
  items: T[];
  onDelete?: (ids: string[]) => Promise<void>;
  searchLabel: string;
  searchPlaceholder: string;
  searchText: (row: T) => string;
  singularName: string;
};

type SortState = {
  direction: "asc" | "desc";
  key: string;
};

export function EntityTable<T extends { id: string }>({
  columns,
  deleteMessage,
  editHref,
  enableColumnToggle = false,
  filterGroups,
  filterOptions,
  getRowLabel,
  items,
  onDelete,
  searchLabel,
  searchPlaceholder,
  searchText,
  singularName,
}: EntityTableProps<T>) {
  const sortableColumns = columns.filter((column) => column.sortValue);
  const hideableColumns = columns.filter((column) => column.hideable);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(filterOptions?.[0]?.value ?? "all");
  const [groupFilters, setGroupFilters] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (filterGroups ?? []).map((group) => [group.key, group.defaultValue])
    )
  );
  const [rows, setRows] = useState(items);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>({
    direction: "asc",
    key: sortableColumns[0]?.key ?? columns[0]?.key ?? "",
  });
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(hideableColumns.map((column) => column.key))
  );

  useCrudBusyLock(deleting);

  const defaultFilterValue = filterOptions?.[0]?.value ?? "all";

  useEffect(() => {
    setRows(items);
  }, [items]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const activeFilter = filterOptions?.find(
      (option) => option.value === filter
    );
    const activeGroupFilters = (filterGroups ?? []).map((group) =>
      group.options.find((option) => option.value === groupFilters[group.key])
    );
    const sortColumn = columns.find((column) => column.key === sort.key);

    const next = rows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        searchText(row).toLowerCase().includes(normalizedQuery);
      const matchesFilter = !activeFilter || activeFilter.match(row);
      const matchesGroupFilters = activeGroupFilters.every(
        (option) => !option || option.match(row)
      );
      return matchesQuery && matchesFilter && matchesGroupFilters;
    });

    if (!sortColumn?.sortValue) {
      return next;
    }

    return [...next].sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1;
      const aValue = sortColumn.sortValue?.(a) ?? "";
      const bValue = sortColumn.sortValue?.(b) ?? "";

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * direction;
      }

      return String(aValue).localeCompare(String(bValue)) * direction;
    });
  }, [
    columns,
    filter,
    filterGroups,
    filterOptions,
    groupFilters,
    query,
    rows,
    searchText,
    sort,
  ]);

  const allVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every((row) => selected.has(row.id));

  function toggleSort(key: string) {
    setSort((current) => ({
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
      key,
    }));
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function toggleAllVisible(checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const row of filteredRows) {
        if (checked) {
          next.add(row.id);
        } else {
          next.delete(row.id);
        }
      }
      return next;
    });
  }

  async function confirmDelete() {
    const ids = Array.from(selected);
    if (onDelete) {
      setDeleting(true);
      setDeleteError(null);
      try {
        await onDelete(ids);
        setRows((current) => current.filter((row) => !selected.has(row.id)));
        setSelected(new Set());
        setConfirmOpen(false);
      } catch (error) {
        setDeleteError(
          error instanceof Error ? error.message : "Delete failed"
        );
      } finally {
        setDeleting(false);
      }
      return;
    }
    setRows((current) => current.filter((row) => !selected.has(row.id)));
    setSelected(new Set());
    setConfirmOpen(false);
  }

  function resolveEditHref(row: T): string {
    return typeof editHref === "function" ? editHref(row) : editHref;
  }

  function isColumnHidden(column: EntityColumn<T>) {
    return (
      enableColumnToggle &&
      column.hideable === true &&
      !visibleColumns.has(column.key)
    );
  }

  const hasActiveGroupFilters = (filterGroups ?? []).some(
    (group) => groupFilters[group.key] !== group.defaultValue
  );
  const hasActiveFilters =
    query.trim().length > 0 ||
    filter !== defaultFilterValue ||
    hasActiveGroupFilters;

  function clearAllFilters() {
    setQuery("");
    setFilter(defaultFilterValue);
    setGroupFilters(
      Object.fromEntries(
        (filterGroups ?? []).map((group) => [group.key, group.defaultValue])
      )
    );
  }

  function setGroupFilter(key: string, value: string) {
    setGroupFilters((current) => ({ ...current, [key]: value }));
  }

  const selectedLabels = rows
    .filter((row) => selected.has(row.id))
    .map((row) => getRowLabel?.(row) ?? row.id);

  return (
    <section className="rounded-card border border-surface-line bg-surface-card p-6 shadow-card">
      <CrudBusyShield active={deleting}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <ListSearchField
              label={searchLabel}
              onChange={setQuery}
              placeholder={searchPlaceholder}
              value={query}
            />
            {filterGroups?.map((group) => (
              <ListFilterSelect
                ariaLabel={group.ariaLabel}
                className={group.className ?? "w-[180px]"}
                defaultValue={group.defaultValue}
                key={group.key}
                onValueChange={(value) => setGroupFilter(group.key, value)}
                options={group.options}
                size="lg"
                value={groupFilters[group.key] ?? group.defaultValue}
              />
            ))}
            {filterOptions ? (
              <ListFilterSelect
                className="w-[180px]"
                defaultValue={defaultFilterValue}
                onValueChange={setFilter}
                options={filterOptions}
                size="lg"
                value={filter}
              />
            ) : null}
            <ListClearFiltersButton
              active={hasActiveFilters}
              onClear={clearAllFilters}
            />
            {enableColumnToggle && hideableColumns.length ? (
              <div className="relative">
                <button
                  aria-expanded={columnsOpen}
                  aria-haspopup="true"
                  className="inline-flex h-11 items-center gap-2 rounded-base border border-surface-line bg-surface-card px-4 text-[14px] font-semibold text-ink-700 transition-colors hover:bg-surface-muted"
                  onClick={() => setColumnsOpen((current) => !current)}
                  type="button"
                >
                  <Icon className="h-4 w-4" name="sliders-horizontal" />
                  Columns
                </button>
                {columnsOpen ? (
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-base border border-surface-line bg-surface-card p-2 shadow-card">
                    <p className="px-2 py-1 text-[12px] font-semibold uppercase text-ink-400">
                      Toggle columns
                    </p>
                    {hideableColumns.map((column) => (
                      <label
                        className="flex items-center gap-2 rounded px-2 py-1.5 text-[14px] text-ink-700 hover:bg-surface-muted"
                        key={column.key}
                      >
                        <input
                          aria-label={`Toggle ${column.label} column`}
                          checked={visibleColumns.has(column.key)}
                          onChange={(event) => {
                            setVisibleColumns((current) => {
                              const next = new Set(current);
                              if (event.target.checked) {
                                next.add(column.key);
                              } else {
                                next.delete(column.key);
                              }
                              return next;
                            });
                          }}
                          type="checkbox"
                        />{" "}
                        {column.label}
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
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
          <table className="w-full min-w-[820px] text-left">
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
                {columns.map((column) => {
                  const hidden = isColumnHidden(column);
                  return (
                    <th
                      className={cn(
                        "pb-3 pr-4 font-semibold",
                        hidden ? "hidden" : ""
                      )}
                      key={column.key}
                    >
                      {column.sortValue ? (
                        <button
                          className="inline-flex items-center gap-1 uppercase hover:text-ink-700"
                          onClick={() => toggleSort(column.key)}
                          type="button"
                        >
                          {column.label}
                          <Icon
                            className="h-3.5 w-3.5"
                            name="chevrons-up-down"
                          />
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  );
                })}
                <th className="pb-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              {filteredRows.map((row) => (
                <tr
                  className="border-b border-surface-line hover:bg-surface-body/70"
                  key={row.id}
                >
                  <td className="py-4 pr-3">
                    <input
                      aria-label={`Select ${row.id}`}
                      checked={selected.has(row.id)}
                      className="h-4 w-4 rounded border-surface-line text-brand-600 focus:ring-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={deleting}
                      onChange={(event) =>
                        toggleSelected(row.id, event.target.checked)
                      }
                      type="checkbox"
                    />
                  </td>
                  {columns.map((column) => {
                    const hidden = isColumnHidden(column);
                    return (
                      <td
                        className={cn(
                          "py-4 pr-4 text-ink-700",
                          hidden ? "hidden" : ""
                        )}
                        key={column.key}
                      >
                        {column.render(row)}
                      </td>
                    );
                  })}
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        aria-label={`View ${singularName}`}
                        className="icon-button hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={deleting}
                        type="button"
                      >
                        <Icon className="h-4 w-4" name="eye" />
                      </button>
                      {deleting ? (
                        <button
                          aria-label={`Edit ${singularName}`}
                          className="icon-button disabled:cursor-not-allowed disabled:opacity-60"
                          disabled
                          type="button"
                        >
                          <Icon className="h-4 w-4" name="pencil" />
                        </button>
                      ) : (
                        <Link
                          aria-label={`Edit ${singularName}`}
                          className="icon-button hover:bg-brand-50 hover:text-brand-600"
                          href={resolveEditHref(row)}
                        >
                          <Icon className="h-4 w-4" name="pencil" />
                        </Link>
                      )}
                      <button
                        aria-label={`Delete ${singularName}`}
                        className="icon-button hover:bg-danger-50 hover:text-danger-500 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={deleting}
                        onClick={() => {
                          setSelected(new Set([row.id]));
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

        {filteredRows.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-ink-400">
            No {singularName}s match your search.
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-ink-500">
            Showing {filteredRows.length} of {rows.length} {singularName}s
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
          deleteMessage={deleteMessage}
          entityName={singularName}
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

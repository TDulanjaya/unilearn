"use client";

import { useState, useMemo, ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  accessor?: (row: T) => ReactNode;
  filterable?: boolean;
  filterOptions?: string[];
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  pageSize?: number;
  // server search: the page does the search, the table only shows the box
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  // extra filters shown next to the search box
  toolbarExtra?: ReactNode;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = "Search records...",
  pageSizeOptions = [5, 10, 20, 50],
  initialPageSize = 10,
  pageSize: propPageSize,
  searchValue,
  onSearchChange,
  toolbarExtra,
}: DataTableProps<T>) {
  const serverSearch = !!onSearchChange;
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(propPageSize || initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (!serverSearch && searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesSearch = Object.values(item).some((val) =>
          String(val ?? "").toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }

      for (const key of Object.keys(columnFilters)) {
        const filterVal = columnFilters[key];
        if (filterVal && filterVal !== "ALL") {
          if (String(item[key]) !== filterVal) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, columnFilters, serverSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentPageClamped = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentPageClamped - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPageClamped, pageSize]);

  const handleFilterChange = (key: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative w-full md:max-w-sm">
          <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant)] text-base pointer-events-none z-10"></i>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={serverSearch ? searchValue ?? "" : searchTerm}
            onChange={(e) => {
              if (serverSearch) {
                onSearchChange?.(e.target.value);
              } else {
                setSearchTerm(e.target.value);
              }
              setCurrentPage(1);
            }}
            className="w-full !pl-10 pr-4 py-2.5 text-xs sm:text-xs rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] placeholder:text-[var(--on-surface-variant)]/60 focus:outline-none focus:border-[var(--tertiary)] transition-colors min-h-[44px]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {toolbarExtra}
          {columns
            .filter((col) => col.filterable && col.accessorKey && col.filterOptions)
            .map((col) => {
              const key = String(col.accessorKey);
              return (
                <select
                  key={key}
                  value={columnFilters[key] || "ALL"}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className="flex-1 md:flex-none px-3 py-2 text-xs rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)] focus:outline-none focus:border-[var(--tertiary)] min-h-[44px]"
                >
                  <option value="ALL">All {col.header}s</option>
                  {col.filterOptions?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              );
            })}
        </div>
      </div>

      {/* Container */}
      <div className="card overflow-hidden border border-[var(--outline-variant)] shadow-sm bg-[var(--surface-container-lowest)]">
        {/* Mobile Card View (< md) */}
        <div className="md:hidden divide-y divide-[var(--outline-variant)]">
          {paginatedData.length > 0 ? (
            paginatedData.map((row, rIdx) => (
              <div
                key={rIdx}
                className="p-4 space-y-2.5 bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container-low)]/40 transition-colors"
              >
                {columns.map((col, cIdx) => {
                  const val = col.cell
                    ? col.cell(row)
                    : col.accessor
                    ? col.accessor(row)
                    : col.accessorKey
                    ? String(row[col.accessorKey] ?? "")
                    : null;
                  return (
                    <div
                      key={cIdx}
                      className="flex items-start justify-between gap-3 text-xs py-0.5 border-b border-[var(--outline-variant)]/40 last:border-0"
                    >
                      <span className="font-semibold text-[var(--on-surface-variant)] shrink-0 min-w-[85px]">
                        {col.header}
                      </span>
                      <div className="text-[var(--on-surface)] text-right break-words overflow-hidden flex-1 flex justify-end">
                        {val}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[var(--on-surface-variant)]">
              <i className="ti ti-table-off text-2xl block mb-1 opacity-50"></i>
              No matching records found
            </div>
          )}
        </div>

        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--on-surface)]">
            <thead className="bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] font-semibold border-b border-[var(--outline-variant)] uppercase tracking-wider text-[11px]">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="p-3.5 px-4 font-bold">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--outline-variant)]">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-[var(--surface-container-low)]/50 transition-colors"
                  >
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="p-3.5 px-4">
                        {col.cell
                          ? col.cell(row)
                          : col.accessor
                          ? col.accessor(row)
                          : col.accessorKey
                          ? String(row[col.accessorKey] ?? "")
                          : null}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-8 text-center text-[var(--on-surface-variant)]"
                  >
                    <i className="ti ti-table-off text-2xl block mb-1 opacity-50"></i>
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 px-4 border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--on-surface-variant)]">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1.5 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] min-h-[36px]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <span className="text-[11px] sm:text-xs">
              {filteredData.length === 0 ? 0 : (currentPageClamped - 1) * pageSize + 1}-
              {Math.min(currentPageClamped * pageSize, filteredData.length)} of {filteredData.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPageClamped === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-[var(--outline-variant)] disabled:opacity-40 hover:bg-[var(--surface-container-high)] transition-colors"
                title="Previous page"
                aria-label="Previous page"
              >
                <i className="ti ti-chevron-left text-sm"></i>
              </button>
              <span className="font-semibold px-2">
                {currentPageClamped} / {totalPages}
              </span>
              <button
                disabled={currentPageClamped === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-[var(--outline-variant)] disabled:opacity-40 hover:bg-[var(--surface-container-high)] transition-colors"
                title="Next page"
                aria-label="Next page"
              >
                <i className="ti ti-chevron-right text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

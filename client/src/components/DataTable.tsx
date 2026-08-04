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
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = "Search records...",
  pageSizeOptions = [5, 10, 20, 50],
  initialPageSize = 10,
  pageSize: propPageSize,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(propPageSize || initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      
      if (searchTerm.trim()) {
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
  }, [data, searchTerm, columnFilters]);

  
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
      
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        <div className="relative flex-1 max-w-sm">
          <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--outline)] text-base"></i>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] focus:outline-none focus:border-[var(--tertiary)] transition-colors"
          />
        </div>

        
        <div className="flex items-center gap-2 flex-wrap">
          {columns
            .filter((col) => col.filterable && col.accessorKey && col.filterOptions)
            .map((col) => {
              const key = String(col.accessorKey);
              return (
                <select
                  key={key}
                  value={columnFilters[key] || "ALL"}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)] focus:outline-none focus:border-[var(--tertiary)]"
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

      
      <div className="card overflow-hidden border border-[var(--outline-variant)] shadow-sm bg-[var(--surface-container-lowest)]">
        <div className="overflow-x-auto">
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

        
        <div className="p-3.5 px-4 border-t border-[var(--outline-variant)] bg-[var(--surface-container-low)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--on-surface-variant)]">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>entries per page</span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Showing {filteredData.length === 0 ? 0 : (currentPageClamped - 1) * pageSize + 1} to{" "}
              {Math.min(currentPageClamped * pageSize, filteredData.length)} of {filteredData.length} entries
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPageClamped === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[var(--outline-variant)] disabled:opacity-40 hover:bg-[var(--surface-container-high)] transition-colors"
                title="Previous page"
              >
                <i className="ti ti-chevron-left text-sm"></i>
              </button>
              <span className="font-semibold px-2">
                {currentPageClamped} / {totalPages}
              </span>
              <button
                disabled={currentPageClamped === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[var(--outline-variant)] disabled:opacity-40 hover:bg-[var(--surface-container-high)] transition-colors"
                title="Next page"
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

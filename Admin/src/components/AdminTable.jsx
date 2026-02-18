import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

/**
 * AdminTable (Corporate)
 * - Dark page background safe
 * - Strong zebra rows
 * - Clear header contrast
 * - Works with cell renderers for badges/actions
 *
 * Props:
 * - columns: TanStack column defs
 * - data: array
 * - pageSize?: number (default 10)
 * - emptyText?: string
 * - title?: string
 * - onRowClick?: (rowOriginal) => void
 * - rowHref?: (rowOriginal) => string (optional: enables "open in new tab")
 * - getRowDisabled?: (rowOriginal) => boolean (optional)
 */
const AdminTable = ({
  title,
  columns,
  data,
  pageSize = 10,
  emptyText = "No records found.",
  onRowClick,
  rowHref,
  getRowDisabled,
}) => {
  const safeData = Array.isArray(data) ? data : [];
  const safeColumns = Array.isArray(columns) ? columns : [];

  const table = useReactTable({
    data: safeData,
    columns: safeColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  const rows = table.getRowModel().rows;
  const leafColumnsCount =
    table.getAllLeafColumns?.()?.length || safeColumns.length || 1;

  const isRowClickable = typeof onRowClick === "function" || !!rowHref;

  const handleRowActivate = (rowOriginal, e) => {
    // Don’t hijack clicks on interactive controls inside the row
    const t = e?.target;
    const interactive = t?.closest?.(
      "a,button,input,select,textarea,label,[role='button']",
    );
    if (interactive) return;

    // Disabled row?
    if (typeof getRowDisabled === "function" && getRowDisabled(rowOriginal))
      return;

    // Preferred: onRowClick callback
    if (typeof onRowClick === "function") {
      onRowClick(rowOriginal);
      return;
    }

    // Fallback: rowHref opens in same tab (unless user ctrl/cmd-clicks link inside)
    if (typeof rowHref === "function") {
      const href = rowHref(rowOriginal);
      if (href) window.location.assign(href);
    }
  };

  return (
    <div className="w-full">
      {title ? (
        <div className="mb-3">
          <h2 className="text-[16px] sm:text-[18px] font-semibold text-[#EDECEC]">
            {title}
          </h2>
        </div>
      ) : null}

      <div className="rounded-xl border border-[#9A9EAB]/30 bg-white shadow-lg overflow-hidden">
        {/* Header strip */}
        <div className="px-4 py-3 bg-[#1A2930] flex items-center justify-between">
          <div className="text-sm font-semibold text-[#EDECEC]">
            {`${safeData.length} record(s)`}
          </div>

          <div className="text-[11px] font-semibold tracking-wide uppercase text-[#EDECEC]/80">
            Ellcworth Admin
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-[#EDECEC]">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="
                        text-left
                        px-4 py-3
                        text-[12px] font-bold
                        text-[#1A2930]
                        border-b border-[#9A9EAB]/40
                        whitespace-nowrap
                      "
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={leafColumnsCount}
                    className="px-4 py-8 text-sm text-slate-600"
                  >
                    {emptyText}
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const zebra = idx % 2 === 0 ? "bg-white" : "bg-[#D9D9D9]";
                  const rowOriginal = row.original;

                  const disabled =
                    typeof getRowDisabled === "function"
                      ? !!getRowDisabled(rowOriginal)
                      : false;

                  return (
                    <tr
                      key={row.id}
                      onClick={
                        disabled || !isRowClickable
                          ? undefined
                          : (e) => handleRowActivate(rowOriginal, e)
                      }
                      className={`
                        ${zebra}
                        border-b border-[#9A9EAB]/25
                        transition
                        ${disabled ? "opacity-60" : "hover:bg-[#FFA500]/10"}
                        ${isRowClickable && !disabled ? "cursor-pointer" : ""}
                      `}
                      title={
                        isRowClickable && !disabled ? "Open details" : undefined
                      }
                    >
                      {row.getVisibleCells().map((cell) => {
                        const hasCustomCell =
                          typeof cell.column.columnDef.cell !== "undefined";

                        return (
                          <td
                            key={cell.id}
                            className="px-4 py-3 text-[13px] text-[#1A2930] align-middle whitespace-nowrap"
                          >
                            {hasCustomCell
                              ? flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )
                              : String(cell.getValue?.() ?? "")}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 flex items-center justify-between bg-white">
          <div className="text-xs text-slate-600">
            Page{" "}
            <span className="font-semibold text-[#1A2930]">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#1A2930]">
              {table.getPageCount()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="
                px-3 py-1.5 rounded-md
                bg-[#1A2930] text-[#EDECEC]
                hover:bg-[#FFA500] hover:text-black
                disabled:opacity-40 disabled:cursor-not-allowed
                transition font-semibold text-xs
              "
            >
              Prev
            </button>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="
                px-3 py-1.5 rounded-md
                bg-[#1A2930] text-[#EDECEC]
                hover:bg-[#FFA500] hover:text-black
                disabled:opacity-40 disabled:cursor-not-allowed
                transition font-semibold text-xs
              "
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTable;

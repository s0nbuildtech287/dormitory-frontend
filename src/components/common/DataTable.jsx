import React from "react";
import { Search } from "lucide-react";

/**
 * Common DataTable Component for rendering list views
 *
 * @param {Array} columns - Array of column definitions: { header: string, accessor: string|function, width?: string, align?: 'center'|'left'|'right' }
 * @param {Array} data - Array of data rows to display
 * @param {function} keyExtractor - Function to extract unique key from row data (e.g. (row) => row.id)
 * @param {boolean} loading - Boolean indicating if data is loading
 * @param {object} emptyState - Configuration for empty state: { icon: Component, title: string, description: string }
 * @param {object} selection - Configuration for bulk selection: { selectedItems: Set, showCheckboxColumn: boolean, onSelectAll: function, onSelectRow: function }
 * @param {function} rowClassName - Optional function returning custom class names for a row (row) => string
 */
const DataTable = ({
  columns = [],
  data = [],
  keyExtractor,
  loading = false,
  emptyState = { icon: Search, title: "Không có dữ liệu", description: "Vui lòng thử lại sau" },
  selection,
  rowClassName,
}) => {
  const { selectedItems = new Set(), showCheckboxColumn = false, onSelectAll, onSelectRow } = selection || {};
  const totalCols = showCheckboxColumn ? columns.length + 1 : columns.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="border-b-2 border-slate-300">
          <tr className="bg-slate-200 text-slate-700 text-xs font-black capitalize tracking-widest">
            {showCheckboxColumn && (
              <th className="px-4 py-3 border-r-2 border-slate-300 w-[5%] text-center">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedItems.size === data.length}
                  onChange={onSelectAll}
                  className="w-4 h-4 cursor-pointer"
                  title="Chọn tất cả (trên trang này)"
                />
              </th>
            )}
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`px-6 py-3 border-r-2 border-slate-300 ${col.width || ""} ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          {loading ? (
            <tr>
              <td colSpan={totalCols} className="px-6 py-8 text-center text-slate-500">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={totalCols} className="px-6 py-8 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400">
                  {emptyState.icon && <emptyState.icon size={48} className="mb-4 opacity-50" />}
                  <p className="text-sm font-medium">{emptyState.title}</p>
                  {emptyState.description && <p className="text-xs mt-1">{emptyState.description}</p>}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => {
              const rowKey = keyExtractor ? keyExtractor(row) : idx;
              const isSelected = selectedItems.has(rowKey);
              const customClass = rowClassName ? rowClassName(row) : "";

              return (
                <tr key={rowKey} className={`hover:bg-slate-50/50 transition-colors ${customClass}`}>
                  {showCheckboxColumn && (
                    <td className="px-4 py-2 border-r-2 border-slate-300 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectRow(rowKey)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-6 py-2 border-r-2 border-slate-300 ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}`}
                    >
                      {typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

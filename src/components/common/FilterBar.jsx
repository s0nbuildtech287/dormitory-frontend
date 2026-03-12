import React from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable FilterBar component for standardizing filter layouts across list pages.
 *
 * @param {string} title - Title of the filter section
 * @param {Object} search - Search input config { value, onChange, placeholder, className (optional wrapper classes) }
 * @param {Array} filters - Array of select config objects { value, onChange, options: [{value, label}], className (optional wrapper classes) }
 * @param {ReactNode} customFilters - Optional React Node for rendering arbitrary filters (like Date inputs or complex selects with optgroups)
 * @param {function} onReset - Callback when reset button is clicked
 * @param {boolean} hasActiveFilter - Used to disable the reset button when there are no active filters
 * @param {ReactNode} actionButtons - Optional action buttons (like Export, Add new) to render below or beside filters
 * @param {string} filterContainerClass - Classes to apply to the flex/grid container holding the filters
 */
const FilterBar = ({ title = "Bộ lọc", search, filters = [], customFilters, onReset, hasActiveFilter, actionButtons, filterContainerClass = "flex gap-3 items-center" }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-200">
      <h3 className="text-slate-800 font-medium text-sm mb-4 uppercase tracking-wider">{title}</h3>

      <div className={filterContainerClass}>
        {/* Search Input */}
        {search && (
          <div className={`relative ${search.className || 'flex-[3]'}`}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={search.placeholder || "Tìm kiếm..."}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-xs transition-all bg-slate-50/50"
            />
          </div>
        )}

        {/* Generic Select Filters */}
        {filters.map((filter, index) => (
          <select
            key={index}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className={`text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm ${filter.className || 'flex-[2]'}`}
          >
            {filter.options.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {/* Custom Filters Wrapper */}
        {customFilters}

        {/* Reset Button */}
        {onReset && (
          <button
            onClick={onReset}
            disabled={!hasActiveFilter}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap"
            title="Xóa bộ lọc"
          >
            ↺ Reset
          </button>
        )}
      </div>

      {/* Optional action buttons area (often below filters) */}
      {actionButtons && (
        <div className="flex gap-3 mt-4 flex-wrap">
          {actionButtons}
        </div>
      )}
    </div>
  );
};

export default FilterBar;

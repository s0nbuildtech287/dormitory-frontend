import React from 'react';

/**
 * Reusable PageTabs component for top-level navigation within a management page.
 * 
 * @param {Array} tabs - Array of tab objects { id: string, label: string, icon: lucide-react-icon, badge: ReactNode }
 * @param {string} activeTab - The currently active tab id
 * @param {function} onTabChange - Callback function when a tab is clicked
 * @param {ReactNode} rightAction - Optional React node to render on the right edge (like a refresh button)
 */
const PageTabs = ({ tabs, activeTab, onTabChange, rightAction }) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto scrollbar-hide">
      <div className="flex items-center space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-700 bg-blue-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon && <tab.icon size={18} />}
            {tab.label}
            {tab.badge}
          </button>
        ))}
      </div>
      {rightAction && (
        <div className="flex items-center pr-2 shrink-0">
          {rightAction}
        </div>
      )}
    </div>
  );
};

export default PageTabs;

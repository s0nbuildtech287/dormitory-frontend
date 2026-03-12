import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ pagination }) => {
  const { currentPage, totalPages, totalItems, itemsPerPage, setItemsPerPage, goToPage, nextPage, prevPage } = pagination;
  
  if (totalItems === 0) return null;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Items per page selector */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Hiển thị</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              goToPage(1);
            }}
            className="px-2 py-1 border border-slate-200 rounded text-xs font-medium outline-none focus:border-blue-500 transition-colors"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>mục mỗi trang</span>
        </div>

        {/* Pagination info */}
        <div className="text-sm text-slate-600 font-medium">
          Hiển thị <span className="text-slate-900 font-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}</span> của <span className="text-slate-900 font-bold">{totalItems}</span> mục
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-transparent"
            title="Trang đầu"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-transparent"
            title="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>
          
          {/* Page Numbers */}
          <div className="flex items-center px-1 gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
              // Show first, last, current, and +-1 pages
              if (
                number === 1 ||
                number === totalPages ||
                (number >= currentPage - 1 && number <= currentPage + 1)
              ) {
                return (
                  <button
                    key={number}
                    onClick={() => goToPage(number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                      currentPage === number
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                    }`}
                  >
                    {number}
                  </button>
                );
              }
              // Show ellipsis
              if (number === currentPage - 2 || number === currentPage + 2) {
                return (
                  <span key={number} className="w-6 text-center text-slate-400">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-transparent"
            title="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-transparent"
            title="Trang cuối"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

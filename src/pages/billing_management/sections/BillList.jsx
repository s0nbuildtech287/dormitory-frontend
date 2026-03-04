import { useState, useEffect } from "react";
import { Search, Plus, Download, Printer, Send, CreditCard, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Users } from "lucide-react";
import { getInvoices } from "../../../api/apiInvoice.js";

const BillList = ({ bills, setBills }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Fetch invoices from API
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      console.log("Fetching invoices...");
      const response = await getInvoices();
      console.log("Invoice response:", response);
      if (response.success) {
        console.log("Invoices data:", response.data);
        setBills(response.data || []);
      } else {
        console.error("Response not successful:", response);
        setBills([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  // Ensure bills is always an array
  const safeBills = Array.isArray(bills) ? bills : [];

  const filteredBills = safeBills.filter((bill) => {
    const matchesSearch = 
      bill.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bill.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.student_names?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || bill.status === filterStatus;
    const matchesMonth = filterMonth === "All" || bill.billing_month?.startsWith(filterMonth);
    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Pagination calculations
  const totalItems = filteredBills.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredBills.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setFilterMonth("All");
    setCurrentPage(1);
  };

  const hasActiveFilter = searchTerm || filterStatus !== "All" || filterMonth !== "All";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-200">
        <h3 className="text-slate-800 font-medium text-sm mb-4 uppercase tracking-wider">Bộ lọc hóa đơn</h3>

        <div className="flex gap-3 items-center">
          {/* Search */}
          <div className="relative flex-[3]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm số phòng, mã hóa đơn, tên sinh viên..."
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-xs transition-all bg-slate-50/50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
            className="flex-[2] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
            <option value="Chưa thanh toán">Chưa thanh toán</option>
            <option value="Quá hạn">Quá hạn</option>
          </select>

          {/* Month Filter */}
          <select
            value={filterMonth}
            onChange={(e) => handleFilterChange(setFilterMonth, e.target.value)}
            className="flex-[2] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả tháng</option>
            <option value="2026-01">Tháng 1/2026</option>
            <option value="2026-02">Tháng 2/2026</option>
            <option value="2026-03">Tháng 3/2026</option>
            <option value="2026-04">Tháng 4/2026</option>
            <option value="2026-05">Tháng 5/2026</option>
            <option value="2026-06">Tháng 6/2026</option>
            <option value="2026-07">Tháng 7/2026</option>
            <option value="2026-08">Tháng 8/2026</option>
            <option value="2026-09">Tháng 9/2026</option>
            <option value="2026-10">Tháng 10/2026</option>
            <option value="2026-11">Tháng 11/2026</option>
            <option value="2026-12">Tháng 12/2026</option>
          </select>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={!hasActiveFilter}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap"
            title="Xóa bộ lọc"
          >
            ↺ Reset
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3">
          <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-200 transition-colors flex items-center gap-2">
            <Plus size={14} /> Hóa đơn mới
          </button>
          <button className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider text-left">Bảng hóa đơn ({totalItems} kết quả)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b-2 border-slate-300">
              <tr className="bg-slate-200 text-slate-700 text-xs font-black capitalize tracking-widest">
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[12%] text-center">Mã HĐ</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[10%] text-center">Phòng</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[15%] text-center">Sinh viên</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[10%] text-center">Tháng</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[12%] text-center">Tổng tiền</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[10%] text-center">Hạn đóng</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[12%] text-center">Trạng thái</th>
                <th className="px-6 py-3 w-[10%] text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <CreditCard size={48} className="mb-4 opacity-50" />
                      <p className="text-sm font-medium">Không có hóa đơn nào</p>
                      <p className="text-xs mt-1">Thử thay đổi bộ lọc để tìm kiếm</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((bill) => {
                  // Parse dates correctly
                  const billingMonth = bill.billing_month; // Format: YYYY-MM-DD
                  const [year, month] = billingMonth.split('-');
                  const dueDate = new Date(bill.due_date + 'T00:00:00');
                  
                  return (
                    <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-2 font-bold text-slate-900 text-xs border-r-2 border-slate-300 text-center font-mono">
                        {bill.invoice_number}
                      </td>
                      <td className="px-6 py-2 text-slate-700 text-xs border-r-2 border-slate-300 text-center font-bold">
                        {bill.building}-{bill.room_number}
                      </td>
                      <td className="px-6 py-2 text-slate-600 text-xs border-r-2 border-slate-300 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs font-semibold text-slate-700">
                            {bill.occupancy || 0}/{bill.current_occupancy || 5}
                          </span>
                          <Users size={14} className="text-purple-500" />
                        </div>
                      </td>
                      <td className="px-6 py-2 text-slate-600 text-xs border-r-2 border-slate-300 text-center font-semibold">
                        Tháng {parseInt(month)}/{year}
                      </td>
                      <td className="px-6 py-2 font-bold text-blue-700 text-xs border-r-2 border-slate-300 text-center">
                        {(bill.total_amount || 0).toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-2 text-slate-500 font-semibold text-xs border-r-2 border-slate-300 text-center">
                        {dueDate.toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-2 border-r-2 border-slate-300 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          bill.status === "Đã thanh toán" ? "bg-emerald-100 text-emerald-700" : 
                          bill.status === "Quá hạn" ? "bg-rose-100 text-rose-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-2 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button 
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Xem chi tiết"
                          >
                            <Eye size={15} />
                          </button>
                          <button 
                            className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" 
                            title="In hóa đơn"
                          >
                            <Printer size={15} />
                          </button>
                          <button 
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" 
                            title="Gửi nhắc nhở"
                          >
                            <Send size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Hiển thị</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-slate-200 rounded text-xs font-medium"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>mục mỗi trang</span>
            </div>

            <div className="text-sm text-slate-600">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} của {totalItems} mục
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum ? "bg-blue-600 text-white" : "border border-slate-200 hover:bg-slate-50"}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillList;

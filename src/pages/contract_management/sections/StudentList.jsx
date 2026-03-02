import React, { useState } from "react";
import { Search, Eye, Clock, CheckCircle2, XCircle, FileX, Trash2, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Mail } from "lucide-react";

const STATUS_CONFIG = {
  Pending: { label: "Chờ gán phòng", cls: "bg-amber-100 text-amber-700", icon: <Clock size={11} /> },
  Active: { label: "Đang nội trú", cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={11} /> },
  Expired: { label: "Hết hạn", cls: "bg-slate-100 text-slate-600", icon: <FileX size={11} /> },
  Terminated: { label: "Chấm dứt", cls: "bg-rose-100 text-rose-700", icon: <XCircle size={11} /> },
};

const StudentList = ({ contracts = [], loading, onViewDetail, onRefresh, onDeleteContract }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  // Track email sent locally (chưa dùng backend)
  const [emailSentSet, setEmailSentSet] = useState(new Set());

  const markEmailSent = (id) => setEmailSentSet((prev) => new Set([...prev, id]));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const filtered = contracts.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = (c.student_name?.toLowerCase().includes(q) ?? false) || (c.snapshot_student_id?.toLowerCase().includes(q) ?? false) || (c.contract_number?.toLowerCase().includes(q) ?? false);
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    const matchGender = filterGender === "All" || c.snapshot_gender === filterGender;
    return matchSearch && matchStatus && matchGender;
  });

  // Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filtered.slice(startIndex, endIndex);

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filters - giống room_management */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-200">
        <h3 className="text-slate-800 font-medium text-sm mb-4 uppercase tracking-wider">Bộ lọc hợp đồng</h3>
        <div className="grid grid-cols-6 gap-4 items-center">
          <div className="relative col-span-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên, mã SV, số HĐ..."
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all bg-slate-50/50"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Pending">Chờ gán phòng</option>
            <option value="Active">Đang nội trú</option>
            <option value="Expired">Hết hạn</option>
            <option value="Terminated">Chấm dứt</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => handleFilterChange(setFilterGender, e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          <div className="col-span-2 text-right text-xs text-slate-400 font-bold">{totalItems} kết quả</div>
        </div>
      </div>

      {/* Table - giống room_management */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider text-left">Bảng hợp đồng sinh viên ({totalItems} kết quả)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b-2 border-slate-300">
              <tr className="bg-slate-200 text-slate-700 text-xs font-black capitalize tracking-widest">
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[11%] text-center">Số / Mã HĐ</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[18%] text-center">Sinh viên</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[10%] text-center">Phòng</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[20%] text-center">Trạng thái</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[16%] text-center">Thời hạn</th>
                <th className="px-6 py-3 w-[12%] text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <FileText size={48} className="mb-4 opacity-50" />
                      <p className="text-sm font-medium">Không có hợp đồng nào</p>
                      <p className="text-xs mt-1">Thử thay đổi bộ lọc để tìm kiếm</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((c) => {
                  const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.Active;
                  const isPending = c.status === "Pending";
                  return (
                    <tr key={c.id} className={`hover:bg-slate-50/50 transition-colors ${isPending ? "bg-amber-50/30" : ""}`}>
                      {/* Contract number */}
                      <td className="px-6 py-2 text-xs font-mono border-r-2 border-slate-300 text-center">
                        {c.contract_number ? (
                          <span className="font-bold text-blue-700">{c.contract_number}</span>
                        ) : (
                          <span className="font-semibold text-slate-400 italic">Chưa có số</span>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono font-normal truncate">
                          {c.id || ""}
                        </p>
                      </td>

                      {/* Student info — tên + mã SV tách 2 dòng */}
                      <td className="px-6 py-2 border-r-2 border-slate-300 text-center">
                        <p className="font-semibold text-slate-900 text-xs truncate max-w-[150px] mx-auto">
                          {c.student_name || "—"}
                        </p>
                        {c.snapshot_student_id && (
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate max-w-[150px] mx-auto">
                            {c.snapshot_student_id}
                          </p>
                        )}
                      </td>

                      {/* Room */}
                      <td className="px-6 py-2 text-center border-r-2 border-slate-300">
                        {c.room_number ? (
                          <span className="font-semibold text-blue-700 text-xs">
                            {c.room_number}
                            {c.building ? ` (${c.building})` : ""}
                          </span>
                        ) : (
                          <span className="text-amber-600 text-xs font-semibold italic">Chưa có phòng</span>
                        )}
                      </td>

                      {/* Status + inline badges */}
                      <td className="px-6 py-2 text-center border-r-2 border-slate-300">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${statusCfg.cls}`}>
                            {statusCfg.icon} {statusCfg.label}
                          </span>
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${c.deposit_paid ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                          >
                            {c.deposit_paid ? "Đã cọc" : "Chưa cọc"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${c.hard_copy_received ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                          >
                            {c.hard_copy_received ? "Đã bản cứng" : "Chưa bản cứng"}
                          </span>
                        </div>
                      </td>

                      {/* Thời hạn — 1 dòng */}
                      <td className="px-6 py-2 text-center border-r-2 border-slate-300">
                        {c.start_date ? (
                          <span className="text-xs text-slate-700 font-semibold whitespace-nowrap">
                            {new Date(c.start_date).toLocaleDateString("vi-VN")} → {c.end_date ? new Date(c.end_date).toLocaleDateString("vi-VN") : "—"}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa xác định</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      {(() => {
                        const emailSent = emailSentSet.has(c.id) || !!c.email_sent_at;
                        return (
                          <td className="px-6 py-2 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => onViewDetail(c.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={isPending ? "Gán phòng" : "Xem chi tiết"}>
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  if (!emailSent) markEmailSent(c.id);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${emailSent ? "text-slate-800 hover:bg-slate-100" : "text-blue-500 hover:bg-blue-50"}`}
                                title={emailSent ? `Đã gửi email${c.email_sent_at ? " " + new Date(c.email_sent_at).toLocaleDateString("vi-VN") : ""}` : "Gửi email thông báo"}
                              >
                                <Mail size={15} />
                              </button>
                              <button onClick={() => onDeleteContract(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa hợp đồng">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        );
                      })()}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - giống room_management */}
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

export default StudentList;

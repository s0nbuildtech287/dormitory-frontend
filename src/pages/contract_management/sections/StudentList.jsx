import React, { useState } from "react";
import { Search, Eye, Clock, CheckCircle2, XCircle, FileX } from "lucide-react";

const STATUS_CONFIG = {
  Pending: { label: "Chờ gán phòng", cls: "bg-amber-100 text-amber-700", icon: <Clock size={11} /> },
  Active: { label: "Đang nội trú", cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={11} /> },
  Expired: { label: "Hết hạn", cls: "bg-slate-100 text-slate-600", icon: <FileX size={11} /> },
  Terminated: { label: "Chấm dứt", cls: "bg-rose-100 text-rose-700", icon: <XCircle size={11} /> },
};

const StudentList = ({ contracts = [], loading, onViewDetail, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = contracts.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = (c.student_name?.toLowerCase().includes(q) ?? false) || (c.snapshot_student_id?.toLowerCase().includes(q) ?? false) || (c.contract_number?.toLowerCase().includes(q) ?? false);
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    const matchGender = filterGender === "All" || c.snapshot_gender === filterGender;
    return matchSearch && matchStatus && matchGender;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getAvatar = (name) => {
    const initials = name
      ? name
          .split(" ")
          .map((w) => w[0])
          .slice(-2)
          .join("")
          .toUpperCase()
      : "?";
    return initials;
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Filters */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="relative col-span-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên, mã SV, số HĐ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm bg-slate-50/50"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="col-span-3 text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Pending">Chờ gán phòng</option>
            <option value="Active">Đang nội trú</option>
            <option value="Expired">Hết hạn</option>
            <option value="Terminated">Chấm dứt</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => {
              setFilterGender(e.target.value);
              setCurrentPage(1);
            }}
            className="col-span-2 text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700"
          >
            <option value="All">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          <div className="col-span-3 text-right text-xs text-slate-400 font-bold">{filtered.length} kết quả</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
            <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mr-3" />
            Đang tải...
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-24 text-slate-400 text-sm">Không có hợp đồng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-[11px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4 border-r border-slate-200">Số HĐ</th>
                  <th className="px-6 py-4 border-r border-slate-200">Sinh viên</th>
                  <th className="px-6 py-4 border-r border-slate-200">Năm học</th>
                  <th className="px-6 py-4 border-r border-slate-200">Phòng</th>
                  <th className="px-6 py-4 border-r border-slate-200">Trạng thái</th>
                  <th className="px-6 py-4 border-r border-slate-200">Ngày tạo</th>
                  <th className="px-6 py-4 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((c) => {
                  const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.Active;
                  const isPending = c.status === "Pending";
                  return (
                    <tr key={c.id} className={`hover:bg-slate-50/50 transition-colors ${isPending ? "bg-amber-50/30" : ""}`}>
                      {/* Contract number */}
                      <td className="px-6 py-4 border-r border-slate-200">
                        <span className="text-xs font-mono font-bold text-blue-600">{c.contract_number || `#${c.id?.slice(-8)}`}</span>
                        {isPending && <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-black uppercase">Cần gán phòng</span>}
                      </td>

                      {/* Student info */}
                      <td className="px-6 py-4 border-r border-slate-200">
                        <div className="flex items-center gap-3">
                          {c.student_avatar ? (
                            <img src={c.student_avatar} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black flex-shrink-0">{getAvatar(c.student_name)}</div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">{c.student_name || "—"}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{c.snapshot_student_id || c.student_email || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Year + gender */}
                      <td className="px-6 py-4 border-r border-slate-200">
                        <div className="text-sm font-bold text-slate-700">{c.snapshot_year ? `Năm ${c.snapshot_year}` : "—"}</div>
                        <div className="text-[10px] text-slate-400">{c.snapshot_gender || "—"}</div>
                      </td>

                      {/* Room */}
                      <td className="px-6 py-4 border-r border-slate-200">
                        {c.room_number ? (
                          <span className="font-bold text-blue-700 text-sm">
                            {c.room_number}
                            {c.building ? ` (${c.building})` : ""}
                          </span>
                        ) : (
                          <span className="text-amber-600 text-xs font-bold italic">Chưa có phòng</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 border-r border-slate-200">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusCfg.cls}`}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Created at */}
                      <td className="px-6 py-4 border-r border-slate-200 text-xs text-slate-500">{c.created_at ? new Date(c.created_at).toLocaleDateString("vi-VN") : "—"}</td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => onViewDetail(c.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold"
                        >
                          <Eye size={13} />
                          {isPending ? "Gán phòng" : "Xem"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Trang {currentPage}/{totalPages} · {filtered.length} bản ghi
            </p>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${currentPage === p ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;

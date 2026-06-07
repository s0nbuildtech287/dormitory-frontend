import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, Send, Search, Trash2, CheckCircle, Clock,
  Loader2, RotateCcw, X, ChevronDown, Wrench, Shield, Trash2 as TrashIcon,
  Cpu, HelpCircle, TrendingUp, TrendingDown, Minus, Filter,
} from "lucide-react";
import Pagination from "../../../components/common/Pagination.jsx";
import { API_BASE_URL } from "../../../config/api.js";

const API = API_BASE_URL;
const token = () => localStorage.getItem("token");

const CATEGORY_ICON = {
  "Sửa chữa":      <Wrench size={14} />,
  "Vệ sinh":        <TrashIcon size={14} />,
  "An ninh":        <Shield size={14} />,
  "Trang thiết bị": <Cpu size={14} />,
  "Khác":           <HelpCircle size={14} />,
};

const STATUS_CFG = {
  New:        { label: "Chờ xử lý",     cls: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-400" },
  Processing: { label: "Đang xử lý",    cls: "bg-blue-50 text-blue-700 border-blue-200",     dot: "bg-blue-400" },
  Resolved:   { label: "Đã giải quyết", cls: "bg-green-50 text-green-700 border-green-200",  dot: "bg-green-400" },
};

const SENTIMENT_CFG = {
  Positive: { icon: <TrendingUp size={13} className="text-green-500" />,  label: "Tích cực" },
  Neutral:  { icon: <Minus size={13} className="text-slate-400" />,       label: "Trung lập" },
  Negative: { icon: <TrendingDown size={13} className="text-red-500" />,  label: "Tiêu cực" },
};

const SENTIMENT_BADGE = {
  Positive: "bg-green-50 text-green-700 border-green-200",
  Neutral:  "bg-yellow-50 text-yellow-700 border-yellow-200",
  Negative: "bg-red-50 text-red-700 border-red-200",
};

const PRIORITY_BADGE = {
  High:   "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-orange-50 text-orange-700 border-orange-200",
  Low:    "bg-slate-50 text-slate-600 border-slate-200",
};

const PRIORITY_LABEL = {
  High:   "Cao",
  Medium: "Trung bình",
  Low:    "Thấp",
};

const SentimentBadge = ({ value }) => {
  if (!value) return <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Đang phân tích...</span>;
  const cfg = SENTIMENT_CFG[value];
  const cls = SENTIMENT_BADGE[value] || "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {cfg?.icon}{cfg?.label || value}
    </span>
  );
};

const PriorityBadge = ({ value }) => {
  if (!value) return <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Đang phân tích...</span>;
  const cls = PRIORITY_BADGE[value] || "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {PRIORITY_LABEL[value] || value}
    </span>
  );
};

const fmt = (iso) => new Date(iso).toLocaleString("vi-VN", {
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit",
});

const FeedbackList = ({ feedbacks, setFeedbacks }) => {
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState(null);
  const [replyText, setReplyText]       = useState("");
  const [sending, setSending]           = useState(false);
  const [deletingId, setDeletingId]     = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // id cần xóa
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all")   params.set("status",   filterStatus);
      if (filterCategory !== "all") params.set("category", filterCategory);
      if (filterPriority !== "all") params.set("priority", filterPriority);
      if (search)                   params.set("search",   search);

      const res = await fetch(`${API}/feedbacks?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      setFeedbacks(Array.isArray(data.data) ? data.data : []);
      setCurrentPage(1);
    } catch {
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory, filterPriority, search, setFeedbacks]);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  // Phân trang client-side
  const totalPages = Math.max(1, Math.ceil(feedbacks.length / itemsPerPage));
  const paginated  = feedbacks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const pagination = {
    currentPage, totalPages, totalItems: feedbacks.length, itemsPerPage,
    setItemsPerPage: (v) => { setItemsPerPage(v); setCurrentPage(1); },
    goToPage: setCurrentPage,
    nextPage: () => setCurrentPage(p => Math.min(p + 1, totalPages)),
    prevPage: () => setCurrentPage(p => Math.max(p - 1, 1)),
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/feedbacks/${selected.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status: "Resolved", adminResponse: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyText("");
        setShowModal(false);
        setSelected(data.data);
        fetchFeedbacks();
      }
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    const id = deleteTarget;
    setDeleteTarget(null);
    setDeletingId(id);
    try {
      await fetch(`${API}/feedbacks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (selected?.id === id) setSelected(null);
      fetchFeedbacks();
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    await fetch(`${API}/feedbacks/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status: newStatus }),
    });
    setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    fetchFeedbacks();
  };
  const categories = ["Sửa chữa", "Vệ sinh", "An ninh", "Trang thiết bị", "Khác"];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

      {/* ── Danh sách ── */}
      <div className="xl:col-span-3 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên sinh viên, nội dung..."
              className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Filter size={13} className="text-slate-400" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-transparent text-sm outline-none text-slate-700 cursor-pointer">
              <option value="all">Tất cả trạng thái</option>
              <option value="New">Chờ xử lý</option>
              <option value="Processing">Đang xử lý</option>
              <option value="Resolved">Đã giải quyết</option>
            </select>
            <ChevronDown size={13} className="text-slate-400" />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Filter size={13} className="text-slate-400" />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="bg-transparent text-sm outline-none text-slate-700 cursor-pointer">
              <option value="all">Tất cả danh mục</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} className="text-slate-400" />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Filter size={13} className="text-slate-400" />
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
              className="bg-transparent text-sm outline-none text-slate-700 cursor-pointer">
              <option value="all">Tất cả mức độ</option>
              <option value="High">Cao</option>
              <option value="Medium">Trung bình</option>
              <option value="Low">Thấp</option>
            </select>
            <ChevronDown size={13} className="text-slate-400" />
          </div>
          <button onClick={fetchFeedbacks}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <RotateCcw size={15} />
          </button>
          <span className="text-xs text-slate-400 ml-auto">{feedbacks.length} kết quả</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3.5 text-left">Sinh viên</th>
                <th className="px-5 py-3.5 text-left">Danh mục</th>
                <th className="px-5 py-3.5 text-left">Nội dung</th>
                <th className="px-5 py-3.5 text-left">Trạng thái</th>
                <th className="px-5 py-3.5 text-left">AI</th>
                <th className="px-5 py-3.5 text-left">Ngày gửi</th>
                <th className="px-5 py-3.5 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <Loader2 size={28} className="animate-spin text-slate-300 mx-auto" />
                </td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-400">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="font-semibold text-sm">Không có phản ánh nào</p>
                </td></tr>
              ) : paginated.map(f => {
                const cfg = STATUS_CFG[f.status] || STATUS_CFG.New;
                const isSelected = selected?.id === f.id;
                return (
                  <tr key={f.id}
                    onClick={() => setSelected(f)}
                    className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-slate-50/60"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(f.student_name || "SV")}&background=1e293b&color=fff&size=32`}
                          className="w-8 h-8 rounded-full shrink-0"
                          alt=""
                        />
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{f.student_name || "—"}</p>
                          <p className="text-xs text-slate-400">{f.student_code || f.student_email || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {CATEGORY_ICON[f.category] || <HelpCircle size={12} />}
                        {f.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <p className="text-xs text-slate-600 line-clamp-2">{f.content}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <SentimentBadge value={f.sentiment} />
                        <PriorityBadge value={f.priority} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {fmt(f.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(f.id); }}
                        disabled={deletingId === f.id}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        {deletingId === f.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Trash2 size={13} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination pagination={pagination} />
      </div>

      {/* ── Chi tiết ── */}
      <div className="xl:col-span-2">
        {selected ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Chi tiết phản ánh</h3>
              <button onClick={() => setSelected(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <X size={15} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Student */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selected.student_name || "SV")}&background=1e293b&color=fff&size=48`}
                  className="w-12 h-12 rounded-full"
                  alt=""
                />
                <div>
                  <p className="font-bold text-slate-800">{selected.student_name || "—"}</p>
                  <p className="text-xs text-slate-500">{selected.student_code || selected.student_email || ""}</p>
                  {selected.room_number && (
                    <p className="text-xs text-slate-400">Phòng {selected.room_number} – {selected.building}</p>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Danh mục</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {CATEGORY_ICON[selected.category] || <HelpCircle size={13} />}
                    {selected.category}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Cảm xúc</p>
                  <SentimentBadge value={selected.sentiment} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Mức độ ưu tiên</p>
                  <PriorityBadge value={selected.priority} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Trạng thái</p>
                  {(() => {
                    const cfg = STATUS_CFG[selected.status] || STATUS_CFG.New;
                    return (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Ngày gửi</p>
                  <p className="text-sm text-slate-700">{fmt(selected.created_at)}</p>
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Nội dung phản ánh</p>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed">{selected.content}</p>
                </div>
              </div>

              {/* Admin response */}
              {selected.admin_response ? (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Phản hồi của ban quản lý</p>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-blue-800 leading-relaxed">{selected.admin_response}</p>
                    {selected.resolved_at && (
                      <p className="text-xs text-blue-400 mt-2">Xử lý lúc: {fmt(selected.resolved_at)}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <p className="text-xs text-amber-600 flex items-center gap-1.5">
                    <Clock size={12} /> Chưa có phản hồi từ ban quản lý
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-slate-100 space-y-2">
              {/* Dropdown đổi trạng thái */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Đổi trạng thái</label>
                <div className="relative">
                  <select
                    value={selected.status}
                    onChange={e => handleStatusChange(selected.id, e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 appearance-none bg-white pr-8"
                  >
                    <option value="New">Chờ xử lý</option>
                    <option value="Processing">Đang xử lý</option>
                    <option value="Resolved">Đã giải quyết</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              {/* Nút phản hồi */}
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <Send size={14} /> Gửi phản hồi cho sinh viên
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-24 text-slate-400">
            <MessageSquare size={40} className="opacity-20 mb-3" />
            <p className="text-sm font-semibold">Chọn phản ánh để xem chi tiết</p>
          </div>
        )}
      </div>

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-5 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Xóa phản ánh</h3>
              <p className="text-sm text-slate-500">Phản ánh này sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all">
                Hủy
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-all">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reply Modal ── */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Phản hồi phản ánh</h3>
              <button onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 mb-1">Phản ánh từ {selected.user_name}</p>
                <p className="text-sm text-slate-700 line-clamp-3">{selected.content}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Nội dung phản hồi</label>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={5}
                  placeholder="Nhập nội dung phản hồi..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all">
                  Hủy
                </button>
                <button onClick={handleReply} disabled={sending || !replyText.trim()}
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                  {sending ? <><Loader2 size={14} className="animate-spin" /> Đang gửi...</> : <><Send size={14} /> Gửi phản hồi</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;

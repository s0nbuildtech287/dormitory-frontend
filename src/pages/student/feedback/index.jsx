import { useEffect, useState } from "react";
import {
  Send, MessageSquare, CheckCircle, Clock, Loader2,
  ChevronDown, AlertCircle, Wrench, Shield, Trash2, Cpu, HelpCircle,
} from "lucide-react";
import { getStudentFeedbacks, createStudentFeedback } from "../../../api/apiStudent.js";

const CATEGORIES = ["Sửa chữa", "Vệ sinh", "An ninh", "Trang thiết bị", "Khác"];

const CATEGORY_ICON = {
  "Sửa chữa":      <Wrench size={14} />,
  "Vệ sinh":        <Trash2 size={14} />,
  "An ninh":        <Shield size={14} />,
  "Trang thiết bị": <Cpu size={14} />,
  "Khác":           <HelpCircle size={14} />,
};

const STATUS_CFG = {
  New:        { label: "Chờ xử lý",    cls: "bg-amber-50 text-amber-700 border-amber-200",   dot: "bg-amber-400",   icon: <Clock size={12} /> },
  Processing: { label: "Đang xử lý",   cls: "bg-blue-50 text-blue-700 border-blue-200",      dot: "bg-blue-400",    icon: <Loader2 size={12} className="animate-spin" /> },
  Resolved:   { label: "Đã giải quyết",cls: "bg-green-50 text-green-700 border-green-200",   dot: "bg-green-400",   icon: <CheckCircle size={12} /> },
};

const fmt = (iso) => new Date(iso).toLocaleDateString("vi-VN", {
  day: "2-digit", month: "2-digit", year: "numeric",
});

const StudentFeedback = () => {
  const [feedbacks, setFeedbacks]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [content, setContent]       = useState("");
  const [category, setCategory]     = useState("Khác");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(false);
  const [expanded, setExpanded]     = useState(null);

  const load = () => {
    setLoading(true);
    getStudentFeedbacks()
      .then((res) => setFeedbacks(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setFeedbacks([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await createStudentFeedback({ content, category });
      setContent("");
      setCategory("Khác");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      load();
    } catch (err) {
      setError(err.message || "Gửi thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total:      feedbacks.length,
    pending:    feedbacks.filter(f => f.status === "New").length,
    processing: feedbacks.filter(f => f.status === "Processing").length,
    resolved:   feedbacks.filter(f => f.status === "Resolved").length,
  };

  return (
    <div className="space-y-6">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Tổng phản ánh",   value: stats.total,      color: "text-slate-700",  bg: "bg-white" },
          { label: "Chờ xử lý",       value: stats.pending,    color: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Đang xử lý",      value: stats.processing, color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Đã giải quyết",   value: stats.resolved,   color: "text-green-600",  bg: "bg-green-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-200 px-5 py-4 shadow-sm`}>
            <p className="text-xs text-slate-500 font-medium mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Form gửi phản ánh ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" />
              <h3 className="font-bold text-slate-800">Gửi phản ánh mới</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Danh mục */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Danh mục</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 appearance-none bg-white pr-9"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Nội dung */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Nội dung phản ánh</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={7}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 resize-none"
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{content.length} ký tự</p>
              </div>

              {error   && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              {success && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-1.5"><CheckCircle size={13} /> Gửi phản ánh thành công!</p>}

              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 disabled:opacity-40 transition-all"
              >
                {submitting
                  ? <><Loader2 size={15} className="animate-spin" /> Đang gửi...</>
                  : <><Send size={15} /> Gửi phản ánh</>
                }
              </button>
            </form>
          </div>

          {/* Hướng dẫn */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5"><AlertCircle size={13} /> Lưu ý khi gửi phản ánh</p>
            <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
              <li>Mô tả rõ ràng vị trí và vấn đề gặp phải</li>
              <li>Chọn đúng danh mục để được xử lý nhanh hơn</li>
              <li>Ban quản lý sẽ phản hồi trong vòng 24–48 giờ</li>
            </ul>
          </div>
        </div>

        {/* ── Lịch sử phản ánh ── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Lịch sử phản ánh</h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-semibold">{feedbacks.length} phản ánh</span>
            </div>

            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="py-16 flex justify-center">
                  <Loader2 size={28} className="animate-spin text-slate-300" />
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                  <MessageSquare size={40} className="opacity-20" />
                  <p className="text-sm font-semibold">Chưa có phản ánh nào</p>
                  <p className="text-xs">Hãy gửi phản ánh đầu tiên của bạn</p>
                </div>
              ) : feedbacks.map(f => {
                const cfg = STATUS_CFG[f.status] || STATUS_CFG.New;
                const isOpen = expanded === f.id;
                return (
                  <div key={f.id} className="hover:bg-slate-50/50 transition-colors">
                    <button
                      onClick={() => setExpanded(isOpen ? null : f.id)}
                      className="w-full text-left px-6 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Category icon */}
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                            {CATEGORY_ICON[f.category] || <HelpCircle size={14} />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{f.category}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{f.content}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                          <span className="text-xs text-slate-400">{fmt(f.created_at)}</span>
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className="px-6 pb-5 space-y-3">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Nội dung phản ánh</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{f.content}</p>
                        </div>
                        {f.admin_response ? (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <CheckCircle size={12} /> Phản hồi từ Ban quản lý
                            </p>
                            <p className="text-sm text-blue-800 leading-relaxed">{f.admin_response}</p>
                            {f.resolved_at && (
                              <p className="text-xs text-blue-400 mt-2">Xử lý lúc: {fmt(f.resolved_at)}</p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                            <p className="text-xs text-amber-600 flex items-center gap-1.5">
                              <Clock size={12} /> Đang chờ phản hồi từ ban quản lý...
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedback;

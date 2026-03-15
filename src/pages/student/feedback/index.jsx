import { useEffect, useState } from "react";
import { Send, AlertCircle, TrendingUp, TrendingDown, Minus, MessageSquare } from "lucide-react";
import { getStudentFeedbacks, createStudentFeedback } from "../../../api/apiStudent.js";

const CATEGORIES = ["Sửa chữa", "Vệ sinh", "An ninh", "Trang thiết bị", "Khác"];

const STATUS_CFG = {
  New:        { cls: "bg-amber-100 text-amber-700",   label: "Chờ xử lý" },
  Processing: { cls: "bg-blue-100 text-blue-700",     label: "Đang xử lý" },
  Resolved:   { cls: "bg-emerald-100 text-emerald-700", label: "Đã giải quyết" },
};

const SentimentIcon = ({ s }) => {
  if (s === "Positive") return <TrendingUp size={13} className="text-emerald-500" />;
  if (s === "Negative") return <TrendingDown size={13} className="text-rose-500" />;
  return <Minus size={13} className="text-slate-400" />;
};

const StudentFeedback = () => {
  const [feedbacks, setFeedbacks]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [content, setContent]       = useState("");
  const [category, setCategory]     = useState("Khác");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  // Tải danh sách phản hồi khi mount
  const load = () => {
    setLoading(true);
    getStudentFeedbacks()
      .then((res) => setFeedbacks(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setFeedbacks([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Gửi phản hồi mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createStudentFeedback({ content, category });
      setContent("");
      setCategory("Khác");
      load(); // Tải lại danh sách
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── Form gửi phản hồi ── */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-slate-900">
            <AlertCircle size={18} className="text-blue-600" /> Gửi phản ánh mới
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Danh mục */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">Danh mục</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Nội dung */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">Nội dung</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                placeholder="Mô tả vấn đề bạn gặp phải..."
              />
            </div>

            {error && <p className="text-xs text-rose-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95"
            >
              {submitting ? "Đang gửi..." : <><Send size={15} /> Gửi phản ánh</>}
            </button>
          </form>
        </div>
      </div>

      {/* ── Lịch sử phản hồi ── */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="font-bold text-base text-slate-900 px-1">
          Lịch sử phản ánh ({feedbacks.length})
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
            <MessageSquare size={36} className="text-slate-200" />
            <p className="text-sm">Chưa có phản ánh nào</p>
          </div>
        ) : (
          feedbacks.map((f) => {
            const cfg = STATUS_CFG[f.status] || { cls: "bg-slate-100 text-slate-600", label: f.status };
            return (
              <div key={f.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${cfg.cls}`}>{cfg.label}</span>
                    <span className="px-2.5 py-1 bg-slate-50 rounded-lg text-[10px] text-slate-500 font-bold">{f.category}</span>
                    {f.sentiment && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg text-[10px] text-slate-500 font-bold">
                        <SentimentIcon s={f.sentiment} />{f.sentiment}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(f.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">{f.content}</p>

                {/* Phản hồi từ admin */}
                {f.admin_response && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Phản hồi từ Ban quản lý</p>
                    <p className="text-xs text-blue-800">{f.admin_response}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentFeedback;

import { useEffect, useState } from "react";
import { Bell, Megaphone, AlertTriangle, Wrench, CreditCard, Info, Clock } from "lucide-react";
import { getStudentNotifications } from "../../../api/apiStudent.js";

const TYPE_CONFIG = {
  "Thông báo chung": { icon: Megaphone, bg: "bg-blue-50", border: "border-blue-400", iconBg: "bg-blue-100", iconColor: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  "Thanh toán":      { icon: CreditCard, bg: "bg-emerald-50", border: "border-emerald-400", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  "Bảo trì":         { icon: Wrench, bg: "bg-amber-50", border: "border-amber-400", iconBg: "bg-amber-100", iconColor: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
  "Khẩn cấp":        { icon: AlertTriangle, bg: "bg-rose-50", border: "border-rose-500", iconBg: "bg-rose-100", iconColor: "text-rose-600", badge: "bg-rose-100 text-rose-700" },
  "Kỷ luật":         { icon: Bell, bg: "bg-purple-50", border: "border-purple-400", iconBg: "bg-purple-100", iconColor: "text-purple-600", badge: "bg-purple-100 text-purple-700" },
};

const DEFAULT_CFG = { icon: Info, bg: "bg-slate-50", border: "border-slate-300", iconBg: "bg-slate-100", iconColor: "text-slate-500", badge: "bg-slate-100 text-slate-600" };

const formatDate = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d)) return "";
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return d.toLocaleDateString("vi-VN");
};

const StudentHome = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getStudentNotifications()
      .then((res) => setNotifications(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const types = ["All", ...Object.keys(TYPE_CONFIG)];

  const filtered = notifications
    .filter((n) => n.is_published !== false)
    .filter((n) => filterType === "All" || n.type === filterType)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const urgent = filtered.filter((n) => n.type === "Khẩn cấp");

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-100 rounded-2xl">
          <Bell size={22} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Thông báo từ Ban quản lý</h2>
          <p className="text-xs text-slate-500">{filtered.length} thông báo</p>
        </div>
      </div>

      {/* Urgent banner */}
      {urgent.length > 0 && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3 animate-in fade-in duration-300">
          <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-rose-700 mb-1">Có {urgent.length} thông báo khẩn cấp</p>
            <p className="text-xs text-rose-600">{urgent[0].title}</p>
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterType === t ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t === "All" ? "Tất cả" : t}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Chưa có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || DEFAULT_CFG;
            const Icon = cfg.icon;
            const isOpen = expanded === n.id;
            return (
              <div
                key={n.id}
                onClick={() => setExpanded(isOpen ? null : n.id)}
                className={`${cfg.bg} border-l-4 ${cfg.border} rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md select-none`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${cfg.iconBg}`}>
                    <Icon size={18} className={cfg.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">{n.title}</h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>{n.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                      <Clock size={11} />
                      <span>{formatDate(n.created_at)}</span>
                    </div>
                    <p className={`text-sm text-slate-600 leading-relaxed ${isOpen ? "" : "line-clamp-2"}`}>
                      {n.content}
                    </p>
                    {!isOpen && n.content?.length > 120 && (
                      <p className="text-xs text-blue-500 font-semibold mt-1">Xem thêm</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentHome;

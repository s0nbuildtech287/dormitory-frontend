import { useEffect, useState } from "react";
import {
  Megaphone, AlertTriangle, Wrench, CreditCard, Bell, Info,
  Shield, ChevronRight, Clock
} from "lucide-react";
import { getStudentNotifications } from "../../../api/apiStudent.js";
import { usePagination } from "../../../hooks/usePagination.js";
import Pagination from "../../../components/common/Pagination.jsx";

// ── Cấu hình từng loại thông báo ──────────────────────────────────────────
const TYPE_CFG = {
  "Thông báo chung": { icon: Megaphone,     dot: "bg-blue-500",    badge: "bg-blue-100 text-blue-700",    row: "hover:bg-blue-50/40" },
  "Thanh toán":      { icon: CreditCard,    dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", row: "hover:bg-emerald-50/40" },
  "Bảo trì":         { icon: Wrench,        dot: "bg-amber-500",   badge: "bg-amber-100 text-amber-700",  row: "hover:bg-amber-50/40" },
  "Khẩn cấp":        { icon: AlertTriangle, dot: "bg-rose-500",    badge: "bg-rose-100 text-rose-700",    row: "hover:bg-rose-50/40" },
  "Kỷ luật":         { icon: Shield,        dot: "bg-purple-500",  badge: "bg-purple-100 text-purple-700", row: "hover:bg-purple-50/40" },
};
const DEFAULT_CFG = { icon: Info, dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600", row: "hover:bg-slate-50" };

const TABS = ["Tất cả", "Thông báo chung", "Thanh toán", "Bảo trì", "Khẩn cấp", "Kỷ luật"];

// Thời gian tương đối
const relTime = (val) => {
  if (!val) return "";
  const diff = Math.floor((Date.now() - new Date(val)) / 1000);
  if (diff < 60)   return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} ngày`;
  return new Date(val).toLocaleDateString("vi-VN");
};

// ── Component hàng thông báo (giống email row) ────────────────────────────
const NotifRow = ({ n, isRead, onClick, isSelected }) => {
  const cfg = TYPE_CFG[n.type] || DEFAULT_CFG;
  const Icon = cfg.icon;
  const urgent = n.type === "Khẩn cấp";

  return (
    <div
      onClick={onClick}
      className={`
        flex items-start gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors
        ${isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : cfg.row}
        ${!isRead ? "bg-white" : "bg-slate-50/60"}
      `}
    >
      {/* Icon loại */}
      <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${isRead ? "opacity-50" : ""} ${cfg.badge}`}>
        <Icon size={13} />
      </div>

      {/* Nội dung */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {/* Chấm chưa đọc */}
          {!isRead && <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />}
          <p className={`text-sm truncate ${!isRead ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
            {n.title}
          </p>
          {urgent && (
            <span className="shrink-0 px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded uppercase tracking-wide">
              Khẩn
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate leading-relaxed">{n.content}</p>
      </div>

      {/* Thời gian */}
      <span className={`text-[11px] shrink-0 mt-0.5 ${!isRead ? "font-bold text-slate-700" : "text-slate-400"}`}>
        {relTime(n.created_at)}
      </span>
    </div>
  );
};

// ── Component panel chi tiết (bên phải) ──────────────────────────────────
const DetailPanel = ({ n, onClose }) => {
  if (!n) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3">
      <Bell size={48} strokeWidth={1} />
      <p className="text-sm">Chọn thông báo để xem chi tiết</p>
    </div>
  );

  const cfg = TYPE_CFG[n.type] || DEFAULT_CFG;
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.badge}`}>
              <Icon size={11} />{n.type}
            </span>
          </div>
          <h2 className="text-base font-black text-slate-900 leading-snug">{n.title}</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Clock size={11} />
            {n.created_at ? new Date(n.created_at).toLocaleString("vi-VN") : ""}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none shrink-0">✕</button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{n.content}</p>
        {n.attachment_url && (
          <a
            href={n.attachment_url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
          >
            <ChevronRight size={12} /> Xem tệp đính kèm
          </a>
        )}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────
const StudentHome = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState("Tất cả");
  const [selected, setSelected]           = useState(null);
  const [readIds, setReadIds]             = useState(new Set());

  useEffect(() => {
    getStudentNotifications()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setNotifications(list);
        // Tự động chọn thông báo đầu tiên nếu có
        if (list.length > 0) {
          setSelected(list[0]);
          setReadIds(new Set([list[0].id]));
        }
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = notifications.filter(
    (n) => tab === "Tất cả" || n.type === tab
  );

  const pagination = usePagination(filtered, 15);
  const { currentItems, goToPage } = pagination;

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const handleSelect = (n) => {
    setSelected(n);
    setReadIds((prev) => new Set([...prev, n.id]));
  };

  // Reset về trang 1 khi đổi tab
  const handleTabChange = (t) => {
    setTab(t);
    goToPage(1);
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 8rem)" }}>

      {/* ── Tab lọc nhanh (giống Gmail categories) ── */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 shrink-0">
        {TABS.map((t) => {
          const cfg = TYPE_CFG[t] || null;
          const count = t === "Tất cả"
            ? notifications.length
            : notifications.filter((n) => n.type === t).length;
          return (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`
                flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap
                ${tab === t
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"}
              `}
            >
              {cfg && <cfg.icon size={13} />}
              {t}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        {unreadCount > 0 && (
          <span className="ml-auto mr-2 text-xs text-slate-400 shrink-0">
            {unreadCount} chưa đọc
          </span>
        )}
      </div>

      {/* ── Body: list + detail ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Danh sách (trái) */}
        <div className={`flex flex-col border-r border-slate-200 overflow-y-auto shrink-0 ${selected ? "w-2/5" : "w-full"}`}>
          {loading ? (
            <div className="space-y-0">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3 border-b border-slate-100">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded animate-pulse w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300 gap-3">
              <Bell size={40} strokeWidth={1} />
              <p className="text-sm text-slate-400">Không có thông báo</p>
            </div>
          ) : (
            <>
              {currentItems.map((n) => (
                <NotifRow
                  key={n.id}
                  n={n}
                  isRead={readIds.has(n.id)}
                  isSelected={selected?.id === n.id}
                  onClick={() => handleSelect(n)}
                />
              ))}
              {/* Phân trang */}
              <div className="px-4 py-2 shrink-0">
                <Pagination pagination={pagination} />
              </div>
            </>
          )}
        </div>

        {/* Chi tiết (phải) — chỉ hiện khi đã chọn */}
        {selected && (
          <div className="flex-1 min-w-0 overflow-hidden bg-white">
            <DetailPanel n={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHome;

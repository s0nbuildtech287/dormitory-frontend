import { useEffect, useState } from "react";
import {
  Megaphone, AlertTriangle, Wrench, CreditCard, Bell, Info,
  Shield, Star,
} from "lucide-react";
import { getStudentNotifications } from "../../../api/apiStudent.js";
import { usePagination } from "../../../hooks/usePagination.js";
import Pagination from "../../../components/common/Pagination.jsx";
import NotifDetailModal from "./NotifDetailModal.jsx";

// ── Cấu hình từng loại thông báo ─────────────────────────────────────────
const TYPE_CFG = {
  "Thông báo chung": { icon: Megaphone,     badge: "bg-blue-100 text-blue-700",       row: "hover:bg-blue-50/40" },
  "Thanh toán":      { icon: CreditCard,    badge: "bg-emerald-100 text-emerald-700", row: "hover:bg-emerald-50/40" },
  "Bảo trì":         { icon: Wrench,        badge: "bg-amber-100 text-amber-700",     row: "hover:bg-amber-50/40" },
  "Khẩn cấp":        { icon: AlertTriangle, badge: "bg-rose-100 text-rose-700",       row: "hover:bg-rose-50/40" },
  "Kỷ luật":         { icon: Shield,        badge: "bg-purple-100 text-purple-700",   row: "hover:bg-purple-50/40" },
};
const DEFAULT_CFG = { icon: Info, badge: "bg-slate-100 text-slate-600", row: "hover:bg-slate-50" };

const BASE_TABS = ["Tất cả", "Thông báo chung", "Thanh toán", "Bảo trì", "Khẩn cấp", "Kỷ luật"];

// Thời gian tương đối
const relTime = (val) => {
  if (!val) return "";
  const diff = Math.floor((Date.now() - new Date(val)) / 1000);
  if (diff < 60)        return "Vừa xong";
  if (diff < 3600)      return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)} giờ`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} ngày`;
  return new Date(val).toLocaleDateString("vi-VN");
};

// ── Component hàng thông báo ──────────────────────────────────────────────
const NotifRow = ({ n, isRead, isStarred, onClick }) => {
  const cfg  = TYPE_CFG[n.type] || DEFAULT_CFG;
  const Icon = cfg.icon;
  const urgent = n.type === "Khẩn cấp";

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors bg-white ${cfg.row}`}
    >
      {/* Icon loại */}
      <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${cfg.badge}`}>
        <Icon size={13} />
      </div>

      {/* Nội dung */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {!isRead && <span className="w-2 h-2 rounded-full shrink-0 bg-blue-500" />}
          <p className="text-sm truncate font-bold text-slate-900">{n.title}</p>
          {urgent && (
            <span className="shrink-0 px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded uppercase tracking-wide">
              Khẩn
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate leading-relaxed">{n.content}</p>
      </div>

      {/* Star + thời gian */}
      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        {isStarred && <Star size={13} className="text-yellow-400" fill="currentColor" />}
        <span className="text-[11px] font-bold text-slate-700">{relTime(n.created_at)}</span>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────
const StudentHome = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [tab, setTab]                     = useState("Tất cả");
  const [modal, setModal]                 = useState(null);
  const [readIds, setReadIds]             = useState(new Set());
  const [starredIds, setStarredIds]       = useState(new Set());
  const [deletedIds, setDeletedIds]       = useState(new Set());

  useEffect(() => {
    getStudentNotifications()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setNotifications(list);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  // Lọc bỏ đã xóa
  const visible = notifications.filter((n) => !deletedIds.has(n.id));

  const filtered = tab === "Đã ghim"
    ? visible.filter((n) => starredIds.has(n.id))
    : visible.filter((n) => tab === "Tất cả" || n.type === tab);

  const pagination = usePagination(filtered, 15);
  const { currentItems, goToPage } = pagination;

  const unreadCount = visible.filter((n) => !readIds.has(n.id)).length;
  const starredCount = visible.filter((n) => starredIds.has(n.id)).length;

  const handleOpen = (n) => {
    setModal(n);
    setReadIds((prev) => new Set([...prev, n.id]));
  };

  const handleToggleRead = (id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleClose = () => setModal(null);

  const handleToggleStar = (id) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    // Cập nhật modal nếu đang mở
    setModal((prev) => prev?.id === id ? { ...prev } : prev);
  };

  const handleDelete = (id) => {
    setDeletedIds((prev) => new Set([...prev, id]));
  };

  const handleTabChange = (t) => {
    setTab(t);
    goToPage(1);
  };

  // Tabs động: thêm "Đã ghim" nếu có
  const TABS = starredCount > 0
    ? [...BASE_TABS, "Đã ghim"]
    : BASE_TABS;

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 8rem)" }}>

      {/* ── Tab lọc nhanh ── */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 shrink-0 overflow-x-auto">
        {TABS.map((t) => {
          const cfg = TYPE_CFG[t] || null;
          const count = t === "Tất cả"
            ? visible.length
            : t === "Đã ghim"
            ? starredCount
            : visible.filter((n) => n.type === t).length;
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
              {t === "Đã ghim"
                ? <Star size={13} fill={tab === t ? "currentColor" : "none"} />
                : cfg && <cfg.icon size={13} />}
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

      {/* ── Danh sách thông báo ── */}
      <div className="flex-1 overflow-y-auto">
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
            <p className="text-sm text-slate-400">
              {tab === "Đã ghim" ? "Chưa có thông báo nào được ghim" : "Không có thông báo"}
            </p>
          </div>
        ) : (
          <>
            {currentItems.map((n) => (
              <NotifRow
                key={n.id}
                n={n}
                isRead={readIds.has(n.id)}
                isStarred={starredIds.has(n.id)}
                onClick={() => handleOpen(n)}
              />
            ))}
            <div className="px-4 py-2">
              <Pagination pagination={pagination} />
            </div>
          </>
        )}
      </div>

      {/* ── Modal chi tiết ── */}
      <NotifDetailModal
        n={modal}
        onClose={handleClose}
        onDelete={handleDelete}
        onToggleStar={handleToggleStar}
        onToggleRead={handleToggleRead}
        starredIds={starredIds}
        isRead={modal ? readIds.has(modal.id) : false}
      />
    </div>
  );
};

export default StudentHome;

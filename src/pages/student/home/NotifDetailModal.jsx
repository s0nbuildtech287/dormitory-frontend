import { useState } from "react";
import {
  X, Star, Download, Trash2, Clock,
  Megaphone, AlertTriangle, Wrench, CreditCard, Info, Shield,
  Smile, ThumbsUp, Heart, Laugh, Frown, Angry,
} from "lucide-react";

const TYPE_CFG = {
  "Thông báo chung": { icon: Megaphone,     badge: "bg-blue-100 text-blue-700",       header: "from-blue-50 to-white" },
  "Thanh toán":      { icon: CreditCard,    badge: "bg-emerald-100 text-emerald-700", header: "from-emerald-50 to-white" },
  "Bảo trì":         { icon: Wrench,        badge: "bg-amber-100 text-amber-700",     header: "from-amber-50 to-white" },
  "Khẩn cấp":        { icon: AlertTriangle, badge: "bg-rose-100 text-rose-700",       header: "from-rose-50 to-white" },
  "Kỷ luật":         { icon: Shield,        badge: "bg-purple-100 text-purple-700",   header: "from-purple-50 to-white" },
};
const DEFAULT_CFG = { icon: Info, badge: "bg-slate-100 text-slate-600", header: "from-slate-50 to-white" };

const REACTIONS = [
  { emoji: "👍", label: "Thích",    icon: ThumbsUp },
  { emoji: "❤️", label: "Yêu thích", icon: Heart },
  { emoji: "😄", label: "Vui",      icon: Laugh },
  { emoji: "😮", label: "Ngạc nhiên", icon: Smile },
  { emoji: "😢", label: "Buồn",     icon: Frown },
  { emoji: "😡", label: "Tức giận", icon: Angry },
];

// Tạo nội dung text để download
function buildTextContent(n) {
  const lines = [
    `THÔNG BÁO: ${n.title}`,
    `${"─".repeat(60)}`,
    `Loại       : ${n.type}`,
    `Thời gian  : ${n.created_at ? new Date(n.created_at).toLocaleString("vi-VN") : ""}`,
    `${"─".repeat(60)}`,
    "",
    n.content,
  ];
  return lines.join("\n");
}

function handleDownload(n) {
  const text = buildTextContent(n);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `thongbao-${n.id ?? Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
const NotifDetailModal = ({ n, onClose, onDelete, onToggleStar, starredIds }) => {
  const [reaction, setReaction]     = useState(null);
  const [showEmoji, setShowEmoji]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  if (!n) return null;

  const cfg      = TYPE_CFG[n.type] || DEFAULT_CFG;
  const Icon     = cfg.icon;
  const isStarred = starredIds?.has(n.id);

  const handleReact = (r) => {
    setReaction((prev) => (prev?.emoji === r.emoji ? null : r));
    setShowEmoji(false);
  };

  const handleDelete = () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    onDelete?.(n.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) { setConfirmDel(false); onClose(); } }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">

        {/* ── Toolbar trên cùng (giống Gmail) ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/80">
          {/* Trái: đóng */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            title="Đóng"
          >
            <X size={17} />
          </button>

          {/* Phải: action icons */}
          <div className="flex items-center gap-1">
            {/* Star */}
            <button
              onClick={() => onToggleStar?.(n.id)}
              className={`p-1.5 rounded-lg transition-colors ${isStarred ? "text-yellow-400 hover:text-yellow-500" : "text-slate-400 hover:text-yellow-400 hover:bg-slate-200"}`}
              title={isStarred ? "Bỏ ghim" : "Ghim thông báo"}
            >
              <Star size={17} fill={isStarred ? "currentColor" : "none"} />
            </button>

            {/* Reaction */}
            <div className="relative">
              <button
                onClick={() => setShowEmoji((v) => !v)}
                className={`p-1.5 rounded-lg transition-colors ${reaction ? "text-yellow-500 hover:bg-slate-200" : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"}`}
                title="Cảm xúc"
              >
                {reaction ? (
                  <span className="text-base leading-none">{reaction.emoji}</span>
                ) : (
                  <Smile size={17} />
                )}
              </button>

              {/* Emoji picker */}
              {showEmoji && (
                <div className="absolute right-0 top-9 z-10 flex items-center gap-1 bg-white border border-slate-200 rounded-2xl shadow-xl px-3 py-2">
                  {REACTIONS.map((r) => (
                    <button
                      key={r.emoji}
                      onClick={() => handleReact(r)}
                      title={r.label}
                      className={`text-xl hover:scale-125 transition-transform p-1 rounded-full ${reaction?.emoji === r.emoji ? "bg-yellow-50 ring-2 ring-yellow-300" : ""}`}
                    >
                      {r.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download */}
            <button
              onClick={() => handleDownload(n)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-200 transition-colors"
              title="Tải xuống"
            >
              <Download size={17} />
            </button>

            {/* Xóa */}
            <button
              onClick={handleDelete}
              className={`p-1.5 rounded-lg transition-colors ${confirmDel ? "text-white bg-rose-500 hover:bg-rose-600" : "text-slate-400 hover:text-rose-500 hover:bg-slate-200"}`}
              title={confirmDel ? "Nhấn lần nữa để xác nhận xóa" : "Xóa thông báo"}
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>

        {/* ── Header thông báo ── */}
        <div className={`px-7 pt-6 pb-5 bg-gradient-to-b ${cfg.header}`}>
          {/* Badge loại */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.badge}`}>
              <Icon size={11} />{n.type}
            </span>
            {n.type === "Khẩn cấp" && (
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded uppercase tracking-widest">
                Khẩn cấp
              </span>
            )}
            {isStarred && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-600 text-[10px] font-bold rounded-full border border-yellow-200">
                <Star size={9} fill="currentColor" /> Đã ghim
              </span>
            )}
          </div>

          {/* Tiêu đề */}
          <h2 className="text-xl font-black text-slate-900 leading-snug mb-3">{n.title}</h2>

          {/* Meta: người gửi + thời gian */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">BQL</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Ban Quản Lý Ký Túc Xá</p>
                <p className="text-xs text-slate-400">admin@dormitory.edu.vn</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Clock size={11} />
              {n.created_at ? new Date(n.created_at).toLocaleString("vi-VN") : ""}
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-slate-100 mx-7" />

        {/* ── Nội dung ── */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <p className="text-sm text-slate-700 leading-7 whitespace-pre-wrap">{n.content}</p>

          {n.attachment_url && (
            <div className="mt-6 p-3 border border-slate-200 rounded-xl flex items-center gap-3 bg-slate-50 w-fit">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Tệp đính kèm</p>
                <a
                  href={n.attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Xem / Tải xuống
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer: reaction hiển thị + nút đóng ── */}
        <div className="px-7 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {reaction && (
              <button
                onClick={() => setReaction(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full text-sm hover:bg-yellow-100 transition-colors"
                title="Bỏ cảm xúc"
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs text-yellow-700 font-medium">{reaction.label}</span>
                <X size={11} className="text-yellow-500" />
              </button>
            )}
            {confirmDel && (
              <span className="text-xs text-rose-500 font-medium animate-pulse">
                Nhấn 🗑 lần nữa để xác nhận xóa
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotifDetailModal;

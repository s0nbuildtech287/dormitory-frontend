import { useState, useRef, useEffect } from "react";
import {
  X, Star, Download, Trash2, Clock,
  Megaphone, AlertTriangle, Wrench, CreditCard, Info, Shield,
  Smile, Frown, Angry, Laugh, Heart, ThumbsUp,
  MailOpen, Mail, Reply, Send,
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
  { emoji: "👍", label: "Thích" },
  { emoji: "❤️", label: "Yêu thích" },
  { emoji: "😄", label: "Vui" },
  { emoji: "😮", label: "Ngạc nhiên" },
  { emoji: "😢", label: "Buồn" },
  { emoji: "😡", label: "Tức giận" },
];

function buildTextContent(n) {
  return [
    `THÔNG BÁO: ${n.title}`,
    "─".repeat(60),
    `Loại      : ${n.type}`,
    `Thời gian : ${n.created_at ? new Date(n.created_at).toLocaleString("vi-VN") : ""}`,
    "─".repeat(60),
    "",
    n.content,
  ].join("\n");
}

function handleDownload(n) {
  const blob = new Blob([buildTextContent(n)], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `thongbao-${n.id ?? Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
const NotifDetailModal = ({
  n,
  onClose,
  onDelete,
  onToggleStar,
  onToggleRead,
  starredIds,
  isRead,
}) => {
  const [reaction, setReaction]     = useState(null);
  const [showEmoji, setShowEmoji]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [showReply, setShowReply]   = useState(false);
  const [replyText, setReplyText]   = useState("");
  const [comments, setComments]     = useState([]);
  const textareaRef = useRef(null);

  // Focus textarea khi mở reply
  useEffect(() => {
    if (showReply && textareaRef.current) textareaRef.current.focus();
  }, [showReply]);

  if (!n) return null;

  const cfg       = TYPE_CFG[n.type] || DEFAULT_CFG;
  const Icon      = cfg.icon;
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

  const handleSendReply = () => {
    const text = replyText.trim();
    if (!text) return;
    setComments((prev) => [
      ...prev,
      { id: Date.now(), text, time: new Date() },
    ]);
    setReplyText("");
    setShowReply(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) { setConfirmDel(false); onClose(); } }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            title="Đóng"
          >
            <X size={17} />
          </button>

          <div className="flex items-center gap-1">
            {/* Đánh dấu đã đọc / chưa đọc */}
            <button
              onClick={() => onToggleRead?.(n.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-200 transition-colors"
              title={isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}
            >
              {isRead ? <Mail size={17} /> : <MailOpen size={17} />}
            </button>

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
                className={`p-1.5 rounded-lg transition-colors ${reaction ? "text-yellow-500" : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"}`}
                title="Cảm xúc"
              >
                {reaction
                  ? <span className="text-base leading-none">{reaction.emoji}</span>
                  : <Smile size={17} />}
              </button>
              {showEmoji && (
                <div className="absolute right-0 top-10 z-20 flex items-center gap-1 bg-white border border-slate-200 rounded-2xl shadow-xl px-3 py-2">
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

            {/* Reply */}
            <button
              onClick={() => setShowReply((v) => !v)}
              className={`p-1.5 rounded-lg transition-colors ${showReply ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-blue-600 hover:bg-slate-200"}`}
              title="Phản hồi"
            >
              <Reply size={17} />
            </button>

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
        <div className={`px-8 pt-6 pb-5 bg-gradient-to-b ${cfg.header} shrink-0`}>
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
            {!isRead && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-200">
                Chưa đọc
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black text-slate-900 leading-snug mb-4">{n.title}</h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
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

        <div className="h-px bg-slate-100 mx-8 shrink-0" />

        {/* ── Nội dung ── */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <p className="text-sm text-slate-700 leading-7 whitespace-pre-wrap">{n.content}</p>

          {n.attachment_url && (
            <div className="p-3 border border-slate-200 rounded-xl flex items-center gap-3 bg-slate-50 w-fit">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Tệp đính kèm</p>
                <a href={n.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                  Xem / Tải xuống
                </a>
              </div>
            </div>
          )}

          {/* ── Danh sách comment đã gửi ── */}
          {comments.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Phản hồi của bạn</p>
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">SV</span>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700">Bạn</span>
                      <span className="text-[10px] text-slate-400">
                        {c.time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Reply box ── */}
          {showReply && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <Reply size={13} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">Phản hồi tới Ban Quản Lý</span>
              </div>
              <textarea
                ref={textareaRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSendReply(); }}
                placeholder="Nhập nội dung phản hồi... (Ctrl+Enter để gửi)"
                rows={4}
                className="w-full px-4 py-3 text-sm text-slate-700 placeholder-slate-300 resize-none outline-none"
              />
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">Ctrl + Enter để gửi nhanh</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowReply(false); setReplyText(""); }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <Send size={12} /> Gửi
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-8 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {reaction && (
              <button
                onClick={() => setReaction(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full hover:bg-yellow-100 transition-colors"
                title="Bỏ cảm xúc"
              >
                <span className="text-sm">{reaction.emoji}</span>
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
          <div className="flex items-center gap-2">
            {!showReply && (
              <button
                onClick={() => setShowReply(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Reply size={14} /> Phản hồi
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotifDetailModal;

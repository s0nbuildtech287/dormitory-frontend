import { useState, useEffect } from "react";
import { X, Send, Paperclip, Minus, CheckCircle, AlertCircle } from "lucide-react";
import { sendEmail } from "../../api/apiEmail.js";

/**
 * EmailComposeModal - giống giao diện Gmail compose
 * Props:
 *   isOpen: bool
 *   onClose: () => void
 *   onSend: ({ to, subject, body }) => void  (optional callback sau khi gửi)
 *   defaultTo: string | string[]   - email(s) điền sẵn
 *   defaultSubject: string
 *   defaultBody: string
 *   recipientCount: number         - nếu > 1 thì hiện "X người nhận"
 */
const EmailComposeModal = ({
  isOpen,
  onClose,
  onSend,
  defaultTo = "",
  defaultSubject = "",
  defaultBody = "",
  recipientCount,
}) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null); // { type: "success" | "error", message: string }
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const toValue = Array.isArray(defaultTo) ? defaultTo.join(", ") : defaultTo;
      setTo(toValue);
      setSubject(defaultSubject);
      setBody(defaultBody);
      setSending(false);
      setError("");
      setToast(null);
      setMinimized(false);
    }
  }, [isOpen, defaultTo, defaultSubject, defaultBody]);

  if (!isOpen) return null;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSend = async () => {
    if (!to.trim()) return;
    setSending(true);
    setError("");
    try {
      const toList = to.split(",").map((e) => e.trim()).filter(Boolean);
      await sendEmail({ to: toList.length === 1 ? toList[0] : toList, subject, body });
      onSend?.({ to, subject, body });
      showToast("success", "Gửi email thành công!");
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      const msg = err.message || "Gửi email thất bại";
      setError(msg);
      showToast("error", msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 pointer-events-auto"
        onClick={onClose}
      />

      {/* Compose window */}
      <div
        className={`relative pointer-events-auto w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-200 ${
          minimized ? "h-12" : "h-[520px]"
        }`}
        style={{ zIndex: 51 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded-t-2xl cursor-pointer select-none"
          onClick={() => setMinimized((v) => !v)}
        >
          <span className="text-white text-sm font-semibold">
            {subject || "Soạn thư mới"}
          </span>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMinimized((v) => !v)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title={minimized ? "Mở rộng" : "Thu nhỏ"}
            >
              <Minus size={14} />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Đóng"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* To */}
            <div className="flex items-center border-b border-slate-200 px-4 py-2 gap-2">
              <span className="text-xs text-slate-500 w-12 shrink-0">Đến</span>
              {recipientCount && recipientCount > 1 ? (
                <span className="flex-1 text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  {recipientCount} người nhận
                </span>
              ) : (
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Địa chỉ email..."
                  className="flex-1 text-sm outline-none text-slate-800 placeholder:text-slate-400"
                />
              )}
            </div>

            {/* Subject */}
            <div className="flex items-center border-b border-slate-200 px-4 py-2 gap-2">
              <span className="text-xs text-slate-500 w-12 shrink-0">Tiêu đề</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Tiêu đề email..."
                className="flex-1 text-sm outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Body */}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Nội dung email..."
              className="flex-1 px-4 py-3 text-sm text-slate-800 outline-none resize-none placeholder:text-slate-400"
            />

            {/* Error */}
            {error && (
              <p className="px-4 py-1 text-xs text-rose-600 font-semibold bg-rose-50 border-t border-rose-100">
                {error}
              </p>
            )}

            {/* Footer toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <button
                onClick={handleSend}
                disabled={sending || !to.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-full transition-colors"
              >
                <Send size={14} />
                {sending ? "Đang gửi..." : "Gửi"}
              </button>

              <div className="flex items-center gap-1">
                <button
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                  title="Đính kèm"
                >
                  <Paperclip size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                  title="Hủy"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold whitespace-nowrap transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              toast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailComposeModal;

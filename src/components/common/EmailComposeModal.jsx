import { useState, useEffect, useRef } from "react";
import { X, Send, Paperclip, Minus, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { sendEmail } from "../../api/apiEmail.js";

/**
 * EmailComposeModal
 * Props:
 *   isOpen, onClose, onSend
 *   defaultTo: string | string[]
 *   defaultSubject: string
 *   defaultBody: string
 *   recipientCount: number
 *   templates: Array<{ label: string, subject: string, body: string }>
 */

// ── Template mặc định dùng chung toàn hệ thống ──────────────────────────────
export const EMAIL_TEMPLATES = {
  // Quản lý đăng ký
  APPROVED_REGISTRATION: (reg = {}) => ({
    label: "Duyệt hồ sơ – Mang bản cứng",
    subject: "[KTX TLU] Thông báo kết quả xét duyệt hồ sơ đăng ký ký túc xá",
    body: `Kính gửi ${reg.student_name || "Sinh viên"},

Chúng tôi vui mừng thông báo hồ sơ đăng ký ký túc xá của bạn đã được XÉT DUYỆT THÀNH CÔNG.

Để hoàn tất thủ tục nhập ký túc xá, bạn vui lòng mang đầy đủ các giấy tờ sau đến văn phòng Ban Quản lý KTX trong giờ hành chính (7h30 – 11h30 và 13h30 – 17h00, từ Thứ Hai đến Thứ Sáu):

  1. Bản in hợp đồng ký túc xá (có chữ ký của sinh viên và phụ huynh/người bảo lãnh)
  2. 01 ảnh thẻ 3x4 (chụp trong vòng 6 tháng gần nhất)
  3. Bản sao CCCD/CMND (có công chứng)
  4. Giấy xác nhận sinh viên (lấy tại phòng Đào tạo)

Lưu ý: Hồ sơ cần được nộp trong vòng 07 ngày làm việc kể từ ngày nhận email này. Quá thời hạn, suất ký túc xá sẽ được chuyển cho sinh viên khác.

Trân trọng cảm ơn và chúc bạn có thời gian học tập hiệu quả tại trường.`,
  }),

  REJECTED_REGISTRATION: (reg = {}) => ({
    label: "Từ chối hồ sơ",
    subject: "[KTX TLU] Thông báo kết quả xét duyệt hồ sơ đăng ký ký túc xá",
    body: `Kính gửi ${reg.student_name || "Sinh viên"},

Sau khi xem xét hồ sơ đăng ký ký túc xá của bạn, chúng tôi rất tiếc phải thông báo hồ sơ chưa đáp ứng đủ điều kiện xét duyệt trong đợt này.

Lý do: Số lượng suất ký túc xá có hạn, ưu tiên được xét theo tiêu chí điểm ưu tiên và khoảng cách.

Bạn có thể nộp lại hồ sơ vào đợt xét duyệt tiếp theo hoặc liên hệ trực tiếp Ban Quản lý KTX để được tư vấn thêm.

Trân trọng.`,
  }),

  // Quản lý hợp đồng
  CONTRACT_CREATED: (contract = {}) => ({
    label: "Tạo hợp đồng thành công",
    subject: `[KTX TLU] Thông báo tạo hợp đồng ký túc xá – ${contract.contract_number || ""}`,
    body: `Kính gửi ${contract.student_name || "Sinh viên"},

Hợp đồng ký túc xá của bạn đã được tạo thành công với thông tin như sau:

  • Số hợp đồng : ${contract.contract_number || "—"}
  • Phòng        : ${contract.room_number ? `${contract.building || ""}${contract.room_number}` : "Chưa gán phòng"}
  • Thời hạn     : ${contract.start_date ? new Date(contract.start_date).toLocaleDateString("vi-VN") : "—"} → ${contract.end_date ? new Date(contract.end_date).toLocaleDateString("vi-VN") : "—"}
  • Tiền thuê    : ${contract.rent_price ? Number(contract.rent_price).toLocaleString("vi-VN") + " VNĐ/tháng" : "—"}
  • Tiền cọc     : ${contract.deposit_amount ? Number(contract.deposit_amount).toLocaleString("vi-VN") + " VNĐ" : "—"}

Bạn vui lòng đến văn phòng KTX để ký bản cứng hợp đồng và nộp tiền cọc trong vòng 05 ngày làm việc.

Mọi thắc mắc xin liên hệ Ban Quản lý KTX qua email hoặc đến trực tiếp văn phòng.

Trân trọng.`,
  }),

  DEPOSIT_CONFIRMED: (contract = {}) => ({
    label: "Xác nhận đã nhận tiền cọc",
    subject: `[KTX TLU] Xác nhận nhận tiền cọc – Hợp đồng ${contract.contract_number || ""}`,
    body: `Kính gửi ${contract.student_name || "Sinh viên"},

Ban Quản lý Ký túc xá xác nhận đã nhận tiền cọc của bạn cho hợp đồng số ${contract.contract_number || "—"}.

  • Số tiền cọc : ${contract.deposit_amount ? Number(contract.deposit_amount).toLocaleString("vi-VN") + " VNĐ" : "—"}
  • Phòng       : ${contract.room_number ? `${contract.building || ""}${contract.room_number}` : "—"}
  • Ngày xác nhận: ${new Date().toLocaleDateString("vi-VN")}

Tiền cọc sẽ được hoàn trả khi bạn kết thúc hợp đồng và bàn giao phòng đúng quy định.

Trân trọng.`,
  }),

  HARDCOPY_CONFIRMED: (contract = {}) => ({
    label: "Xác nhận đã nhận bản cứng HĐ",
    subject: `[KTX TLU] Xác nhận nhận bản cứng hợp đồng – ${contract.contract_number || ""}`,
    body: `Kính gửi ${contract.student_name || "Sinh viên"},

Ban Quản lý Ký túc xá xác nhận đã nhận bản cứng hợp đồng ký túc xá của bạn.

  • Số hợp đồng : ${contract.contract_number || "—"}
  • Ngày nhận   : ${new Date().toLocaleDateString("vi-VN")}

Hợp đồng của bạn hiện đã hoàn tất thủ tục hành chính. Chúc bạn có thời gian sinh hoạt tốt tại ký túc xá.

Trân trọng.`,
  }),
};

// ── Component ────────────────────────────────────────────────────────────────
const EmailComposeModal = ({
  isOpen,
  onClose,
  onSend,
  defaultTo = "",
  defaultSubject = "",
  defaultBody = "",
  recipientCount,
  templates = [], // [{ label, subject, body }]
}) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const templateRef = useRef(null);

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
      setShowTemplates(false);
    }
  }, [isOpen, defaultTo, defaultSubject, defaultBody]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (templateRef.current && !templateRef.current.contains(e.target)) {
        setShowTemplates(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isOpen) return null;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const applyTemplate = (tpl) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
    setShowTemplates(false);
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
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={onClose} />

      <div
        className={`relative pointer-events-auto w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col transition-all duration-200 ${
          minimized ? "h-12" : "h-[560px]"
        }`}
        style={{ zIndex: 51 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded-t-2xl cursor-pointer select-none"
          onClick={() => setMinimized((v) => !v)}
        >
          <span className="text-white text-sm font-semibold truncate max-w-[320px]">
            {subject || "Soạn thư mới"}
          </span>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMinimized((v) => !v)} className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors" title={minimized ? "Mở rộng" : "Thu nhỏ"}>
              <Minus size={14} />
            </button>
            <button onClick={onClose} className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors" title="Đóng">
              <X size={14} />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Template picker */}
            {templates.length > 0 && (
              <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2" ref={templateRef}>
                <span className="text-xs text-slate-400 shrink-0">Mẫu nhanh</span>
                <div className="relative flex-1">
                  <button
                    onClick={() => setShowTemplates((v) => !v)}
                    className="w-full flex items-center justify-between gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 font-semibold transition-colors"
                  >
                    <span>Chọn mẫu email...</span>
                    <ChevronDown size={13} className={`transition-transform ${showTemplates ? "rotate-180" : ""}`} />
                  </button>
                  {showTemplates && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      {templates.map((tpl, i) => (
                        <button
                          key={i}
                          onClick={() => applyTemplate(tpl)}
                          className="w-full text-left px-3 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors border-b border-slate-100 last:border-0"
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

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

            {error && (
              <p className="px-4 py-1 text-xs text-rose-600 font-semibold bg-rose-50 border-t border-rose-100">
                {error}
              </p>
            )}

            {/* Footer */}
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
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Đính kèm">
                  <Paperclip size={16} />
                </button>
                <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Hủy">
                  <X size={16} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Toast */}
        {toast && (
          <div className={`absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200 ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
            {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailComposeModal;

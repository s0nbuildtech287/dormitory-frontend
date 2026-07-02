import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Receipt } from "lucide-react";

const fmtMoney = (v) =>
  v ? `${(Number(v) / 100).toLocaleString("vi-VN")} đ` : "—";

const fmtDate = (v) => {
  if (!v || v.length < 14) return "—";
  // VNPay format: yyyyMMddHHmmss
  const y = v.slice(0, 4), mo = v.slice(4, 6), d = v.slice(6, 8);
  const h = v.slice(8, 10), mi = v.slice(10, 12), s = v.slice(12, 14);
  return `${d}/${mo}/${y} ${h}:${mi}:${s}`;
};

const RESPONSE_MESSAGES = {
  "00": { label: "Giao dịch thành công",    color: "emerald", icon: CheckCircle },
  "07": { label: "Giao dịch bị nghi ngờ",   color: "amber",   icon: AlertCircle },
  "24": { label: "Khách hàng hủy giao dịch", color: "slate",  icon: XCircle },
  "51": { label: "Tài khoản không đủ số dư", color: "rose",   icon: XCircle },
  "65": { label: "Vượt hạn mức giao dịch",   color: "rose",   icon: XCircle },
  "97": { label: "Sai chữ ký (checksum)",    color: "rose",   icon: XCircle },
};

const PaymentResult = () => {
  const [params, setParams] = useState({});

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    setParams(Object.fromEntries(search.entries()));
  }, []);

  const code    = params.code || "99";
  const isOk    = code === "00";
  const cfg     = RESPONSE_MESSAGES[code] || { label: "Lỗi không xác định", color: "rose", icon: XCircle };
  const Icon    = cfg.icon;
  const color   = cfg.color;

  const colorMap = {
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
    amber:   { bg: "bg-amber-50",   border: "border-amber-200",   icon: "text-amber-500",   badge: "bg-amber-100 text-amber-700" },
    rose:    { bg: "bg-rose-50",    border: "border-rose-200",    icon: "text-rose-500",    badge: "bg-rose-100 text-rose-700" },
    slate:   { bg: "bg-slate-50",   border: "border-slate-200",   icon: "text-slate-400",   badge: "bg-slate-100 text-slate-600" },
  };
  const c = colorMap[color];

  // Xác định loại thanh toán từ txnRef
  const txnRef = params.txnRef || "";
  const isInvoice = txnRef.startsWith("invoice_");
  const isDeposit = txnRef.startsWith("deposit_");
  const isRenew   = txnRef.startsWith("renew_");
  const backPath  = (isDeposit || isRenew) ? "/contract" : "/bills";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className={`${c.bg} ${c.border} border-b px-6 py-8 flex flex-col items-center gap-3`}>
          <div className={`p-4 rounded-full bg-white shadow-sm`}>
            <Icon size={36} className={c.icon} />
          </div>
          <p className="font-black text-xl text-slate-900 text-center">{cfg.label}</p>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.badge}`}>
            Mã phản hồi: {code}
          </span>
        </div>

        {/* Chi tiết giao dịch */}
        <div className="p-6 space-y-3">
          {[
            { label: "Mã giao dịch VNPay", value: params.transactionNo || "—" },
            { label: "Mã tham chiếu",       value: params.txnRef || "—" },
            { label: "Số tiền",             value: fmtMoney(params.amount) },
            { label: "Ngân hàng",           value: params.bankCode || "—" },
            { label: "Thời gian",           value: fmtDate(params.payDate) },
            { label: "Nội dung",            value: decodeURIComponent(params.orderInfo || "—") },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-4 py-2 border-b border-slate-50 last:border-0">
              <span className="text-xs text-slate-400 font-semibold shrink-0">{label}</span>
              <span className="text-xs font-bold text-slate-800 text-right break-all">{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          {isOk && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-700 text-center font-semibold mb-1">
              {isRenew 
                ? "Gia hạn hợp đồng thành công! Thời hạn hợp đồng của bạn đã được cộng thêm 6 tháng." 
                : "Hệ thống sẽ tự động cập nhật trạng thái thanh toán trong vài giây."}
            </div>
          )}
          <a
            href={backPath}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft size={15} />
            {(isDeposit || isRenew) ? "Quay về hợp đồng" : "Quay về hóa đơn"}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;

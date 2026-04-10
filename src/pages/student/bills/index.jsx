import { useEffect, useState } from "react";
import {
  CreditCard, CheckCircle, Clock, AlertCircle,
  Zap, Droplets, Home, Wifi, Trash2, Car, Receipt, BarChart2, X,
  Send, User, CalendarCheck, Info, QrCode, Copy, Building2, BadgeCheck
} from "lucide-react";
import { getStudentInvoices, submitMeterReading } from "../../../api/apiStudent.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fmtMoney = (v) => (v != null ? `${Number(v).toLocaleString("vi-VN")} đ` : "—");
const fmtMonth = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
};
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—");

const STATUS_CFG = {
  "Chưa thanh toán": { cls: "bg-amber-100 text-amber-700",      icon: Clock,        dot: "bg-amber-400" },
  "Đã thanh toán":   { cls: "bg-emerald-100 text-emerald-700",  icon: CheckCircle,  dot: "bg-emerald-500" },
  "Quá hạn":         { cls: "bg-rose-100 text-rose-700",         icon: AlertCircle,  dot: "bg-rose-500" },
};

const DetailRow = ({ icon: Icon, label, value, accent, sub }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2 text-slate-500 min-w-0">
      <Icon size={13} className={accent ? "text-blue-400" : "text-slate-300"} />
      <span className="text-sm truncate">{label}</span>
      {sub && <span className="text-[10px] text-slate-300 shrink-0">{sub}</span>}
    </div>
    <span className={`text-sm font-bold shrink-0 ml-2 ${accent ? "text-blue-700" : "text-slate-800"}`}>{value}</span>
  </div>
);

const StudentBills = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [showMeterModal, setShowMeterModal] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [copied, setCopied] = useState(null);

  // Meter reading form state
  const [electricEnd, setElectricEnd] = useState("");
  const [waterEnd, setWaterEnd]       = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [submitMsg, setSubmitMsg]     = useState(null); // { type: "success"|"error", text }

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const BANK_INFO = {
    bank: "Vietcombank",
    branch: "Chi nhánh Hà Nội",
    account: "1234567890",
    owner: "KTX TRƯỜNG ĐẠI HỌC THĂNG LONG",
  };

  const today = new Date();
  const isSubmitWindow = today.getDate() <= 5;

  // Kiểm tra hóa đơn tháng trước đã thanh toán chưa
  const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevMonthInvoice = invoices.find(i => {
    const d = new Date(i.billing_month);
    return d.getFullYear() === prevMonth.getFullYear() && d.getMonth() === prevMonth.getMonth();
  });
  const isPrevPaid = prevMonthInvoice?.status === "Đã thanh toán";
  const canSubmitMeter = isSubmitWindow && !isPrevPaid; // 5 ngày đầu tháng

  const loadInvoices = () => {
    setLoading(true);
    getStudentInvoices()
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : [];
        const sorted = [...list].sort((a, b) => {
          const order = { "Quá hạn": 0, "Chưa thanh toán": 1, "Đã thanh toán": 2 };
          const od = (order[a.status] ?? 9) - (order[b.status] ?? 9);
          if (od !== 0) return od;
          return new Date(b.billing_month) - new Date(a.billing_month);
        });
        setInvoices(sorted);
        if (sorted.length > 0) setSelected(sorted[0]);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadInvoices(); }, []);

  const handleSubmitMeter = async (e) => {
    e.preventDefault();
    if (!electricEnd || !waterEnd) return;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const res = await submitMeterReading({
        electric_end: Number(electricEnd),
        water_end:    Number(waterEnd),
      });
      setSubmitMsg({ type: "success", text: res.message || "Gửi thành công!" });
      setElectricEnd("");
      setWaterEnd("");
      loadInvoices(); // reload để cập nhật hóa đơn
    } catch (err) {
      setSubmitMsg({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const unpaid  = invoices.filter(i => i.status === "Chưa thanh toán" || i.status === "Quá hạn");
  const overdue = invoices.filter(i => i.status === "Quá hạn");
  const totalUnpaid = unpaid.reduce((s, i) => s + Number(i.total_amount || 0), 0);

  if (loading) return (
    <div className="grid grid-cols-3 gap-5 h-96">
      <div className="col-span-2 bg-slate-100 rounded-2xl animate-pulse" />
      <div className="bg-slate-100 rounded-2xl animate-pulse" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center gap-2 py-20 text-rose-500">
      <AlertCircle size={36} /><p className="font-semibold">{error}</p>
    </div>
  );

  return (
    <div className="flex gap-5 h-full" style={{ minHeight: "calc(100vh - 12rem)" }}>

      {/* ── Cột trái: Chi tiết hóa đơn được chọn ── */}
      <div className="flex-1 min-w-0 space-y-4">

      {/* Thống kê nhanh */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Cần thanh toán",  value: fmtMoney(totalUnpaid), icon: CreditCard,  cls: "text-rose-600 bg-rose-50",      hi: totalUnpaid > 0 },
            { label: "Quá hạn",         value: `${overdue.length} kỳ`, icon: AlertCircle, cls: "text-orange-600 bg-orange-50",  hi: overdue.length > 0 },
            { label: "Tổng hóa đơn",    value: `${invoices.length} kỳ`, icon: Receipt,    cls: "text-blue-600 bg-blue-50" },
          ].map(({ label, value, icon: Icon, cls, hi }) => (
            <div key={label} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-3 ${hi ? "border-rose-200" : "border-slate-100"}`}>
              <div className={`p-2.5 rounded-xl shrink-0 ${cls}`}><Icon size={16} /></div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider truncate">{label}</p>
                <p className={`text-sm font-black mt-0.5 ${hi ? "text-rose-600" : "text-slate-900"}`}>{value}</p>
              </div>
            </div>
          ))}
          {/* Card gửi số điện/nước */}
          <button onClick={() => canSubmitMeter && setShowMeterModal(true)}
            className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-3 text-left transition-all active:scale-95 ${
              canSubmitMeter
                ? "border-blue-200 hover:bg-blue-50/40 cursor-pointer"
                : "border-slate-100 opacity-50 cursor-not-allowed"
            }`}
            title={!isSubmitWindow ? "Chỉ mở trong 5 ngày đầu tháng" : isPrevPaid ? "Hóa đơn đã thanh toán" : "Gửi số điện/nước"}>
            <div className={`p-2.5 rounded-xl shrink-0 ${canSubmitMeter ? "text-blue-600 bg-blue-50" : "text-slate-400 bg-slate-100"}`}>
              <Zap size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Điện / Nước</p>
              <p className={`text-sm font-black mt-0.5 ${canSubmitMeter ? "text-blue-700" : "text-slate-400"}`}>
                {!isSubmitWindow ? "Đã hết hạn" : isPrevPaid ? "Đã thanh toán" : `Còn ${5 - today.getDate()} ngày`}
              </p>
            </div>
          </button>
          {/* Card biểu đồ */}
          <button onClick={() => setShowChart(true)}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:border-blue-200 hover:bg-blue-50/30 transition-all active:scale-95 text-left">
            <div className="p-2.5 rounded-xl shrink-0 text-indigo-600 bg-indigo-50"><BarChart2 size={16} /></div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Biểu đồ</p>
              <p className="text-sm font-black mt-0.5 text-slate-900">Xem chi tiết</p>
            </div>
          </button>
        </div>

        {/* Modal nhập số điện/nước */}
        {showMeterModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={18} className="text-blue-600" />
                  <div>
                    <p className="font-bold text-slate-900">Gửi số điện/nước</p>
                    <p className="text-xs text-slate-500">
                      Tháng {today.getMonth() === 0 ? 12 : today.getMonth()}/
                      {today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear()}
                      {" "}· Hạn gửi ngày 1–5/{today.getMonth() + 1}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setShowMeterModal(false); setSubmitMsg(null); }}
                  className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={16} className="text-slate-500" />
                </button>
              </div>
              <form onSubmit={async (e) => { await handleSubmitMeter(e); if (!submitMsg || submitMsg.type === "success") setShowMeterModal(false); }} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5 flex items-center gap-1.5">
                      <Zap size={12} className="text-amber-500" /> Số điện cuối kỳ (kWh)
                    </label>
                    <input type="number" min="0" step="0.01" value={electricEnd}
                      onChange={e => setElectricEnd(e.target.value)}
                      placeholder="VD: 1250"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                      required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5 flex items-center gap-1.5">
                      <Droplets size={12} className="text-sky-500" /> Số nước cuối kỳ (m³)
                    </label>
                    <input type="number" min="0" step="0.01" value={waterEnd}
                      onChange={e => setWaterEnd(e.target.value)}
                      placeholder="VD: 45"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                      required />
                  </div>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Info size={11} /> Chỉ cần 1 người trong phòng gửi. Gửi lại sẽ lấy số liệu mới nhất.
                </p>
                {submitMsg && (
                  <p className={`text-xs font-semibold flex items-center gap-1.5 ${submitMsg.type === "success" ? "text-green-600" : "text-red-500"}`}>
                    {submitMsg.type === "success" ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                    {submitMsg.text}
                  </p>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { setShowMeterModal(false); setSubmitMsg(null); }}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-all">
                    Hủy
                  </button>
                  <button type="submit" disabled={submitting || !electricEnd || !waterEnd}
                    className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                    {submitting ? "Đang gửi..." : <><Send size={14} /> Gửi số liệu</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal biểu đồ */}        {showChart && (() => {
          const chartData = [...invoices]
            .filter(i => i.billing_month)
            .sort((a, b) => new Date(a.billing_month) - new Date(b.billing_month))
            .map(i => ({
              month: `T${new Date(i.billing_month).getMonth() + 1}/${new Date(i.billing_month).getFullYear()}`,
              "Tiền phòng": Number(i.rent_amount || 0),
              "Điện":       Number(i.electric_amount || 0),
              "Nước":       Number(i.water_amount || 0),
              "Dịch vụ":    Number(i.service_fees || 0),
              "Tổng":       Number(i.total_amount || 0),
            }));
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={18} className="text-indigo-600" />
                    <p className="font-bold text-slate-900">Biểu đồ chi phí theo tháng</p>
                  </div>
                  <button onClick={() => setShowChart(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* Bar chart — phân tích chi phí */}
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Phân tích chi phí theo khoản mục</p>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barSize={16}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} style={{ fontSize: "11px" }} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} style={{ fontSize: "11px" }} width={42} />
                          <Tooltip formatter={v => fmtMoney(v)} contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                          <Legend wrapperStyle={{ fontSize: "11px" }} />
                          <Bar dataKey="Tiền phòng" fill="#1e40af" radius={[3,3,0,0]} />
                          <Bar dataKey="Điện"       fill="#f59e0b" radius={[3,3,0,0]} />
                          <Bar dataKey="Nước"       fill="#38bdf8" radius={[3,3,0,0]} />
                          <Bar dataKey="Dịch vụ"   fill="#a78bfa" radius={[3,3,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {/* Bar chart — tổng tiền */}
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Tổng tiền hóa đơn theo tháng</p>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barSize={28}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} style={{ fontSize: "11px" }} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} style={{ fontSize: "11px" }} width={42} />
                          <Tooltip formatter={v => fmtMoney(v)} contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                          <Bar dataKey="Tổng" fill="#2563eb" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Modal thanh toán chuyển khoản */}
        {showPayModal && selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-5 text-white">
                <button onClick={() => setShowPayModal(false)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-xl transition-colors">
                  <X size={16} />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-white/20 rounded-xl"><CreditCard size={18} /></div>
                  <div>
                    <p className="font-black text-base">Thanh toán chuyển khoản</p>
                    <p className="text-blue-200 text-xs">{fmtMonth(selected.billing_month)} · {selected.invoice_number}</p>
                  </div>
                </div>
                <div className="bg-white/15 rounded-2xl px-4 py-3 flex items-center justify-between">
                  <span className="text-blue-100 text-sm font-semibold">Số tiền cần thanh toán</span>
                  <span className="text-white font-black text-xl">{fmtMoney(selected.total_amount)}</span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* QR placeholder */}
                <div className="flex flex-col items-center gap-2 py-3">
                  <div className="w-36 h-36 bg-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200">
                    <QrCode size={40} className="text-slate-300" />
                    <p className="text-[10px] text-slate-400 font-semibold">QR VietQR</p>
                  </div>
                  <p className="text-[11px] text-slate-400">Quét mã để chuyển khoản nhanh</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">hoặc chuyển khoản thủ công</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Thông tin ngân hàng */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  {[
                    { label: "Ngân hàng",    value: BANK_INFO.bank,    key: "bank",    icon: Building2 },
                    { label: "Chi nhánh",    value: BANK_INFO.branch,  key: "branch",  icon: Building2 },
                    { label: "Số tài khoản", value: BANK_INFO.account, key: "account", icon: CreditCard },
                    { label: "Chủ tài khoản",value: BANK_INFO.owner,   key: "owner",   icon: User },
                  ].map(({ label, value, key, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon size={13} className="text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-500 shrink-0">{label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-bold text-slate-800 truncate">{value}</span>
                        <button onClick={() => handleCopy(value, key)}
                          className="p-1 hover:bg-slate-200 rounded-lg transition-colors shrink-0">
                          {copied === key
                            ? <BadgeCheck size={13} className="text-emerald-500" />
                            : <Copy size={13} className="text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Nội dung chuyển khoản */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Nội dung chuyển khoản</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-blue-800 font-mono">
                      {selected.invoice_number}
                    </p>
                    <button onClick={() => handleCopy(selected.invoice_number, "content")}
                      className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors shrink-0">
                      {copied === "content"
                        ? <BadgeCheck size={14} className="text-emerald-500" />
                        : <Copy size={14} className="text-blue-400" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-blue-500 mt-1.5 flex items-center gap-1">
                    <Info size={10} /> Vui lòng ghi đúng nội dung để hệ thống xác nhận tự động.
                  </p>
                </div>

                <button onClick={() => setShowPayModal(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-all">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cảnh báo quá hạn */}
        {overdue.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-700">Bạn có {overdue.length} hóa đơn quá hạn!</p>
              <p className="text-xs text-rose-500 mt-0.5">Vui lòng thanh toán sớm để tránh phát sinh thêm phí phạt.</p>
            </div>
          </div>
        )}

        {/* Chi tiết hóa đơn được chọn */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-black text-slate-900">{fmtMonth(selected.billing_month)}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Phòng {selected.building}-{selected.room_number} · {selected.invoice_number}
                </p>
              </div>
              {(() => {
                const cfg = STATUS_CFG[selected.status] || STATUS_CFG["Chưa thanh toán"];
                const Icon = cfg.icon;
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.cls}`}>
                    <Icon size={11} /> {selected.status}
                  </span>
                );
              })()}
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chi phí chính */}
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3">Chi phí chính</p>
                <DetailRow icon={Home}     label="Tiền phòng"  value={fmtMoney(selected.rent_amount)}
                  sub={`${selected.occupancy} người × ${fmtMoney(selected.rent_per_person)}`} accent />
                <DetailRow icon={Zap}      label="Tiền điện"   value={fmtMoney(selected.electric_amount)}
                  sub={`${selected.electric_start}→${selected.electric_end} kWh`} />
                <DetailRow icon={Droplets} label="Tiền nước"   value={fmtMoney(selected.water_amount)}
                  sub={`${selected.water_start}→${selected.water_end} m³`} />
              </div>

              {/* Phí dịch vụ + tổng */}
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-3">Phí dịch vụ & tổng</p>
                <DetailRow icon={Wifi}     label="Internet"    value={fmtMoney(selected.internet_fee)} />
                <DetailRow icon={Trash2}   label="Rác"         value={fmtMoney(selected.garbage_fee)} />
                <DetailRow icon={Car}      label="Gửi xe"      value={fmtMoney(selected.parking_fee)}
                  sub={selected.parking_count > 0 ? `${selected.parking_count} xe` : undefined} />
                {Number(selected.discount_amount) > 0 && (
                  <DetailRow icon={CheckCircle} label="Giảm giá" value={`-${fmtMoney(selected.discount_amount)}`} />
                )}
                {Number(selected.penalty_amount) > 0 && (
                  <DetailRow icon={AlertCircle} label="Phí phạt" value={fmtMoney(selected.penalty_amount)} accent />
                )}
                <div className="mt-3 pt-3 border-t-2 border-slate-200 flex items-center justify-between">
                  <span className="font-black text-slate-700 uppercase text-xs tracking-wider">Tổng cộng</span>
                  <span className="font-black text-blue-700 text-xl">{fmtMoney(selected.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Thông tin thanh toán */}
            {selected.status === "Đã thanh toán" && (
              <div className="mx-5 mb-5 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle size={14} className="shrink-0" />
                <span>Đã thanh toán{selected.paid_at ? ` ngày ${fmtDate(selected.paid_at)}` : ""}
                  {selected.payment_method ? ` · ${selected.payment_method}` : ""}</span>
                {selected.payment_reference && (
                  <span className="font-mono text-xs text-emerald-500 ml-1">({selected.payment_reference})</span>
                )}
              </div>
            )}
            {selected.status !== "Đã thanh toán" && (
              <div className="mx-5 mb-5 space-y-3">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-700">
                  <span className="font-semibold">Hạn thanh toán:</span> {fmtDate(selected.due_date)}
                </div>
                <button
                  onClick={() => setShowPayModal(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-200">
                  <CreditCard size={16} /> Thanh toán chuyển khoản
                </button>
              </div>
            )}
            {selected.note && (
              <div className="mx-5 mb-5 bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-xs text-slate-500 italic">{selected.note}</p>
              </div>
            )}

            {/* Thông tin người gửi số điện/nước */}
            {selected.meter_submitted_by && (
              <div className="mx-5 mb-5 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
                <User size={14} className="text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-700">Số liệu điện/nước do sinh viên gửi</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {selected.meter_submitter_name || "Sinh viên"} · {selected.meter_submitted_at ? new Date(selected.meter_submitted_at).toLocaleString("vi-VN") : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center text-slate-400">
            <Receipt size={36} className="mx-auto mb-3 text-slate-200" />
            <p className="text-sm">Chọn một hóa đơn để xem chi tiết</p>
          </div>
        )}
      </div>

      {/* ── Cột phải: Danh sách hóa đơn ── */}
      <div className="w-72 shrink-0 flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 12rem)" }}>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1 mb-1">
          Lịch sử hóa đơn ({invoices.length})
        </p>
        {invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 py-10 text-center text-slate-400 text-sm">
            Chưa có hóa đơn
          </div>
        ) : invoices.map(inv => {
          const cfg  = STATUS_CFG[inv.status] || STATUS_CFG["Chưa thanh toán"];
          const Icon = cfg.icon;
          const isActive = selected?.id === inv.id;
          return (
            <button key={inv.id} onClick={() => setSelected(inv)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                isActive
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
              }`}>
              <div className="flex items-center justify-between mb-1.5">
                <p className={`font-bold text-sm ${isActive ? "text-white" : "text-slate-900"}`}>
                  {fmtMonth(inv.billing_month)}
                </p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : cfg.cls
                }`}>
                  <Icon size={9} /> {inv.status}
                </span>
              </div>
              <p className={`text-xs ${isActive ? "text-blue-200" : "text-slate-400"}`}>
                Phòng {inv.building}-{inv.room_number}
              </p>
              <p className={`text-sm font-black mt-1 ${isActive ? "text-white" : "text-blue-700"}`}>
                {fmtMoney(inv.total_amount)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StudentBills;

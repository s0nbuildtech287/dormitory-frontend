import { useEffect, useState } from "react";
import {
  CreditCard, CheckCircle, Clock, AlertCircle,
  Zap, Droplets, Home, Wifi, Trash2, Car, Receipt
} from "lucide-react";
import { getStudentInvoices } from "../../../api/apiStudent.js";

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

  useEffect(() => {
    getStudentInvoices()
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : [];
        // Sắp xếp: quá hạn → chưa TT → đã TT, mới nhất lên đầu
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
  }, []);

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
        <div className="grid grid-cols-3 gap-3">
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
        </div>

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
              <div className="mx-5 mb-5 bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-700">
                <span className="font-semibold">Hạn thanh toán:</span> {fmtDate(selected.due_date)}
              </div>
            )}
            {selected.note && (
              <div className="mx-5 mb-5 bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-xs text-slate-500 italic">{selected.note}</p>
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

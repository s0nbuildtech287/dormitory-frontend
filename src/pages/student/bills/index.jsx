import { useEffect, useState } from "react";
import { CreditCard, CheckCircle, Clock, AlertCircle, Zap, Droplets, Home } from "lucide-react";
import { getStudentInvoices } from "../../../api/apiStudent.js";

const fmtMoney = (v) => (v != null ? `${Number(v).toLocaleString("vi-VN")} đ` : "—");
const fmtMonth = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
};

const STATUS_CFG = {
  "Chưa thanh toán": { cls: "bg-rose-100 text-rose-700",     icon: Clock },
  "Đã thanh toán":   { cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  "Quá hạn":         { cls: "bg-orange-100 text-orange-700",  icon: AlertCircle },
};

const StudentBills = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getStudentInvoices()
      .then((res) => setInvoices(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Tổng hợp số liệu
  const unpaid = invoices.filter((i) => i.status === "Chưa thanh toán" || i.status === "Quá hạn");
  const paid   = invoices.filter((i) => i.status === "Đã thanh toán");
  const totalUnpaid = unpaid.reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const totalPaid   = paid.reduce((s, i) => s + Number(i.total_amount || 0), 0);

  if (loading) return <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-rose-500">
        <AlertCircle size={36} /><p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-xl"><CreditCard size={22} className="text-rose-600" /></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cần thanh toán</p>
            <p className="text-xl font-black text-slate-900">{fmtMoney(totalUnpaid)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl"><CheckCircle size={22} className="text-emerald-600" /></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Đã thanh toán</p>
            <p className="text-xl font-black text-slate-900">{fmtMoney(totalPaid)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl"><Home size={22} className="text-blue-600" /></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tổng hóa đơn</p>
            <p className="text-xl font-black text-slate-900">{invoices.length}</p>
          </div>
        </div>
      </div>

      {/* Bảng hóa đơn */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {invoices.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">Chưa có hóa đơn nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                  <th className="px-5 py-3.5">Kỳ</th>
                  <th className="px-5 py-3.5">Phòng</th>
                  <th className="px-5 py-3.5">Tiền phòng</th>
                  <th className="px-5 py-3.5">Điện</th>
                  <th className="px-5 py-3.5">Nước</th>
                  <th className="px-5 py-3.5">Tổng</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => {
                  const cfg = STATUS_CFG[inv.status] || { cls: "bg-slate-100 text-slate-600", icon: Clock };
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelected(selected?.id === inv.id ? null : inv)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">{fmtMonth(inv.billing_month)}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-sm">{inv.building}-{inv.room_number}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-sm">{fmtMoney(inv.rent_amount)}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-sm">{fmtMoney(inv.electric_amount)}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-sm">{fmtMoney(inv.water_amount)}</td>
                      <td className="px-5 py-3.5 font-bold text-blue-700 text-sm">{fmtMoney(inv.total_amount)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${cfg.cls}`}>
                          <Icon size={10} />{inv.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chi tiết hóa đơn được chọn */}
      {selected && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Chi tiết — {fmtMonth(selected.billing_month)}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {[
              ["Tiền phòng", fmtMoney(selected.rent_amount)],
              ["Điện", fmtMoney(selected.electric_amount)],
              ["Nước", fmtMoney(selected.water_amount)],
              ["Internet", fmtMoney(selected.internet_fee)],
              ["Rác", fmtMoney(selected.garbage_fee)],
              ["Gửi xe", fmtMoney(selected.parking_fee)],
              ["Giảm giá", fmtMoney(selected.discount_amount)],
              ["Phạt", fmtMoney(selected.penalty_amount)],
              ["Hạn TT", selected.due_date ? new Date(selected.due_date).toLocaleDateString("vi-VN") : "—"],
            ].map(([label, val]) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 uppercase font-bold">{label}</p>
                <p className="font-bold text-slate-800 mt-0.5">{val}</p>
              </div>
            ))}
          </div>
          {selected.note && (
            <p className="text-xs text-slate-500 italic mt-2">Ghi chú: {selected.note}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentBills;

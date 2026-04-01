import { useState, useEffect } from "react";
import { X, Receipt, Home, Zap, Droplet, Wifi, Car, Trash2, Printer, ArrowRight, Pencil, Save, RotateCcw } from "lucide-react";
import { updateInvoice } from "../../../api/apiInvoice.js";

const fmt = (v) => Math.round(v || 0).toLocaleString("vi-VN");

const InvoiceDetailModal = ({ invoice, onClose, onNavigateToInvoice, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const buildForm = (inv) => ({
    electric_start: inv?.electric_start ?? 0,
    electric_end: inv?.electric_end ?? 0,
    electric_rate: inv?.electric_rate ?? 3500,
    water_start: inv?.water_start ?? 0,
    water_end: inv?.water_end ?? 0,
    water_rate: inv?.water_rate ?? 15000,
    garbage_fee: inv?.garbage_fee ?? 70000,
    internet_fee: inv?.internet_fee ?? 300000,
    parking_count: inv?.parking_count ?? 0,
    parking_fee_per_vehicle: inv?.parking_fee_per_vehicle ?? 50000,
    discount_amount: inv?.discount_amount ?? 0,
    penalty_amount: inv?.penalty_amount ?? 0,
    note: inv?.note ?? "",
    status: inv?.status ?? "Chưa thanh toán",
  });

  const [form, setForm] = useState(() => buildForm(invoice));

  useEffect(() => {
    setForm(buildForm(invoice));
    setIsEditing(false);
    setSaveError("");
  }, [invoice?.id]);

  if (!invoice) return null;

  const electricUsage = Number(form.electric_end) - Number(form.electric_start);
  const waterUsage = Number(form.water_end) - Number(form.water_start);
  const electricAmount = Math.max(0, electricUsage) * Number(form.electric_rate);
  const waterAmount = Math.max(0, waterUsage) * Number(form.water_rate);
  const parkingFee = Number(form.parking_count) * Number(form.parking_fee_per_vehicle);
  const serviceFees = Number(form.garbage_fee) + Number(form.internet_fee) + parkingFee;
  const rentAmount = Number(invoice.rent_amount || 0);
  const totalAmount = rentAmount + electricAmount + waterAmount + serviceFees
    - Number(form.discount_amount) + Number(form.penalty_amount);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError("");
      await updateInvoice(invoice.id, {
        electric_start: Number(form.electric_start),
        electric_end: Number(form.electric_end),
        electric_rate: Number(form.electric_rate),
        electric_amount: electricAmount,
        water_start: Number(form.water_start),
        water_end: Number(form.water_end),
        water_rate: Number(form.water_rate),
        water_amount: waterAmount,
        garbage_fee: Number(form.garbage_fee),
        internet_fee: Number(form.internet_fee),
        parking_count: Number(form.parking_count),
        parking_fee_per_vehicle: Number(form.parking_fee_per_vehicle),
        parking_fee: parkingFee,
        service_fees: serviceFees,
        discount_amount: Number(form.discount_amount),
        penalty_amount: Number(form.penalty_amount),
        total_amount: totalAmount,
        note: form.note,
        status: form.status,
      });
      setIsEditing(false);
      if (onUpdated) onUpdated();
    } catch (err) {
      setSaveError(err.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(buildForm(invoice));
    setIsEditing(false);
    setSaveError("");
  };

  const numInput = (field, label, unit = "đ", step = 1000) => (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      {isEditing ? (
        <div className="flex items-center gap-1">
          <input
            type="number" min={0} step={step}
            value={form[field]}
            onChange={e => set(field, e.target.value)}
            className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-right outline-none focus:ring-2 focus:ring-blue-200"
          />
          <span className="text-xs text-slate-400">{unit}</span>
        </div>
      ) : (
        <span className="text-xs font-semibold text-slate-700">{fmt(form[field])} {unit}</span>
      )}
    </div>
  );

  const billingMonthLabel = (() => {
    if (!invoice.billing_month) return "N/A";
    if (typeof invoice.billing_month === "string") {
      if (invoice.billing_month.includes("T")) {
        const d = new Date(invoice.billing_month);
        return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
      }
      const [year, month] = invoice.billing_month.split("-");
      return `Tháng ${parseInt(month)}/${year}`;
    }
    return "N/A";
  })();

  const dueDateLabel = invoice.due_date
    ? new Date(invoice.due_date.includes("T") ? invoice.due_date : invoice.due_date + "T00:00:00").toLocaleDateString("vi-VN")
    : "—";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-in scale-in-95 duration-200">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={24} className="text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">Chi tiết hóa đơn</h3>
              {isEditing && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg">Đang chỉnh sửa</span>
              )}
            </div>
            {invoice.invoice_number ? (
              <p className="text-sm text-slate-500">
                Mã HĐ: <span className="font-mono font-semibold text-slate-700">{invoice.invoice_number}</span>
              </p>
            ) : (
              <p className="text-sm text-amber-600 font-semibold">Chưa có hóa đơn chính thức</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Phòng</p>
            <p className="text-sm font-bold text-slate-900">{invoice.building}-{invoice.room_number}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Số người ở</p>
            <p className="text-sm font-bold text-slate-900">{invoice.occupancy} người</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Kỳ thanh toán</p>
            <p className="text-sm font-bold text-slate-900">{billingMonthLabel}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Hạn đóng</p>
            <p className="text-sm font-bold text-slate-900">{dueDateLabel}</p>
          </div>
        </div>

        {/* Fee Details */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Chi tiết các khoản phí</h4>

          {/* Rent (readonly) */}
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <Home size={16} className="text-blue-600" />
              <div>
                <span className="text-sm font-semibold text-slate-700">Tiền phòng</span>
                <p className="text-xs text-slate-500">
                  {fmt(invoice.rent_per_person)} đ/người × {invoice.occupancy}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900">{fmt(rentAmount)} đ</span>
          </div>

          {/* Electric */}
          <div className="p-3 bg-slate-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                <span className="text-sm font-semibold text-slate-700">Tiền điện</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{fmt(electricAmount)} đ</span>
            </div>
            <div className="pl-6 space-y-1.5">
              {numInput("electric_start", "Chỉ số đầu", "kWh", 1)}
              {numInput("electric_end", "Chỉ số cuối", "kWh", 1)}
              {numInput("electric_rate", "Đơn giá", "đ/kWh", 100)}
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tiêu thụ</span>
                <span className="font-semibold">{Math.max(0, electricUsage)} kWh</span>
              </div>
            </div>
          </div>

          {/* Water */}
          <div className="p-3 bg-slate-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet size={16} className="text-blue-500" />
                <span className="text-sm font-semibold text-slate-700">Tiền nước</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{fmt(waterAmount)} đ</span>
            </div>
            <div className="pl-6 space-y-1.5">
              {numInput("water_start", "Chỉ số đầu", "m³", 1)}
              {numInput("water_end", "Chỉ số cuối", "m³", 1)}
              {numInput("water_rate", "Đơn giá", "đ/m³", 1000)}
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tiêu thụ</span>
                <span className="font-semibold">{Math.max(0, waterUsage)} m³</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="p-3 bg-slate-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Phí dịch vụ</span>
              <span className="text-sm font-bold text-slate-900">{fmt(serviceFees)} đ</span>
            </div>
            <div className="pl-4 border-l-2 border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600"><Trash2 size={12} /><span>Rác</span></div>
                {isEditing ? (
                  <input type="number" min={0} step={1000} value={form.garbage_fee}
                    onChange={e => set("garbage_fee", e.target.value)}
                    className="w-24 px-2 py-1 border border-slate-300 rounded-lg text-xs font-semibold text-right outline-none focus:ring-2 focus:ring-blue-200" />
                ) : (
                  <span className="text-xs font-semibold text-slate-700">{fmt(form.garbage_fee)} đ</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600"><Wifi size={12} /><span>Internet</span></div>
                {isEditing ? (
                  <input type="number" min={0} step={1000} value={form.internet_fee}
                    onChange={e => set("internet_fee", e.target.value)}
                    className="w-24 px-2 py-1 border border-slate-300 rounded-lg text-xs font-semibold text-right outline-none focus:ring-2 focus:ring-blue-200" />
                ) : (
                  <span className="text-xs font-semibold text-slate-700">{fmt(form.internet_fee)} đ</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-600"><Car size={12} /><span>Gửi xe</span></div>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input type="number" min={0} value={form.parking_count}
                      onChange={e => set("parking_count", e.target.value)}
                      className="w-12 px-2 py-1 border border-slate-300 rounded-lg text-xs font-semibold text-center outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="xe" />
                    <span className="text-xs text-slate-400">×</span>
                    <input type="number" min={0} step={1000} value={form.parking_fee_per_vehicle}
                      onChange={e => set("parking_fee_per_vehicle", e.target.value)}
                      className="w-20 px-2 py-1 border border-slate-300 rounded-lg text-xs font-semibold text-right outline-none focus:ring-2 focus:ring-blue-200" />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-700">{fmt(parkingFee)} đ ({form.parking_count} xe)</span>
                )}
              </div>
            </div>
          </div>

          {/* Discount & Penalty */}
          <div className="p-3 bg-slate-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-green-700">Giảm giá</span>
              {isEditing ? (
                <input type="number" min={0} step={10000} value={form.discount_amount}
                  onChange={e => set("discount_amount", e.target.value)}
                  className="w-28 px-2 py-1.5 border border-green-300 rounded-lg text-xs font-semibold text-right outline-none focus:ring-2 focus:ring-green-200 bg-green-50" />
              ) : (
                <span className="text-sm font-bold text-green-700">-{fmt(form.discount_amount)} đ</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-red-700">Phí phạt</span>
              {isEditing ? (
                <input type="number" min={0} step={10000} value={form.penalty_amount}
                  onChange={e => set("penalty_amount", e.target.value)}
                  className="w-28 px-2 py-1.5 border border-red-300 rounded-lg text-xs font-semibold text-right outline-none focus:ring-2 focus:ring-red-200 bg-red-50" />
              ) : (
                <span className="text-sm font-bold text-red-700">+{fmt(form.penalty_amount)} đ</span>
              )}
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="border-t-2 border-slate-200 pt-4 mb-6">
          <div className="flex justify-between items-center p-4 bg-blue-600 rounded-xl">
            <span className="text-base font-bold text-white">Tổng cộng</span>
            <span className="text-2xl font-black text-white">{fmt(totalAmount)} đ</span>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-semibold text-slate-600">Trạng thái</span>
            {isEditing ? (
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-200 bg-white">
                <option>Chưa thanh toán</option>
                <option>Đã thanh toán</option>
                <option>Quá hạn</option>
              </select>
            ) : (
              <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                form.status === "Đã thanh toán" ? "bg-emerald-100 text-emerald-700" :
                form.status === "Quá hạn" ? "bg-rose-100 text-rose-700" :
                "bg-amber-100 text-amber-700"
              }`}>{form.status}</span>
            )}
          </div>
          {form.status === "Đã thanh toán" && invoice.paid_at && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-semibold text-slate-600">Ngày thanh toán</span>
              <span className="text-sm font-bold text-slate-900">{new Date(invoice.paid_at).toLocaleDateString("vi-VN")}</span>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Ghi chú</p>
          {isEditing ? (
            <textarea rows={2} value={form.note} onChange={e => set("note", e.target.value)}
              placeholder="Ghi chú thêm..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
          ) : form.note ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">{form.note}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Không có ghi chú</p>
          )}
        </div>

        {/* Thông tin người gửi số điện/nước */}
        {invoice.meter_submitted_by && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Zap size={12} /> Số liệu điện/nước
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Nguồn</span>
                <span className={`font-semibold ${invoice.meter_submitter_name === 'Mặc định (hệ thống)' ? 'text-amber-600' : 'text-slate-700'}`}>
                  {invoice.meter_submitter_name || "—"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Thời gian</span>
                <span className="font-semibold text-slate-700">
                  {invoice.meter_submitted_at
                    ? new Date(invoice.meter_submitted_at).toLocaleString("vi-VN")
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        )}
        {!invoice.meter_submitted_by && (
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-400 italic flex items-center gap-1.5">
              <Zap size={11} /> Chưa có số liệu điện/nước từ sinh viên
            </p>
          </div>
        )}

        {saveError && <p className="text-xs text-rose-600 font-semibold mb-4">{saveError}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button onClick={handleCancel}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm flex items-center justify-center gap-2">
                <RotateCcw size={15} /> Hủy
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                <Save size={15} /> {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm">
                Đóng
              </button>
              <button onClick={() => setIsEditing(true)}
                className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-bold text-sm flex items-center justify-center gap-2">
                <Pencil size={15} /> Chỉnh sửa
              </button>
              {onNavigateToInvoice && invoice.invoice_number && (
                <button onClick={onNavigateToInvoice}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold text-sm flex items-center justify-center gap-2">
                  <ArrowRight size={16} /> Xem trang HĐ
                </button>
              )}
              {invoice.invoice_number && (
                <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm flex items-center justify-center gap-2">
                  <Printer size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;

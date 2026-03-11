import { X, Receipt, Home, Zap, Droplet, Wifi, Car, Trash2, Printer, ArrowRight } from "lucide-react";

const InvoiceDetailModal = ({ invoice, onClose, onNavigateToInvoice }) => {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-in scale-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Receipt size={24} className="text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">Chi tiết hóa đơn</h3>
            </div>
            {invoice.invoice_number ? (
              <p className="text-sm text-slate-500">
                Mã HĐ: <span className="font-mono font-semibold text-slate-700">{invoice.invoice_number}</span>
              </p>
            ) : (
              <p className="text-sm text-amber-600 font-semibold">
                Chưa có hóa đơn chính thức
              </p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
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
            <p className="text-sm font-bold text-slate-900">
              {(() => {
                // Safe parsing for billing_month
                if (typeof invoice.billing_month === 'string') {
                  if (invoice.billing_month.includes('T')) {
                    // ISO timestamp format
                    const date = new Date(invoice.billing_month);
                    return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
                  } else {
                    // YYYY-MM-DD format
                    const [year, month] = invoice.billing_month.split('-');
                    return `Tháng ${parseInt(month)}/${year}`;
                  }
                }
                return 'N/A';
              })()}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Hạn đóng</p>
            <p className="text-sm font-bold text-slate-900">
              {invoice.due_date ? (() => {
                const dueDate = invoice.due_date.includes('T') 
                  ? new Date(invoice.due_date) 
                  : new Date(invoice.due_date + 'T00:00:00');
                return dueDate.toLocaleDateString('vi-VN');
              })() : '—'}
            </p>
          </div>
        </div>

        {/* Fee Details */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Chi tiết các khoản phí</h4>
          
          {/* Rent */}
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <Home size={16} className="text-blue-600" />
              <div>
                <span className="text-sm font-semibold text-slate-700">Tiền phòng</span>
                <p className="text-xs text-slate-500">
                  {Math.round(invoice.rent_per_person || 500000).toLocaleString('vi-VN')} đ/người × {invoice.occupancy}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {Math.round(invoice.rent_amount || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>

          {/* Electric */}
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <div>
                <span className="text-sm font-semibold text-slate-700">Tiền điện</span>
                <p className="text-xs text-slate-500">
                  {invoice.electric_start} → {invoice.electric_end} kWh 
                  ({invoice.electric_end - invoice.electric_start} kWh × {Math.round(invoice.electric_rate || 3500).toLocaleString('vi-VN')} đ)
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {Math.round(invoice.electric_amount || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>

          {/* Water */}
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Droplet size={16} className="text-blue-500" />
              <div>
                <span className="text-sm font-semibold text-slate-700">Tiền nước</span>
                <p className="text-xs text-slate-500">
                  {invoice.water_start} → {invoice.water_end} m³
                  ({invoice.water_end - invoice.water_start} m³ × {Math.round(invoice.water_rate || 15000).toLocaleString('vi-VN')} đ)
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {Math.round(invoice.water_amount || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>

          {/* Services */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Phí dịch vụ</span>
              <span className="text-sm font-bold text-slate-900">
                {Math.round(invoice.service_fees || 0).toLocaleString('vi-VN')} đ
              </span>
            </div>
            <div className="space-y-1.5 pl-4 border-l-2 border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Trash2 size={12} />
                  <span>Rác</span>
                </div>
                <span className="font-semibold text-slate-700">
                  {Math.round(invoice.garbage_fee || 70000).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Wifi size={12} />
                  <span>Internet</span>
                </div>
                <span className="font-semibold text-slate-700">
                  {Math.round(invoice.internet_fee || 300000).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Car size={12} />
                  <span>Gửi xe ({invoice.parking_count || 0} xe)</span>
                </div>
                <span className="font-semibold text-slate-700">
                  {Math.round(invoice.parking_fee || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </div>

          {/* Discount & Penalty */}
          {(invoice.discount_amount > 0 || invoice.penalty_amount > 0) && (
            <div className="space-y-2">
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-sm font-semibold text-green-700">Giảm giá</span>
                  <span className="text-sm font-bold text-green-700">
                    -{Math.round(invoice.discount_amount || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              )}
              {invoice.penalty_amount > 0 && (
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-sm font-semibold text-red-700">Phí phạt</span>
                  <span className="text-sm font-bold text-red-700">
                    +{Math.round(invoice.penalty_amount || 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="border-t-2 border-slate-200 pt-4 mb-6">
          <div className="flex justify-between items-center p-4 bg-blue-600 rounded-xl">
            <span className="text-base font-bold text-white">Tổng cộng</span>
            <span className="text-2xl font-black text-white">
              {Math.round(invoice.total_amount || 0).toLocaleString('vi-VN')} đ
            </span>
          </div>
        </div>

        {/* Status & Payment Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-semibold text-slate-600">Trạng thái</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
              invoice.status === "Đã thanh toán" ? "bg-emerald-100 text-emerald-700" : 
              invoice.status === "Quá hạn" ? "bg-rose-100 text-rose-700" :
              "bg-amber-100 text-amber-700"
            }`}>
              {invoice.status}
            </span>
          </div>
          
          {invoice.status === "Đã thanh toán" && invoice.paid_at && (
            <>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-600">Ngày thanh toán</span>
                <span className="text-sm font-bold text-slate-900">
                  {new Date(invoice.paid_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {invoice.payment_method && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-semibold text-slate-600">Phương thức</span>
                  <span className="text-sm font-bold text-slate-900">{invoice.payment_method}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Note */}
        {invoice.note && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <p className="text-xs font-semibold text-amber-800 mb-1">Ghi chú:</p>
            <p className="text-xs text-amber-700">{invoice.note}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm"
          >
            Đóng
          </button>
          {onNavigateToInvoice && invoice.invoice_number && (
            <button 
              onClick={onNavigateToInvoice}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold text-sm flex items-center justify-center gap-2"
            >
              <ArrowRight size={16} />
              Xem trang hóa đơn
            </button>
          )}
          {invoice.invoice_number && (
            <button 
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm flex items-center justify-center gap-2"
            >
              <Printer size={16} />
              In hóa đơn
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;

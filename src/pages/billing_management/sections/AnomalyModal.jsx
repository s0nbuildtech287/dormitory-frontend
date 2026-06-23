import { useEffect, useState } from "react";
import { X, Zap, Droplets, TrendingUp, AlertTriangle, RefreshCw, Building2 } from "lucide-react";
import { detectInvoiceAnomalies } from "../../../api/apiInvoice.js";
import useBuildingDisplayNames from "../../../hooks/useBuildingDisplayNames.js";
import { usePagination } from "../../../hooks/usePagination.js";
import Pagination from "../../../components/common/Pagination.jsx";

/**
 * Modal hiển thị các bất thường điện/nước trong hóa đơn
 * So sánh tháng hiện tại với trung bình 3 tháng trước
 */
const AnomalyModal = ({ isOpen, onClose }) => {
  const { getRoomLabel } = useBuildingDisplayNames();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const anomaliesList = data?.anomalies || [];
  const pagination = usePagination(anomaliesList, 5); // 5 items per page
  const { currentItems, goToPage } = pagination;

  useEffect(() => {
    if (isOpen) fetchAnomalies();
  }, [isOpen]);

  const fetchAnomalies = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await detectInvoiceAnomalies();
      if (res.success) {
        setData(res.data);
        goToPage(1);
      }
      else setError("Không thể tải dữ liệu bất thường.");
    } catch (e) {
      setError(e.message || "Lỗi kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col animate-in scale-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Phát hiện bất thường</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                So sánh điện/nước tháng hiện tại với trung bình 3 tháng trước
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAnomalies}
              disabled={loading}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <RefreshCw size={28} className="animate-spin text-amber-400" />
              <p className="text-sm text-slate-500">Đang phân tích dữ liệu...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Summary */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  data.total === 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {data.total === 0
                    ? "✓ Không có bất thường"
                    : `${data.total} phòng bất thường`}
                </div>
                <span className="text-xs text-slate-400">
                  Ngưỡng cảnh báo: tăng &gt; {data.threshold_pct}% so với trung bình
                </span>
              </div>

              {data.total === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <TrendingUp size={24} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Mọi thứ bình thường</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Không có phòng nào có mức tiêu thụ điện/nước tăng đột biến so với 3 tháng trước.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {currentItems.map((item) => (
                      <AnomalyCard key={item.invoice_id} item={item} />
                    ))}
                  </div>
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <Pagination pagination={pagination} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const AnomalyCard = ({ item }) => {
  const { getRoomLabel } = useBuildingDisplayNames();
  const hasElectric = item.electric_anomaly;
  const hasWater = item.water_anomaly;

  return (
    <div className="border-2 border-amber-100 bg-amber-50/40 rounded-2xl p-4 hover:border-amber-200 transition-colors">
      {/* Room info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-slate-500" />
          <span className="text-sm font-bold text-slate-900">
            {getRoomLabel(item.building, item.room_number)}
          </span>
          <span className="text-xs text-slate-500 font-mono">{item.invoice_number}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{item.billing_month_label}</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
            item.status === "Đã thanh toán"
              ? "bg-emerald-100 text-emerald-700"
              : item.status === "Quá hạn"
                ? "bg-rose-100 text-rose-700"
                : "bg-amber-100 text-amber-700"
          }`}>
            {item.status}
          </span>
        </div>
      </div>

      {/* Anomaly details */}
      <div className="grid grid-cols-2 gap-3">
        {hasElectric && (
          <div className="bg-white rounded-xl p-3 border border-amber-200">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={13} className="text-yellow-500" />
              <span className="text-xs font-bold text-slate-700">Điện bất thường</span>
            </div>
            <div className="space-y-1.5">
              {/* Lượng dùng */}
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Tháng này</span>
                <span className="font-bold text-amber-700">{item.electric_usage} kWh</span>
              </div>
              {item.electric_prev !== null && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Tháng trước</span>
                  <span className={`font-semibold ${Math.abs(item.electric_change_prev_pct) >= 50 ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                    {item.electric_prev} kWh ({item.electric_change_prev_pct >= 0 ? "+" : ""}{item.electric_change_prev_pct}%)
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">TB 3 tháng trước</span>
                <span className={`font-semibold ${Math.abs(item.electric_increase_pct) >= 50 ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                  {item.electric_avg} kWh ({item.electric_increase_pct >= 0 ? "+" : ""}{item.electric_increase_pct}%)
                </span>
              </div>
              {/* Tiền */}
              <div className="pt-1.5 border-t border-amber-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Tiền điện tháng này</span>
                  <span className="font-bold text-amber-700">{(item.electric_amount || 0).toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">TB tiền điện trước</span>
                  <span className="text-slate-500">{(item.electric_amount_avg || 0).toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-0.5">
                  <span className="text-slate-600">Chênh lệch (vs TB)</span>
                  <span className="text-rose-600">
                    {item.electric_amount_diff >= 0 ? "+" : ""}{(item.electric_amount_diff || 0).toLocaleString("vi-VN")}đ
                    <span className="text-rose-400 font-normal ml-1">
                      ({item.electric_increase_pct >= 0 ? "+" : ""}{item.electric_increase_pct}%)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {hasWater && (
          <div className="bg-white rounded-xl p-3 border border-blue-200">
            <div className="flex items-center gap-1.5 mb-2">
              <Droplets size={13} className="text-blue-500" />
              <span className="text-xs font-bold text-slate-700">Nước bất thường</span>
            </div>
            <div className="space-y-1.5">
              {/* Lượng dùng */}
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Tháng này</span>
                <span className="font-bold text-blue-700">{item.water_usage} m³</span>
              </div>
              {item.water_prev !== null && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Tháng trước</span>
                  <span className={`font-semibold ${Math.abs(item.water_change_prev_pct) >= 50 ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                    {item.water_prev} m³ ({item.water_change_prev_pct >= 0 ? "+" : ""}{item.water_change_prev_pct}%)
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">TB 3 tháng trước</span>
                <span className={`font-semibold ${Math.abs(item.water_increase_pct) >= 50 ? "text-rose-600 font-bold" : "text-slate-600"}`}>
                  {item.water_avg} m³ ({item.water_increase_pct >= 0 ? "+" : ""}{item.water_increase_pct}%)
                </span>
              </div>
              {/* Tiền */}
              <div className="pt-1.5 border-t border-blue-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Tiền nước tháng này</span>
                  <span className="font-bold text-blue-700">{(item.water_amount || 0).toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">TB tiền nước trước</span>
                  <span className="text-slate-500">{(item.water_amount_avg || 0).toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-0.5">
                  <span className="text-slate-600">Chênh lệch (vs TB)</span>
                  <span className="text-rose-600">
                    {item.water_amount_diff >= 0 ? "+" : ""}{(item.water_amount_diff || 0).toLocaleString("vi-VN")}đ
                    <span className="text-rose-400 font-normal ml-1">
                      ({item.water_increase_pct >= 0 ? "+" : ""}{item.water_increase_pct}%)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nếu chỉ có 1 loại bất thường, fill cột còn lại bằng tổng tiền */}
        {(hasElectric !== hasWater) && (
          <div className="bg-white rounded-xl p-3 border border-slate-200 flex flex-col justify-center">
            <p className="text-xs text-slate-500 mb-1">Tổng hóa đơn</p>
            <p className="text-sm font-bold text-blue-700">
              {Math.round(item.total_amount || 0).toLocaleString("vi-VN")}đ
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyModal;

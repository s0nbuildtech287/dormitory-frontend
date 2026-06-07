import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, FileText, DoorOpen, Receipt, MessageSquare,
  Bell, TrendingUp, ArrowRight, Clock, AlertCircle,
  Calendar, Activity, Loader2,
} from "lucide-react";
import StatCard from "../../../components/common/StatCard.jsx";
import { getRegistrationStatistics } from "../../../api/apiRegistration.js";
import { getRoomStatistics } from "../../../api/apiRoom.js";
import { getContractStats, getExpiringContracts } from "../../../api/apiContract.js";
import { getInvoiceStatistics } from "../../../api/apiInvoice.js";
import { getAllNotifications } from "../../../api/apiNotification.js";
import { API_BASE_URL } from "../../../config/api.js";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const DashboardHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    registrations: { total: 0, pending: 0, approved: 0, rejected: 0 },
    rooms: { total: 0, occupied: 0, available: 0, occupancyRate: 0 },
    contracts: { total: 0, active: 0, pending: 0, expiring: 0, expired: 0 },
    invoices: { total: 0, paid: 0, unpaid: 0, overdue: 0, revenue: 0, collectionRate: 0 },
    feedbacks: { total: 0, pending: 0, resolved: 0 },
    notifications: { total: 0 },
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        getRegistrationStatistics(),
        getRoomStatistics(),
        getContractStats(),
        getExpiringContracts(30),
        getInvoiceStatistics(),
        fetch(`${API_BASE_URL}/feedbacks`, { headers: authHeaders() }).then(r => r.json()),
        getAllNotifications(),
      ]);

      // ── Registrations ──────────────────────────────────────────────
      const regData = results[0].status === "fulfilled" ? results[0].value?.data : [];
      const regStats = { total: 0, pending: 0, approved: 0, rejected: 0 };
      if (Array.isArray(regData)) {
        regData.forEach((row) => {
          const cnt = parseInt(row.count || 0);
          regStats.total += cnt;
          if (row.status === "Chờ duyệt") regStats.pending += cnt;
          else if (row.status === "Chấp nhận") regStats.approved += cnt;
          else if (row.status === "Từ chối") regStats.rejected += cnt;
        });
      }

      // ── Rooms ──────────────────────────────────────────────────────
      const roomData = results[1].status === "fulfilled" ? results[1].value?.data : {};
      const roomStats = {
        total: parseInt(roomData?.total_rooms || 0),
        occupied: parseInt(roomData?.occupied_rooms || 0),   // số phòng có người ở
        available: parseInt(roomData?.available_rooms || 0), // số phòng chưa đầy
        totalOccupancy: parseInt(roomData?.total_occupancy || 0), // tổng số người
        occupancyRate: parseFloat(roomData?.occupancy_rate || 0),
      };

      // ── Contracts ──────────────────────────────────────────────────
      // getContractStats trả về 1 object (không phải array)
      const contractData = results[2].status === "fulfilled" ? results[2].value?.data : {};
      const expiringData = results[3].status === "fulfilled" ? results[3].value?.data : [];
      const contractStats = {
        total: parseInt(contractData?.total_count || 0),
        active: parseInt(contractData?.active_count || 0),
        pending: parseInt(contractData?.pending_count || 0),
        expired: parseInt(contractData?.expired_count || 0),
        expiring: Array.isArray(expiringData) ? expiringData.length : 0,
      };

      // ── Invoices ───────────────────────────────────────────────────
      // getStatistics trả về object với field names: total_invoices, paid_count, unpaid_count, overdue_count, paid_amount
      const invData = results[4].status === "fulfilled" ? results[4].value?.data : {};
      const invoiceStats = {
        total: parseInt(invData?.total_invoices || 0),
        paid: parseInt(invData?.paid_count || 0),
        unpaid: parseInt(invData?.unpaid_count || 0),
        overdue: parseInt(invData?.overdue_count || 0),
        revenue: parseFloat(invData?.paid_amount || invData?.total_amount || 0),
        collectionRate: invData?.total_invoices > 0
          ? parseFloat(((parseInt(invData?.paid_count || 0) / parseInt(invData?.total_invoices)) * 100).toFixed(1))
          : 0,
      };

      // ── Feedbacks ──────────────────────────────────────────────────
      const fbRaw = results[5].status === "fulfilled" ? results[5].value : {};
      const fbList = Array.isArray(fbRaw?.data) ? fbRaw.data : [];
      const feedbackStats = {
        total: fbList.length,
        pending: fbList.filter((f) => f.status === "New" || f.status === "Processing").length,
        resolved: fbList.filter((f) => f.status === "Resolved").length,
      };

      // ── Notifications ──────────────────────────────────────────────
      const notifList = results[6].status === "fulfilled" ? results[6].value : [];
      const notifStats = { total: Array.isArray(notifList) ? notifList.length : 0 };

      setStats({
        registrations: regStats,
        rooms: roomStats,
        contracts: contractStats,
        invoices: invoiceStats,
        feedbacks: feedbackStats,
        notifications: notifStats,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n || 0);
  const fmtMoney = (n) => {
    if (!n) return "0 ₫";
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} tỷ ₫`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} triệu ₫`;
    return `${fmt(n)} ₫`;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 md:p-8 rounded-3xl text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold mb-2">Chào mừng trở lại! 👋</h1>
            <p className="text-blue-100 text-sm md:text-lg">Hệ thống quản lý ký túc xá - Tổng quan hoạt động</p>
          </div>
          <div className="sm:text-right">
            <div className="flex items-center gap-2 text-blue-100 mb-1">
              <Calendar size={16} />
              <span className="text-xs md:text-sm font-semibold">
                {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Clock size={16} />
              <span className="text-xs md:text-sm font-semibold">{new Date().toLocaleTimeString("vi-VN")}</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 size={32} className="animate-spin mr-3" />
          <span className="text-lg font-semibold">Đang tải dữ liệu...</span>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            <StatCard
              variant="vertical" icon={<FileText size={28} />}
              title="Hồ sơ đăng ký"
              value={fmt(stats.registrations.total)}
              subtitle={`${fmt(stats.registrations.pending)} chờ duyệt`}
              color="blue" alert={stats.registrations.pending > 0}
              onClick={() => navigate("/registrations")}
            />
            <StatCard
              variant="vertical" icon={<DoorOpen size={28} />}
              title="Phòng ký túc xá"
              value={`${fmt(stats.rooms.occupied)}/${fmt(stats.rooms.total)}`}
              subtitle={`Công suất ${stats.rooms.occupancyRate}%`}
              color="purple"
              onClick={() => navigate("/rooms")}
            />
            <StatCard
              variant="vertical" icon={<Users size={28} />}
              title="Hợp đồng sinh viên"
              value={fmt(stats.contracts.active)}
              subtitle={`${fmt(stats.contracts.expiring)} sắp hết hạn`}
              color="green" alert={stats.contracts.expiring > 0}
              onClick={() => navigate("/students")}
            />
            <StatCard
              variant="vertical" icon={<Receipt size={28} />}
              title="Hóa đơn"
              value={`${fmt(stats.invoices.paid)}/${fmt(stats.invoices.total)}`}
              subtitle={`${fmt(stats.invoices.overdue)} quá hạn`}
              color="amber" alert={stats.invoices.overdue > 0}
              onClick={() => navigate("/billing")}
            />
            <StatCard
              variant="vertical" icon={<MessageSquare size={28} />}
              title="Phản ánh"
              value={fmt(stats.feedbacks.total)}
              subtitle={`${fmt(stats.feedbacks.pending)} chờ xử lý`}
              color="indigo" alert={stats.feedbacks.pending > 0}
              onClick={() => navigate("/feedbacks")}
            />
            <StatCard
              variant="vertical" icon={<Bell size={28} />}
              title="Thông báo"
              value={fmt(stats.notifications.total)}
              subtitle="Đã gửi"
              color="rose"
              onClick={() => navigate("/notifications")}
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Financial */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Tổng quan tài chính</h3>
                  <p className="text-sm text-slate-500">Doanh thu và thanh toán</p>
                </div>
              </div>
              <div className="space-y-4">
                <MetricRow label="Tổng doanh thu" value={fmtMoney(stats.invoices.revenue)} color="text-green-600" />
                <MetricRow
                  label="Tỷ lệ thu"
                  value={`${stats.invoices.collectionRate || (stats.invoices.total > 0 ? ((stats.invoices.paid / stats.invoices.total) * 100).toFixed(1) : 0)}%`}
                  color="text-blue-600"
                  progress={stats.invoices.collectionRate || (stats.invoices.total > 0 ? (stats.invoices.paid / stats.invoices.total) * 100 : 0)}
                />
                <MetricRow label="Chưa thanh toán" value={`${fmt(stats.invoices.unpaid)} hóa đơn`} color="text-amber-600" />
                <MetricRow label="Quá hạn" value={`${fmt(stats.invoices.overdue)} hóa đơn`} color="text-red-600" alert={stats.invoices.overdue > 0} />
              </div>
              <button onClick={() => navigate("/billing")} className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                Xem chi tiết <ArrowRight size={18} />
              </button>
            </div>

            {/* Occupancy */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Tình trạng phòng</h3>
                  <p className="text-sm text-slate-500">Công suất sử dụng</p>
                </div>
              </div>
              <div className="space-y-4">
                <MetricRow label="Tổng số phòng" value={fmt(stats.rooms.total)} color="text-slate-600" />
                <MetricRow
                  label="Phòng có người ở"
                  value={fmt(stats.rooms.occupied)}
                  color="text-green-600"
                  progress={stats.rooms.total > 0 ? (stats.rooms.occupied / stats.rooms.total) * 100 : 0}
                />
                <MetricRow label="Tổng sinh viên đang ở" value={fmt(stats.rooms.totalOccupancy)} color="text-blue-600" />
                <MetricRow label="Công suất lấp đầy" value={`${stats.rooms.occupancyRate}%`} color="text-purple-600" />
              </div>
              <button onClick={() => navigate("/rooms")} className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                Xem chi tiết <ArrowRight size={18} />
              </button>
            </div>
          </div>

        </>
      )}
    </div>
  );
};

const MetricRow = ({ label, value, color, progress, alert }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className={`text-lg font-bold ${color} flex items-center gap-2`}>
        {value}
        {alert && <AlertCircle size={16} className="text-red-500" />}
      </span>
    </div>
    {progress !== undefined && (
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className={`h-full ${color.replace("text-", "bg-")} rounded-full transition-all`} style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
    )}
  </div>
);


export default DashboardHome;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  DoorOpen,
  Receipt,
  MessageSquare,
  Bell,
  TrendingUp,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  Activity,
} from "lucide-react";
import StatCard from "../../../components/common/StatCard.jsx";

const DashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    registrations: { total: 0, pending: 0, approved: 0, rejected: 0 },
    rooms: { total: 0, occupied: 0, available: 0, occupancyRate: 0 },
    contracts: { total: 0, active: 0, expiring: 0, expired: 0 },
    invoices: { total: 0, paid: 0, unpaid: 0, overdue: 0, revenue: 0 },
    feedbacks: { total: 0, pending: 0, resolved: 0 },
    notifications: { total: 0, sent: 0 },
  });

  // TODO: Fetch real data from API
  useEffect(() => {
    // Mock data - replace with actual API calls
    setStats({
      registrations: { total: 245, pending: 45, approved: 180, rejected: 20 },
      rooms: { total: 120, occupied: 95, available: 25, occupancyRate: 79.2 },
      contracts: { total: 180, active: 165, expiring: 12, expired: 3 },
      invoices: { total: 540, paid: 420, unpaid: 95, overdue: 25, revenue: 1250000000 },
      feedbacks: { total: 89, pending: 15, resolved: 74 },
      notifications: { total: 156, sent: 156 },
    });
  }, []);

  const handleNavigate = (page) => {
    navigate(`/${page}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại! 👋</h1>
            <p className="text-blue-100 text-lg">
              Hệ thống quản lý ký túc xá - Tổng quan hoạt động
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-blue-100 mb-1">
              <Calendar size={18} />
              <span className="text-sm font-semibold">
                {new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Clock size={18} />
              <span className="text-sm font-semibold">
                {new Date().toLocaleTimeString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Registrations */}
        <StatCard
          variant="vertical"
          icon={<FileText size={28} />}
          title="Hồ sơ đăng ký"
          value={stats.registrations.total}
          subtitle={`${stats.registrations.pending} chờ duyệt`}
          color="blue"
          alert={stats.registrations.pending > 0}
          onClick={() => handleNavigate("registrations")}
        />

        {/* Rooms */}
        <StatCard
          variant="vertical"
          icon={<DoorOpen size={28} />}
          title="Phòng ký túc xá"
          value={`${stats.rooms.occupied}/${stats.rooms.total}`}
          subtitle={`Công suất ${stats.rooms.occupancyRate}%`}
          color="purple"
          onClick={() => handleNavigate("rooms")}
        />

        {/* Contracts */}
        <StatCard
          variant="vertical"
          icon={<Users size={28} />}
          title="Hợp đồng sinh viên"
          value={stats.contracts.active}
          subtitle={`${stats.contracts.expiring} sắp hết hạn`}
          color="green"
          alert={stats.contracts.expiring > 0}
          onClick={() => handleNavigate("students")}
        />

        {/* Invoices */}
        <StatCard
          variant="vertical"
          icon={<Receipt size={28} />}
          title="Hóa đơn"
          value={`${stats.invoices.paid}/${stats.invoices.total}`}
          subtitle={`${stats.invoices.overdue} quá hạn`}
          color="amber"
          alert={stats.invoices.overdue > 0}
          onClick={() => handleNavigate("billing")}
        />

        {/* Feedbacks */}
        <StatCard
          variant="vertical"
          icon={<MessageSquare size={28} />}
          title="Phản ánh"
          value={stats.feedbacks.total}
          subtitle={`${stats.feedbacks.pending} chờ xử lý`}
          color="indigo"
          alert={stats.feedbacks.pending > 0}
          onClick={() => handleNavigate("feedbacks")}
        />

        {/* Notifications */}
        <StatCard
          variant="vertical"
          icon={<Bell size={28} />}
          title="Thông báo"
          value={stats.notifications.sent}
          subtitle="Đã gửi"
          color="rose"
          onClick={() => handleNavigate("notifications")}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Overview */}
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
            <MetricRow
              label="Tổng doanh thu"
              value={`${(stats.invoices.revenue / 1000000000).toFixed(2)} tỷ VNĐ`}
              color="text-green-600"
            />
            <MetricRow
              label="Đã thu"
              value={`${((stats.invoices.paid / stats.invoices.total) * 100).toFixed(1)}%`}
              color="text-blue-600"
              progress={(stats.invoices.paid / stats.invoices.total) * 100}
            />
            <MetricRow
              label="Chưa thu"
              value={`${stats.invoices.unpaid} hóa đơn`}
              color="text-amber-600"
            />
            <MetricRow
              label="Quá hạn"
              value={`${stats.invoices.overdue} hóa đơn`}
              color="text-red-600"
              alert={stats.invoices.overdue > 0}
            />
          </div>

          <button
            onClick={() => handleNavigate("billing")}
            className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            Xem chi tiết
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Occupancy Overview */}
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
            <MetricRow
              label="Tổng số phòng"
              value={stats.rooms.total}
              color="text-slate-600"
            />
            <MetricRow
              label="Đang sử dụng"
              value={stats.rooms.occupied}
              color="text-green-600"
              progress={(stats.rooms.occupied / stats.rooms.total) * 100}
            />
            <MetricRow
              label="Còn trống"
              value={stats.rooms.available}
              color="text-blue-600"
            />
            <MetricRow
              label="Công suất"
              value={`${stats.rooms.occupancyRate}%`}
              color="text-purple-600"
            />
          </div>

          <button
            onClick={() => handleNavigate("rooms")}
            className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            Xem chi tiết
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cảnh báo & Công việc cần xử lý</h3>
            <p className="text-sm text-slate-500">Các vấn đề cần chú ý</p>
          </div>
        </div>

        <div className="space-y-3">
          {stats.registrations.pending > 0 && (
            <AlertItem
              icon={<FileText size={18} />}
              title={`${stats.registrations.pending} hồ sơ đăng ký chờ duyệt`}
              description="Cần xem xét và phê duyệt"
              color="blue"
              onClick={() => handleNavigate("registrations")}
            />
          )}
          {stats.contracts.expiring > 0 && (
            <AlertItem
              icon={<Clock size={18} />}
              title={`${stats.contracts.expiring} hợp đồng sắp hết hạn`}
              description="Trong vòng 30 ngày tới"
              color="amber"
              onClick={() => handleNavigate("students")}
            />
          )}
          {stats.invoices.overdue > 0 && (
            <AlertItem
              icon={<Receipt size={18} />}
              title={`${stats.invoices.overdue} hóa đơn quá hạn thanh toán`}
              description="Cần nhắc nhở sinh viên"
              color="red"
              onClick={() => handleNavigate("billing")}
            />
          )}
          {stats.feedbacks.pending > 0 && (
            <AlertItem
              icon={<MessageSquare size={18} />}
              title={`${stats.feedbacks.pending} phản ánh chờ xử lý`}
              description="Cần phản hồi và giải quyết"
              color="indigo"
              onClick={() => handleNavigate("feedbacks")}
            />
          )}
          {stats.registrations.pending === 0 && 
           stats.contracts.expiring === 0 && 
           stats.invoices.overdue === 0 && 
           stats.feedbacks.pending === 0 && (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
              <p className="text-xl font-bold text-slate-700 mb-2">Tất cả đang ổn định! ✨</p>
              <p className="text-sm">Không có vấn đề cần xử lý khẩn cấp</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// Metric Row Component
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
        <div
          className={`h-full ${color.replace('text-', 'bg-')} rounded-full transition-all`}
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </div>
);

// Alert Item Component
const AlertItem = ({ icon, title, description, color, onClick }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    amber: "bg-amber-50 border-amber-200 text-amber-600",
    red: "bg-red-50 border-red-200 text-red-600",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-600",
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-xl border-2 ${colorClasses[color]} hover:shadow-md transition-all cursor-pointer group`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
          {icon}
        </div>
        <div>
          <p className="font-bold text-slate-900">{title}</p>
          <p className="text-xs text-slate-600">{description}</p>
        </div>
      </div>
      <ArrowRight size={20} className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
    </div>
  );
};

export default DashboardHome;

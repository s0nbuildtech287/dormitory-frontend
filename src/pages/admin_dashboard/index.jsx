import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import DashboardHome from "./sections/DashboardHome.jsx";

const AdminDashboard = () => {
  const [activeSubTab, setActiveSubTab] = useState("home");
  const navigate = useNavigate();

  // Handle navigation to statistics pages
  const handleNavigateToStats = (page) => {
    navigate(`/${page}`);
    // The target page will need to handle switching to stats tab
    // You can use URL params or localStorage to communicate the desired tab
    localStorage.setItem('targetTab', 'stats');
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveSubTab("home")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === "home"
              ? "border-blue-600 text-blue-700 bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Home size={18} /> Trang chủ
        </button>
        <button
          onClick={() => handleNavigateToStats("registrations")}
          className="px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
        >
          <BarChart3 size={18} /> Thống kê & Phân tích
        </button>
        <button
          onClick={() => handleNavigateToStats("rooms")}
          className="px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
        >
          <PieChart size={18} /> Thống kê mật độ
        </button>
        <button
          onClick={() => handleNavigateToStats("students")}
          className="px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
        >
          <Activity size={18} /> Thống kê hợp đồng
        </button>
        <button
          onClick={() => handleNavigateToStats("billing")}
          className="px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
        >
          <DollarSign size={18} /> Thống kê hóa đơn
        </button>
        <button
          onClick={() => handleNavigateToStats("feedbacks")}
          className="px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
        >
          <MessageSquare size={18} /> Thống kê phản ánh
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === "home" && <DashboardHome />}
    </div>
  );
};

export default AdminDashboard;

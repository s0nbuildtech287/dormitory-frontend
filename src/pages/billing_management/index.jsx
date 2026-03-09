import { useState } from "react";
import { List, TrendingUp, Settings } from "lucide-react";
import BillList from "./sections/BillList.jsx";
import RevenueReport from "./sections/RevenueReport.jsx";
import PricingSettings from "./sections/PricingSettings.jsx";

const BillingManagement = ({ onNavigateToContract }) => {
  const [bills, setBills] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("list");

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("list")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeSubTab === "list" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <List size={18} /> Danh sách hóa đơn
        </button>
        <button
          onClick={() => setActiveSubTab("revenue")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeSubTab === "revenue" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <TrendingUp size={18} /> Báo cáo doanh thu
        </button>
        <button
          onClick={() => setActiveSubTab("settings")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeSubTab === "settings" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Settings size={18} /> Điều chỉnh bảng giá
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === "list" && <BillList bills={bills} setBills={setBills} onNavigateToContract={onNavigateToContract} />}
      {activeSubTab === "revenue" && <RevenueReport bills={bills} />}
      {activeSubTab === "settings" && <PricingSettings />}
    </div>
  );
};

export default BillingManagement;

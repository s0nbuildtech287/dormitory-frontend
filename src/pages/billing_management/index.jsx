import { useState } from "react";
import { List, TrendingUp } from "lucide-react";
import BillList from "./sections/BillList.jsx";
import RevenueReport from "./sections/RevenueReport.jsx";

const BillingManagement = () => {
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
      </div>

      {/* Tab Content */}
      {activeSubTab === "list" && <BillList bills={bills} setBills={setBills} />}
      {activeSubTab === "revenue" && <RevenueReport bills={bills} />}
    </div>
  );
};

export default BillingManagement;

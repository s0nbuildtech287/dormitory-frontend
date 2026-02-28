import React, { useState, useEffect, useCallback } from "react";
import { List, BarChart3, RefreshCw, Clock } from "lucide-react";
import StudentList from "./sections/StudentList.jsx";
import StudentDetail from "./sections/StudentDetail.jsx";
import ContractStatistics from "./sections/ContractStatistics.jsx";
import { getContracts, getContractStats } from "../../api/apiContract.js";

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("list");
  const [selectedContract, setSelectedContract] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [contractsRes, statsRes] = await Promise.all([getContracts(), getContractStats()]);
      if (contractsRes.success) setContracts(contractsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      console.error("Error fetching contracts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Navigate to detail
  if (selectedContract) {
    return (
      <StudentDetail
        contractId={selectedContract}
        onBack={() => {
          setSelectedContract(null);
          fetchData();
        }}
      />
    );
  }

  const pendingCount = contracts.filter((c) => c.status === "Pending").length;

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveSubTab("list")}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeSubTab === "list" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <List size={18} /> Danh sách SV
            {pendingCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black flex items-center gap-1">
                <Clock size={10} /> {pendingCount} chờ phòng
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab("stats")}
            className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeSubTab === "stats" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <BarChart3 size={18} /> Thống kê hợp đồng
          </button>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {activeSubTab === "list" && <StudentList contracts={contracts} loading={loading} onViewDetail={(id) => setSelectedContract(id)} onRefresh={fetchData} />}

      {activeSubTab === "stats" && (
        <div className="space-y-6">
          {/* Stats summary cards */}
          {stats && (
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Chờ gán phòng", value: stats.pending_count, color: "amber" },
                { label: "Đang nội trú", value: stats.active_count, color: "emerald" },
                { label: "Hết hạn", value: stats.expired_count, color: "slate" },
                { label: "Đã chấm dứt", value: stats.terminated_count, color: "rose" },
              ].map((s) => (
                <div key={s.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-3xl font-black text-${s.color}-600`}>{s.value ?? 0}</p>
                </div>
              ))}
            </div>
          )}
          <ContractStatistics contracts={contracts} />
        </div>
      )}
    </div>
  );
};

export default ContractManagement;

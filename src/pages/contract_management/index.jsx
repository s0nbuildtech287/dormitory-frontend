import { useState, useEffect, useCallback } from "react";
import { List, BarChart3, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import StudentList from "./sections/StudentList.jsx";
import ContractDetailModal from "./sections/ContractDetailModal.jsx";
import ContractStatistics from "./sections/ContractStatistics.jsx";
import { getContracts, getContractStats, deleteContract } from "../../api/apiContract.js";

const ContractManagement = ({ initialFilter }) => {
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("list");
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // Handle delete contract
  const handleDeleteContract = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await deleteContract(confirmDelete);
      if (res.success) {
        setConfirmDelete(null);
        fetchData();
      }
    } catch (err) {
      console.error("Error deleting contract:", err);
      alert(err.message || "Có lỗi xảy ra khi xóa hợp đồng");
    } finally {
      setDeleting(false);
    }
  };

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

      {activeSubTab === "list" && (
        <StudentList 
          contracts={contracts} 
          loading={loading} 
          onViewDetail={(id) => setSelectedContractId(id)} 
          onRefresh={fetchData} 
          onDeleteContract={(id) => setConfirmDelete(id)}
          initialFilter={initialFilter}
        />
      )}

      {activeSubTab === "stats" && (
        <ContractStatistics contracts={contracts} />
      )}

      {/* Contract Detail Modal */}
      {selectedContractId && (
        <ContractDetailModal
          contractId={selectedContractId}
          onClose={() => {
            setSelectedContractId(null);
            fetchData();
          }}
          onRefresh={fetchData}
        />
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in scale-in duration-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-100 text-red-600">
                <AlertTriangle size={16} />
              </div>
              Xóa hợp đồng?
            </h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed ml-9">Hợp đồng sẽ bị xóa vĩnh viễn. Nếu hợp đồng đang hoạt động, phòng sẽ được giải phóng. Bạn có chắc chắn muốn xóa?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">
                Hủy
              </button>
              <button onClick={handleDeleteContract} disabled={deleting} className="flex-1 py-3 rounded-xl font-bold text-white transition-all bg-red-600 hover:bg-red-700 disabled:opacity-50">
                {deleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;

import React, { useState } from "react";
import { List, BarChart3 } from "lucide-react";
import StudentList from "./sections/StudentList.jsx";
import StudentDetail from "./sections/StudentDetail.jsx";
import ContractStatistics from "./sections/ContractStatistics.jsx";

const ContractManagement = () => {
  const [students] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("list");
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (selectedStudent) {
    return <StudentDetail student={selectedStudent} onBack={() => setSelectedStudent(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("list")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === "list" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <List size={18} /> Danh sách SV
        </button>
        <button
          onClick={() => setActiveSubTab("contracts")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeSubTab === "contracts" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <BarChart3 size={18} /> Thống kê hợp đồng
        </button>
      </div>

      {activeSubTab === "list" && <StudentList students={students} onViewDetail={setSelectedStudent} />}

      {activeSubTab === "contracts" && <ContractStatistics students={students} />}
    </div>
  );
};

export default ContractManagement;

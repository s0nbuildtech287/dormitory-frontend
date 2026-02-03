import { useState } from "react";
import { RegistrationStatus, AISuggestionType } from "../../../utils/types.js";
import {
  FileSpreadsheet,
  Search,
  Eye,
  RefreshCw,
  RotateCw,
  Plus,
  List,
} from "lucide-react";
import ModelimportCSV from "./ModelimportCSV.jsx";

const RegistrationList = ({
  regs,
  setSelectedReg,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterYear,
  setFilterYear,
  filterScore,
  setFilterScore,
  filterGender,
  setFilterGender
}) => {
  const filteredRegs = regs.filter((reg) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = reg.studentName.toLowerCase().includes(searchLower) || (reg.studentId?.toLowerCase().includes(searchLower) ?? false);

    const matchesStatus = filterStatus === "All" || reg.status === filterStatus;
    const matchesYear = filterYear === "All" || reg.year === parseInt(filterYear);
    const matchesScore =
      filterScore === "All" ||
      (filterScore === "High" && reg.priorityPoints >= 80) ||
      (filterScore === "Medium" && reg.priorityPoints >= 60 && reg.priorityPoints < 80) ||
      (filterScore === "Low" && reg.priorityPoints < 60);

    const matchesGender = filterGender === "All" || reg.gender === filterGender;

    return matchesSearch && matchesStatus && matchesYear && matchesScore && matchesGender;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* KHỐI CHỨC NĂNG DỮ LIỆU ĐẦU VÀO */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-7 gap-4 items-stretch">
          <div className="col-span-3 relative">
            <input
              type="text"
              placeholder="Nhập URL Google Sheets..."
              className="w-full h-full pl-4 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all bg-slate-50/50"
            />
          </div>

          <div className="col-span-1">
            <ModelimportCSV />
          </div>

          <button className="col-span-1 flex items-center justify-center px-1 py-3 bg-white text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-lg shadow-slate-100 font-bold text-xs whitespace-nowrap">
            <RefreshCw size={14} className="mr-1 flex-shrink-0" /> Reset
          </button>

          <button className="col-span-1 flex items-center justify-center px-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-xs whitespace-nowrap">
            <RotateCw size={14} className="mr-1 flex-shrink-0" /> Đồng bộ
          </button>

          <button className="col-span-1 flex items-center justify-center px-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-xs whitespace-nowrap">
            <Plus size={14} className="mr-1 flex-shrink-0" /> Thêm hồ sơ
          </button>
        </div>
      </div>

      {/* THANH TÌM KIẾM VÀ LỌC */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-6 gap-4 items-center">
          <div className="relative col-span-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên hoặc mã SV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all bg-slate-50/50"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value={RegistrationStatus.PENDING}>Chờ duyệt</option>
            <option value={RegistrationStatus.APPROVED}>Đã duyệt</option>
            <option value={RegistrationStatus.REJECTED}>Từ chối</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả năm</option>
            <option value="1">Năm 1</option>
            <option value="2">Năm 2</option>
            <option value="3">Năm 3</option>
            <option value="4">Năm 4</option>
          </select>

          <select
            value={filterScore}
            onChange={(e) => setFilterScore(e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả điểm</option>
            <option value="High">Cao (≥80)</option>
            <option value="Medium">Trung bình (60-79)</option>
            <option value="Low">Thấp (&lt;60)</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-xs font-black capitalize tracking-widest">
                <th className="px-8 py-5 border-r-2 border-slate-300">Mã sinh viên</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Tên sinh viên</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Thời gian đăng ký</th>
                <th className="px-8 py-5 text-center border-r-2 border-slate-300">Điểm</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Đề xuất</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Trạng thái</th>
                <th className="px-8 py-5 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegs.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 text-xs font-mono font-bold text-blue-600 border-r-2 border-slate-300">{reg.studentId || "N/A"}</td>
                  <td className="px-8 py-5 font-bold text-slate-900 text-sm border-r-2 border-slate-300">{reg.studentName}</td>
                  <td className="px-8 py-5 text-slate-500 text-xs font-medium border-r-2 border-slate-300">{reg.createdAt ? new Date(reg.createdAt).toLocaleDateString("vi-VN") : "N/A"}</td>
                  <td className="px-8 py-5 text-center border-r-2 border-slate-300">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black">{reg.priorityPoints}</span>
                  </td>
                  <td className="px-8 py-5 border-r-2 border-slate-300">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                        reg.aiSuggestion === AISuggestionType.RECOMMENDED
                          ? "bg-emerald-50 text-emerald-600"
                          : reg.aiSuggestion === AISuggestionType.CONSIDER
                            ? "bg-amber-50 text-amber-600"
                            : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          reg.aiSuggestion === AISuggestionType.RECOMMENDED ? "bg-emerald-500" : reg.aiSuggestion === AISuggestionType.CONSIDER ? "bg-amber-500" : "bg-rose-500"
                        }`}
                      ></div>
                      {reg.aiSuggestion}
                    </div>
                  </td>
                  <td className="px-8 py-5 border-r-2 border-slate-300">
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                        reg.status === RegistrationStatus.PENDING
                          ? "bg-amber-100 text-amber-700"
                          : reg.status === RegistrationStatus.APPROVED
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {reg.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button onClick={() => setSelectedReg(reg)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegistrationList;
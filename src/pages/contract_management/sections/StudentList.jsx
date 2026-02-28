import React, { useState } from "react";
import { Search, UserPlus, Eye, Edit2, Trash2 } from "lucide-react";

const StudentList = ({ students, onViewDetail }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterGender, setFilterGender] = useState("All");

  const filteredStudents = students.filter((std) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = std.name.toLowerCase().includes(searchLower) || (std.studentId?.toLowerCase().includes(searchLower) ?? false);
    const matchesStatus = filterStatus === "All" || std.status === filterStatus;
    const matchesGender = filterGender === "All" || std.gender === filterGender;
    return matchesSearch && matchesStatus && matchesGender;
  });

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Filters */}
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
            <option value="Active">Nội trú</option>
            <option value="Inactive">Đã rời</option>
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

          <div className="col-span-2 flex gap-2">
            <button className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-sm">
              <UserPlus size={14} className="mr-2 flex-shrink-0" /> Thêm sinh viên
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-xs font-black capitalize tracking-widest">
                <th className="px-8 py-5 border-r-2 border-slate-300">Mã hợp đồng</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Tên sinh viên</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Vị trí</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Tình trạng</th>
                <th className="px-8 py-5 text-center border-r-2 border-slate-300">Thông tin chi tiết</th>
                <th className="px-8 py-5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((std) => (
                <tr key={std.id || std.studentId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 text-xs font-mono font-bold text-blue-600 border-r-2 border-slate-300">{std.contractCode || std.contractId || `HD-${std.studentId || std.id || "N/A"}`}</td>
                  <td className="px-8 py-5 border-r-2 border-slate-300">
                    <div className="flex items-center">
                      <img src={std.avatar} className="w-8 h-8 rounded-lg mr-3" alt={std.name} />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{std.name}</p>
                        <p className="text-[10px] text-slate-500">{std.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-blue-700 text-sm border-r-2 border-slate-300">{std.room ? `${std.room} (${std.building || "N/A"})` : "N/A"}</td>
                  <td className="px-8 py-5 border-r-2 border-slate-300">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${std.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                      {std.status === "Active" ? "Nội trú" : "Đã rời"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center border-r-2 border-slate-300">
                    <button onClick={() => onViewDetail(std)} className="p-1.5 text-blue-600">
                      <Eye size={18} />
                    </button>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button className="p-1.5 text-slate-600 mr-2">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-1.5 text-rose-600">
                      <Trash2 size={16} />
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

export default StudentList;

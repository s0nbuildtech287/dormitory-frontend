import React, { useState, useMemo } from "react";
import { MOCK_STUDENTS, MOCK_BILLS } from "../utils/constants.jsx";
import { Gender, BillStatus } from "../utils/types.js";
import { Search, UserPlus, ArrowLeft, Eye, Mail, Phone, FileText, BookOpen, Clock, List, Briefcase, BarChart3, Users } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const StudentManagement = () => {
  const [students] = useState(MOCK_STUDENTS);
  const [activeSubTab, setActiveSubTab] = useState("list");
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  const analysisData = useMemo(() => {
    const facultyCounts = students.reduce((acc, std) => {
      const f = std.faculty || "Khác";
      acc[f] = (acc[f] || 0) + 1;
      return acc;
    }, {});

    return {
      facultyStats: Object.keys(facultyCounts).map((name) => ({ name, value: facultyCounts[name] })),
      genderDist: [
        { name: "Nam", value: students.filter((s) => s.gender === Gender.MALE).length, color: "#3b82f6" },
        { name: "Nữ", value: students.filter((s) => s.gender === Gender.FEMALE).length, color: "#f43f5e" },
      ],
    };
  }, [students]);

  if (selectedStudent) {
    const studentBills = MOCK_BILLS.filter((b) => b.studentId === selectedStudent.id);
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button onClick={() => setSelectedStudent(null)} className="flex items-center text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách sinh viên
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8">
              <img src={selectedStudent.avatar} className="w-32 h-32 rounded-3xl border-4 border-slate-50" />
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{selectedStudent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase">{selectedStudent.studentId}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${selectedStudent.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}
                    >
                      {selectedStudent.status === "Active" ? "Đang nội trú" : "Đã rời"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem icon={<Mail size={16} />} label="Email" value={selectedStudent.email} />
                  <InfoItem icon={<Phone size={16} />} label="Số điện thoại" value={selectedStudent.phone || "N/A"} />
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                <FileText size={16} className="text-blue-600" /> Chi tiết hợp đồng
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <DataField label="Phòng" value={`${selectedStudent.room || "N/A"} (${selectedStudent.building || "N/A"})`} highlight />
                <DataField label="Tiền cọc" value={`${selectedStudent.deposit?.toLocaleString() || "0"} VNĐ`} />
                <DataField label="Hết hạn" value="30/06/2024" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("list")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeSubTab === "list" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <List size={18} /> Danh sách SV
        </button>
        <button
          onClick={() => setActiveSubTab("contracts")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeSubTab === "contracts" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Briefcase size={18} /> Hợp đồng & Cọc
        </button>
        <button
          onClick={() => setActiveSubTab("analysis")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeSubTab === "analysis" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <BarChart3 size={18} /> Phân tích nhân khẩu
        </button>
      </div>

      {(activeSubTab === "list" || activeSubTab === "contracts") && (
        <div className="animate-in fade-in duration-500 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <button className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">
              <UserPlus size={18} className="mr-2" /> Thêm mới
            </button>
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên hoặc mã SV..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-widest">
                    <th className="px-6 py-4">Sinh viên</th>
                    <th className="px-6 py-4">Mã số SV</th>
                    {activeSubTab === "contracts" ? (
                      <>
                        <th className="px-6 py-4">Tiền cọc</th>
                        <th className="px-6 py-4">Giá thuê</th>
                        <th className="px-6 py-4">Thời hạn</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4">Phòng</th>
                        <th className="px-6 py-4">Trạng thái</th>
                      </>
                    )}
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img src={std.avatar} className="w-8 h-8 rounded-lg mr-3" />
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{std.name}</p>
                            <p className="text-[10px] text-slate-500">{std.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-bold">{std.studentId}</td>
                      {activeSubTab === "contracts" ? (
                        <>
                          <td className="px-6 py-4 text-sm font-bold text-emerald-600">{std.deposit?.toLocaleString()}đ</td>
                          <td className="px-6 py-4 text-sm font-bold text-blue-600">{std.rentPrice?.toLocaleString()}đ</td>
                          <td className="px-6 py-4 text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <Clock size={12} /> 12 tháng
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-bold text-blue-700 text-sm">{std.room || "N/A"}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${std.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                              {std.status === "Active" ? "Nội trú" : "Đã rời"}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => setSelectedStudent(std)} className="p-1.5 text-blue-600">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "analysis" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" /> Phân bổ theo Khoa
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisData.facultyStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1e40af" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Users size={18} className="text-rose-600" /> Giới tính nội trú
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analysisData.genderDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {analysisData.genderDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="text-slate-400">{icon}</div>
    <div>
      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</p>
      <p className="font-semibold text-slate-800 text-sm">{value}</p>
    </div>
  </div>
);

const DataField = ({ label, value, highlight }) => (
  <div>
    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</p>
    <p className={`font-bold ${highlight ? "text-blue-700" : "text-slate-800"}`}>{value}</p>
  </div>
);

export default StudentManagement;

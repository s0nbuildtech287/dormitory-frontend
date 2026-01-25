import React, { useState, useMemo } from "react";
import { MOCK_ROOMS, MOCK_STUDENTS } from "../utils/constants.jsx";
import { Gender } from "../utils/types.js";
import { Plus, Search, Eye, ShieldCheck, Zap, Droplet, BarChart3, LayoutGrid, ArrowLeft, Users, Building2, Filter } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const RoomManagement = () => {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [activeSubTab, setActiveSubTab] = useState("list");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [filterBuilding, setFilterBuilding] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRooms = rooms.filter((r) => {
    const matchesBuilding = filterBuilding === "All" || r.building === filterBuilding;
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === "Full") matchesStatus = r.currentOccupancy >= r.capacity;
    else if (filterStatus === "Available") matchesStatus = r.currentOccupancy > 0 && r.currentOccupancy < r.capacity;
    else if (filterStatus === "Empty") matchesStatus = r.currentOccupancy === 0;

    return matchesBuilding && matchesSearch && matchesStatus;
  });

  const analyticsData = useMemo(() => {
    const buildingStats = rooms.reduce((acc, room) => {
      if (!acc[room.building]) acc[room.building] = { name: `Tòa ${room.building}`, capacity: 0, occupancy: 0 };
      acc[room.building].capacity += room.capacity;
      acc[room.building].occupancy += room.currentOccupancy;
      return acc;
    }, {});

    const genderDist = [
      { name: "Nam", value: rooms.filter((r) => r.genderType === Gender.MALE).reduce((sum, r) => sum + r.currentOccupancy, 0), color: "#3b82f6" },
      { name: "Nữ", value: rooms.filter((r) => r.genderType === Gender.FEMALE).reduce((sum, r) => sum + r.currentOccupancy, 0), color: "#f43f5e" },
    ];

    return {
      buildingStats: Object.values(buildingStats),
      genderDist,
    };
  }, [rooms]);

  if (selectedRoom) {
    const roomStudents = MOCK_STUDENTS.filter((s) => s.room === selectedRoom.name);
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button onClick={() => setSelectedRoom(null)} className="flex items-center text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách phòng
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold ${selectedRoom.genderType === Gender.MALE ? "bg-blue-600" : "bg-rose-500"}`}>
                    {selectedRoom.name}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Phòng {selectedRoom.name}</h3>
                    <p className="text-slate-500 font-medium">
                      Tòa {selectedRoom.building} - Tầng {selectedRoom.floor}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Tình trạng</p>
                  <span
                    className={`px-4 py-1 rounded-xl text-xs font-bold uppercase tracking-widest ${selectedRoom.currentOccupancy >= selectedRoom.capacity ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                  >
                    {selectedRoom.currentOccupancy}/{selectedRoom.capacity} Giường
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <Zap size={20} className="mx-auto mb-2 text-amber-500" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Chỉ số điện</p>
                  <p className="font-bold text-slate-800">1,240 kWh</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <Droplet size={20} className="mx-auto mb-2 text-blue-500" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Chỉ số nước</p>
                  <p className="font-bold text-slate-800">450 m³</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <ShieldCheck size={20} className="mx-auto mb-2 text-emerald-500" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Thiết bị</p>
                  <p className="font-bold text-slate-800">Ổn định</p>
                </div>
              </div>
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-600" /> Danh sách sinh viên
              </h4>
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-3">Họ tên</th>
                      <th className="px-6 py-3">Mã SV</th>
                      <th className="px-6 py-3">Ngày vào</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roomStudents.map((s) => (
                      <tr key={s.id} className="text-sm">
                        <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono">{s.studentId}</td>
                        <td className="px-6 py-4 text-slate-500">01/09/2023</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
          <LayoutGrid size={18} /> Sơ đồ phòng
        </button>
        <button
          onClick={() => setActiveSubTab("analytics")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeSubTab === "analytics" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <BarChart3 size={18} /> Thống kê & Mật độ
        </button>
      </div>

      {activeSubTab === "list" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <button className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm font-bold text-sm">
                <Plus size={18} className="mr-2" /> Thêm phòng mới
              </button>
              <div className="relative w-full md:w-80">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo số phòng..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
              <Filter size={14} className="text-slate-400" />
              <select className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-1.5 outline-none bg-slate-50" value={filterBuilding} onChange={(e) => setFilterBuilding(e.target.value)}>
                <option value="All">Tất cả tòa</option>
                <option value="A1">Tòa A1</option>
                <option value="B1">Tòa B1</option>
              </select>
              <select className="text-xs font-bold border border-slate-200 rounded-lg px-3 py-1.5 outline-none bg-slate-50" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">Tất cả trạng thái</option>
                <option value="Available">Còn trống chỗ</option>
                <option value="Full">Đã đầy</option>
              </select>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">Số phòng</th>
                    <th className="px-6 py-4">Vị trí</th>
                    <th className="px-6 py-4">Đối tượng</th>
                    <th className="px-6 py-4">Sức chứa</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.map((room) => {
                    const rate = (room.currentOccupancy / room.capacity) * 100;
                    return (
                      <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 text-lg">{room.name}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">
                          Tòa {room.building} - Tầng {room.floor}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${room.genderType === Gender.MALE ? "bg-blue-50 text-blue-700" : "bg-rose-50 text-rose-700"}`}>
                            {room.genderType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${room.genderType === Gender.MALE ? "bg-blue-600" : "bg-rose-500"}`} style={{ width: `${rate}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                            {room.currentOccupancy}/{room.capacity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${room.currentOccupancy >= room.capacity ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                          >
                            {room.currentOccupancy >= room.capacity ? "Hết chỗ" : "Còn trống"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => setSelectedRoom(room)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" /> Công suất theo tòa
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.buildingStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="occupancy" name="Đã ở" fill="#1e40af" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="capacity" name="Tổng cộng" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Users size={18} className="text-rose-600" /> Tỷ lệ sinh viên Nam/Nữ
            </h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analyticsData.genderDist} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {analyticsData.genderDist.map((entry, index) => (
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

export default RoomManagement;

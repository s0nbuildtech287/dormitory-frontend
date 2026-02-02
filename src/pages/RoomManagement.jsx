import React, { useState, useMemo } from "react";
import { Gender } from "../utils/types.js";
import { Plus, Search, Eye, ShieldCheck, Zap, Droplet, BarChart3, LayoutGrid, ArrowLeft, Users, Building2, Filter, Settings, DollarSign, Home, Wifi, Car, Trash2, Info } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("list");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [filterBuilding, setFilterBuilding] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterFloor, setFilterFloor] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Room settings state
  const [roomSettings, setRoomSettings] = useState({
    defaultCapacity: 4,
    defaultRentPrice: 1200000,
    defaultGarbageFee: 20000,
    defaultInternetFee: 50000,
    defaultParkingFee: 100000,
    defaultArea: 25.5
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  const filteredRooms = rooms.filter((r) => {
    const matchesBuilding = filterBuilding === "All" || r.building === filterBuilding;
    const matchesFloor = filterFloor === "All" || r.floor === parseInt(filterFloor);
    const matchesSearch = r.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.name?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === "Full") matchesStatus = r.currentOccupancy >= r.capacity;
    else if (filterStatus === "Occupied") matchesStatus = r.currentOccupancy > 0 && r.currentOccupancy < r.capacity;
    else if (filterStatus === "Empty") matchesStatus = r.currentOccupancy === 0;

    return matchesBuilding && matchesFloor && matchesSearch && matchesStatus;
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
    const roomStudents = [].filter((s) => s.room === selectedRoom.name);
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

  // Room settings functions
  const fetchRoomSettings = async () => {
    try {
      setIsLoadingSettings(true);
      // Fetch all room category settings
      const response = await fetch('/api/settings/category/room', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Map settings to state
        const settings = {};
        data.data.forEach(setting => {
          switch(setting.name) {
            case 'defaultCapacity':
            case 'defaultRentPrice':
            case 'defaultGarbageFee':
            case 'defaultInternetFee':
            case 'defaultParkingFee':
              settings[setting.name] = parseInt(setting.value);
              break;
            case 'defaultArea':
              settings[setting.name] = parseFloat(setting.value);
              break;
          }
        });
        setRoomSettings(prev => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.error('Error fetching room settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const updateRoomSettings = async () => {
    try {
      setIsLoadingSettings(true);
      // Update each setting individually
      const updates = [
        { id: 'room_capacity', name: 'defaultCapacity', value: roomSettings.defaultCapacity },
        { id: 'room_rent_price', name: 'defaultRentPrice', value: roomSettings.defaultRentPrice },
        { id: 'room_garbage_fee', name: 'defaultGarbageFee', value: roomSettings.defaultGarbageFee },
        { id: 'room_internet_fee', name: 'defaultInternetFee', value: roomSettings.defaultInternetFee },
        { id: 'room_parking_fee', name: 'defaultParkingFee', value: roomSettings.defaultParkingFee },
        { id: 'room_area', name: 'defaultArea', value: roomSettings.defaultArea }
      ];

      for (const update of updates) {
        await fetch(`/api/settings/${update.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ value: update.value })
        });
      }

      alert('Cài đặt phòng đã được cập nhật thành công!');
    } catch (error) {
      console.error('Error updating room settings:', error);
      alert('Có lỗi xảy ra khi cập nhật cài đặt phòng');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleRoomSettingChange = (field, value) => {
    setRoomSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch room settings when settings tab is selected
  useMemo(() => {
    if (activeSubTab === "settings") {
      fetchRoomSettings();
    }
  }, [activeSubTab]);

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
        <button
          onClick={() => setActiveSubTab("settings")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeSubTab === "settings" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Settings size={18} /> Điều chỉnh
        </button>
      </div>

      {activeSubTab === "list" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="grid grid-cols-6 gap-4 items-center">
              <div className="relative col-span-2">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo số phòng..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all bg-slate-50/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
              >
                <option value="All">Tất cả tòa</option>
                <option value="A1">Tòa A1</option>
                <option value="B1">Tòa B1</option>
              </select>

              <select
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
              >
                <option value="All">Tất cả tầng</option>
                <option value="1">Tầng 1</option>
                <option value="2">Tầng 2</option>
                <option value="3">Tầng 3</option>
                <option value="4">Tầng 4</option>
                <option value="5">Tầng 5</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="Empty">Trống</option>
                <option value="Occupied">Đang ở</option>
                <option value="Full">Đã đầy</option>
              </select>

              <button className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-sm">
                <Plus size={14} className="mr-2 flex-shrink-0" /> Thêm phòng
              </button>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-xs font-black capitalize tracking-widest">
                    <th className="px-8 py-5 border-r-2 border-slate-300">Số phòng</th>
                    <th className="px-8 py-5 border-r-2 border-slate-300">Tòa nhà</th>
                    <th className="px-8 py-5 border-r-2 border-slate-300">Tầng</th>
                    <th className="px-8 py-5 border-r-2 border-slate-300">Số lượng</th>
                    <th className="px-8 py-5 border-r-2 border-slate-300">Trạng thái</th>
                    <th className="px-8 py-5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.map((room) => {
                    const rate = (room.currentOccupancy / room.capacity) * 100;
                    return (
                      <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-xs font-mono font-bold text-blue-600 border-r-2 border-slate-300">
                          <span className="font-bold text-slate-900 text-lg">{room.room_number || room.name}</span>
                        </td>
                        <td className="px-8 py-5 font-bold text-slate-900 text-sm border-r-2 border-slate-300">
                          Tòa {room.building}
                        </td>
                        <td className="px-8 py-5 text-slate-500 text-xs font-medium border-r-2 border-slate-300">
                          Tầng {room.floor}
                        </td>
                        <td className="px-8 py-5 text-center border-r-2 border-slate-300">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black">
                            {room.currentOccupancy}/{room.capacity}
                          </span>
                        </td>
                        <td className="px-8 py-5 border-r-2 border-slate-300">
                          <span
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${
                              room.currentOccupancy >= room.capacity 
                                ? "bg-rose-100 text-rose-700" 
                                : room.currentOccupancy > 0 
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {room.currentOccupancy >= room.capacity 
                              ? "Đã đầy" 
                              : room.currentOccupancy > 0 
                                ? "Đang ở"
                                : "Trống"
                            }
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
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

      {activeSubTab === "settings" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Điều chỉnh cài đặt phòng</h3>
                <p className="text-slate-500">Thiết lập các thông số mặc định cho phòng ký túc xá</p>
              </div>
              <button
                onClick={updateRoomSettings}
                disabled={isLoadingSettings}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingSettings ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Thông số cơ bản */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Home size={20} className="text-blue-600" />
                  Thông số cơ bản
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sức chứa mặc định</label>
                    <input
                      type="number"
                      value={roomSettings.defaultCapacity}
                      onChange={(e) => handleRoomSettingChange('defaultCapacity', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="1"
                      max="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Diện tích mặc định (m²)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={roomSettings.defaultArea}
                      onChange={(e) => handleRoomSettingChange('defaultArea', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="10"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Phí dịch vụ */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign size={20} className="text-green-600" />
                  Phí dịch vụ (VNĐ/tháng)
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tiền thuê phòng</label>
                    <input
                      type="number"
                      value={roomSettings.defaultRentPrice}
                      onChange={(e) => handleRoomSettingChange('defaultRentPrice', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      step="50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                      <Trash2 size={16} /> Phí rác
                    </label>
                    <input
                      type="number"
                      value={roomSettings.defaultGarbageFee}
                      onChange={(e) => handleRoomSettingChange('defaultGarbageFee', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      step="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                      <Wifi size={16} /> Phí internet
                    </label>
                    <input
                      type="number"
                      value={roomSettings.defaultInternetFee}
                      onChange={(e) => handleRoomSettingChange('defaultInternetFee', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      step="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                      <Car size={16} /> Phí gửi xe
                    </label>
                    <input
                      type="number"
                      value={roomSettings.defaultParkingFee}
                      onChange={(e) => handleRoomSettingChange('defaultParkingFee', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      step="10000"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded text-blue-600 shrink-0">
                <Info size={14} />
              </div>
              <p className="text-sm text-blue-700 leading-tight">Các cài đặt này sẽ được áp dụng làm mặc định cho các phòng mới được tạo.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;

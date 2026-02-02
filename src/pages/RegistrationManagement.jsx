import { useState, useMemo } from "react";
import { RegistrationStatus, AISuggestionType } from "../utils/types.js";
import {
  FileSpreadsheet,
  Sparkles,
  Search,
  Check,
  X,
  Filter,
  Eye,
  ArrowLeft,
  User,
  MapPin,
  Star,
  Calendar,
  Mail,
  Phone,
  BookOpen,
  Image as ImageIcon,
  BarChart3,
  List,
  CheckCircle2,
  Info,
  AlertCircle,
  MessageSquare,
  CheckSquare,
  History,
  FileText,
  RefreshCw,
  RotateCw,
  Plus,
  Settings,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const RegistrationManagement = () => {
  const [regs, setRegs] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("list");
  const [selectedReg, setSelectedReg] = useState(null);
  const [note, setNote] = useState("");
  const [isConfirming, setIsConfirming] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterScore, setFilterScore] = useState("All");
  const [filterGender, setFilterGender] = useState("All");

  // Settings state
  const [settings, setSettings] = useState({
    year: { weight: 20, max_year: 5 },
    distance: { weight: 30, max_distance: 100 },
    gpa: { weight: 25, min_gpa: 2.0 },
    circumstance: { weight: 25, max_points: 20 }
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  const handleStatusChange = (id, newStatus) => {
    setRegs((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus, note } : r)));
    setSelectedReg(null);
    setIsConfirming(null);
    setNote("");
  };

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

  const statsData = useMemo(() => {
    const statusCounts = {
      [RegistrationStatus.PENDING]: regs.filter((r) => r.status === RegistrationStatus.PENDING).length,
      [RegistrationStatus.APPROVED]: regs.filter((r) => r.status === RegistrationStatus.APPROVED).length,
      [RegistrationStatus.REJECTED]: regs.filter((r) => r.status === RegistrationStatus.REJECTED).length,
    };

    const pieData = [
      { name: "Chờ duyệt", value: statusCounts[RegistrationStatus.PENDING], color: "#f59e0b" },
      { name: "Đã chấp nhận", value: statusCounts[RegistrationStatus.APPROVED], color: "#10b981" },
      { name: "Đã từ chối", value: statusCounts[RegistrationStatus.REJECTED], color: "#f43f5e" },
    ];

    const aiDist = [
      { name: "Nên duyệt", value: regs.filter((r) => r.aiSuggestion === AISuggestionType.RECOMMENDED).length },
      { name: "Cân nhắc", value: regs.filter((r) => r.aiSuggestion === AISuggestionType.CONSIDER).length },
      { name: "Không ưu tiên", value: regs.filter((r) => r.aiSuggestion === AISuggestionType.LOW_PRIORITY).length },
    ];

    return { pieData, aiDist };
  }, [regs]);

  if (selectedReg) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <button onClick={() => setSelectedReg(null)} className="flex items-center text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors mb-2">
          <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách hồ sơ
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* BÊN TRÁI: THÔNG TIN SINH VIÊN (DỮ LIỆU GỐC) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">{selectedReg.studentName.charAt(0)}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedReg.studentName}</h3>
                    <p className="text-slate-500 font-medium">Mã số SV: {selectedReg.studentId || "N/A"}</p>
                  </div>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    selectedReg.status === RegistrationStatus.PENDING
                      ? "bg-amber-100 text-amber-700"
                      : selectedReg.status === RegistrationStatus.APPROVED
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {selectedReg.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Thông tin cá nhân</h4>
                  <div className="space-y-4">
                    <InfoRow icon={<User size={16} />} label="Giới tính" value={selectedReg.gender} />
                    <InfoRow icon={<Calendar size={16} />} label="Ngày sinh" value={selectedReg.dob || "15/01/2006"} />
                    <InfoRow icon={<Mail size={16} />} label="Email" value={selectedReg.email || "N/A"} />
                    <InfoRow icon={<Phone size={16} />} label="Số điện thoại" value={selectedReg.phone || "N/A"} />
                    <InfoRow icon={<MapPin size={16} />} label="Địa chỉ" value={selectedReg.address || "N/A"} />
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Học vấn & Đăng ký</h4>
                  <div className="space-y-4">
                    <InfoRow icon={<BookOpen size={16} />} label="Khoa / Lớp" value={`${selectedReg.faculty} - ${selectedReg.class}`} />
                    <InfoRow icon={<History size={16} />} label="Sinh viên năm" value={selectedReg.year} />
                    <InfoRow icon={<Star size={16} />} label="Điểm ưu tiên" value={selectedReg.priorityPoints} />
                    <InfoRow icon={<MapPin size={16} />} label="Khoảng cách" value={`${selectedReg.distance} km`} />
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ImageIcon size={16} /> Ảnh minh chứng hồ sơ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedReg.evidenceImages?.map((img, idx) => (
                    <div key={idx} className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                      <img src={img} alt="Evidence" className="w-full h-40 object-cover" />
                    </div>
                  )) || <p className="text-sm text-slate-400 italic">Không có ảnh minh chứng.</p>}
                </div>
              </div>
            </div>
          </div>

          {/* BÊN PHẢI: PHÂN TÍCH AI & QUYẾT ĐỊNH QUẢN TRỊ */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
              <div className="flex items-center gap-2 mb-8">
                <Sparkles className="text-blue-400" size={20} />
                <h4 className="font-bold text-lg">Đánh giá của hệ thống (AI)</h4>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tổng điểm đề xuất</p>
                    <p className="text-5xl font-black text-blue-400">
                      {selectedReg.aiScore || 0}
                      <span className="text-xl text-slate-500 font-normal">/100</span>
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                      selectedReg.aiSuggestion === AISuggestionType.RECOMMENDED
                        ? "bg-emerald-500/20 text-emerald-400"
                        : selectedReg.aiSuggestion === AISuggestionType.CONSIDER
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {selectedReg.aiSuggestion}
                  </div>
                </div>

                <div className="space-y-4">
                  <AIProgress label="Điểm ưu tiên" score={selectedReg.aiReasoning?.priority || 0} />
                  <AIProgress label="Khoảng cách địa lý" score={selectedReg.aiReasoning?.distance || 0} />
                  <AIProgress label="Năm học" score={selectedReg.aiReasoning?.year || 0} />
                  <AIProgress label="Hoàn cảnh đặc biệt" score={selectedReg.aiReasoning?.circumstance || 0} />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} /> Kết luận đề xuất
                </p>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "Dựa trên các trọng số, sinh viên này {selectedReg.aiSuggestion === AISuggestionType.RECOMMENDED ? "rất cần" : "có thể"} được sắp xếp phòng do khoảng cách xa và điểm ưu tiên tốt. Hệ
                  thống gợi ý {selectedReg.aiSuggestion?.toLowerCase()}."
                </p>
                <p className="text-[10px] text-slate-500 font-bold italic border-t border-white/5 pt-2">*AI chỉ có vai trò gợi ý, quyết định cuối cùng do quản trị viên.</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest flex items-center gap-2">
                <CheckSquare size={18} /> Duyệt hồ sơ thủ công
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ghi chú duyệt</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50 outline-none h-24 transition-all"
                    placeholder="Nhập ghi chú hoặc lý do..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsConfirming({ id: selectedReg.id, status: RegistrationStatus.APPROVED })}
                    className="flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-lg"
                  >
                    <Check size={20} /> Duyệt
                  </button>
                  <button
                    onClick={() => setIsConfirming({ id: selectedReg.id, status: RegistrationStatus.REJECTED })}
                    className="flex items-center justify-center gap-2 py-4 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl font-bold transition-all"
                  >
                    <X size={20} /> Từ chối
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HỘP THOẠI XÁC NHẬN */}
        {isConfirming && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isConfirming.status === RegistrationStatus.APPROVED ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
              >
                {isConfirming.status === RegistrationStatus.APPROVED ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận quyết định?</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Bạn đang chuẩn bị <span className="font-bold text-slate-900">{isConfirming.status.toLowerCase()}</span> hồ sơ của <b>{selectedReg.studentName}</b>. Hệ thống sẽ gửi thông báo kết quả
                cho sinh viên.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsConfirming(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">
                  Hủy
                </button>
                <button
                  onClick={() => handleStatusChange(isConfirming.id, isConfirming.status)}
                  className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg ${isConfirming.status === RegistrationStatus.APPROVED ? "bg-emerald-600" : "bg-rose-600"}`}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Settings functions
  const fetchSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const response = await fetch('/api/settings/scoring-weights', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data.value);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const updateSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const response = await fetch('/api/settings/scoring-weights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ scoringWeights: settings })
      });
      const data = await response.json();
      if (data.success) {
        alert('Cài đặt đã được cập nhật thành công!');
      } else {
        alert('Có lỗi xảy ra khi cập nhật cài đặt');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Có lỗi xảy ra khi cập nhật cài đặt');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSettingChange = (key, field, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  // Fetch settings when adjustment tab is selected
  useMemo(() => {
    if (activeSubTab === "adjustment") {
      fetchSettings();
    }
  }, [activeSubTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveSubTab("list")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeSubTab === "list" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <List size={18} /> Danh sách hồ sơ
        </button>
        <button
          onClick={() => setActiveSubTab("stats")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeSubTab === "stats" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <BarChart3 size={18} /> Thống kê & Phân tích
        </button>
        <button
          onClick={() => setActiveSubTab("adjustment")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeSubTab === "adjustment" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Settings size={18} /> Điều chỉnh
        </button>
      </div>

      {activeSubTab === "list" && (
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

              <button className="col-span-1 flex items-center justify-center px-1 py-3 bg-slate-50/50 text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-100/50 transition-all shadow-lg shadow-gray-100 font-bold text-xs whitespace-nowrap">
                <FileSpreadsheet size={14} className="mr-1 flex-shrink-0" /> Import CSV
              </button>

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

          {/* NÚT IMPORT - ĐÃ CHUYỂN VÀO KHỐI DỮ LIỆU ĐẦU VÀO */}

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
      )}

      {activeSubTab === "stats" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h4 className="font-black text-slate-900 mb-8 flex items-center gap-2 uppercase text-xs tracking-widest">Tỷ lệ trạng thái hồ sơ</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statsData.pieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {statsData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h4 className="font-black text-slate-900 mb-8 flex items-center gap-2 uppercase text-xs tracking-widest">Đề xuất AI theo phân nhóm</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.aiDist}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold" }} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="value" fill="#1e40af" radius={[8, 8, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "adjustment" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Điều chỉnh thông số tính điểm</h3>
                <p className="text-slate-500">Thiết lập trọng số và ngưỡng cho hệ thống đánh giá hồ sơ đăng ký</p>
              </div>
              <button
                onClick={updateSettings}
                disabled={isLoadingSettings}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingSettings ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Năm học */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600" />
                  Năm học (Year)
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Trọng số (%)</label>
                    <input
                      type="number"
                      value={settings.year.weight}
                      onChange={(e) => handleSettingChange('year', 'weight', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Năm tối đa</label>
                    <input
                      type="number"
                      value={settings.year.max_year}
                      onChange={(e) => handleSettingChange('year', 'max_year', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Khoảng cách */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin size={20} className="text-green-600" />
                  Khoảng cách (Distance)
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Trọng số (%)</label>
                    <input
                      type="number"
                      value={settings.distance.weight}
                      onChange={(e) => handleSettingChange('distance', 'weight', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Khoảng cách tối đa (km)</label>
                    <input
                      type="number"
                      value={settings.distance.max_distance}
                      onChange={(e) => handleSettingChange('distance', 'max_distance', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* GPA */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen size={20} className="text-purple-600" />
                  Điểm trung bình (GPA)
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Trọng số (%)</label>
                    <input
                      type="number"
                      value={settings.gpa.weight}
                      onChange={(e) => handleSettingChange('gpa', 'weight', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">GPA tối thiểu</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.gpa.min_gpa}
                      onChange={(e) => handleSettingChange('gpa', 'min_gpa', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      max="4"
                    />
                  </div>
                </div>
              </div>

              {/* Hoàn cảnh */}
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Star size={20} className="text-amber-600" />
                  Điểm ưu tiên (Circumstance)
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Trọng số (%)</label>
                    <input
                      type="number"
                      value={settings.circumstance.weight}
                      onChange={(e) => handleSettingChange('circumstance', 'weight', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Điểm tối đa</label>
                    <input
                      type="number"
                      value={settings.circumstance.max_points}
                      onChange={(e) => handleSettingChange('circumstance', 'max_points', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-slate-50 rounded-xl">
              <h5 className="font-bold text-slate-900 mb-2">Tổng trọng số: {Object.values(settings).reduce((sum, item) => sum + (item.weight || 0), 0)}%</h5>
              <p className="text-sm text-slate-600">Tổng trọng số phải bằng 100% để hệ thống hoạt động chính xác.</p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded text-blue-600 shrink-0">
                <Info size={14} />
              </div>
              <p className="text-sm text-blue-700 leading-tight">Các cài đặt này sẽ được áp dụng làm mặc định cho việc đánh giá hồ sơ đăng ký mới.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 group">
    <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:text-blue-600 transition-colors">{icon}</div>
    <div>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1.5">{label}</p>
      <p className="font-bold text-slate-800 text-sm leading-none">{value}</p>
    </div>
  </div>
);

const AIProgress = ({ label, score }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
      <span className="text-slate-400">{label}</span>
      <span className="text-blue-400">{score}%</span>
    </div>
    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${score}%` }}></div>
    </div>
  </div>
);

export default RegistrationManagement;

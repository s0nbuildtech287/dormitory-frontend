import { useState, useMemo, useEffect } from "react";
import { RegistrationStatus, AISuggestionType } from "../../utils/types.js";
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
import { getRegistrations } from "../../api/apiRegistration.js";

// Import the split components
import RegistrationList from "./sections/RegistrationList.jsx";
import RegistrationStatistics from "./sections/RegistrationStatistics.jsx";
import RegistrationSettings from "./sections/RegistrationSettings.jsx";

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

  const fetchRegistrations = async () => {
    try {
      const data = await getRegistrations();
      
      if (Array.isArray(data.data)) {
        setRegs(data.data);
      } else {
        console.error('data.data is not an array:', typeof data.data);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleImportSuccess = () => {
    // Fetch lại dữ liệu sau khi import thành công
    fetchRegistrations();
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setRegs((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus, note } : r)));
    setSelectedReg(null);
    setIsConfirming(null);
    setNote("");
  };

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
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${selectedReg.status === RegistrationStatus.PENDING
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
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${selectedReg.aiSuggestion === AISuggestionType.RECOMMENDED
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

  // Fetch settings when adjustment tab is selected
  useMemo(() => {
    if (activeSubTab === "adjustment") {
      // Settings are handled in RegistrationSettings component
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
        <RegistrationList
          regs={regs}
          setSelectedReg={setSelectedReg}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterYear={filterYear}
          setFilterYear={setFilterYear}
          filterScore={filterScore}
          setFilterScore={setFilterScore}
          filterGender={filterGender}
          setFilterGender={setFilterGender}
          onImportSuccess={handleImportSuccess}
          onRefresh={fetchRegistrations}
        />
      )}

      {activeSubTab === "stats" && (
        <RegistrationStatistics regs={regs} />
      )}

      {activeSubTab === "adjustment" && (
        <RegistrationSettings onSettingsUpdated={fetchRegistrations} />
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

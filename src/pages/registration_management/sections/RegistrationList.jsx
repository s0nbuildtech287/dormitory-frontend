import { useState, useEffect } from "react";
import { RegistrationStatus, AISuggestionType } from "../../../utils/types.js";
import { FileSpreadsheet, Search, Eye, RefreshCw, RotateCw, Plus, List, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, CheckCircle2, XCircle } from "lucide-react";
import ModelimportCSV from "./ModelimportCSV.jsx";
import AddRegistrationModal from "./AddRegistrationModal.jsx";
import { getScoringWeights, createRegistration } from "../../../api/apiRegistration.js";

// Helper function to determine priority group
const getGroupName = (year, priorityReasons) => {
  // Check if priority_reasons has any data - if yes, it's policy-based
  if (priorityReasons && String(priorityReasons).trim() !== "") {
    return "Chính sách";
  }

  // If no priority reasons, classify by year
  if (year === 1) {
    return "Tân sinh viên";
  }

  if (year > 1) {
    return "Sinh viên khoá cũ";
  }

  return "Không xác định";
};

// Helper function to convert snake_case object keys to camelCase
const convertToCamelCase = (obj) => {
  if (!obj) return null;

  return {
    id: obj.id,
    studentName: obj.student_name || obj.studentName,
    studentId: obj.student_id || obj.studentId,
    studentEmail: obj.student_email || obj.studentEmail,
    phone: obj.phone_number || obj.phone,
    gender: obj.gender,
    dob: obj.dob,
    address: obj.address,
    email: obj.student_email || obj.email,
    faculty: obj.faculty,
    class: obj.class,
    year: obj.year,
    gpa: obj.gpa,
    distance: obj.distance || obj.distance_km,
    priorityReasons: obj.priority_reasons || obj.priorityReasons,
    status: obj.status,
    aiScore: obj.ai_score ?? obj.aiScore,
    aiSuggestion: obj.ai_suggestion || obj.aiSuggestion,
    aiReasoning: obj.ai_reasoning || obj.aiReasoning,
    evidenceImages: obj.evidence_images || obj.evidenceImages || [],
  };
};

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
  setFilterGender,
  onImportSuccess,
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterGroup, setFilterGroup] = useState("All");
  const [selectedRegDetail, setSelectedRegDetail] = useState(null);
  const [isConfirming, setIsConfirming] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  
  // Settings state for quotas
  const [quotas, setQuotas] = useState({
    totalSlots: 1000,
    policy_priority: 10,
    freshmen: 60,
    seniors: 30,
  });
  
  // Fetch quotas from settings when component mounts
  useEffect(() => {
    const fetchQuotas = async () => {
      try {
        const data = await getScoringWeights();
        if (data.success && data.data && data.data.value && data.data.value.quotas) {
          setQuotas(data.data.value.quotas);
        }
      } catch (error) {
        console.error('Error fetching quotas:', error);
      }
    };
    fetchQuotas();
  }, [regs]);

  const filteredRegs = regs
    .filter((reg) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (reg.student_name?.toLowerCase().includes(searchLower) ?? false) || (reg.student_id?.toLowerCase().includes(searchLower) ?? false);

      const matchesStatus = filterStatus === "All" || reg.status === filterStatus;
      const matchesYear = filterYear === "All" || reg.year === parseInt(filterYear);
      const matchesScore =
        filterScore === "All" ||
        (filterScore === "High" && (reg.ai_score ?? 0) >= 80) ||
        (filterScore === "Medium" && (reg.ai_score ?? 0) >= 60 && (reg.ai_score ?? 0) < 80) ||
        (filterScore === "Low" && (reg.ai_score ?? 0) < 60);

      const matchesGender = filterGender === "All" || reg.gender === filterGender;

      const regGroup = getGroupName(reg.year, reg.priority_reasons);
      const matchesGroup = filterGroup === "All" || regGroup === filterGroup;

      return matchesSearch && matchesStatus && matchesYear && matchesScore && matchesGender && matchesGroup;
    })
    .sort((a, b) => (b.ai_score ?? 0) - (a.ai_score ?? 0));

  // Pagination calculations
  const totalItems = filteredRegs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredRegs.slice(startIndex, endIndex);

  // Calculate quota-based pending count for current filter group
  const totalSlots = quotas.totalSlots || 1000;
  const groupQuotas = {
    'Chính sách': Math.round((quotas.policy_priority / 100) * totalSlots),
    'Tân sinh viên': Math.round((quotas.freshmen / 100) * totalSlots),
    'Sinh viên khoá cũ': Math.round((quotas.seniors / 100) * totalSlots),
  };
  
  // Calculate available slots for current filter group
  const getAvailableSlotsForGroup = (groupFilter) => {
    if (groupFilter === 'All') {
      return totalSlots;
    }
    return groupQuotas[groupFilter] || 0;
  };
  
  const availableSlots = getAvailableSlotsForGroup(filterGroup);
  const actualPendingCount = filteredRegs.filter(reg => reg.status === RegistrationStatus.PENDING).length;
  const quotaBasedPendingCount = Math.min(actualPendingCount, availableSlots);

  // Reset to first page when filters change
  const handleFilterChange = (filterSetter, value) => {
    filterSetter(value);
    setCurrentPage(1);
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  // Handle add registration form submission
  const handleAddRegistration = async (formData) => {
    setIsSubmittingReg(true);
    try {
      const response = await createRegistration(formData);
      if (response.success) {
        // Refresh the registrations list by calling onImportSuccess
        if (onImportSuccess) {
          onImportSuccess();
        }
        return;
      } else {
        throw new Error(response.message || "Có lỗi xảy ra khi thêm hồ sơ");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsSubmittingReg(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* KHỐI CHỨC NĂNG DỮ LIỆU ĐẦU VÀO */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-200">
        <h3 className="text-slate-800 font-medium text-sm mb-4 uppercase tracking-wider">Đồng bộ dữ liệu đăng ký</h3>
        <div className="grid grid-cols-7 gap-4 items-stretch">
          <div className="col-span-3 relative">
            <input
              type="text"
              placeholder="Nhập URL Google Sheets..."
              className="w-full h-full pl-4 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all bg-slate-50/50"
            />
          </div>

          <div className="col-span-1">
            <ModelimportCSV onImportSuccess={onImportSuccess} />
          </div>

          <button className="col-span-1 flex items-center justify-center px-1 py-3 bg-white text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-lg shadow-slate-100 font-bold text-xs whitespace-nowrap">
            <RefreshCw size={14} className="mr-1 flex-shrink-0" /> Reset
          </button>

          <button className="col-span-1 flex items-center justify-center px-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-xs whitespace-nowrap">
            <RotateCw size={14} className="mr-1 flex-shrink-0" /> Đồng bộ
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="col-span-1 flex items-center justify-center px-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-xs whitespace-nowrap">
            <Plus size={14} className="mr-1 flex-shrink-0" /> Thêm hồ sơ
          </button>
        </div>
      </div>

      {/* THANH TÌM KIẾM VÀ LỌC */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-200">
        <h3 className="text-slate-800 font-medium text-sm mb-4 uppercase tracking-wider">Bộ lọc dữ liệu đăng ký</h3>
        <div className="grid grid-cols-7 gap-4 items-center">
          <div className="relative col-span-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên hoặc mã SV..."
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all bg-slate-50/50"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value={RegistrationStatus.PENDING}>Chờ duyệt</option>
            <option value={RegistrationStatus.APPROVED}>Đã duyệt</option>
            <option value={RegistrationStatus.REJECTED}>Từ chối</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => handleFilterChange(setFilterYear, e.target.value)}
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
            onChange={(e) => handleFilterChange(setFilterScore, e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả điểm</option>
            <option value="High">Cao (≥80)</option>
            <option value="Medium">Trung bình (60-79)</option>
            <option value="Low">Thấp (&lt;60)</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => handleFilterChange(setFilterGender, e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          <select
            value={filterGroup}
            onChange={(e) => handleFilterChange(setFilterGroup, e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả nhóm</option>
            <option value="Tân sinh viên">Tân sinh viên</option>
            <option value="Chính sách">Chính sách</option>
            <option value="Sinh viên khoá cũ">Sinh viên khoá cũ</option>
          </select>
        </div>
      </div>

      {/* BẢNG HỒ SƠ ĐĂNG KÝ */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider text-left">
            Bảng hồ sơ đăng ký ({totalItems} kết quả) - chờ duyệt {quotaBasedPendingCount} / {totalItems} hồ sơ
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b-2 border-slate-300">
              <tr className="bg-slate-200 text-slate-700 text-xs font-black capitalize tracking-widest">
                <th className="px-6 py-3 border-r-2 border-slate-300">Mã sinh viên</th>
                <th className="px-6 py-3 border-r-2 border-slate-300">Tên sinh viên</th>
                <th className="px-6 py-3 border-r-2 border-slate-300">Nhóm</th>
                <th className="px-6 py-3 text-center border-r-2 border-slate-300">Điểm</th>
                <th className="px-6 py-3 border-r-2 border-slate-300">Đề xuất</th>
                <th className="px-6 py-3 border-r-2 border-slate-300">Trạng thái</th>
                <th className="px-6 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <List size={48} className="mb-4 opacity-50" />
                      <p className="text-sm font-medium">Chưa có hồ sơ đăng ký nào</p>
                      <p className="text-xs mt-1">Hãy thử import CSV để thêm dữ liệu</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors h-12">
                    <td className="px-6 py-2 text-xs font-mono font-semibold text-slate-900 border-r-2 border-slate-300">{reg.student_id || "N/A"}</td>
                    <td className="px-6 py-2 font-semibold text-slate-900 text-sm border-r-2 border-slate-300">{reg.student_name}</td>
                    <td className="px-6 py-2 border-r-2 border-slate-300">
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-black">{getGroupName(reg.year, reg.priority_reasons)}</span>
                    </td>
                    <td className="px-6 py-2 text-center border-r-2 border-slate-300">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black">{reg.ai_score ?? 0}</span>
                    </td>
                    <td className="px-6 py-2 border-r-2 border-slate-300">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                          reg.ai_suggestion === AISuggestionType.RECOMMENDED
                            ? "bg-emerald-50 text-emerald-600"
                            : reg.ai_suggestion === AISuggestionType.CONSIDER
                              ? "bg-amber-50 text-amber-600"
                              : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            reg.ai_suggestion === AISuggestionType.RECOMMENDED ? "bg-emerald-500" : reg.ai_suggestion === AISuggestionType.CONSIDER ? "bg-amber-500" : "bg-rose-500"
                          }`}
                        ></div>
                        {reg.ai_suggestion}
                      </div>
                    </td>
                    <td className="px-6 py-2 border-r-2 border-slate-300">
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight ${
                            reg.status === RegistrationStatus.PENDING
                              ? "bg-amber-100 text-amber-700"
                              : reg.status === RegistrationStatus.APPROVED
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {reg.status}
                        </span>
                        {reg.isFull && reg.status === RegistrationStatus.PENDING && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight bg-orange-100 text-orange-700 border border-orange-200">
                            Đầy chỗ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedRegDetail(reg)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Xem chi tiết">
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setIsConfirming({ id: reg.id, status: RegistrationStatus.APPROVED })}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Phê duyệt"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => setIsConfirming({ id: reg.id, status: RegistrationStatus.REJECTED })}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Từ chối"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalItems > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Hiển thị</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-slate-200 rounded text-xs font-medium"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>mục mỗi trang</span>
            </div>

            {/* Pagination info */}
            <div className="text-sm text-slate-600">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} của {totalItems} mục
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-1">
              {/* First page */}
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft size={16} />
              </button>

              {/* Previous page */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum ? "bg-blue-600 text-white" : "border border-slate-200 hover:bg-slate-50"}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next page */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>

              {/* Last page */}
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedRegDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in scale-in duration-300">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b border-blue-800">
              <h3 className="text-white font-bold text-lg">Chi tiết hồ sơ đăng ký</h3>
              <button onClick={() => setSelectedRegDetail(null)} className="p-1 text-white hover:bg-white/20 rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider">Thông tin cá nhân</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Mã sinh viên</p>
                    <p className="text-slate-900 font-bold">{selectedRegDetail.student_id || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Tên sinh viên</p>
                    <p className="text-slate-900 font-bold">{selectedRegDetail.student_name}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Email</p>
                    <p className="text-slate-900 font-bold">{selectedRegDetail.student_email || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Số điện thoại</p>
                    <p className="text-slate-900 font-bold">{selectedRegDetail.phone_number || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Giới tính</p>
                    <p className="text-slate-900 font-bold">{selectedRegDetail.gender || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Ngày sinh</p>
                    <p className="text-slate-900 font-bold">{selectedRegDetail.dob || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider">Thông tin học tập</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Khoa</p>
                    <p className="text-slate-900 font-bold">{selectedRegDetail.faculty || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Chuyên ngành</p>
                    <p className="text-slate-900 font-bold">{selectedRegDetail.major || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Lớp</p>
                    <p className="text-slate-900 font-bold">{selectedRegDetail.class || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Năm theo học</p>
                    <p className="text-slate-900 font-bold">Năm {selectedRegDetail.year}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">GPA</p>
                    <p className="text-slate-900 font-bold">{selectedRegDetail.gpa ?? "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Khoảng cách</p>
                    <p className="text-slate-900 font-bold">{selectedRegDetail.distance ?? "N/A"} km</p>
                  </div>
                </div>
              </div>

              {/* Priority and Scoring */}
              <div>
                <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider">Ưu tiên & Đánh giá</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-slate-600 text-xs font-semibold mb-2">Lý do ưu tiên</p>
                    <p className="text-slate-900 font-bold">{selectedRegDetail.priority_reasons || "Không có"}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                      <p className="text-slate-600 text-xs font-semibold mb-2">Điểm AI</p>
                      <p className="text-blue-900 font-black text-2xl">{selectedRegDetail.ai_score ?? 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                      <p className="text-slate-600 text-xs font-semibold mb-2">Nhóm</p>
                      <p className="text-purple-900 font-bold">{getGroupName(selectedRegDetail.year, selectedRegDetail.priority_reasons)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                      <p className="text-slate-600 text-xs font-semibold mb-2">Đề xuất</p>
                      <p
                        className={`font-bold ${
                          selectedRegDetail.ai_suggestion === AISuggestionType.RECOMMENDED
                            ? "text-emerald-700"
                            : selectedRegDetail.ai_suggestion === AISuggestionType.CONSIDER
                              ? "text-amber-700"
                              : "text-rose-700"
                        }`}
                      >
                        {selectedRegDetail.ai_suggestion}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-2">Lý do đánh giá</p>
                    {(() => {
                      // Parse ai_reasoning if it's a string
                      let reasoning = selectedRegDetail.ai_reasoning;
                      if (typeof reasoning === 'string') {
                        try {
                          reasoning = JSON.parse(reasoning);
                        } catch (e) {
                          // If parse fails, keep as string
                        }
                      }
                      
                      if (reasoning && typeof reasoning === "object") {
                        return (
                          <div className="space-y-2 text-sm">
                            {reasoning.description && <p className="text-slate-900 font-bold">{reasoning.description}</p>}
                            {reasoning.basket && (
                              <p className="text-slate-700">
                                • Rổ: <span className="font-bold">{reasoning.basket}</span> - {reasoning.basket_name}
                              </p>
                            )}
                            {reasoning.priority_score !== undefined && (
                              <p className="text-slate-700">
                                • Điểm ưu tiên: <span className="font-bold">{reasoning.priority_score}</span>
                                {reasoning.basket_weights?.w1_priority && ` (W₁: ${reasoning.basket_weights.w1_priority})`}
                              </p>
                            )}
                            {reasoning.year_score !== undefined && (
                              <p className="text-slate-700">
                                • Điểm năm học: <span className="font-bold">{reasoning.year_score}</span>
                                {reasoning.basket_weights?.w2_year && ` (W₂: ${reasoning.basket_weights.w2_year})`}
                              </p>
                            )}
                            {reasoning.gpa_score !== undefined && (
                              <p className="text-slate-700">
                                • Điểm GPA: <span className="font-bold">{reasoning.gpa_score}</span>
                                {reasoning.basket_weights?.w3_gpa && ` (W₃: ${reasoning.basket_weights.w3_gpa})`}
                              </p>
                            )}
                            {reasoning.final_score !== undefined && (
                              <p className="text-slate-700">
                                • Điểm cuối cùng: <span className="font-bold text-blue-700">{reasoning.final_score.toFixed(2)}</span>
                              </p>
                            )}
                            {reasoning.formula && <p className="text-slate-600 text-xs italic mt-2 bg-blue-50 p-2 rounded">📐 {reasoning.formula}</p>}
                          </div>
                        );
                      } else if (reasoning) {
                        return <p className="text-slate-900 text-sm">{String(reasoning)}</p>;
                      } else {
                        return <p className="text-slate-500 italic">Không có thông tin</p>;
                      }
                    })()}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider">Trạng thái</h4>
                <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-1">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded-md text-xs font-black uppercase tracking-tight ${
                      selectedRegDetail.status === RegistrationStatus.PENDING
                        ? "bg-amber-100 text-amber-700"
                        : selectedRegDetail.status === RegistrationStatus.APPROVED
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {selectedRegDetail.status}
                  </span>
                  {selectedRegDetail.isFull && selectedRegDetail.status === RegistrationStatus.PENDING && (
                    <span className="inline-block px-1.5 py-0.5 rounded-md text-xs font-black uppercase tracking-tight bg-orange-100 text-orange-700 border border-orange-200">
                      ⚠️ Đầy chỗ
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedRegDetail.note && (
                <div>
                  <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider">Ghi chú</h4>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-900 text-sm">{selectedRegDetail.note}</p>
                  </div>
                </div>
              )}

              {/* Evidence Images */}
              {selectedRegDetail.evidence_images && selectedRegDetail.evidence_images.length > 0 && (
                <div>
                  <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider">📸 Ảnh minh chứng</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedRegDetail.evidence_images.map((img, idx) => (
                      <div key={idx} className="relative group overflow-hidden rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition-all">
                        <img
                          src={img}
                          alt={`Evidence ${idx + 1}`}
                          className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                          onClick={() => {
                            // Open image in new tab
                            window.open(img, "_blank");
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-bold">Nhấn xem</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-slate-100 px-6 py-4 flex items-center justify-between gap-3 border-t border-slate-200">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsConfirming({ id: selectedRegDetail.id, status: RegistrationStatus.APPROVED })}
                  className="px-4 py-2 text-white font-semibold bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Phê duyệt
                </button>
                <button
                  onClick={() => setIsConfirming({ id: selectedRegDetail.id, status: RegistrationStatus.REJECTED })}
                  className="px-4 py-2 text-white font-semibold bg-rose-600 rounded-lg hover:bg-rose-700 transition-all flex items-center gap-2"
                >
                  <XCircle size={16} /> Từ chối
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedRegDetail(null)} className="px-4 py-2 text-slate-700 font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all">
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setSelectedReg(convertToCamelCase(selectedRegDetail));
                    setSelectedRegDetail(null);
                  }}
                  className="px-4 py-2 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      {isConfirming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in scale-in duration-300">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                isConfirming.status === RegistrationStatus.APPROVED ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
              }`}
            >
              {isConfirming.status === RegistrationStatus.APPROVED ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận quyết định?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Bạn đang chuẩn bị <span className="font-bold text-slate-900">{isConfirming.status === RegistrationStatus.APPROVED ? "phê duyệt" : "từ chối"}</span> hồ sơ.
              {selectedRegDetail && <span> Hệ thống sẽ gửi thông báo kết quả cho sinh viên.</span>}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsConfirming(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">
                Hủy
              </button>
              <button
                onClick={() => {
                  // TODO: Call API to update registration status
                  console.log(`Update registration ${isConfirming.id} to ${isConfirming.status}`);
                  setIsConfirming(null);
                  if (selectedRegDetail) setSelectedRegDetail(null);
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${
                  isConfirming.status === RegistrationStatus.APPROVED ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <AddRegistrationModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddRegistration}
      />
    </div>
  );
};

export default RegistrationList;

import { useState, useEffect } from "react";
import { RegistrationStatus, AISuggestionType } from "../../../utils/types.js";
import { FileSpreadsheet, Search, Eye, RefreshCw, RotateCw, Plus, List, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, CheckCircle2, XCircle, Send } from "lucide-react";
import { usePagination } from "../../../hooks/usePagination.js";
import { useSelection } from "../../../hooks/useSelection.js";
import Pagination from "../../../components/common/Pagination.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import FilterBar from "../../../components/common/FilterBar.jsx";
import ModelimportCSV from "./ModelimportCSV.jsx";
import AddRegistrationModal from "./AddRegistrationModal.jsx";
import { getScoringWeights, createRegistration, deleteRegistration, approveRegistration, rejectRegistration } from "../../../api/apiRegistration.js";

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
  onRefresh,
}) => {
  const [filterGroup, setFilterGroup] = useState("All");
  const [selectedRegDetail, setSelectedRegDetail] = useState(null);
  const [isConfirming, setIsConfirming] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);

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
        console.error("Error fetching quotas:", error);
      }
    };
    fetchQuotas();
  }, [regs]);

  const filteredRegs = regs
    .filter((reg) => reg.status !== RegistrationStatus.APPROVED) // Ẩn hồ sơ đã duyệt (đã chuyển sang hợp đồng)
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

  // Custom Hooks
  const pagination = usePagination(filteredRegs, 10);
  const { currentItems, totalItems } = pagination;
  const { 
    selectedItems: selectedRegs, 
    showCheckboxColumn, 
    toggleSelectionMode: handleToggleCheckbox, 
    handleSelectItem: handleSelectReg, 
    handleSelectAll, 
    clearSelection 
  } = useSelection(filteredRegs.map(r => r.id));

  // Calculate quota-based pending count for current filter group
  const totalSlots = quotas.totalSlots || 1000;
  const groupQuotas = {
    "Chính sách": Math.round((quotas.policy_priority / 100) * totalSlots),
    "Tân sinh viên": Math.round((quotas.freshmen / 100) * totalSlots),
    "Sinh viên khoá cũ": Math.round((quotas.seniors / 100) * totalSlots),
  };

  // Calculate available slots for current filter group
  const getAvailableSlotsForGroup = (groupFilter) => {
    if (groupFilter === "All") {
      return totalSlots;
    }
    return groupQuotas[groupFilter] || 0;
  };

  const availableSlots = getAvailableSlotsForGroup(filterGroup);
  const actualPendingCount = filteredRegs.filter((reg) => reg.status === RegistrationStatus.PENDING).length;
  const quotaBasedPendingCount = Math.min(actualPendingCount, availableSlots);

  // Reset to first page when filters change
  const handleFilterChange = (filterSetter, value) => {
    filterSetter(value);
    pagination.goToPage(1);
  };

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

  // Handlers deleted in favor of useSelection Hook

  const handleBulkEmail = () => {
    if (selectedRegs.size === 0) {
      alert("Vui lòng chọn ít nhất một hồ sơ");
      return;
    }
    setShowBulkEmailModal(true);
  };

  const handleConfirmBulkEmail = () => {
    const selected = regs.filter(r => selectedRegs.has(r.id));
    const emails = [...new Set(selected.map(r => r.student_email || r.email).filter(Boolean))];
    
    setShowBulkEmailModal(false);
    clearSelection();
    
    alert(`Đã mô phỏng gửi email cho ${selected.length} hồ sơ.\nTổng số email: ${emails.length}\n${emails.join(', ')}`);
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
            className="col-span-1 flex items-center justify-center px-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-xs whitespace-nowrap"
          >
            <Plus size={14} className="mr-1 flex-shrink-0" /> Thêm hồ sơ
          </button>
        </div>
      </div>

      {/* THANH TÌM KIẾM VÀ LỌC */}
      <FilterBar
        title="Bộ lọc dữ liệu đăng ký"
        filterContainerClass="grid grid-cols-7 gap-4 items-center"
        search={{
          placeholder: "Tìm tên hoặc mã SV...",
          value: searchTerm,
          onChange: (val) => handleFilterChange(setSearchTerm, val),
          className: "col-span-2 relative"
        }}
        filters={[
          {
            value: filterStatus,
            onChange: (val) => handleFilterChange(setFilterStatus, val),
            className: "w-full",
            options: [
              { value: "All", label: "Tất cả trạng thái" },
              { value: RegistrationStatus.PENDING, label: "Chờ duyệt" },
              { value: RegistrationStatus.REJECTED, label: "Từ chối" },
            ]
          },
          {
            value: filterYear,
            onChange: (val) => handleFilterChange(setFilterYear, val),
            className: "w-full",
            options: [
              { value: "All", label: "Tất cả năm" },
              { value: "1", label: "Năm 1" },
              { value: "2", label: "Năm 2" },
              { value: "3", label: "Năm 3" },
              { value: "4", label: "Năm 4" },
            ]
          },
          {
            value: filterScore,
            onChange: (val) => handleFilterChange(setFilterScore, val),
            className: "w-full",
            options: [
              { value: "All", label: "Tất cả điểm" },
              { value: "High", label: "Cao (≥80)" },
              { value: "Medium", label: "Trung bình (60-79)" },
              { value: "Low", label: "Thấp (<60)" },
            ]
          },
          {
            value: filterGender,
            onChange: (val) => handleFilterChange(setFilterGender, val),
            className: "w-full",
            options: [
              { value: "All", label: "Tất cả giới tính" },
              { value: "Nam", label: "Nam" },
              { value: "Nữ", label: "Nữ" },
            ]
          },
          {
            value: filterGroup,
            onChange: (val) => handleFilterChange(setFilterGroup, val),
            className: "w-full",
            options: [
              { value: "All", label: "Tất cả nhóm" },
              { value: "Tân sinh viên", label: "Tân sinh viên" },
              { value: "Chính sách", label: "Chính sách" },
              { value: "Sinh viên khoá cũ", label: "Sinh viên khoá cũ" },
            ]
          }
        ]}
      />

      {/* BẢNG HỒ SƠ ĐĂNG KÝ */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300 flex items-center justify-between">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider text-left">
            Bảng hồ sơ đăng ký ({totalItems} kết quả) - chờ duyệt {actualPendingCount} / {totalItems} hồ sơ
          </h3>
          
          <div className="flex items-center gap-2">
            {/* Toggle Checkbox Column Button */}
            <button
              onClick={handleToggleCheckbox}
              className={`px-3 py-2 border text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
                showCheckboxColumn 
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Send size={13} /> {showCheckboxColumn ? 'Tắt chế độ chọn' : 'Chọn nhiều'}
            </button>
            
            {/* Bulk Email Button */}
            {showCheckboxColumn && selectedRegs.size > 0 && (
              <button
                onClick={handleBulkEmail}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-amber-200 transition-colors flex items-center gap-1.5 animate-in fade-in duration-200"
              >
                <Send size={13} /> Gửi email ({selectedRegs.size})
              </button>
            )}
          </div>
        </div>
        <DataTable
          columns={[
            {
              header: "Mã sinh viên",
              align: "left",
              accessor: (reg) => <span className="text-xs font-mono font-semibold text-slate-900">{reg.student_id || "N/A"}</span>,
            },
            {
              header: "Tên sinh viên",
              align: "left",
              accessor: (reg) => <span className="font-semibold text-slate-900 text-sm">{reg.student_name}</span>,
            },
            {
              header: "Nhóm",
              align: "left",
              accessor: (reg) => (
                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-black">
                  {getGroupName(reg.year, reg.priority_reasons)}
                </span>
              ),
            },
            {
              header: "Điểm",
              align: "center",
              accessor: (reg) => (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black">{reg.ai_score ?? 0}</span>
              ),
            },
            {
              header: "Đề xuất",
              align: "left",
              accessor: (reg) => (
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
              ),
            },
            {
              header: "Trạng thái",
              align: "left",
              accessor: (reg) => (
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
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight bg-orange-100 text-orange-700 border border-orange-200">Đầy chỗ</span>
                  )}
                </div>
              ),
            },
            {
              header: "Hành động",
              align: "center",
              accessor: (reg) => (
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setSelectedRegDetail(reg)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Xem chi tiết">
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => alert(`Đã mô phỏng gửi email thông báo cho tài khoản ${reg.student_id}`)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Gửi email thông báo"
                  >
                    <Send size={16} />
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
              ),
            },
          ]}
          data={currentItems}
          keyExtractor={(reg) => reg.id}
          loading={false}
          emptyState={{ icon: List, title: "Chưa có hồ sơ đăng ký nào", description: "Hãy thử import CSV để thêm dữ liệu" }}
          selection={{
            selectedItems: selectedRegs,
            showCheckboxColumn,
            onSelectAll: handleSelectAll,
            onSelectRow: handleSelectReg,
          }}
          rowClassName={() => "h-12"}
        />
      </div>

      <Pagination pagination={pagination} />

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
                    <p className="text-slate-700">{selectedRegDetail.student_id || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Tên sinh viên</p>
                    <p className="text-slate-700">{selectedRegDetail.student_name}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Email</p>
                    <p className="text-slate-700">{selectedRegDetail.student_email || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Số điện thoại</p>
                    <p className="text-slate-700">{selectedRegDetail.phone_number || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Giới tính</p>
                    <p className="text-slate-700">{selectedRegDetail.gender || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Ngày sinh</p>
                    <p className="text-slate-700">{selectedRegDetail.dob || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h4 className="text-slate-800 font-medium text-sm mb-4 uppercase tracking-wider">Thông tin học tập</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Khoa</p>
                    <p className="text-slate-700">{selectedRegDetail.faculty || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Chuyên ngành</p>
                    <p className="text-slate-700">{selectedRegDetail.major || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Lớp</p>
                    <p className="text-slate-700">{selectedRegDetail.class || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Năm theo học</p>
                    <p className="text-slate-700">Năm {selectedRegDetail.year}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">GPA</p>
                    <p className="text-slate-700">{selectedRegDetail.gpa ?? "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Khoảng cách</p>
                    <p className="text-slate-700">{selectedRegDetail.distance ?? "N/A"} km</p>
                  </div>
                </div>
              </div>

              {/* Priority and Scoring */}
              <div>
                <h4 className="text-slate-800 font-medium text-sm mb-4 uppercase tracking-wider">Ưu tiên & Đánh giá</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-slate-600 text-xs font-semibold mb-2">Lý do ưu tiên</p>
                    <p className="text-slate-700">{selectedRegDetail.priority_reasons || "Không có"}</p>
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
                      if (typeof reasoning === "string") {
                        try {
                          reasoning = JSON.parse(reasoning);
                        } catch (e) {
                          // If parse fails, keep as string
                        }
                      }

                      if (reasoning && typeof reasoning === "object") {
                        return (
                          <div className="space-y-2 text-sm">
                            {reasoning.description && <p className="text-slate-700">{reasoning.description}</p>}
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
                    <span className="inline-block px-1.5 py-0.5 rounded-md text-xs font-black uppercase tracking-tight bg-orange-100 text-orange-700 border border-orange-200">⚠️ Đầy chỗ</span>
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
                  <h4 className="text-slate-800 font-medium text-sm mb-4 uppercase tracking-wider">📸 Ảnh minh chứng</h4>
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
                <button
                  onClick={() => setIsConfirming({ id: selectedRegDetail.id, status: "DELETE" })}
                  className="px-4 py-2 text-white font-semibold bg-red-600 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  <XCircle size={16} /> Xóa
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
      <ConfirmModal
        isOpen={!!isConfirming}
        onClose={() => setIsConfirming(null)}
        onConfirm={async () => {
          try {
            if (isConfirming.status === "DELETE") {
              await deleteRegistration(isConfirming.id);
            } else if (isConfirming.status === RegistrationStatus.APPROVED) {
              await approveRegistration(isConfirming.id);
            } else if (isConfirming.status === RegistrationStatus.REJECTED) {
              await rejectRegistration(isConfirming.id, "Từ chối từ admin");
            }
            setIsConfirming(null);
            if (selectedRegDetail) setSelectedRegDetail(null);
            if (onRefresh) onRefresh();
          } catch (error) {
            console.error("Error:", error.message);
            alert(error.message || "Có lỗi xảy ra");
          }
        }}
        title={isConfirming?.status === "DELETE" ? "Xóa hồ sơ?" : "Xác nhận quyết định?"}
        message={isConfirming?.status === "DELETE" ? (
          "Hồ sơ sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn xóa hồ sơ này không?"
        ) : (
          <span>
            Bạn đang chuẩn bị <span className="font-bold text-slate-900">{isConfirming?.status === RegistrationStatus.APPROVED ? "phê duyệt" : "từ chối"}</span> hồ sơ.
            {selectedRegDetail && <span> Hệ thống sẽ gửi thông báo kết quả cho sinh viên.</span>}
          </span>
        )}
        confirmText={isConfirming?.status === "DELETE" ? "Xóa" : "Xác nhận"}
        icon={isConfirming?.status === RegistrationStatus.APPROVED ? CheckCircle2 : XCircle}
        iconBgColor={
          isConfirming?.status === RegistrationStatus.APPROVED
            ? "bg-emerald-100"
            : isConfirming?.status === "DELETE"
              ? "bg-red-100"
              : "bg-rose-100"
        }
        iconColor={
          isConfirming?.status === RegistrationStatus.APPROVED
            ? "text-emerald-600"
            : isConfirming?.status === "DELETE"
              ? "text-red-600"
              : "text-rose-600"
        }
        confirmColor={
          isConfirming?.status === RegistrationStatus.APPROVED
            ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200"
            : isConfirming?.status === "DELETE"
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-200"
              : "bg-rose-600 hover:bg-rose-700 focus:ring-rose-200"
        }
      />

      <AddRegistrationModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddRegistration} />

      {/* BULK EMAIL CONFIRMATION */}
      <ConfirmModal
        isOpen={showBulkEmailModal}
        onClose={() => setShowBulkEmailModal(false)}
        onConfirm={handleConfirmBulkEmail}
        title="Xác nhận gửi email hàng loạt"
        confirmText="Gửi email"
        icon={Send}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
        confirmColor="bg-amber-600 hover:bg-amber-700 focus:ring-amber-200"
      >
        <p className="text-sm text-slate-600">
          Số hồ sơ được chọn: <span className="font-bold text-slate-900">{selectedRegs.size}</span>
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Số email sẽ gửi: <span className="font-bold text-slate-900">
            {[...new Set(
              regs
                .filter(r => selectedRegs.has(r.id))
                .map(r => r.student_email || r.email)
                .filter(Boolean)
            )].length} email
          </span>
        </p>
      </ConfirmModal>
    </div>
  );
};

export default RegistrationList;

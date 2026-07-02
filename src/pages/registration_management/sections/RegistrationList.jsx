import { useState, useEffect, useMemo } from "react";
import { RegistrationStatus, AISuggestionType } from "../../../utils/types.js";
import { Search, Eye, RefreshCw, RotateCw, Plus, List, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ChevronsLeft, ChevronsRight, X, CheckCircle2, XCircle, Send, Square, CheckSquare, Loader2, ShieldCheck, Rocket, BedDouble, Users, AlertTriangle, Info, Settings, Sliders } from "lucide-react";
import { usePagination } from "../../../hooks/usePagination.js";
import { useSelection } from "../../../hooks/useSelection.js";
import Pagination from "../../../components/common/Pagination.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import FilterBar from "../../../components/common/FilterBar.jsx";
import ModelimportCSV from "./ModelimportCSV.jsx";
import AddRegistrationModal from "./AddRegistrationModal.jsx";
import EmailComposeModal, { EMAIL_TEMPLATES } from "../../../components/common/EmailComposeModal.jsx";
import { getScoringWeights, createRegistration, deleteRegistration, approveRegistration, rejectRegistration, importFromGoogleSheets, validateRegistrationImages, getRoomForecast, autoAllocateRegistrations } from "../../../api/apiRegistration.js";
import ModalPortal from "../../../components/ModalPortal.jsx";

// Badge hiển thị trạng thái xác thực ảnh Vision
const VisionBadge = ({ status }) => {
  const cfg = {
    VALID: { cls: "bg-emerald-100 text-emerald-700", label: "✅ Hợp lệ" },
    SUSPECT: { cls: "bg-amber-100 text-amber-700", label: "⚠️ Nghi ngờ" },
    INVALID: { cls: "bg-rose-100 text-rose-700", label: "❌ Không hợp lệ" },
    PENDING: { cls: "bg-slate-100 text-slate-500", label: "⏳ Chờ xử lý" },
    ERROR: { cls: "bg-orange-100 text-orange-700", label: "🔴 Lỗi" },
  };
  if (!status) return null;
  const { cls, label } = cfg[status] || cfg.PENDING;
  return <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight ${cls}`}>{label}</span>;
};

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

// Helper to classify registration into baskets (1: Policy, 2: Freshmen, 3: Seniors)
const getRegBasket = (reg) => {
  if (reg.priority_reasons && String(reg.priority_reasons).trim() !== "") {
    const lowerReason = String(reg.priority_reasons).toLowerCase();
    const hasPriority =
      lowerReason.includes("hộ nghèo") ||
      lowerReason.includes("cận nghèo") ||
      lowerReason.includes("thương binh") ||
      lowerReason.includes("liệt sỹ") ||
      lowerReason.includes("khuyết tật") ||
      lowerReason.includes("lưu học sinh") ||
      lowerReason.includes("hoàn cảnh khó khăn đặc biệt") ||
      lowerReason.includes("vùng sâu") ||
      lowerReason.includes("vùng xa") ||
      lowerReason.includes("hải đảo") ||
      lowerReason.includes("vùng có điều kiện kinh tế đặc biệt khó khăn") ||
      lowerReason.includes("giấy xác nhận ưu tiên") ||
      lowerReason.includes("ưu tiên khác");

    if (hasPriority) return 1;
  }
  return reg.year === 1 ? 2 : 3;
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
    visionStatus: obj.vision_status || obj.visionStatus || null,
    visionScore: obj.vision_score ?? obj.visionScore ?? null,
    visionReasons: obj.vision_reasons || obj.visionReasons || [],
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
  const [filterVision, setFilterVision] = useState("All");
  const [filterFaculty, setFilterFaculty] = useState("All");

  const [isOpenSkippedModal, setIsOpenSkippedModal] = useState(false);

  const skippedPendingRegs = useMemo(() => {
    return (regs || []).filter(r => {
      if (r.status !== "Chờ duyệt" || !r.note) return false;
      const noteStr = String(r.note);
      return (
        noteStr.includes("Hết chỉ tiêu toàn KTX") ||
        noteStr.includes("Hết chỗ trống KTX (khi dồn chỉ tiêu)") ||
        noteStr.includes("Hết chỉ tiêu nhóm đối tượng") ||
        noteStr.includes("Vượt quá chỉ tiêu khoa")
      );
    });
  }, [regs]);

  // Auto-allocate states
  const [isOpenAutoAllocateModal, setIsOpenAutoAllocateModal] = useState(false);
  const [autoAllocating, setAutoAllocating] = useState(false);
  const [autoAllocateResult, setAutoAllocateResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");
  const [simulate, setSimulate] = useState(true);
  const [allowOverflow, setAllowOverflow] = useState(false);
  const [modalQuotas, setModalQuotas] = useState({
    totalSlots: 1000,
    freshmen: 60,
    seniors: 40,
    facultyQuotas: {},
    genderQuotas: { male: 0, female: 0 },
  });
  const [facultiesList, setFacultiesList] = useState([]);
  const [isQuotasCollapsed, setIsQuotasCollapsed] = useState(true);
  const [facultyDetailOpen, setFacultyDetailOpen] = useState(false);
  const [roomStats, setRoomStats] = useState({
    available_now: 0,
    available_soon: 0,
    total: 0,
    by_building: {}
  });

  const [validatingId, setValidatingId] = useState(null);
  const [selectedRegDetail, setSelectedRegDetail] = useState(null);
  const [isConfirming, setIsConfirming] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [composeEmail, setComposeEmail] = useState(null);
  const [sendEmailOnApprove, setSendEmailOnApprove] = useState(true);

  // Google Sheets sync state
  const [sheetUrl, setSheetUrl] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null); // { type: 'success'|'error', text }

  // Auto-refresh sau khi sync để cập nhật vision_status từ background job
  // Poll nhiều lần trong 3 phút đầu sau khi import
  const triggerAutoRefresh = () => {
    // Poll tại: 5s, 15s, 30s, 60s, 90s, 120s, 180s
    const delays = [5000, 15000, 30000, 60000, 90000, 120000, 180000];
    delays.forEach((delay) => {
      setTimeout(() => {
        if (onRefresh) onRefresh();
      }, delay);
    });
  };

  // Settings state for quotas
  const [quotas, setQuotas] = useState({
    totalSlots: 1000,
    policy_priority: 0,
    freshmen: 60,
    seniors: 40,
    genderQuotas: { male: 0, female: 0 },
  });

  // Load room forecast stats
  useEffect(() => {
    getRoomForecast()
      .then(res => {
        if (res.success) setRoomStats(res.data);
      })
      .catch(err => console.error("Error loading room forecast:", err));
  }, [regs]);

  const getApprovalStage = (percent) => {
    if (percent < 20) return "Chuẩn bị danh sách xét duyệt...";
    if (percent < 45) return "Đang xếp hạng theo điểm xét tuyển & diện ưu tiên...";
    if (percent < 75) return "Đang khởi tạo tài khoản & hợp đồng chờ gán...";
    if (percent < 90) return "Đang kiểm tra chỉ tiêu & áp dụng cấu hình...";
    return "Đang hoàn tất lưu dữ liệu...";
  };

  const handleRunAutoAllocate = async (overrideSimulate = null) => {
    setAutoAllocating(true);
    setProgress(0);
    setProgressStage("Chuẩn bị danh sách xét duyệt...");

    const runSimulate = overrideSimulate !== null ? overrideSimulate : simulate;

    const pendingCount = (regs || []).filter(
      (r) =>
        r.status === "Chờ duyệt" &&
        (filterFaculty === "All" || r.faculty === filterFaculty)
    ).length;

    const estimatedDuration = Math.max(2000, pendingCount * 22);
    const tickMs = 100;
    const increment = (tickMs / estimatedDuration) * 98;

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress = Math.min(98, currentProgress + increment);
      setProgress(Math.round(currentProgress));
      setProgressStage(getApprovalStage(currentProgress));
    }, tickMs);

    try {
      const res = await autoAllocateRegistrations(
        filterFaculty === "All" ? null : filterFaculty,
        runSimulate,
        allowOverflow,
        modalQuotas
      );
      clearInterval(timer);
      setProgress(100);
      setProgressStage(runSimulate ? "Đã chạy mô phỏng xong!" : "Đã duyệt thành công!");
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (res.success) {
        setAutoAllocateResult(res.data);
        if (!runSimulate && onRefresh) {
          onRefresh();
        }
      } else {
        alert(res.message || "Tự động phân bổ thất bại");
      }
    } catch (err) {
      clearInterval(timer);
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setAutoAllocating(false);
    }
  };

  // Auto-refresh khi user focus lại vào tab/window
  useEffect(() => {
    const handleFocus = () => {
      if (onRefresh) onRefresh();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [onRefresh]);

  // Fetch quotas from settings when component mounts
  useEffect(() => {
    const fetchQuotas = async () => {
      try {
        const data = await getScoringWeights();
        if (data.success) {
          if (data.data.faculties) {
            setFacultiesList(data.data.faculties);
          }
          if (data.data.value && data.data.value.quotas) {
            const settingsQuotas = data.data.value.quotas;
            const loadedFacultyQuotas = settingsQuotas.facultyQuotas || {};
            if (data.data.faculties) {
              data.data.faculties.forEach(fac => {
                const facVal = loadedFacultyQuotas[fac.name];
                if (facVal === undefined) {
                  loadedFacultyQuotas[fac.name] = { freshmen: 0, seniors: 0 };
                } else if (typeof facVal === 'object' && facVal !== null) {
                  loadedFacultyQuotas[fac.name] = {
                    freshmen: facVal.freshmen !== undefined ? Number(facVal.freshmen) : 0,
                    seniors: facVal.seniors !== undefined ? Number(facVal.seniors) : 0
                  };
                } else {
                  const numVal = Number(facVal) || 0;
                  loadedFacultyQuotas[fac.name] = {
                    freshmen: numVal,
                    seniors: numVal
                  };
                }
              });
            }
            const updated = {
              totalSlots: settingsQuotas.totalSlots !== undefined ? settingsQuotas.totalSlots : 1000,
              policy_priority: settingsQuotas.policy_priority !== undefined ? settingsQuotas.policy_priority : 0,
              freshmen: settingsQuotas.freshmen !== undefined ? settingsQuotas.freshmen : 60,
              seniors: settingsQuotas.seniors !== undefined ? settingsQuotas.seniors : 40,
              facultyQuotas: loadedFacultyQuotas,
              genderQuotas: settingsQuotas.genderQuotas || { male: 0, female: 0 },
            };
            setQuotas(updated);
            setModalQuotas(updated);
          }
        }
      } catch (error) {
        console.error("Error fetching quotas:", error);
      }
    };
    fetchQuotas();
  }, [regs]);

  // Fetch quotas for modal specifically when it opens to have fresh values and reset collapsed state
  useEffect(() => {
    if (isOpenAutoAllocateModal) {
      const fetchQuotasForModal = async () => {
        try {
          const data = await getScoringWeights();
          if (data.success) {
            if (data.data.faculties) {
              setFacultiesList(data.data.faculties);
            }
            if (data.data.value && data.data.value.quotas) {
              const settingsQuotas = data.data.value.quotas;
              const loadedFacultyQuotas = settingsQuotas.facultyQuotas || {};
              if (data.data.faculties) {
                data.data.faculties.forEach(fac => {
                  const facVal = loadedFacultyQuotas[fac.name];
                  if (facVal === undefined) {
                    loadedFacultyQuotas[fac.name] = { freshmen: 0, seniors: 0 };
                  } else if (typeof facVal === 'object' && facVal !== null) {
                    loadedFacultyQuotas[fac.name] = {
                      freshmen: facVal.freshmen !== undefined ? Number(facVal.freshmen) : 0,
                      seniors: facVal.seniors !== undefined ? Number(facVal.seniors) : 0
                    };
                  } else {
                    const numVal = Number(facVal) || 0;
                    loadedFacultyQuotas[fac.name] = {
                      freshmen: numVal,
                      seniors: numVal
                    };
                  }
                });
              }
              setModalQuotas({
                totalSlots: settingsQuotas.totalSlots !== undefined ? settingsQuotas.totalSlots : 1000,
                freshmen: settingsQuotas.freshmen !== undefined ? settingsQuotas.freshmen : 60,
                seniors: settingsQuotas.seniors !== undefined ? settingsQuotas.seniors : 40,
                facultyQuotas: loadedFacultyQuotas,
              });
            }
          }
        } catch (error) {
          console.error("Error fetching quotas for modal:", error);
        }
      };
      fetchQuotasForModal();
      setIsQuotasCollapsed(true);
      setFacultyDetailOpen(false);
    }
  }, [isOpenAutoAllocateModal]);

  const facultyOptions = useMemo(() => {
    const opts = [{ value: "All", label: "Tất cả khoa" }];
    const uniqueFaculties = [...new Set(regs.map(r => r.faculty).filter(Boolean))];
    uniqueFaculties.sort().forEach(fac => {
      opts.push({ value: fac, label: fac });
    });
    return opts;
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

      const matchesVision = filterVision === "All" || (reg.vision_status || "PENDING") === filterVision;

      const matchesFaculty = filterFaculty === "All" || reg.faculty === filterFaculty;

      return matchesSearch && matchesStatus && matchesYear && matchesScore && matchesGender && matchesGroup && matchesVision && matchesFaculty;
    })
    .sort((a, b) => {
      const aValid = a.vision_status === "VALID" ? 1 : 0;
      const bValid = b.vision_status === "VALID" ? 1 : 0;
      if (aValid !== bValid) {
        return bValid - aValid;
      }
      return (b.ai_score ?? 0) - (a.ai_score ?? 0);
    });

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
    "Chính sách": totalSlots,
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
    const emails = [...new Set(selected.map(r => r.email || r.student_email).filter(Boolean))];
    setShowBulkEmailModal(false);
    setComposeEmail({
      to: emails,
      subject: "",
      body: "",
      recipientCount: selected.length,
    });
  };

  // Handler xác thực lại ảnh Vision
  const handleValidateImages = async (regId) => {
    setValidatingId(regId);
    try {
      await validateRegistrationImages(regId);
      if (onRefresh) onRefresh();
      // Cập nhật selectedRegDetail nếu đang mở
      if (selectedRegDetail?.id === regId && onRefresh) {
        // onRefresh sẽ reload data, selectedRegDetail sẽ được cập nhật qua regs prop
      }
    } catch (err) {
      alert(err.message || "Xác thực ảnh thất bại");
    } finally {
      setValidatingId(null);
    }
  };

  // Handler đồng bộ Google Sheets
  const handleSyncSheets = async () => {
    const url = sheetUrl.trim();
    if (!url) {
      setSyncMsg({ type: 'error', text: 'Vui lòng nhập link Google Sheets!' });
      return;
    }
    if (!url.includes('docs.google.com/spreadsheets') && !/^[a-zA-Z0-9_-]{20,}$/.test(url)) {
      setSyncMsg({ type: 'error', text: 'URL không hợp lệ. Dán đúng link Google Sheets.' });
      return;
    }
    setIsSyncing(true);
    setSyncMsg(null);
    try {
      const res = await importFromGoogleSheets(url);
      setSyncMsg({ type: 'success', text: `Đồng bộ thành công ${res.data.success} hồ sơ!${res.data.failed > 0 ? ` (${res.data.failed} lỗi)` : ''}${res.data.visionValidation === 'processing' ? ' Đang xác thực ảnh...' : ''}` });
      setSheetUrl("");
      if (onImportSuccess) onImportSuccess();
      // Poll refresh để cập nhật vision_status sau khi background job xong
      triggerAutoRefresh();
    } catch (err) {
      setSyncMsg({ type: 'error', text: err.message || 'Đồng bộ thất bại!' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
      {/* KHỐI CHỨC NĂNG DỮ LIỆU ĐẦU VÀO */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-200">
        <h3 className="text-slate-800 font-medium text-sm mb-4 uppercase tracking-wider">Đồng bộ dữ liệu đăng ký</h3>
        <div className="grid grid-cols-8 gap-4 items-stretch">
          <div className="col-span-3 relative">
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => { setSheetUrl(e.target.value); setSyncMsg(null); }}
              disabled={isSyncing}
              placeholder="Nhập URL Google Sheets..."
              className="w-full h-full pl-4 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all bg-slate-50/50 disabled:opacity-60"
            />
          </div>

          <div className="col-span-1">
            <ModelimportCSV onImportSuccess={onImportSuccess} />
          </div>

          <button
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("All");
              setFilterYear("All");
              setFilterScore("All");
              setFilterGender("All");
              setFilterGroup("All");
              setFilterVision("All");
              setFilterFaculty("All");
              setSyncMsg(null);
            }}
            className="col-span-1 flex items-center justify-center px-1 py-3 bg-white text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-lg shadow-slate-100 font-bold text-xs whitespace-nowrap">
            <RefreshCw size={14} className="mr-1 flex-shrink-0" /> Reset
          </button>

          <button
            onClick={handleSyncSheets}
            disabled={isSyncing}
            className="col-span-1 flex items-center justify-center px-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 font-bold text-xs whitespace-nowrap">
            {isSyncing
              ? <><Loader2 size={14} className="mr-1 animate-spin" /> Đang đồng bộ...</>
              : <><RotateCw size={14} className="mr-1 flex-shrink-0" /> Đồng bộ</>}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="col-span-1 flex items-center justify-center px-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-xs whitespace-nowrap"
          >
            <Plus size={14} className="mr-1 flex-shrink-0" /> Thêm hồ sơ
          </button>

          <button
            onClick={() => setIsOpenAutoAllocateModal(true)}
            className="col-span-1 flex items-center justify-center px-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-xs whitespace-nowrap"
          >
            <Rocket size={14} className="mr-1 flex-shrink-0" /> Duyệt tự động
          </button>
        </div>

        {/* Thông báo kết quả đồng bộ */}
        {syncMsg && (
          <div className={`mt-3 flex items-center justify-between px-3 py-2 rounded-lg ${syncMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
            <div className="flex items-center gap-2 flex-1">
              <p className="text-xs font-semibold">
                {syncMsg.type === 'success' ? '✅ ' : '❌ '}{syncMsg.text}
              </p>
              {syncMsg.type === 'success' && (
                <button
                  onClick={() => { if (onRefresh) onRefresh(); }}
                  className="ml-3 flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 underline whitespace-nowrap"
                >
                  <RefreshCw size={11} /> Làm mới ngay
                </button>
              )}
            </div>
            <button
              onClick={() => setSyncMsg(null)}
              className={`p-1 rounded-full hover:bg-black/5 transition-colors ml-3 ${
                syncMsg.type === 'success' ? 'text-emerald-500 hover:text-emerald-700' : 'text-rose-500 hover:text-rose-700'
              }`}
              title="Đóng"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* KHỐI THỐNG KÊ DUNG LƯỢNG PHÒNG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(() => {
          const isCapacityFull = roomStats.available_now - (roomStats.pending_contracts_count || 0) <= 0;
          return (
            <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between transition-all ${
              isCapacityFull 
                ? 'bg-slate-50 border-slate-200 opacity-60 filter grayscale' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
            }`}>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider text-left ${
                  isCapacityFull ? 'text-slate-500' : 'text-blue-600'
                }`}>
                  Chỗ trống hiện tại
                </p>
                <p className={`text-xl font-black mt-0.5 text-left ${
                  isCapacityFull ? 'text-slate-700' : 'text-blue-900'
                }`}>
                  {roomStats.available_now} chỗ
                </p>
                <p className={`text-[10px] mt-0.5 text-left font-semibold ${
                  isCapacityFull ? 'text-amber-600' : 'text-blue-500'
                }`}>
                  {isCapacityFull 
                    ? `⚠️ Đã đặt trước bởi ${roomStats.pending_contracts_count || 0} hồ sơ chờ gán` 
                    : 'Sẵn sàng gán phòng ngay'
                  }
                </p>
              </div>
              <div className={`p-2 rounded-xl ${
                isCapacityFull ? 'bg-slate-200 text-slate-500' : 'bg-blue-200/50 text-blue-700'
              }`}>
                <BedDouble size={20} />
              </div>
            </div>
          );
        })()}

        <div 
          onClick={() => setIsOpenSkippedModal(true)}
          className="p-4 rounded-2xl border bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:border-purple-400 cursor-pointer hover:shadow-md flex items-center justify-between transition-all"
          title="Nhấn để xem danh sách hồ sơ bị bỏ qua và lý do"
        >
          <div>
            <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider text-left">Hồ sơ chờ duyệt</p>
            <p className="text-xl font-black text-purple-900 mt-0.5 text-left">{actualPendingCount} hồ sơ</p>
            {skippedPendingRegs.length > 0 ? (
              <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[9px] font-bold">
                ⚠️ Bị bỏ qua ({skippedPendingRegs.length})
              </span>
            ) : actualPendingCount > roomStats.available_now ? (
              <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 bg-rose-200 text-rose-800 rounded text-[9px] font-bold">
                <AlertTriangle size={9} /> Quá tải ({actualPendingCount - roomStats.available_now} chỗ)
              </span>
            ) : (
              <p className="text-[10px] text-purple-500 mt-0.5 text-left">KTX đáp ứng đủ</p>
            )}
          </div>
          <div className="bg-purple-200/50 p-2 rounded-xl text-purple-700">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-2xl border border-emerald-200 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1 text-left">Tỷ lệ sử dụng chỉ tiêu</p>
          {(() => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const approvedCount = regs.filter((reg) => {
              if (reg.status !== RegistrationStatus.APPROVED) return false;
              const createdDate = reg.created_at ? new Date(reg.created_at) : new Date();
              return createdDate >= thirtyDaysAgo;
            }).length;
            const pctUsed = totalSlots > 0 ? Math.min(100, Math.round((approvedCount / totalSlots) * 100)) : 0;
            return (
              <>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-base font-black text-emerald-900 leading-none">
                    {pctUsed}%
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium leading-none">{approvedCount} / {totalSlots} chỗ đã gán</span>
                </div>
                <div className="w-full bg-emerald-200/40 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${pctUsed}%` }}
                  ></div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* THANH TÌM KIẾM VÀ LỌC */}
      <FilterBar
        title="Bộ lọc dữ liệu đăng ký"
        filterContainerClass="grid grid-cols-9 gap-4 items-center"
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
            value: filterFaculty,
            onChange: (val) => handleFilterChange(setFilterFaculty, val),
            className: "w-full",
            options: facultyOptions
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
            value: filterGroup,
            onChange: (val) => handleFilterChange(setFilterGroup, val),
            className: "w-full",
            options: [
              { value: "All", label: "Tất cả nhóm" },
              { value: "Tân sinh viên", label: "Tân sinh viên" },
              { value: "Chính sách", label: "Chính sách" },
              { value: "Sinh viên khoá cũ", label: "Sinh viên khoá cũ" },
            ]
          },
          {
            value: filterVision,
            onChange: (val) => handleFilterChange(setFilterVision, val),
            className: "w-full",
            options: [
              { value: "All", label: "Tất cả ảnh" },
              { value: "VALID", label: "✅ Ảnh hợp lệ" },
              { value: "SUSPECT", label: "⚠️ Nghi ngờ" },
              { value: "INVALID", label: "❌ Không hợp lệ" },
              { value: "PENDING", label: "⏳ Chờ xử lý" },
              { value: "ERROR", label: "🔴 Lỗi xác thực" },
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
              className={`px-3 py-2 border text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${showCheckboxColumn
                ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
            >
              {showCheckboxColumn ? <CheckSquare size={13} /> : <Square size={13} />} {showCheckboxColumn ? 'Tắt chế độ chọn' : 'Chọn nhiều'}
            </button>
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
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${reg.ai_suggestion === AISuggestionType.RECOMMENDED
                    ? "bg-emerald-50 text-emerald-600"
                    : reg.ai_suggestion === AISuggestionType.CONSIDER
                      ? "bg-amber-50 text-amber-600"
                      : "bg-rose-50 text-rose-600"
                    }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${reg.ai_suggestion === AISuggestionType.RECOMMENDED ? "bg-emerald-500" : reg.ai_suggestion === AISuggestionType.CONSIDER ? "bg-amber-500" : "bg-rose-500"
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
                <div className="flex items-center gap-1 flex-wrap">
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight ${reg.status === RegistrationStatus.PENDING
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
                  <VisionBadge status={reg.vision_status} />
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
                    onClick={() => {
                      if (showCheckboxColumn && selectedRegs.size > 0) {
                        setShowBulkEmailModal(true);
                      } else {
                        setComposeEmail({
                          to: reg.email || reg.student_email || "",
                          subject: "",
                          body: "",
                          recipientCount: 1,
                        });
                      }
                    }}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title={showCheckboxColumn && selectedRegs.size > 0 ? "Gửi email hàng loạt" : "Gửi email thông báo"}
                  >
                    <Send size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (showCheckboxColumn && selectedRegs.size > 0) {
                        setBulkAction({ status: RegistrationStatus.APPROVED, ids: [...selectedRegs] });
                      } else {
                        setIsConfirming({ id: reg.id, status: RegistrationStatus.APPROVED });
                      }
                    }}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title={showCheckboxColumn && selectedRegs.size > 0 ? "Duyệt hàng loạt" : "Phê duyệt"}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (showCheckboxColumn && selectedRegs.size > 0) {
                        setBulkAction({ status: RegistrationStatus.REJECTED, ids: [...selectedRegs] });
                      } else {
                        setIsConfirming({ id: reg.id, status: RegistrationStatus.REJECTED });
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title={showCheckboxColumn && selectedRegs.size > 0 ? "Từ chối hàng loạt" : "Từ chối"}
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
      </div>

      {/* DETAIL MODAL */}
      {selectedRegDetail && (
        <ModalPortal>
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
                      <p className="text-slate-600 text-xs font-semibold mb-2">Điểm xét duyệt</p>
                      <p className="text-blue-900 font-black text-2xl">{selectedRegDetail.ai_score ?? 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                      <p className="text-slate-600 text-xs font-semibold mb-2">Nhóm</p>
                      <p className="text-purple-900 font-bold">{getGroupName(selectedRegDetail.year, selectedRegDetail.priority_reasons)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                      <p className="text-slate-600 text-xs font-semibold mb-2">Đề xuất</p>
                      <p
                        className={`font-bold ${selectedRegDetail.ai_suggestion === AISuggestionType.RECOMMENDED
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
                                • Nhóm: <span className="font-bold">{reasoning.basket}</span> - {reasoning.basket_name}
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
                    className={`inline-block px-1.5 py-0.5 rounded-md text-xs font-black uppercase tracking-tight ${selectedRegDetail.status === RegistrationStatus.PENDING
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

              {/* Evidence Images + Vision Results */}
              {(() => {
                let imgs = selectedRegDetail.evidence_images;
                if (typeof imgs === "string") {
                  try { imgs = JSON.parse(imgs); } catch { imgs = [imgs]; }
                }
                if (!Array.isArray(imgs)) imgs = imgs ? [imgs] : [];
                imgs = imgs.filter(Boolean);
                if (imgs.length === 0) return null;

                // Mỗi phần tử có thể là string URL hoặc object { url, status, vision_score, vision_reasons }
                const toThumbnailUrl = (url) => {
                  const match = (url || "").match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
                  return null;
                };

                const visionStatusCfg = {
                  VALID: { border: "border-emerald-400", badge: "bg-emerald-100 text-emerald-700", label: "✅ Hợp lệ" },
                  SUSPECT: { border: "border-amber-400", badge: "bg-amber-100 text-amber-700", label: "⚠️ Nghi ngờ" },
                  INVALID: { border: "border-rose-500", badge: "bg-rose-100 text-rose-700", label: "❌ Không hợp lệ" },
                  ERROR: { border: "border-orange-400", badge: "bg-orange-100 text-orange-700", label: "🔴 Lỗi" },
                };

                return (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-slate-800 font-medium text-sm uppercase tracking-wider">📸 Ảnh minh chứng</h4>
                      <div className="flex items-center gap-3">
                        <VisionBadge status={selectedRegDetail.vision_status} />
                        <button
                          onClick={() => handleValidateImages(selectedRegDetail.id)}
                          disabled={validatingId === selectedRegDetail.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                          {validatingId === selectedRegDetail.id
                            ? <><Loader2 size={12} className="animate-spin" /> Đang xác thực...</>
                            : <><ShieldCheck size={12} /> Xác thực lại ảnh</>}
                        </button>
                      </div>
                    </div>

                    {/* Cảnh báo nếu SUSPECT hoặc INVALID */}
                    {selectedRegDetail.vision_status === "SUSPECT" && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-xs font-semibold">
                        ⚠️ Ảnh minh chứng cần xem xét thêm. Vui lòng kiểm tra thủ công trước khi duyệt hồ sơ.
                      </div>
                    )}
                    {selectedRegDetail.vision_status === "INVALID" && (
                      <div className="mb-4 p-3 bg-rose-50 border border-rose-400 rounded-xl text-rose-800 text-xs font-semibold">
                        ❌ Ảnh minh chứng không hợp lệ. Sinh viên có thể đã nộp ảnh không đúng yêu cầu.
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {imgs.map((img, idx) => {
                        const isObj = typeof img === "object" && img !== null;
                        const url = isObj ? img.url : img;
                        const vStatus = isObj ? img.status : null;
                        const vReasons = isObj ? (img.vision_reasons || []) : [];
                        const thumbUrl = toThumbnailUrl(url);
                        const cfg = visionStatusCfg[vStatus];

                        return (
                          <div key={idx} className={`rounded-2xl border-2 overflow-hidden shadow-sm ${cfg ? cfg.border : "border-slate-200"}`}>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="relative group block">
                              {thumbUrl ? (
                                <img
                                  src={thumbUrl}
                                  alt={`Minh chứng ${idx + 1}`}
                                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                                />
                              ) : null}
                              <div style={{ display: thumbUrl ? "none" : "flex" }} className="w-full h-36 items-center justify-center bg-slate-100 text-xs text-blue-600 font-semibold p-2 text-center">
                                🖼️ Xem ảnh {idx + 1}
                              </div>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-bold">Mở Drive</span>
                              </div>
                            </a>
                            {/* Vision result cho từng ảnh */}
                            {vStatus && (
                              <div className="p-2 bg-white">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${cfg.badge}`}>{cfg.label}</span>
                                {vReasons.length > 0 && (
                                  <ul className="mt-1 space-y-0.5">
                                    {vReasons.map((r, i) => (
                                      <li key={i} className="text-[10px] text-slate-500 leading-tight">• {r}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="sticky bottom-0 bg-slate-100 px-6 py-4 flex items-center justify-between gap-3 border-t border-slate-200">
              <div className="flex gap-2 flex-wrap">
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
                <button
                  onClick={() => handleValidateImages(selectedRegDetail.id)}
                  disabled={validatingId === selectedRegDetail.id}
                  className="px-4 py-2 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center gap-2"
                >
                  {validatingId === selectedRegDetail.id
                    ? <><Loader2 size={16} className="animate-spin" /> Đang xác thực...</>
                    : <><ShieldCheck size={16} /> Xác thực lại ảnh</>}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedRegDetail(null)} className="px-4 py-2 text-slate-700 font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
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
              // Tự mở compose email nếu checkbox được chọn
              if (sendEmailOnApprove) {
                const reg = regs.find(r => r.id === isConfirming.id);
                const email = reg?.student_email || reg?.email || "";
                if (email) {
                  const tpl = EMAIL_TEMPLATES.APPROVED_REGISTRATION(reg || {});
                  setComposeEmail({ to: email, subject: tpl.subject, body: tpl.body });
                }
              }
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
      >
        {isConfirming?.status === RegistrationStatus.APPROVED && (
          <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sendEmailOnApprove}
              onChange={e => setSendEmailOnApprove(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-600"
            />
            <span className="text-sm text-slate-600">Gửi email thông báo cho sinh viên sau khi duyệt</span>
          </label>
        )}
      </ConfirmModal>

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
      {/* BULK ACTION CONFIRMATION (approve/reject nhiều) */}
      <ConfirmModal
        isOpen={!!bulkAction}
        onClose={() => setBulkAction(null)}
        onConfirm={async () => {
          if (!bulkAction) return;
          try {
            if (bulkAction.status === RegistrationStatus.APPROVED) {
              await Promise.all(bulkAction.ids.map(id => approveRegistration(id)));
            } else if (bulkAction.status === RegistrationStatus.REJECTED) {
              await Promise.all(bulkAction.ids.map(id => rejectRegistration(id, "Từ chối từ admin")));
            }
            setBulkAction(null);
            clearSelection();
            if (onRefresh) onRefresh();
          } catch (error) {
            alert(error.message || "Có lỗi xảy ra");
          }
        }}
        title={bulkAction?.status === RegistrationStatus.APPROVED ? "Duyệt hàng loạt?" : "Từ chối hàng loạt?"}
        confirmText={bulkAction?.status === RegistrationStatus.APPROVED ? "Duyệt tất cả" : "Từ chối tất cả"}
        icon={bulkAction?.status === RegistrationStatus.APPROVED ? CheckCircle2 : XCircle}
        iconBgColor={bulkAction?.status === RegistrationStatus.APPROVED ? "bg-emerald-100" : "bg-rose-100"}
        iconColor={bulkAction?.status === RegistrationStatus.APPROVED ? "text-emerald-600" : "text-rose-600"}
        confirmColor={bulkAction?.status === RegistrationStatus.APPROVED ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200" : "bg-rose-600 hover:bg-rose-700 focus:ring-rose-200"}
      >
        <p className="text-sm text-slate-600">
          Số hồ sơ được chọn: <span className="font-bold text-slate-900">{bulkAction?.ids?.length}</span>
        </p>
      </ConfirmModal>

      <EmailComposeModal
        isOpen={!!composeEmail}
        onClose={() => { setComposeEmail(null); clearSelection(); }}
        defaultTo={composeEmail?.to}
        defaultSubject={composeEmail?.subject}
        defaultBody={composeEmail?.body}
        recipientCount={composeEmail?.recipientCount > 1 ? composeEmail.recipientCount : undefined}
        templates={[
          EMAIL_TEMPLATES.APPROVED_REGISTRATION(),
          EMAIL_TEMPLATES.REJECTED_REGISTRATION(),
        ]}
        onSend={({ to, subject, body }) => {
          console.log("Gửi email:", { to, subject, body });
        }}
      />

      {/* MODAL: DUYỆT HỒ SƠ TỰ ĐỘNG */}
      {isOpenAutoAllocateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 flex flex-col max-h-[calc(100vh-64px)] overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="bg-blue-600 p-6 flex justify-between items-center rounded-t-3xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl text-white">
                  <Rocket size={20} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-white text-xl font-black text-left">Duyệt hồ sơ tự động</h2>
                  <p className="text-blue-100 text-xs text-left mt-0.5">Duyệt theo nhóm ưu tiên và điểm xét tuyển — tạo hợp đồng chờ gán phòng</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpenAutoAllocateModal(false);
                  setAutoAllocateResult(null);
                }}
                disabled={autoAllocating}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {autoAllocating ? (
                /* Loading State with Progress Bar */
                <div className="flex flex-col items-center justify-center py-16 space-y-8 px-8">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                      <Rocket size={28} className="animate-bounce" />
                    </div>
                  </div>

                  <div className="w-full max-w-md space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                      <span className="text-blue-600 animate-pulse text-left">{progressStage}</span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg text-sm">{progress}%</span>
                    </div>

                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out shadow-sm shadow-blue-500/20"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-center max-w-md">
                    <p className="text-xs text-slate-400 font-medium">
                      Vui lòng không đóng trình duyệt hoặc tải lại trang trong khi hệ thống đang xử lý dữ liệu.
                    </p>
                  </div>
                </div>
              ) : autoAllocateResult ? (
                /* Success/Result State */
                <div className="space-y-6">
                  {autoAllocateResult.isSimulation ? (
                    <>
                      <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4">
                        <div className="p-3 bg-amber-500 rounded-xl text-white">
                          <AlertTriangle size={24} />
                        </div>
                        <div className="space-y-1 text-left flex-1">
                          <h3 className="font-bold text-amber-900 text-base">Chế độ mô phỏng xét duyệt</h3>
                          <p className="text-sm text-amber-700 font-medium">
                            Đây là kết quả chạy thử nghiệm. Các hồ sơ dưới đây chưa được duyệt chính thức và không có thay đổi nào được ghi lại vào cơ sở dữ liệu.
                          </p>
                          <div className="grid grid-cols-3 gap-6 mt-4 pt-4 border-t border-amber-200/50">
                            <div>
                              <p className="text-xs text-amber-600 font-bold">Dự kiến duyệt</p>
                              <p className="text-2xl font-black text-amber-800">{autoAllocateResult.processed} hồ sơ</p>
                            </div>
                            <div>
                              <p className="text-xs text-amber-600 font-bold">Dồn chỉ tiêu</p>
                              <p className="text-2xl font-black text-blue-700">{autoAllocateResult.overflowAllocations?.length || 0} hồ sơ</p>
                            </div>
                            <div>
                              <p className="text-xs text-amber-600 font-bold">Bỏ qua do hết chỉ tiêu</p>
                              <p className="text-2xl font-black text-slate-600">{autoAllocateResult.skippedQuota || 0} hồ sơ</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Thanh điều chỉnh mô phỏng nhanh */}
                      <div className="p-4 bg-slate-50 border border-slate-250/60 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
                        <div className="flex items-center gap-2">
                          <Sliders size={16} className="text-blue-600" />
                          <span className="text-xs font-bold text-slate-700">Điều chỉnh nhanh mô phỏng:</span>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center flex-1 justify-start sm:justify-end">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={allowOverflow}
                              onChange={e => setAllowOverflow(e.target.checked)}
                              className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-700">Cho phép dồn chỉ tiêu thừa</span>
                          </label>
                          <button
                            onClick={() => handleRunAutoAllocate(true)}
                            disabled={autoAllocating}
                            className="px-4 py-2 text-white font-bold text-xs bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-100 flex items-center gap-1.5"
                          >
                            <RefreshCw size={12} className={autoAllocating ? "animate-spin" : ""} />
                            Chạy lại mô phỏng
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex items-start gap-4">
                      <div className="p-3 bg-emerald-500 rounded-xl text-white">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="space-y-1 text-left flex-1">
                        <h3 className="font-bold text-emerald-900 text-base">Hoàn thành duyệt hồ sơ thực tế!</h3>
                        <p className="text-sm text-emerald-700 font-medium">
                          Các hồ sơ đã được duyệt chính thức và đã được ghi nhận trong cơ sở dữ liệu. Hợp đồng sinh viên ở trạng thái chờ gán phòng đã được tạo thành công.
                        </p>
                        <div className="grid grid-cols-3 gap-6 mt-4 pt-4 border-t border-emerald-200/50">
                          <div>
                            <p className="text-xs text-emerald-600 font-bold">Đã duyệt</p>
                            <p className="text-2xl font-black text-emerald-800">{autoAllocateResult.processed} hồ sơ</p>
                          </div>
                          <div>
                            <p className="text-xs text-emerald-600 font-bold">Hợp đồng Chờ gán</p>
                            <p className="text-2xl font-black text-amber-700">{autoAllocateResult.processed} hồ sơ</p>
                          </div>
                          <div>
                            <p className="text-xs text-emerald-600 font-bold">Bỏ qua</p>
                            <p className="text-2xl font-black text-slate-600">{autoAllocateResult.skippedQuota || 0} hồ sơ</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chi tiết phân bổ chỉ tiêu theo nhóm đối tượng */}
                  {(() => {
                    const approvedFreshmen = autoAllocateResult.allocations?.filter(r => r.year === 1).length || 0;
                    const approvedSeniors = autoAllocateResult.allocations?.filter(r => r.year > 1).length || 0;
                    const quotaFreshmenSlots = Math.round((modalQuotas.freshmen / 100) * modalQuotas.totalSlots);
                    const quotaSeniorsSlots = Math.round((modalQuotas.seniors / 100) * modalQuotas.totalSlots);
                    const actualFreshmenPercent = ((approvedFreshmen / modalQuotas.totalSlots) * 100).toFixed(1);
                    const actualSeniorsPercent = ((approvedSeniors / modalQuotas.totalSlots) * 100).toFixed(1);

                    return (
                      <div className="space-y-3 text-left">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Tỷ lệ sử dụng chỉ tiêu thực tế (Sau mô phỏng)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Cột 1: Tân sinh viên */}
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                              <span className="font-black text-indigo-900 text-sm">1. Tân sinh viên (Năm 1)</span>
                              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                                Chỉ tiêu: {modalQuotas.freshmen}% (~{quotaFreshmenSlots} chỗ)
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-semibold text-slate-600">
                                <span>Tổng dự kiến duyệt:</span>
                                <span className="text-slate-900 font-bold">{approvedFreshmen} / {quotaFreshmenSlots} chỗ ({((approvedFreshmen / quotaFreshmenSlots) * 100).toFixed(1)}%)</span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="bg-indigo-600 h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(100, (approvedFreshmen / quotaFreshmenSlots) * 100)}%` }}
                                ></div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500 border-t border-slate-200/50">
                                <div>
                                  <span className="block text-[9px] text-slate-400 font-bold uppercase">Diện chính sách</span>
                                  <span className="font-bold text-slate-700">
                                    {autoAllocateResult.allocations?.filter(r => r.year === 1 && r.basket === 1).length || 0} SV
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[9px] text-slate-400 font-bold uppercase">Xét điểm thường</span>
                                  <span className="font-bold text-slate-700">
                                    {autoAllocateResult.allocations?.filter(r => r.year === 1 && r.basket === 2).length || 0} SV
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Cột 2: Sinh viên khóa cũ */}
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                              <span className="font-black text-emerald-900 text-sm">2. Sinh viên khóa cũ (Năm &gt; 1)</span>
                              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                Chỉ tiêu: {modalQuotas.seniors}% (~{quotaSeniorsSlots} chỗ)
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs font-semibold text-slate-600">
                                <span>Tổng dự kiến duyệt:</span>
                                <span className="text-slate-900 font-bold">{approvedSeniors} / {quotaSeniorsSlots} chỗ ({((approvedSeniors / quotaSeniorsSlots) * 100).toFixed(1)}%)</span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-600 h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(100, (approvedSeniors / quotaSeniorsSlots) * 100)}%` }}
                                ></div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500 border-t border-slate-200/50">
                                <div>
                                  <span className="block text-[9px] text-slate-400 font-bold uppercase">Diện chính sách</span>
                                  <span className="font-bold text-slate-700">
                                    {autoAllocateResult.allocations?.filter(r => r.year > 1 && r.basket === 1).length || 0} SV
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[9px] text-slate-400 font-bold uppercase">Xét điểm thường</span>
                                  <span className="font-bold text-slate-700">
                                    {autoAllocateResult.allocations?.filter(r => r.year > 1 && r.basket === 3).length || 0} SV
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dòng tổng quan tất cả chính sách */}
                        <div className="p-4 bg-slate-100/80 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex justify-between items-center">
                          <span>Tổng số sinh viên Diện Chính Sách trúng tuyển:</span>
                          <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg border border-rose-200 font-bold">
                            {autoAllocateResult.allocations?.filter(r => r.basket === 1).length || 0} sinh viên (chiếm {((autoAllocateResult.allocations?.filter(r => r.basket === 1).length || 0) / modalQuotas.totalSlots * 100).toFixed(1)}% chỉ tiêu KTX)
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Chi tiết hạn mức theo Khoa */}
                  {autoAllocateResult.overflowDetails && Object.keys(autoAllocateResult.overflowDetails).length > 0 && (
                    <div className="text-left border border-slate-200 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setFacultyDetailOpen(prev => !prev)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Chi tiết phân bổ chỉ tiêu theo Khoa</h4>
                        {facultyDetailOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                      </button>
                      {facultyDetailOpen && (
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(autoAllocateResult.overflowDetails).map(([facName, detail]) => {
                              const leftover = detail.leftover || 0;
                              const excess = detail.excess || 0;
                              return (
                                <div key={facName} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-900 text-sm">{facName}</span>
                                    <span className="text-[11px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                                      Chỉ tiêu: {detail.quota || "0 (Không giới hạn)"}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 text-center">
                                    <div className="bg-white p-1.5 rounded-xl border border-slate-100">
                                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Hồ sơ</span>
                                      <span className="font-bold text-xs text-slate-700">{detail.applied}</span>
                                    </div>
                                    <div className="bg-emerald-50/50 p-1.5 rounded-xl border border-emerald-100">
                                      <span className="block text-[9px] text-emerald-500 font-bold uppercase">Duyệt</span>
                                      <span className="font-bold text-xs text-emerald-700">{detail.approved}</span>
                                    </div>
                                    <div className="bg-blue-50/50 p-1.5 rounded-xl border border-blue-100">
                                      <span className="block text-[9px] text-blue-500 font-bold uppercase">Dư</span>
                                      <span className="font-bold text-xs text-blue-700">{leftover}</span>
                                    </div>
                                    <div className="bg-red-50/50 p-1.5 rounded-xl border border-red-100">
                                      <span className="block text-[9px] text-red-500 font-bold uppercase">Vượt</span>
                                      <span className="font-bold text-xs text-red-700">{excess}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Nhóm được dồn chỉ tiêu */}
                  {autoAllocateResult.overflowAllocations && autoAllocateResult.overflowAllocations.length > 0 && (
                    <div className="p-5 bg-blue-50/50 border border-blue-200/80 rounded-2xl text-left space-y-2">
                      <h5 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                        <Info size={16} /> Danh sách dồn chỉ tiêu ({autoAllocateResult.overflowAllocations.length} sinh viên)
                      </h5>
                      {(() => {
                        const approvedFreshmen = autoAllocateResult.allocations?.filter(r => r.year === 1).length || 0;
                        const approvedSeniors = autoAllocateResult.allocations?.filter(r => r.year > 1).length || 0;

                        const overflowFreshmen = autoAllocateResult.overflowAllocations?.filter(r => r.year === 1).length || 0;
                        const overflowSeniors = autoAllocateResult.overflowAllocations?.filter(r => r.year > 1).length || 0;

                        const quotaFreshmenSlots = Math.round((modalQuotas.freshmen / 100) * modalQuotas.totalSlots);
                        const quotaSeniorsSlots = Math.round((modalQuotas.seniors / 100) * modalQuotas.totalSlots);

                        const originalFreshmenLeftover = Math.max(0, quotaFreshmenSlots - (approvedFreshmen - overflowFreshmen));
                        const originalSeniorsLeftover = Math.max(0, quotaSeniorsSlots - (approvedSeniors - overflowSeniors));

                        return (
                          <div className="space-y-1 bg-blue-100/30 p-3.5 rounded-xl border border-blue-200/50">
                            <p className="text-xs text-blue-750 font-medium">
                              Các hồ sơ dưới đây đã vượt quá hạn mức ban đầu của nhóm học hoặc của khoa, nhưng được dồn chỉ tiêu thừa từ các nhóm/khoa khác sang để phê duyệt.
                            </p>
                            <p className="text-xs text-blue-800 font-bold leading-relaxed">
                              💡 Chi tiết dồn:
                              {overflowSeniors > 0 && ` Nhóm Tân sinh viên dư ${originalFreshmenLeftover} chỗ (${approvedFreshmen - overflowFreshmen}/${quotaFreshmenSlots}) -> đã tự động chuyển dồn duyệt cho ${overflowSeniors} sinh viên Khóa cũ.`}
                              {overflowFreshmen > 0 && ` Nhóm Sinh viên khóa cũ dư ${originalSeniorsLeftover} chỗ (${approvedSeniors - overflowSeniors}/${quotaSeniorsSlots}) -> đã tự động chuyển dồn duyệt cho ${overflowFreshmen} Tân sinh viên.`}
                            </p>
                          </div>
                        );
                      })()}
                      <div className="max-h-[160px] overflow-y-auto border border-blue-200/50 rounded-xl divide-y divide-blue-100/60 bg-white">
                        {autoAllocateResult.overflowAllocations.map((item, idx) => (
                          <div key={idx} className="p-3 flex justify-between items-center text-xs hover:bg-slate-50 transition-colors">
                            <div>
                              <span className="font-bold text-slate-800">{item.student_name}</span>
                              <span className="text-slate-400 font-mono ml-2">({item.student_id})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.basket === 1 && (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[9px] uppercase">
                                  Chính sách
                                </span>
                              )}
                              {item.basket === 2 && (
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-bold text-[9px] uppercase">
                                  Tân sinh viên
                                </span>
                              )}
                              {item.basket === 3 && (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[9px] uppercase">
                                  Khóa cũ
                                </span>
                              )}
                              <span className="text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">{item.faculty}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Danh sách đã duyệt */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                        Danh sách dự kiến duyệt ({autoAllocateResult.allocations?.length || 0} sinh viên)
                      </h4>
                    </div>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto bg-white shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã SV</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tên sinh viên</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Khoa</th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Đối tượng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {autoAllocateResult.allocations && autoAllocateResult.allocations.length > 0 ? (
                            autoAllocateResult.allocations.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-2.5 font-mono font-bold text-slate-700">{item.student_id}</td>
                                <td className="px-4 py-2.5 font-semibold text-slate-950">{item.student_name}</td>
                                <td className="px-4 py-2.5 text-slate-600">{item.faculty}</td>
                                <td className="px-4 py-2.5">
                                  {item.basket === 1 && (
                                    <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[9px] uppercase">
                                      Chính sách
                                    </span>
                                  )}
                                  {item.basket === 2 && (
                                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full font-bold text-[9px] uppercase">
                                      Tân sinh viên
                                    </span>
                                  )}
                                  {item.basket === 3 && (
                                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[9px] uppercase">
                                      Khóa cũ
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center py-6 text-sm text-slate-500 font-medium">Không có hồ sơ nào được duyệt.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Danh sách bị bỏ qua */}
                  {autoAllocateResult.skipped && autoAllocateResult.skipped.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-left">
                          Danh sách hồ sơ bị bỏ qua ({autoAllocateResult.skipped.length} sinh viên)
                        </h4>
                      </div>
                      <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[220px] overflow-y-auto bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã SV</th>
                              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tên sinh viên</th>
                              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Khoa</th>
                              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Đối tượng</th>
                              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Lý do</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-left">
                            {autoAllocateResult.skipped.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-2.5 font-mono font-bold text-slate-700">{item.student_id}</td>
                                <td className="px-4 py-2.5 font-semibold text-slate-900">{item.student_name}</td>
                                <td className="px-4 py-2.5 text-slate-600">{item.faculty}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.basket === 1
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : item.basket === 2 || item.year === 1
                                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    }`}>
                                    {item.basket === 1 ? "Chính sách" : (item.basket === 2 || item.year === 1 ? "Tân SV" : "Lưu SV")}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[9px] uppercase">
                                    {item.reason}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Initial/Ready State */
                <div className="space-y-6 text-left">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
                    <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-bold text-blue-900 text-sm text-left">Lưu ý quy trình duyệt tự động nâng cao</p>
                      <p className="text-xs text-blue-700 mt-0.5 text-left font-medium">
                        Bước 1 (tại đây): Duyệt hồ sơ theo Chỉ tiêu Khoa (nếu cấu hình) → tạo hợp đồng <strong>Chờ gán phòng</strong>.<br />
                        Bước 2: Vào <strong>Hợp đồng sinh viên</strong> → nhấn <strong>Gán tự động</strong> để xếp phòng thực tế.
                      </p>
                    </div>
                  </div>

                  {/* Cài đặt chế độ duyệt */}
                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 text-sm">Cài đặt chế độ duyệt tự động:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-500 cursor-pointer select-none transition-all shadow-sm">
                        <input
                          type="checkbox"
                          checked={simulate}
                          onChange={e => setSimulate(e.target.checked)}
                          className="w-5 h-5 rounded accent-blue-600 mt-0.5 cursor-pointer"
                        />
                        <div>
                          <span className="text-sm font-bold text-slate-800 block">Chạy thử nghiệm (Mô phỏng)</span>
                          <span className="text-xs text-slate-500 block mt-0.5">Hệ thống sẽ tính toán và hiển thị kết quả chi tiết, không thực hiện ghi hoặc thay đổi database.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-500 cursor-pointer select-none transition-all shadow-sm">
                        <input
                          type="checkbox"
                          checked={allowOverflow}
                          onChange={e => setAllowOverflow(e.target.checked)}
                          className="w-5 h-5 rounded accent-blue-600 mt-0.5 cursor-pointer"
                        />
                        <div>
                          <span className="text-sm font-bold text-slate-800 block">Cho phép dồn chỉ tiêu thừa</span>
                          <span className="text-xs text-slate-500 block mt-0.5">Sử dụng chỉ tiêu dư từ các nhóm/khoa đăng ký ít để bù đắp, phê duyệt thêm cho sinh viên các nhóm/khoa quá tải.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Collapsible Quota Editor */}
                  <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                    <button
                      type="button"
                      onClick={() => setIsQuotasCollapsed(!isQuotasCollapsed)}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors border-b border-slate-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <Settings size={18} className="text-blue-600 animate-spin-slow" />
                        <span className="text-sm font-bold text-slate-800">Điều chỉnh nhanh chỉ tiêu mô phỏng (Tùy chọn)</span>
                      </div>
                      {isQuotasCollapsed ? (
                        <span className="text-xs text-slate-500 font-bold flex items-center gap-1">Mở rộng <ChevronDown size={14} /></span>
                      ) : (
                        <span className="text-xs text-slate-500 font-bold flex items-center gap-1">Thu gọn <ChevronUp size={14} /></span>
                      )}
                    </button>

                    {!isQuotasCollapsed && (
                      <div className="p-5 space-y-4 bg-slate-50/30">
                        {/* Quota inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5 text-left">
                            <label className="block text-xs font-bold text-slate-650">Tổng chỉ tiêu KTX</label>
                            <input
                              type="number"
                              value={modalQuotas.totalSlots}
                              onChange={e => setModalQuotas(prev => ({ ...prev, totalSlots: parseInt(e.target.value) || 0 }))}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-50 outline-none text-xs font-bold"
                              min="1"
                            />
                          </div>
                          <div className="space-y-1.5 text-left">
                            <label className="block text-xs font-bold text-slate-650">Tân sinh viên (%)</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={modalQuotas.freshmen}
                                onChange={e => setModalQuotas(prev => ({ ...prev, freshmen: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 pr-6 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-50 outline-none text-xs font-bold"
                                min="0"
                                max="100"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                            </div>
                          </div>
                          <div className="space-y-1.5 text-left">
                            <label className="block text-xs font-bold text-slate-650">Khóa cũ (%)</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={modalQuotas.seniors}
                                onChange={e => setModalQuotas(prev => ({ ...prev, seniors: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 pr-6 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-50 outline-none text-xs font-bold"
                                min="0"
                                max="100"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                            </div>
                          </div>
                        </div>

                        {/* Ratio warning */}
                        {Math.abs(modalQuotas.freshmen + modalQuotas.seniors - 100) > 0.1 && (
                          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-1.5">
                            <AlertTriangle size={14} className="flex-shrink-0" />
                            Tổng tỷ lệ chỉ tiêu (Tân SV + Khóa cũ) phải bằng 100% (Hiện tại: {(modalQuotas.freshmen + modalQuotas.seniors).toFixed(1)}%)
                          </div>
                        )}

                        {/* Chỉ tiêu Giới tính trong Modal */}
                        <div className="border-t border-slate-200 pt-3.5 space-y-2">
                          <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-left">Chỉ tiêu theo Giới tính (Tùy chọn - Đặt bằng 0 nếu không giới hạn)</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                              <div className="text-left min-w-0 pr-2">
                                <span className="text-xs font-semibold text-slate-800 block">Sinh viên Nam</span>
                              </div>
                              <input
                                type="number"
                                value={modalQuotas.genderQuotas?.male === 0 ? "" : (modalQuotas.genderQuotas?.male || "")}
                                placeholder="Không giới hạn"
                                onChange={e => {
                                  const val = parseInt(e.target.value) || 0;
                                  setModalQuotas(prev => ({
                                    ...prev,
                                    genderQuotas: {
                                      ...(prev.genderQuotas || { male: 0, female: 0 }),
                                      male: val
                                    }
                                  }));
                                }}
                                className="w-24 px-1.5 py-0.5 border border-slate-200 rounded-lg text-[11px] font-bold text-center focus:ring-2 focus:ring-blue-50 outline-none bg-white"
                                min="0"
                              />
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                              <div className="text-left min-w-0 pr-2">
                                <span className="text-xs font-semibold text-slate-800 block">Sinh viên Nữ</span>
                              </div>
                              <input
                                type="number"
                                value={modalQuotas.genderQuotas?.female === 0 ? "" : (modalQuotas.genderQuotas?.female || "")}
                                placeholder="Không giới hạn"
                                onChange={e => {
                                  const val = parseInt(e.target.value) || 0;
                                  setModalQuotas(prev => ({
                                    ...prev,
                                    genderQuotas: {
                                      ...(prev.genderQuotas || { male: 0, female: 0 }),
                                      female: val
                                    }
                                  }));
                                }}
                                className="w-24 px-1.5 py-0.5 border border-slate-200 rounded-lg text-[11px] font-bold text-center focus:ring-2 focus:ring-blue-50 outline-none bg-white"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Faculty Quotas */}
                        {facultiesList && facultiesList.length > 0 && (
                          <div className="border-t border-slate-200 pt-3.5 space-y-2.5">
                            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-left">Chỉ tiêu theo Khoa (Tùy chọn - Đặt bằng 0 nếu không giới hạn)</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {facultiesList.map(fac => {
                                const quotaVal = modalQuotas.facultyQuotas?.[fac.name] || { freshmen: 0, seniors: 0 };
                                const currentVal = typeof quotaVal === 'object' && quotaVal !== null
                                  ? { freshmen: quotaVal.freshmen || 0, seniors: quotaVal.seniors || 0 }
                                  : { freshmen: Number(quotaVal) || 0, seniors: Number(quotaVal) || 0 };

                                return (
                                  <div key={fac.name} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                                    <div className="text-left flex-1 min-w-0 pr-2">
                                      <span className="text-xs font-semibold text-slate-800 block truncate">{fac.name}</span>
                                      <span className="inline-block text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                                        {fac.count} hồ sơ chờ ({fac.freshmenCount || 0} Tân SV, {fac.seniorsCount || 0} Lưu SV)
                                      </span>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                      <div className="flex flex-col items-center">
                                        <span className="text-[9px] text-slate-500 font-semibold mb-0.5">Tân SV</span>
                                        <input
                                          type="number"
                                          value={currentVal.freshmen === 0 ? "" : currentVal.freshmen}
                                          placeholder="0"
                                          onChange={e => {
                                            const val = parseInt(e.target.value) || 0;
                                            setModalQuotas(prev => {
                                              const current = prev.facultyQuotas?.[fac.name] || { freshmen: 0, seniors: 0 };
                                              const updated = typeof current === 'object' && current !== null
                                                ? { ...current }
                                                : { freshmen: Number(current) || 0, seniors: Number(current) || 0 };
                                              updated.freshmen = val;
                                              return {
                                                ...prev,
                                                facultyQuotas: {
                                                  ...prev.facultyQuotas,
                                                  [fac.name]: updated
                                                }
                                              };
                                            });
                                          }}
                                          className="w-16 px-1.5 py-0.5 border border-slate-200 rounded-lg text-[11px] font-bold text-center focus:ring-2 focus:ring-blue-50 outline-none bg-white"
                                          min="0"
                                        />
                                      </div>
                                      <div className="flex flex-col items-center">
                                        <span className="text-[9px] text-slate-500 font-semibold mb-0.5">Lưu SV</span>
                                        <input
                                          type="number"
                                          value={currentVal.seniors === 0 ? "" : currentVal.seniors}
                                          placeholder="0"
                                          onChange={e => {
                                            const val = parseInt(e.target.value) || 0;
                                            setModalQuotas(prev => {
                                              const current = prev.facultyQuotas?.[fac.name] || { freshmen: 0, seniors: 0 };
                                              const updated = typeof current === 'object' && current !== null
                                                ? { ...current }
                                                : { freshmen: Number(current) || 0, seniors: Number(current) || 0 };
                                              updated.seniors = val;
                                              return {
                                                ...prev,
                                                facultyQuotas: {
                                                  ...prev.facultyQuotas,
                                                  [fac.name]: updated
                                                }
                                              };
                                            });
                                          }}
                                          className="w-16 px-1.5 py-0.5 border border-slate-200 rounded-lg text-[11px] font-bold text-center focus:ring-2 focus:ring-blue-50 outline-none bg-white"
                                          min="0"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary statistics & Pending breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Thống kê hồ sơ chờ duyệt hiện tại</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Khoa áp dụng</span>
                        <span className="font-black text-slate-800 text-sm block mt-1">{filterFaculty === "All" ? "Tất cả các khoa" : filterFaculty}</span>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">1. Nhóm Chính sách</span>
                        <span className="font-black text-rose-600 text-lg block">
                          {filteredRegs.filter((reg) => reg.status === RegistrationStatus.PENDING && getRegBasket(reg) === 1).length} hồ sơ
                        </span>
                        <span className="text-[10px] text-slate-500 block">Xét duyệt ưu tiên thẳng</span>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">2. Tân sinh viên</span>
                        <span className="font-black text-indigo-600 text-lg block">
                          {filteredRegs.filter((reg) => reg.status === RegistrationStatus.PENDING && getRegBasket(reg) === 2).length} hồ sơ
                        </span>
                        <span className="text-[10px] text-slate-500 block">Chỉ tiêu: {modalQuotas.freshmen}% (~{Math.round((modalQuotas.freshmen / 100) * modalQuotas.totalSlots)} chỗ)</span>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">3. Sinh viên khóa cũ</span>
                        <span className="font-black text-emerald-600 text-lg block">
                          {filteredRegs.filter((reg) => reg.status === RegistrationStatus.PENDING && getRegBasket(reg) === 3).length} hồ sơ
                        </span>
                        <span className="text-[10px] text-slate-500 block">Chỉ tiêu: {modalQuotas.seniors}% (~{Math.round((modalQuotas.seniors / 100) * modalQuotas.totalSlots)} chỗ)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl space-y-4">
                    <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                      <Info size={16} /> Quy chế duyệt tự động nâng cao:
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-2 list-disc pl-5 font-medium">
                      <li><strong>Thứ tự ưu tiên:</strong> Nhóm chính sách → Tân SV năm 1 → SV khóa cũ, sắp xếp theo điểm xét tuyển giảm dần.</li>
                      <li><strong>Xét theo Khoa:</strong> Nếu một khoa được đặt chỉ tiêu lớn hơn 0, hệ thống sẽ giới hạn số sinh viên khoa đó trúng tuyển tương ứng.</li>
                      <li><strong>Chế độ dồn chỉ tiêu:</strong> Khi được bật, chỉ tiêu thừa từ các khoa ít hồ sơ sẽ tự động chuyển sang xét duyệt tiếp cho sinh viên khoa quá tải (theo thứ tự ưu tiên điểm số).</li>
                    </ul>
                  </div>

                  <p className="text-xs text-slate-500 font-bold text-center">
                    Bạn có chắc chắn muốn bắt đầu chạy quy trình duyệt tự động ở trên không?
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-between items-center rounded-b-3xl border-t border-slate-200 flex-shrink-0">
              {autoAllocateResult ? (
                autoAllocateResult.isSimulation ? (
                  <>
                    <button
                      onClick={() => setAutoAllocateResult(null)}
                      disabled={autoAllocating}
                      className="px-5 py-2.5 text-slate-700 font-bold text-xs bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-40"
                    >
                      Quay lại thiết lập
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsOpenAutoAllocateModal(false);
                          setAutoAllocateResult(null);
                        }}
                        disabled={autoAllocating}
                        className="px-5 py-2.5 text-slate-500 font-bold text-xs hover:text-slate-700 transition-all disabled:opacity-40"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        onClick={() => handleRunAutoAllocate(false)}
                        disabled={autoAllocating}
                        className="px-6 py-2.5 text-white font-bold text-xs bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 flex items-center gap-1.5 rounded-xl disabled:opacity-40"
                      >
                        {autoAllocating ? (
                          <><Loader2 size={13} className="animate-spin" /> Đang duyệt...</>
                        ) : (
                          <><Rocket size={13} /> Phê duyệt thực tế (Lưu DB)</>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 font-semibold text-left">Đã ghi nhận dữ liệu thật thành công.</p>
                    <button
                      onClick={() => {
                        setIsOpenAutoAllocateModal(false);
                        setAutoAllocateResult(null);
                        if (onRefresh) onRefresh();
                      }}
                      className="px-6 py-2.5 text-white font-bold text-xs bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                    >
                      Xác nhận & Đóng
                    </button>
                  </>
                )
              ) : (
                <>
                  <button
                    onClick={() => setIsOpenAutoAllocateModal(false)}
                    disabled={autoAllocating}
                    className="px-5 py-2.5 text-slate-700 font-bold text-xs bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-40"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={() => handleRunAutoAllocate(null)}
                    disabled={autoAllocating || filteredRegs.filter((reg) => reg.status === RegistrationStatus.PENDING).length === 0}
                    className="px-6 py-2.5 text-white font-bold text-xs bg-blue-600 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-100 flex items-center gap-1.5"
                  >
                    {autoAllocating ? (
                      <><Loader2 size={13} className="animate-spin" /> Đang xử lý...</>
                    ) : (
                      <><Rocket size={13} /> {simulate ? "Chạy mô phỏng" : "Duyệt thực tế"}</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DANH SÁCH HỒ SƠ BỊ BỎ QUA */}
      {isOpenSkippedModal && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 flex flex-col max-h-[calc(100vh-64px)] overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-800 p-6 flex justify-between items-center rounded-t-3xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl text-white">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="text-white text-xl font-black text-left">Hồ sơ bị bỏ qua trong lần duyệt tự động trước</h2>
                  <p className="text-slate-300 text-xs text-left mt-0.5">Danh sách các hồ sơ chưa được duyệt do hết chỉ tiêu hoặc hết giường</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpenSkippedModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {skippedPendingRegs.length > 0 ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Mã SV</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Tên sinh viên</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Khoa</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Đối tượng</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Lý do</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-left">
                      {skippedPendingRegs.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-700">{item.student_id}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-900">{item.student_name}</td>
                          <td className="px-4 py-2.5 text-slate-600">{item.faculty}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.priority_reasons && String(item.priority_reasons).trim() !== ""
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : item.year === 1
                                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}>
                              {item.priority_reasons && String(item.priority_reasons).trim() !== "" 
                                ? "Chính sách" 
                                : item.year === 1 
                                  ? "Tân SV" 
                                  : "Lưu SV"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[9px] uppercase">
                              {item.note}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 px-4 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Không có hồ sơ nào bị bỏ qua</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Hiện chưa ghi nhận hồ sơ nào bị bỏ qua do hết chỉ tiêu hoặc hết giường trong lần chạy duyệt tự động thực tế gần nhất.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end items-center rounded-b-3xl border-t border-slate-200 flex-shrink-0">
              <button
                onClick={() => setIsOpenSkippedModal(false)}
                className="px-6 py-2.5 text-white font-bold text-xs bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </>
  );
};

export default RegistrationList;

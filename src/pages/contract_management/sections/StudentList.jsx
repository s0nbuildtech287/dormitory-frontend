import React, { useState, useEffect, useMemo } from "react";
import { Search, Eye, Clock, CheckCircle2, XCircle, FileX, Trash2, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Mail, Send, Square, CheckSquare, RotateCcw, Rocket, Loader2, X, Info, AlertTriangle } from "lucide-react";
import { usePagination } from "../../../hooks/usePagination.js";
import { useSelection } from "../../../hooks/useSelection.js";
import Pagination from "../../../components/common/Pagination.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import FilterBar from "../../../components/common/FilterBar.jsx";
import EmailComposeModal, { EMAIL_TEMPLATES } from "../../../components/common/EmailComposeModal.jsx";
import { revertContract, autoAssignPendingContracts, assignRoom } from "../../../api/apiContract.js";
import { getRooms } from "../../../api/apiRoom.js";

const STATUS_CONFIG = {
  Pending: { label: "Chờ gán phòng", cls: "bg-amber-100 text-amber-700", icon: <Clock size={11} /> },
  Active: { label: "Đang nội trú", cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={11} /> },
  Expired: { label: "Hết hạn", cls: "bg-slate-100 text-slate-600", icon: <FileX size={11} /> },
  Terminated: { label: "Chấm dứt", cls: "bg-rose-100 text-rose-700", icon: <XCircle size={11} /> },
};

const AUDIENCE_CONFIG = {
  general: { label: "Phòng chung", cls: "bg-slate-100 text-slate-700 border border-slate-200" },
  freshmen: { label: "Tân sinh viên", cls: "bg-blue-100 text-blue-700 border border-blue-200" },
  returning_students: { label: "Lưu sinh viên", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
  international: { label: "Quốc tế", cls: "bg-violet-100 text-violet-700 border border-violet-200" },
  xung_kich: { label: "Xung kích", cls: "bg-rose-100 text-rose-700 border border-rose-200" },
};

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const hasAnyKeyword = (value, keywords = []) => {
  const text = normalizeText(value);
  return keywords.some((keyword) => text.includes(normalizeText(keyword)));
};

const POLICY_KEYWORDS = [
  "ho ngheo",
  "can ngheo",
  "thuong binh",
  "liet sy",
  "khuyet tat",
  "hoan canh kho khan dac biet",
  "vung sau",
  "vung xa",
  "hai dao",
  "vung co dieu kien kinh te dac biet kho khan",
  "giay xac nhan uu tien",
  "uu tien khac",
  "chinh sach",
];

const INTERNATIONAL_KEYWORDS = [
  "luu hoc sinh",
  "quoc te",
  "nuoc ngoai",
  "du hoc sinh",
  "du hoc",
  "lao",
  "campuchia",
];

const StudentList = ({ contracts = [], loading, onViewDetail, onRefresh, onDeleteContract, initialFilter }) => {
  const [searchTerm, setSearchTerm] = useState(initialFilter?.searchTerm || "");
  const [filterStatus, setFilterStatus] = useState(initialFilter?.filterStatus || "All");
  const [filterGender, setFilterGender] = useState(initialFilter?.filterGender || "All");
  const [filterCohort, setFilterCohort] = useState(initialFilter?.filterCohort || "All");
  const [filterFaculty, setFilterFaculty] = useState(initialFilter?.filterFaculty || "All");
  const [dateFrom, setDateFrom] = useState(initialFilter?.dateFrom || "");
  const [dateTo, setDateTo] = useState(initialFilter?.dateTo || "");
  // Track email sent locally (chưa dùng backend)
  const [emailSentSet, setEmailSentSet] = useState(new Set());

  // Apply initial filter when it changes
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.searchTerm !== undefined) setSearchTerm(initialFilter.searchTerm);
      if (initialFilter.filterStatus !== undefined) setFilterStatus(initialFilter.filterStatus);
      if (initialFilter.filterGender !== undefined) setFilterGender(initialFilter.filterGender);
      if (initialFilter.filterCohort !== undefined) setFilterCohort(initialFilter.filterCohort);
      if (initialFilter.filterFaculty !== undefined) setFilterFaculty(initialFilter.filterFaculty);
      if (initialFilter.dateFrom !== undefined) setDateFrom(initialFilter.dateFrom);
      if (initialFilter.dateTo !== undefined) setDateTo(initialFilter.dateTo);
    }
  }, [initialFilter]);

  const markEmailSent = (id) => setEmailSentSet((prev) => new Set([...prev, id]));

  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [bulkDeleteContracts, setBulkDeleteContracts] = useState([]);
  const [composeEmail, setComposeEmail] = useState(null);
  const [revertTarget, setRevertTarget] = useState(null); // contract to revert
  const [revertLoading, setRevertLoading] = useState(false);
  const [isOpenAutoAssignModal, setIsOpenAutoAssignModal] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [autoAssignResult, setAutoAssignResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");



  const facultyOptions = useMemo(() => {
    const opts = [{ value: "All", label: "Tất cả khoa" }];
    const uniqueFaculties = [...new Set(contracts.map(c => c.snapshot_faculty).filter(Boolean))];
    uniqueFaculties.sort().forEach(fac => {
      opts.push({ value: fac, label: fac });
    });
    return opts;
  }, [contracts]);

  const pendingContracts = contracts.filter((c) => {
    const isPending = c.status === "Pending";
    const matchesFaculty = filterFaculty === "All" || c.snapshot_faculty === filterFaculty;
    return isPending && matchesFaculty;
  });

  const getAssignmentStage = (percent) => {
    if (percent < 20) return "Khởi tạo danh sách phòng và hợp đồng chờ xếp...";
    if (percent < 40) return "Đang lọc theo giới tính và khoa/ngành học...";
    if (percent < 70) return "Đang tối ưu phân bổ (Phòng quốc tế / Tân SV / Khóa cũ)...";
    if (percent < 90) return "Đang cập nhật chỗ trống và tạo hồ sơ nội trú...";
    return "Đang hoàn tất...";
  };

  const handleRunAutoAssign = async () => {
    setAutoAssigning(true);
    setProgress(0);
    setProgressStage("Khởi tạo danh sách phòng và hợp đồng chờ xếp...");

    const estimatedDuration = Math.max(2000, pendingContracts.length * 15);
    const tickMs = 100;
    const increment = (tickMs / estimatedDuration) * 98;

    let currentProgress = 0;
    const timer = setInterval(() => {
      currentProgress = Math.min(98, currentProgress + increment);
      setProgress(Math.round(currentProgress));
      setProgressStage(getAssignmentStage(currentProgress));
    }, tickMs);

    try {
      const res = await autoAssignPendingContracts(filterFaculty !== "All" ? filterFaculty : null);
      clearInterval(timer);
      setProgress(100);
      setProgressStage("Đã gán phòng thành công!");
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (res.success) {
        setAutoAssignResult(res.data);
      } else {
        alert(res.message || "Gán phòng tự động thất bại");
      }
    } catch (err) {
      clearInterval(timer);
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setAutoAssigning(false);
    }
  };

  const filtered = contracts.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = (c.student_name?.toLowerCase().includes(q) ?? false) || (c.snapshot_student_id?.toLowerCase().includes(q) ?? false) || (c.contract_number?.toLowerCase().includes(q) ?? false);
    const matchStatus =
      filterStatus === "All" ? true :
        filterStatus === "Pending" ? c.status === "Pending" :
          filterStatus === "Active" ? c.status === "Active" :
            filterStatus === "Expired" ? c.status === "Expired" :
              filterStatus === "Terminated" ? c.status === "Terminated" :
                filterStatus === "deposit_paid" ? !!c.deposit_paid :
                  filterStatus === "deposit_unpaid" ? !c.deposit_paid :
                    filterStatus === "hardcopy_received" ? !!c.hard_copy_received :
                      filterStatus === "hardcopy_not" ? !c.hard_copy_received :
                        true;
    const matchGender = filterGender === "All" || c.snapshot_gender === filterGender;
    const cohortYear = Number(c.snapshot_year ?? c.rf_year);
    const priorityReasons = c.rf_priority_reasons || c.priority_reasons || "";
    const isPolicy = hasAnyKeyword(priorityReasons, POLICY_KEYWORDS);
    const isInternational = hasAnyKeyword(priorityReasons, INTERNATIONAL_KEYWORDS);
    const matchCohort =
      filterCohort === "All" ||
      (filterCohort === "freshmen" && cohortYear === 1) ||
      (filterCohort === "returning_students" && cohortYear >= 2) ||
      (filterCohort === "policy" && isPolicy) ||
      (filterCohort === "international" && isInternational);

    const matchFaculty = filterFaculty === "All" || c.snapshot_faculty === filterFaculty;

    const contractDate = c.created_at ? new Date(c.created_at) : null;
    const matchDateFrom = !dateFrom || (contractDate && contractDate >= new Date(dateFrom));
    const matchDateTo = !dateTo || (contractDate && contractDate <= new Date(dateTo + "T23:59:59"));

    return matchSearch && matchStatus && matchGender && matchCohort && matchFaculty && matchDateFrom && matchDateTo;
  });

  // Sắp xếp Chờ gán phòng lên đầu
  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aPending = a.status === "Pending" ? 1 : 0;
      const bPending = b.status === "Pending" ? 1 : 0;
      if (aPending !== bPending) {
        return bPending - aPending;
      }
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [filtered]);

  // Hooks
  const pagination = usePagination(sortedFiltered, 10);
  const { currentItems, totalItems } = pagination;
  const { 
    selectedItems: selectedContracts, 
    showCheckboxColumn, 
    toggleSelectionMode: handleToggleCheckbox, 
    handleSelectItem: handleSelectContract, 
    handleSelectAll, 
    clearSelection 
  } = useSelection(sortedFiltered.map(c => c.id));

  // Batch manual room allocation states
  const [isOpenManualAssignModal, setIsOpenManualAssignModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [isSavingManualAssign, setIsSavingManualAssign] = useState(false);
  const [manualAssignError, setManualAssignError] = useState(null);
  const [manualAssignSuccess, setManualAssignSuccess] = useState(false);

  const selectedPendingContracts = useMemo(() => {
    return contracts.filter(c => selectedContracts.has(c.id) && c.status === "Pending");
  }, [selectedContracts, contracts]);

  const handleOpenManualAssignModal = async () => {
    setIsOpenManualAssignModal(true);
    setLoadingRooms(true);
    setManualAssignError(null);
    setManualAssignSuccess(false);
    setSelectedBuilding("");
    setSelectedFloor("");
    setSelectedRoomId("");
    try {
      const res = await getRooms();
      if (res.success) {
        setRooms(res.data || []);
      }
    } catch (err) {
      console.error("Error loading rooms:", err);
      setManualAssignError("Không thể tải danh sách phòng");
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSaveManualAssign = async () => {
    if (!selectedRoomId) {
      setManualAssignError("Vui lòng chọn phòng");
      return;
    }
    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    if (!selectedRoom) {
      setManualAssignError("Không tìm thấy thông tin phòng");
      return;
    }
    const remainingSlots = selectedRoom.capacity - (selectedRoom.current_occupancy || 0);
    if (selectedPendingContracts.length > remainingSlots) {
      setManualAssignError(`Không đủ chỗ trống! Phòng còn ${remainingSlots} chỗ, nhưng bạn đã chọn ${selectedPendingContracts.length} sinh viên.`);
      return;
    }

    setIsSavingManualAssign(true);
    setManualAssignError(null);
    setManualAssignSuccess(false);

    try {
      const promises = selectedPendingContracts.map(c => assignRoom(c.id, selectedRoomId));
      await Promise.all(promises);
      
      setManualAssignSuccess(true);
      clearSelection();
      if (onRefresh) {
        await onRefresh();
      }
      setTimeout(() => {
        setIsOpenManualAssignModal(false);
      }, 1200);
    } catch (err) {
      console.error("Error batch manual assignment:", err);
      setManualAssignError(err.message || "Có lỗi xảy ra khi gán phòng. Vui lòng kiểm tra lại.");
    } finally {
      setIsSavingManualAssign(false);
    }
  };

  const selectedGenders = useMemo(() => {
    const genders = [...new Set(selectedPendingContracts.map(c => c.rf_gender || c.snapshot_gender).filter(Boolean))];
    return genders;
  }, [selectedPendingContracts]);

  const hasGenderMismatch = selectedGenders.length > 1;
  const studentGender = selectedGenders.length === 1 ? selectedGenders[0] : null;

  const genderMatchingRooms = useMemo(() => {
    if (!studentGender) return [];
    return rooms.filter(r => r.gender_type === studentGender && r.status === "Active");
  }, [rooms, studentGender]);

  const buildingOptions = useMemo(() => {
    const bSet = new Set(genderMatchingRooms.map(r => r.building).filter(Boolean));
    return [...bSet].sort();
  }, [genderMatchingRooms]);

  const floorOptions = useMemo(() => {
    if (!selectedBuilding) return [];
    const fSet = new Set(
      genderMatchingRooms
        .filter(r => r.building === selectedBuilding)
        .map(r => r.floor)
        .filter(Boolean)
    );
    return [...fSet].sort((a, b) => a - b);
  }, [genderMatchingRooms, selectedBuilding]);

  const roomOptions = useMemo(() => {
    if (!selectedBuilding || !selectedFloor) return [];
    return genderMatchingRooms
      .filter(r => r.building === selectedBuilding && r.floor === Number(selectedFloor))
      .sort((a, b) => String(a.room_number).localeCompare(String(b.room_number), undefined, { numeric: true }));
  }, [genderMatchingRooms, selectedBuilding, selectedFloor]);

  const handleBulkEmail = () => {
    if (selectedContracts.size === 0) {
      alert("Vui lòng chọn ít nhất một hợp đồng");
      return;
    }
    setShowBulkEmailModal(true);
  };

  const handleConfirmBulkEmail = () => {
    const selected = contracts.filter(c => selectedContracts.has(c.id));
    const emails = [...new Set(selected.map(c => c.email || c.student_email).filter(Boolean))];
    setShowBulkEmailModal(false);
    setComposeEmail({
      to: emails,
      subject: "",
      body: "",
      recipientCount: selected.length,
    });
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    pagination.goToPage(1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setFilterGender("All");
    setFilterCohort("All");
    setFilterFaculty("All");
    setDateFrom("");
    setDateTo("");
    pagination.goToPage(1);
  };

  const hasActiveFilter = searchTerm || filterStatus !== "All" || filterGender !== "All" || filterCohort !== "All" || filterFaculty !== "All" || dateFrom || dateTo;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filters */}
      <FilterBar
        title="Bộ lọc hợp đồng"
        search={{
          placeholder: "Tìm tên, mã SV, số HĐ...",
          value: searchTerm,
          onChange: (val) => handleFilterChange(setSearchTerm, val)
        }}
        customFilters={
          <>
            {/* Trạng thái (gộp cọc + bản cứng) */}
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
              className="flex-[2] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
            >
              <option value="All">Tất cả trạng thái</option>
              <optgroup label="— Trạng thái hợp đồng">
                <option value="Pending">Chờ gán phòng</option>
                <option value="Active">Đang nội trú</option>
                <option value="Expired">Hết hạn</option>
                <option value="Terminated">Chấm dứt</option>
              </optgroup>
              <optgroup label="— Tiền cọc">
                <option value="deposit_paid">Đã cọc</option>
                <option value="deposit_unpaid">Chưa cọc</option>
              </optgroup>
              <optgroup label="— Bản cứng hợp đồng">
                <option value="hardcopy_received">Đã có bản cứng</option>
                <option value="hardcopy_not">Chưa có bản cứng</option>
              </optgroup>
            </select>

            {/* Giới tính */}
            <select
              value={filterGender}
              onChange={(e) => handleFilterChange(setFilterGender, e.target.value)}
              className="flex-[2] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
            >
              <option value="All">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>

            {/* Xem nhanh theo nhóm */}
            <select
              value={filterCohort}
              onChange={(e) => handleFilterChange(setFilterCohort, e.target.value)}
              className="flex-[2] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
              title="Xem nhanh theo nhóm sinh viên"
            >
              <option value="All">Tất cả nhóm</option>
              <option value="freshmen">Tân sinh viên</option>
              <option value="returning_students">Lưu sinh viên</option>
              <option value="policy">Chính sách</option>
              <option value="international">Nước ngoài</option>
            </select>

            {/* Khoa */}
            <select
              value={filterFaculty}
              onChange={(e) => handleFilterChange(setFilterFaculty, e.target.value)}
              className="flex-[2] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
              title="Lọc theo khoa"
            >
              {facultyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Ngày từ */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFilterChange(setDateFrom, e.target.value)}
              className="flex-1 text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
              title="Ngày đăng ký HĐ từ"
            />

            {/* Ngày đến */}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleFilterChange(setDateTo, e.target.value)}
              className="flex-1 text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
              title="Ngày đăng ký HĐ đến"
            />
          </>
        }
        hasActiveFilter={hasActiveFilter}
        onReset={handleReset}
        actionButtons={
          <>
            <button
              onClick={() => pagination.goToPage(1)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-200 transition-colors"
            >
              Áp dụng
            </button>
            <button
              onClick={() => setIsOpenAutoAssignModal(true)}
              disabled={pendingContracts.length === 0}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-200 transition-colors flex items-center gap-1.5"
            >
              <Rocket size={13} /> Gán tự động ({pendingContracts.length})
            </button>
          </>
        }
      />



      {/* Table - giống room_management */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300 flex items-center justify-between">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider text-left">Bảng hợp đồng sinh viên ({totalItems} kết quả)</h3>
          
          <div className="flex items-center gap-2">
            {showCheckboxColumn && selectedContracts.size > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleBulkEmail}
                  className="px-3 py-2 bg-blue-50 border border-blue-200 text-blue-750 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Mail size={13} /> Gửi email ({selectedContracts.size})
                </button>
                <button
                  type="button"
                  onClick={() => setBulkDeleteContracts([...selectedContracts])}
                  className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-750 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Trash2 size={13} /> Xóa ({selectedContracts.size})
                </button>
                {selectedPendingContracts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenManualAssignModal}
                    className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-750 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-sm font-sans"
                  >
                    <Rocket size={13} /> Gán phòng thủ công ({selectedPendingContracts.length})
                  </button>
                )}
              </>
            )}

            {/* Toggle Checkbox Column Button */}
            <button
              onClick={handleToggleCheckbox}
              className={`px-3 py-2 border text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
                showCheckboxColumn 
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
              header: "Số / Mã HĐ",
              align: "center",
              width: showCheckboxColumn ? "w-[10%]" : "w-[11%]",
              accessor: (c) =>
                c.contract_number ? (
                  <span className="font-bold text-blue-700 text-xs font-mono">{c.contract_number}</span>
                ) : (
                  <span className="font-semibold text-slate-400 italic text-xs">Chưa có số</span>
                ),
            },
            {
              header: "Sinh viên",
              align: "center",
              width: "w-[18%]",
              accessor: (c) => (
                <>
                  <p className="font-semibold text-slate-900 text-xs truncate max-w-[150px] mx-auto">
                    {c.student_name || "—"}
                  </p>
                  {c.snapshot_student_id && (
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate max-w-[150px] mx-auto">
                      {c.snapshot_student_id}
                    </p>
                  )}
                </>
              ),
            },
            {
              header: "Phòng",
              align: "center",
              width: "w-[10%]",
              accessor: (c) => {
                if (!c.room_number) {
                  return <span className="text-amber-600 text-xs font-semibold italic">Chưa có phòng</span>;
                }
                const roomNum = c.room_number;
                let displayRoom = roomNum;
                if (typeof roomNum === "string" && roomNum.startsWith("room-")) {
                  const parts = roomNum.split("-");
                  if (parts.length >= 2) {
                    displayRoom = `Phòng ${parts[1]}`;
                  }
                }
                return (
                  <span className="font-semibold text-blue-700 text-xs whitespace-nowrap">
                    {displayRoom}
                    {c.building ? ` (${c.building})` : ""}
                  </span>
                );
              },
            },
            {
              header: "Trạng thái",
              align: "center",
              width: "w-[20%]",
              accessor: (c) => {
                const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.Active;
                return (
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${statusCfg.cls}`}>
                      {statusCfg.icon} {statusCfg.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${c.deposit_paid ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {c.deposit_paid ? "Đã cọc" : "Chưa cọc"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${c.hard_copy_received ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {c.hard_copy_received ? "Đã bản cứng" : "Chưa bản cứng"}
                    </span>
                  </div>
                );
              },
            },
            {
              header: "Thời hạn",
              align: "center",
              width: "w-[16%]",
              accessor: (c) =>
                c.start_date ? (
                  <span className="text-xs text-slate-700 font-semibold whitespace-nowrap">
                    {new Date(c.start_date).toLocaleDateString("vi-VN")} → {c.end_date ? new Date(c.end_date).toLocaleDateString("vi-VN") : "—"}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic">Chưa xác định</span>
                ),
            },
            {
              header: "Thao tác",
              align: "center",
              width: "w-[12%]",
              accessor: (c) => {
                const emailSent = emailSentSet.has(c.id) || !!c.email_sent_at;
                const isPending = c.status === "Pending";
                const canRevert = isPending && !c.deposit_paid && !c.hard_copy_received;
                return (
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => onViewDetail(c.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={isPending ? "Gán phòng" : "Xem chi tiết"}>
                      <Eye size={15} />
                    </button>
                    {canRevert && (
                      <button
                        onClick={() => setRevertTarget(c)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Hoàn tác – trả hồ sơ về danh sách đăng ký"
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (showCheckboxColumn && selectedContracts.size > 0) {
                          setShowBulkEmailModal(true);
                        } else {
                          setComposeEmail({
                            to: c.email || c.student_email || "",
                            subject: "",
                            body: "",
                          });
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${emailSent ? "text-slate-800 hover:bg-slate-100" : "text-blue-500 hover:bg-blue-50"}`}
                      title={showCheckboxColumn && selectedContracts.size > 0 ? "Gửi email hàng loạt" : emailSent ? `Đã gửi email${c.email_sent_at ? " " + new Date(c.email_sent_at).toLocaleDateString("vi-VN") : ""}` : "Gửi email thông báo"}
                    >
                      <Send size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (showCheckboxColumn && selectedContracts.size > 0) {
                          setBulkDeleteContracts([...selectedContracts]);
                        } else {
                          onDeleteContract(c.id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={showCheckboxColumn && selectedContracts.size > 0 ? "Xóa hàng loạt" : "Xóa hợp đồng"}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              },
            },
          ]}
          data={currentItems}
          keyExtractor={(c) => c.id}
          loading={loading}
          emptyState={{ icon: FileText, title: "Không có hợp đồng nào", description: "Thử thay đổi bộ lọc để tìm kiếm" }}
          selection={{
            selectedItems: selectedContracts,
            showCheckboxColumn,
            onSelectAll: handleSelectAll,
            onSelectRow: handleSelectContract,
          }}
          rowClassName={(c) => c.status === "Pending" ? "bg-amber-50/30" : ""}
        />
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} />

      {/* Bulk Email Confirmation Modal */}
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
          Số hợp đồng được chọn: <span className="font-bold text-slate-900">{selectedContracts.size}</span>
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Số email sẽ gửi: <span className="font-bold text-slate-900">
            {[...new Set(
              contracts
                .filter(c => selectedContracts.has(c.id))
                .map(c => c.student_email || c.email)
                .filter(Boolean)
            )].length} email
          </span>
        </p>
      </ConfirmModal>

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteContracts.length > 0}
        onClose={() => setBulkDeleteContracts([])}
        onConfirm={() => {
          bulkDeleteContracts.forEach(id => onDeleteContract(id));
          setBulkDeleteContracts([]);
          clearSelection();
        }}
        title="Xóa hàng loạt hợp đồng?"
        confirmText="Xóa tất cả"
        icon={Trash2}
        iconBgColor="bg-red-50"
        iconColor="text-red-600"
        confirmColor="bg-red-600 hover:bg-red-700 focus:ring-red-200"
      >
        <p className="text-sm text-slate-600">
          Số hợp đồng sẽ xóa: <span className="font-bold text-slate-900">{bulkDeleteContracts.length}</span>
        </p>
      </ConfirmModal>

      {/* Revert Contract Modal */}
      <ConfirmModal
        isOpen={!!revertTarget}
        onClose={() => setRevertTarget(null)}
        onConfirm={async () => {
          if (!revertTarget) return;
          setRevertLoading(true);
          try {
            await revertContract(revertTarget.id);
            setRevertTarget(null);
            if (onRefresh) onRefresh();
          } catch (err) {
            alert(err.message || "Hoàn tác thất bại");
          } finally {
            setRevertLoading(false);
          }
        }}
        title="Hoàn tác hợp đồng?"
        confirmText="Hoàn tác"
        icon={RotateCcw}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
        confirmColor="bg-amber-600 hover:bg-amber-700 focus:ring-amber-200"
        isLoading={revertLoading}
      >
        <p className="text-sm text-slate-600">
          Hợp đồng của <span className="font-bold text-slate-900">{revertTarget?.student_name}</span> sẽ bị xóa và hồ sơ đăng ký sẽ trở về trạng thái <span className="font-bold text-amber-700">Chờ duyệt</span>.
        </p>
        <p className="text-xs text-slate-400 mt-1">Tài khoản sinh viên cũng sẽ bị xóa. Hành động này không thể hoàn tác.</p>
      </ConfirmModal>

      <EmailComposeModal
        isOpen={!!composeEmail}
        onClose={() => { setComposeEmail(null); clearSelection(); }}
        defaultTo={composeEmail?.to}
        defaultSubject={composeEmail?.subject}
        defaultBody={composeEmail?.body}
        recipientCount={composeEmail?.recipientCount > 1 ? composeEmail.recipientCount : undefined}
        templates={[
          EMAIL_TEMPLATES.CONTRACT_CREATED(),
          EMAIL_TEMPLATES.DEPOSIT_CONFIRMED(),
          EMAIL_TEMPLATES.HARDCOPY_CONFIRMED(),
          EMAIL_TEMPLATES.APPROVED_REGISTRATION(),
        ]}
        onSend={({ to, subject, body }) => {
          console.log("Gửi email:", { to, subject, body });
        }}
      />

      {/* MODAL: GÁN PHÒNG TỰ ĐỘNG */}
      {isOpenAutoAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 flex flex-col max-h-[calc(100vh-64px)] overflow-hidden border border-slate-100">
            <div className="bg-blue-600 p-6 flex justify-between items-center rounded-t-3xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl text-white">
                  <Rocket size={20} />
                </div>
                <div>
                  <h2 className="text-white text-xl font-black text-left">Gán phòng tự động</h2>
                  <p className="text-blue-100 text-xs text-left mt-0.5">Xếp phòng cho hợp đồng chờ gán theo giới tính, diện SV và điểm xét tuyển</p>
                </div>
              </div>
              <button
                onClick={() => { setIsOpenAutoAssignModal(false); setAutoAssignResult(null); }}
                disabled={autoAssigning}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-all disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {autoAssigning ? (
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
                      Hệ thống đang tự động xếp phòng theo giới tính, diện sinh viên và tối ưu hóa vị trí phòng trống.
                    </p>
                  </div>
                </div>
              ) : autoAssignResult ? (
                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl">
                    <h3 className="font-bold text-emerald-900">Hoàn thành gán phòng!</h3>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-emerald-600 font-bold">Đã xử lý</p>
                        <p className="text-2xl font-black text-emerald-800">{autoAssignResult.processed}</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-bold">Gán thành công</p>
                        <p className="text-2xl font-black text-emerald-800">{autoAssignResult.assigned}</p>
                      </div>
                      <div>
                        <p className="text-xs text-amber-600 font-bold">Vẫn chờ gán</p>
                        <p className="text-2xl font-black text-amber-700">{autoAssignResult.stillPending}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[280px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-2 text-xs font-bold text-slate-500">MSSV</th>
                          <th className="px-4 py-2 text-xs font-bold text-slate-500">Tên</th>
                          <th className="px-4 py-2 text-xs font-bold text-slate-500">Phòng</th>
                          <th className="px-4 py-2 text-xs font-bold text-slate-500">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[...(autoAssignResult.allocations || [])].sort((a, b) => {
                          const aPending = a.status === "Pending" ? 1 : 0;
                          const bPending = b.status === "Pending" ? 1 : 0;
                          return bPending - aPending; // Sắp xếp Chờ gán lên đầu
                        }).map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-xs font-mono">{item.student_id}</td>
                            <td className="px-4 py-2 text-xs">{item.student_name}</td>
                            <td className="px-4 py-2 text-xs font-bold text-blue-600">{item.room_number}</td>
                            <td className="px-4 py-2 text-xs">
                              {item.status === "Active" ? (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Đang nội trú</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">Chờ gán</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 font-medium">
                      Có <strong>{pendingContracts.length}</strong> hợp đồng chờ gán phòng. Hệ thống sẽ tự động ghép và xếp phòng tối ưu theo các quy chế bên dưới.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                    <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2 mb-2"><Info size={14} /> Quy chế gán phòng tự động</h4>
                    <ul className="text-xs text-blue-800 space-y-1.5 list-disc pl-4">
                      <li>Cùng giới tính, còn chỗ trống.</li>
                      <li>Ưu tiên xếp sinh viên vào đúng phòng chuyên dụng đã cấu hình (Phòng quốc tế / Tân sinh viên / Khóa cũ).</li>
                      <li>Ưu tiên cao ghép các sinh viên <strong>cùng khoa học</strong> và <strong>cùng năm học/khóa học</strong> vào chung phòng.</li>
                      <li>Tự động gom nhóm các <strong>lưu học sinh / sinh viên quốc tế</strong> vào cùng phòng để tiện giao tiếp, sinh hoạt.</li>
                      <li>Hết phòng phù hợp → giữ trạng thái Chờ gán phòng.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200 rounded-b-3xl">
              {autoAssignResult ? (
                <button
                  onClick={() => {
                    setIsOpenAutoAssignModal(false);
                    setAutoAssignResult(null);
                    if (onRefresh) onRefresh();
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700"
                >
                  Xác nhận & Đóng
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsOpenAutoAssignModal(false)}
                    disabled={autoAssigning}
                    className="px-5 py-2.5 text-slate-700 text-xs font-bold bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleRunAutoAssign}
                    disabled={autoAssigning || pendingContracts.length === 0}
                    className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Rocket size={13} /> Bắt đầu gán phòng
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Batch Manual Assign Rooms ──────────────────────────── */}
      {isOpenManualAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Gán phòng thủ công hàng loạt</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Đang chọn gán cho <span className="font-bold text-indigo-600">{selectedPendingContracts.length}</span> sinh viên chờ gán phòng.
                </p>
              </div>
              <button 
                onClick={() => setIsOpenManualAssignModal(false)} 
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {manualAssignError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs font-semibold leading-relaxed animate-in slide-in-from-top-2 duration-250">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{manualAssignError}</span>
              </div>
            )}

            {manualAssignSuccess && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-700 text-xs font-semibold animate-in slide-in-from-top-2 duration-250">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-650" />
                <span>Đã gán phòng thành công cho các sinh viên!</span>
              </div>
            )}

            {/* Selection details */}
            <div className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-2">
                Danh sách sinh viên được chọn ({selectedPendingContracts.length})
              </span>
              <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1">
                {selectedPendingContracts.map(c => {
                  const isMale = (c.rf_gender || c.snapshot_gender) === "Nam";
                  return (
                    <div key={c.id} className="flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-[120px]">{c.student_name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isMale ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                      }`}>
                        {c.rf_gender || c.snapshot_gender || "Chung"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {hasGenderMismatch ? (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs font-bold leading-normal">
                <AlertTriangle size={18} className="shrink-0 text-rose-600" />
                <span>
                  Lỗi giới tính: Bạn đã chọn cả sinh viên Nam và Nữ. Hệ thống không thể gán sinh viên khác giới tính vào cùng một phòng. Vui lòng tắt chế độ chọn, lọc theo Giới tính và chỉ chọn các sinh viên cùng giới tính.
                </span>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2 text-blue-800 text-[11px] font-medium leading-normal">
                  <Info size={14} className="shrink-0 mt-0.5 text-blue-600" />
                  <span>
                    Hệ thống sẽ lọc các phòng hoạt động dành cho giới tính <strong>{studentGender || "Chung"}</strong>.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Select Building */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">1. Chọn Tòa nhà</label>
                    <select
                      value={selectedBuilding}
                      onChange={(e) => {
                        setSelectedBuilding(e.target.value);
                        setSelectedFloor("");
                        setSelectedRoomId("");
                      }}
                      disabled={loadingRooms || isSavingManualAssign}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-50 bg-white"
                    >
                      <option value="">-- Chọn tòa --</option>
                      {buildingOptions.map(b => (
                        <option key={b} value={b}>Tòa {b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Floor */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">2. Chọn Tầng</label>
                    <select
                      value={selectedFloor}
                      onChange={(e) => {
                        setSelectedFloor(e.target.value);
                        setSelectedRoomId("");
                      }}
                      disabled={!selectedBuilding || loadingRooms || isSavingManualAssign}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-50 bg-white disabled:opacity-50"
                    >
                      <option value="">-- Chọn tầng --</option>
                      {floorOptions.map(f => (
                        <option key={f} value={f}>Tầng {f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Select Room */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">3. Chọn Phòng</label>
                  {loadingRooms ? (
                    <div className="py-2.5 px-3 border border-slate-200 rounded-xl text-xs text-slate-450 flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" /> Đang tải danh sách phòng...
                    </div>
                  ) : (
                    <select
                      value={selectedRoomId}
                      onChange={(e) => {
                        setSelectedRoomId(e.target.value);
                        setManualAssignError(null);
                      }}
                      disabled={!selectedFloor || isSavingManualAssign}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-50 bg-white disabled:opacity-50"
                    >
                      <option value="">-- Chọn phòng trống --</option>
                      {roomOptions.map(r => {
                        const remaining = r.capacity - (r.current_occupancy || 0);
                        const isEnough = remaining >= selectedPendingContracts.length;
                        return (
                          <option 
                            key={r.id} 
                            value={r.id} 
                            disabled={!isEnough}
                            className={!isEnough ? "text-slate-400 italic" : "text-slate-850 font-bold"}
                          >
                            Phòng {r.room_number} ({remaining}/{r.capacity} chỗ trống - Đối tượng: {AUDIENCE_CONFIG[r.reserved_for]?.label || "Phòng chung"}) {!isEnough ? " - Không đủ chỗ" : ""}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpenManualAssignModal(false)}
                disabled={isSavingManualAssign}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveManualAssign}
                disabled={isSavingManualAssign || hasGenderMismatch || !selectedRoomId}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-150 disabled:opacity-40 flex items-center gap-1.5"
              >
                {isSavingManualAssign ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Đang gán...
                  </>
                ) : (
                  <>
                    <Rocket size={13} />
                    Xác nhận gán phòng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;



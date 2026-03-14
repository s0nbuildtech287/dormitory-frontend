import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShieldAlert,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  FileWarning,
  Gavel,
  BadgeDollarSign,
  TrendingUp,
  Send,
  Trash2,
} from "lucide-react";
import { usePagination } from "../../../hooks/usePagination.js";
import { useSelection } from "../../../hooks/useSelection.js";
import Pagination from "../../../components/common/Pagination.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import FilterBar from "../../../components/common/FilterBar.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import {
  createDisciplinaryRecord,
  deleteDisciplinaryRecord,
  getDisciplinaryRecords,
  updateDisciplinaryRecord,
} from "../../../api/apiDiscipline.js";
import { getContracts } from "../../../api/apiContract.js";

const LEVEL_CONFIG = {
  "Nhắc nhở": { color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  "Cảnh cáo": { color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  "Phạt tiền": { color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  "Đình chỉ tạm thời": { color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  "Buộc thôi ở": { color: "bg-rose-200 text-rose-800", dot: "bg-rose-700" },
};

const STATUS_CONFIG = {
  "Chờ xử lý": { color: "bg-amber-100 text-amber-700", icon: Clock },
  "Đã xử lý": { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  "Đã khiếu nại": { color: "bg-purple-100 text-purple-700", icon: FileWarning },
  "Đã hủy": { color: "bg-slate-100 text-slate-500", icon: XCircle },
};

const VIOLATION_TYPES = [
  "Vi phạm nội quy",
  "Gây mất trật tự",
  "Hư hại tài sản",
  "Vệ sinh kém",
  "Trốn phòng",
  "Nộp tiền trễ",
  "Sử dụng điện sai quy định",
  "Khác",
];

const LEVELS = ["Nhắc nhở", "Cảnh cáo", "Phạt tiền", "Đình chỉ tạm thời", "Buộc thôi ở"];
const STATUS_OPTIONS = ["Chờ xử lý", "Đã xử lý", "Đã khiếu nại", "Đã hủy"];

const formatCurrency = (value) => `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))}đ`;

const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return withTime ? date.toLocaleString("vi-VN") : date.toLocaleDateString("vi-VN");
};

const getStudentCode = (record) => record.student_id || record.user_id || "N/A";

const getRoomLabel = (record) => {
  if (!record.room_number) return "Chưa gán phòng";
  return `${record.building ? `${record.building}-` : ""}${record.room_number}`;
};

const LevelBadge = ({ level }) => {
  const cfg = LEVEL_CONFIG[level] || { color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {level}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: "bg-slate-100 text-slate-500", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.color}`}>
      <Icon size={11} />
      {status}
    </span>
  );
};

const DisciplineList = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSentSet, setEmailSentSet] = useState(new Set());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDisciplinaryRecords();
      setRecords(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching disciplinary records:", err);
      setRecords([]);
      setError(err.message || "Không tải được danh sách vi phạm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchSearch =
        !normalizedSearch ||
        record.student_name?.toLowerCase().includes(normalizedSearch) ||
        getStudentCode(record).toLowerCase().includes(normalizedSearch) ||
        getRoomLabel(record).toLowerCase().includes(normalizedSearch);

      const matchStatus = filterStatus === "All" || record.status === filterStatus;
      const matchLevel = filterLevel === "All" || record.disciplinary_level === filterLevel;
      const matchType = filterType === "All" || record.violation_type === filterType;

      return matchSearch && matchStatus && matchLevel && matchType;
    });
  }, [records, search, filterStatus, filterLevel, filterType]);

  const pagination = usePagination(filtered, 10);
  const { currentItems, totalItems } = pagination;
  const {
    selectedItems: selectedRecords,
    showCheckboxColumn,
    toggleSelectionMode: handleToggleCheckbox,
    handleSelectItem: handleSelectRecord,
    handleSelectAll,
    clearSelection,
  } = useSelection(filtered.map((record) => record.id));
  const hasFilter = search || filterStatus !== "All" || filterLevel !== "All" || filterType !== "All";

  const totalRecords = records.length;
  const pending = records.filter((record) => record.status === "Chờ xử lý").length;
  const unpaidPenalty = records.filter((record) => Number(record.penalty_amount) > 0 && !record.penalty_paid).length;
  const totalPenalty = records.reduce((sum, record) => sum + Number(record.penalty_amount || 0), 0);

  const stats = [
    { label: "Tổng vi phạm", value: totalRecords, icon: ShieldAlert, bg: "bg-red-100", text: "text-red-600" },
    { label: "Chờ xử lý", value: pending, icon: Clock, bg: "bg-amber-100", text: "text-amber-600" },
    { label: "Chưa nộp phạt", value: unpaidPenalty, icon: BadgeDollarSign, bg: "bg-orange-100", text: "text-orange-600" },
    { label: "Tổng tiền phạt", value: formatCurrency(totalPenalty), icon: TrendingUp, bg: "bg-purple-100", text: "text-purple-600" },
  ];

  const columns = [
    {
      header: "STT",
      accessor: (record) => {
        const index = currentItems.indexOf(record);
        return <span className="text-xs text-slate-400 font-bold">{(pagination.currentPage - 1) * 10 + index + 1}</span>;
      },
      width: "w-12",
    },
    {
      header: "Sinh viên",
      accessor: (record) => (
        <div>
          <p className="text-sm font-bold text-slate-900">{record.student_name || "Không rõ"}</p>
          <p className="text-xs text-slate-500">
            {getStudentCode(record)} • Phòng {getRoomLabel(record)}
          </p>
        </div>
      ),
    },
    {
      header: "Loại vi phạm",
      accessor: (record) => <span className="text-sm text-slate-700 font-medium">{record.violation_type}</span>,
    },
    {
      header: "Ngày vi phạm",
      accessor: (record) => <span className="text-xs text-slate-600">{formatDate(record.violation_date)}</span>,
    },
    {
      header: "Mức kỷ luật",
      accessor: (record) => <LevelBadge level={record.disciplinary_level} />,
    },
    {
      header: "Trạng thái",
      accessor: (record) => <StatusBadge status={record.status} />,
    },
    {
      header: "Hành động",
      accessor: (record) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setSelectedRecord(record)}
            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
            title="Xem chi tiết"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => {
              setEmailSentSet((prev) => new Set([...prev, record.id]));
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              emailSentSet.has(record.id) ? "text-slate-700 hover:bg-slate-100" : "text-blue-500 hover:bg-blue-50"
            }`}
            title={emailSentSet.has(record.id) ? "Đã gửi email" : "Gửi email"}
          >
            <Send size={15} />
          </button>
          <button
            onClick={async () => {
              setDeleteError("");
              setRecordToDelete(record);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa phiếu"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
      width: "w-28",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon size={20} className={stat.text} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <FilterBar
        title="Bộ lọc vi phạm"
        search={{
          placeholder: "Tìm sinh viên, mã SV, phòng...",
          value: search,
          onChange: (value) => setSearch(value),
        }}
        customFilters={
          <>
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="flex-[2] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
            >
              <option value="All">Tất cả trạng thái</option>
              <option>Chờ xử lý</option>
              <option>Đã xử lý</option>
              <option>Đã khiếu nại</option>
              <option>Đã hủy</option>
            </select>
            <select
              value={filterLevel}
              onChange={(event) => setFilterLevel(event.target.value)}
              className="flex-[2] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
            >
              <option value="All">Tất cả mức độ</option>
              {LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-200 transition-colors whitespace-nowrap"
            >
              <Plus size={14} /> Lập phiếu
            </button>
          </>
        }
        hasActiveFilter={hasFilter}
        onReset={() => {
          setSearch("");
          setFilterStatus("All");
          setFilterLevel("All");
          setFilterType("All");
        }}
        actionButtons={
          <div className="flex flex-wrap items-center gap-2">
            {["All", ...VIOLATION_TYPES].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filterType === type ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {type === "All" ? "Tất cả loại" : type}
              </button>
            ))}
          </div>
        }
      />

      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300 flex items-center justify-between">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider">
            Danh sách vi phạm kỷ luật ({filtered.length} bản ghi)
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleCheckbox}
              className={`px-3 py-2 border text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
                showCheckboxColumn ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Send size={13} /> {showCheckboxColumn ? "Tắt chế độ chọn" : "Chọn nhiều"}
            </button>
            {showCheckboxColumn && selectedRecords.size > 0 && (
              <button
                onClick={() => setShowBulkEmailModal(true)}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-amber-200 transition-colors flex items-center gap-1.5 animate-in fade-in duration-200"
              >
                <Send size={13} /> Gửi email ({selectedRecords.size})
              </button>
            )}
          </div>
        </div>

        <DataTable
          columns={columns}
          data={currentItems}
          keyExtractor={(record) => record.id}
          loading={loading}
          emptyState={{
            icon: ShieldAlert,
            title: error || "Không có vi phạm nào",
            description: error ? "Vui lòng kiểm tra backend hoặc token đăng nhập" : "Thử thay đổi bộ lọc để tìm kiếm",
          }}
          selection={{
            selectedItems: selectedRecords,
            showCheckboxColumn,
            onSelectAll: handleSelectAll,
            onSelectRow: handleSelectRecord,
          }}
          rowClassName={(record) => (record.status === "Chờ xử lý" ? "bg-amber-50/30 hover:bg-amber-50/60" : "hover:bg-slate-50/50")}
        />

        <div className="px-6 py-4 border-t border-slate-100">
          <Pagination pagination={pagination} totalItems={totalItems} itemsPerPage={10} />
        </div>
      </div>

      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdated={() => {
            setSelectedRecord(null);
            fetchRecords();
          }}
        />
      )}
      {showAddModal && (
        <AddRecordModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchRecords();
          }}
        />
      )}
      <ConfirmModal
        isOpen={showBulkEmailModal}
        onClose={() => setShowBulkEmailModal(false)}
        onConfirm={() => {
          setShowBulkEmailModal(false);
          clearSelection();
          alert(`Đã mô phỏng gửi email cho ${selectedRecords.size} phiếu.`);
        }}
        title="Xác nhận gửi email hàng loạt"
        confirmText="Gửi email"
        icon={Send}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
        confirmColor="bg-amber-600 hover:bg-amber-700 focus:ring-amber-200"
      >
        <p className="text-sm text-slate-600">
          Số phiếu được chọn: <span className="font-bold text-slate-900">{selectedRecords.size}</span>
        </p>
      </ConfirmModal>
      <ConfirmModal
        isOpen={!!recordToDelete}
        onClose={() => {
          setRecordToDelete(null);
          setDeleteError("");
        }}
        onConfirm={async () => {
          if (!recordToDelete) return;
          try {
            setDeleteLoading(true);
            setDeleteError("");
            await deleteDisciplinaryRecord(recordToDelete.id);
            setRecordToDelete(null);
            fetchRecords();
          } catch (err) {
            setDeleteError(err.message || "Xóa phiếu vi phạm thất bại");
          } finally {
            setDeleteLoading(false);
          }
        }}
        title="Xác nhận xóa phiếu"
        confirmText="Xóa phiếu"
        icon={Trash2}
        iconBgColor="bg-red-50"
        iconColor="text-red-600"
        confirmColor="bg-red-600 hover:bg-red-700 focus:ring-red-200"
        isLoading={deleteLoading}
      >
        <p className="text-sm text-slate-600">
          Bạn có chắc muốn xóa phiếu vi phạm <span className="font-bold text-slate-900">#{recordToDelete?.id}</span> không?
        </p>
        {deleteError && <p className="text-xs text-rose-600 font-semibold mt-2">{deleteError}</p>}
      </ConfirmModal>
    </div>
  );
};

const RecordDetailModal = ({ record, onClose, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState(record.penalty_amount ?? 0);
  const [penaltyPaid, setPenaltyPaid] = useState(Boolean(record.penalty_paid));
  const [scoreDeducted, setScoreDeducted] = useState(record.score_deducted ?? 0);
  const [disciplinaryLevel, setDisciplinaryLevel] = useState(record.disciplinary_level || LEVELS[0]);
  const [status, setStatus] = useState(record.status || STATUS_OPTIONS[0]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError("");

      await updateDisciplinaryRecord(record.id, {
        penalty_amount: Number(penaltyAmount || 0),
        penalty_paid: Boolean(penaltyPaid),
        score_deducted: Number(scoreDeducted || 0),
        disciplinary_level: disciplinaryLevel,
        status,
      });

      setIsEditing(false);
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error("Error updating disciplinary record:", err);
      setSaveError(err.message || "Không cập nhật được phiếu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-in scale-in duration-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 rounded-xl">
              <Gavel size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Chi tiết vi phạm</h3>
              <p className="text-xs text-slate-500">#{record.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <XCircle size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Thông tin sinh viên</p>
            {[
              ["Họ tên", record.student_name || "Không rõ"],
              ["Mã SV", getStudentCode(record)],
              ["Phòng", getRoomLabel(record)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm gap-4">
                <span className="text-slate-500">{label}</span>
                <span className="font-bold text-slate-900 text-right">{value}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-red-50 rounded-2xl space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-3">Thông tin vi phạm</p>
            {[
              ["Loại vi phạm", record.violation_type || "—"],
              ["Ngày vi phạm", formatDate(record.violation_date, true)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm gap-4">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-900 text-right">{value}</span>
              </div>
            ))}
          <div className="flex justify-between items-center text-sm gap-4">
            <span className="text-slate-500">Mức kỷ luật</span>
            {isEditing ? (
              <select
                value={disciplinaryLevel}
                onChange={(event) => setDisciplinaryLevel(event.target.value)}
                className="px-3 py-2 border border-red-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-red-200 bg-white"
              >
                {LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            ) : (
              <LevelBadge level={record.disciplinary_level} />
            )}
          </div>
          <div className="flex justify-between items-center text-sm gap-4">
            <span className="text-slate-500">Trạng thái</span>
            {isEditing ? (
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="px-3 py-2 border border-red-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-red-200 bg-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <StatusBadge status={record.status} />
            )}
          </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Mô tả vi phạm</p>
            <p className="text-sm text-slate-700 leading-relaxed">{record.description || "Chưa có mô tả"}</p>
          </div>

          <div className="p-4 bg-orange-50 rounded-2xl space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-orange-500">Điểm & tiền phạt</p>

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-600">Điểm bị trừ</span>
              {isEditing ? (
                <input
                  type="number"
                  min={0}
                  value={scoreDeducted}
                  onChange={(event) => setScoreDeducted(event.target.value)}
                  className="w-24 px-3 py-2 border border-orange-200 rounded-xl text-sm font-semibold text-right outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                />
              ) : (
                <span className="font-bold text-orange-700">{Number(record.score_deducted || 0)}</span>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-600">Tiền phạt</span>
              {isEditing ? (
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={penaltyAmount}
                  onChange={(event) => setPenaltyAmount(event.target.value)}
                  className="w-32 px-3 py-2 border border-orange-200 rounded-xl text-sm font-semibold text-right outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                />
              ) : (
                <span className="font-bold text-orange-600">
                  {Number(record.penalty_amount || 0) > 0 ? formatCurrency(record.penalty_amount) : "—"}
                </span>
              )}
            </div>

            {Number(penaltyAmount || record.penalty_amount || 0) > 0 && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-600">Trạng thái nộp</span>
                {isEditing ? (
                  <select
                    value={penaltyPaid ? "paid" : "unpaid"}
                    onChange={(event) => setPenaltyPaid(event.target.value === "paid")}
                    className="px-3 py-2 border border-orange-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                  >
                    <option value="unpaid">Chưa nộp</option>
                    <option value="paid">Đã nộp</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${record.penalty_paid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {record.penalty_paid ? "Đã nộp" : "Chưa nộp"}
                  </span>
                )}
              </div>
            )}

            {saveError && <p className="text-xs text-rose-600 font-semibold">{saveError}</p>}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AddRecordModal = ({ onClose, onCreated }) => {
  const [studentId, setStudentId] = useState("");
  const [userId, setUserId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [studentInfo, setStudentInfo] = useState("");
  const [searchingStudent, setSearchingStudent] = useState(false);
  const [violationType, setViolationType] = useState(VIOLATION_TYPES[0]);
  const [disciplinaryLevel, setDisciplinaryLevel] = useState(LEVELS[0]);
  const [penaltyAmount, setPenaltyAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [violationDate, setViolationDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSearchStudent = async () => {
    if (!studentId.trim()) {
      setSubmitError("Vui lòng nhập mã sinh viên để tìm.");
      return;
    }

    try {
      setSearchingStudent(true);
      setSubmitError("");
      setStudentInfo("");

      const response = await getContracts({ search: studentId.trim(), status: "Active" });
      const matches = Array.isArray(response?.data) ? response.data : [];

      if (matches.length === 0) {
        setSubmitError("Không tìm thấy sinh viên theo mã này.");
        setUserId("");
        setRoomId("");
        return;
      }

      const match = matches[0];
      setUserId(match.user_id || "");
      setRoomId(match.room_id || "");

      const labelParts = [
        match.student_name ? `SV: ${match.student_name}` : "",
        match.snapshot_student_id ? `Mã SV: ${match.snapshot_student_id}` : "",
        match.room_number ? `Phòng: ${match.building ? `${match.building}-` : ""}${match.room_number}` : "",
      ].filter(Boolean);

      setStudentInfo(labelParts.join(" • "));

      if (matches.length > 1) {
        setSubmitError("Tìm thấy nhiều kết quả, đã chọn kết quả đầu tiên.");
      }
    } catch (err) {
      console.error("Error searching student:", err);
      setSubmitError(err.message || "Không tìm được sinh viên.");
    } finally {
      setSearchingStudent(false);
    }
  };

  const handleSubmit = async () => {
    if (!userId.trim()) {
      setSubmitError("Vui lòng tìm sinh viên để lấy user_id.");
      return;
    }
    if (!description.trim()) {
      setSubmitError("Vui lòng nhập mô tả vi phạm.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      await createDisciplinaryRecord({
        user_id: userId.trim(),
        room_id: roomId.trim() || null,
        violation_type: violationType,
        violation_date: violationDate ? new Date(violationDate).toISOString() : new Date().toISOString(),
        description: description.trim(),
        disciplinary_level: disciplinaryLevel,
        penalty_amount: Number(penaltyAmount || 0),
      });

      if (onCreated) onCreated();
    } catch (err) {
      console.error("Error creating disciplinary record:", err);
      setSubmitError(err.message || "Không tạo được phiếu vi phạm");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in scale-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Plus size={18} className="text-red-600" /> Lập phiếu vi phạm
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
            <XCircle size={18} className="text-slate-400" />
          </button>
        </div>
        <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Mã sinh viên</label>
          <div className="flex gap-2">
            <input
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              placeholder="VD: 20210001"
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50"
            />
            <button
              onClick={handleSearchStudent}
              disabled={searchingStudent}
              className="px-3 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 disabled:opacity-60"
            >
              {searchingStudent ? "Đang tìm..." : "Tìm"}
            </button>
          </div>
          {studentInfo && <p className="text-xs text-emerald-600 font-semibold">{studentInfo}</p>}
          {userId && <p className="text-xs text-slate-500">user_id: {userId}</p>}
        </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Mã phòng (tùy chọn)</label>
            <input
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              placeholder="VD: room-001"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Ngày vi phạm</label>
            <input
              type="date"
              value={violationDate}
              onChange={(event) => setViolationDate(event.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Loại vi phạm</label>
              <select
                value={violationType}
                onChange={(event) => setViolationType(event.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50 bg-white"
              >
                {VIOLATION_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700">Mức kỷ luật</label>
              <select
                value={disciplinaryLevel}
                onChange={(event) => setDisciplinaryLevel(event.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50 bg-white"
              >
                {LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Tiền phạt (nếu có)</label>
            <input
              type="number"
              min={0}
              step={50000}
              value={penaltyAmount}
              onChange={(event) => setPenaltyAmount(event.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Mô tả vi phạm</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Mô tả chi tiết vi phạm..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50 resize-none"
            />
          </div>
          {submitError && <p className="text-xs text-rose-600 font-semibold">{submitError}</p>}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Đang lập..." : "Lập phiếu"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisciplineList;

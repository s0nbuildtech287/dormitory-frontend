import { useState, useMemo } from "react";
import {
  ShieldAlert, Plus, Eye, CheckCircle,
  Clock, XCircle, FileWarning, Gavel,
  BadgeDollarSign, TrendingUp
} from "lucide-react";
import { usePagination } from "../../../hooks/usePagination.js";
import Pagination from "../../../components/common/Pagination.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import FilterBar from "../../../components/common/FilterBar.jsx";

// ── Mock data đã xóa — dữ liệu sẽ load từ API ──────────────────────────────

// ── Config ───────────────────────────────────────────────────────────────────
const LEVEL_CONFIG = {
  "Nhắc nhở":          { color: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  "Cảnh cáo":          { color: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
  "Phạt tiền":         { color: "bg-orange-100 text-orange-700",dot: "bg-orange-500" },
  "Đình chỉ tạm thời": { color: "bg-red-100 text-red-700",      dot: "bg-red-500" },
  "Buộc thôi ở":       { color: "bg-rose-200 text-rose-800",    dot: "bg-rose-700" },
};

const STATUS_CONFIG = {
  "Chờ xử lý":   { color: "bg-amber-100 text-amber-700",    icon: Clock },
  "Đã xử lý":    { color: "bg-emerald-100 text-emerald-700",icon: CheckCircle },
  "Đã khiếu nại":{ color: "bg-purple-100 text-purple-700",  icon: FileWarning },
  "Đã hủy":      { color: "bg-slate-100 text-slate-500",    icon: XCircle },
};

const VIOLATION_TYPES = [
  "Vi phạm nội quy", "Gây mất trật tự", "Hư hại tài sản",
  "Vệ sinh kém", "Trốn phòng", "Nộp tiền trễ",
  "Sử dụng điện sai quy định", "Khác",
];

const LEVELS = ["Nhắc nhở", "Cảnh cáo", "Phạt tiền", "Đình chỉ tạm thời", "Buộc thôi ở"];

// ── Badges ───────────────────────────────────────────────────────────────────
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

// ── Main ─────────────────────────────────────────────────────────────────────
const DisciplineList = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const records = [];

  // Stats
  const totalRecords = records.length;
  const pending = records.filter((r) => r.status === "Chờ xử lý").length;
  const unpaidPenalty = records.filter((r) => r.penalty_amount > 0 && !r.penalty_paid).length;
  const totalPenalty = records.reduce((s, r) => s + (r.penalty_amount || 0), 0);

  const stats = [
    { label: "Tổng vi phạm",   value: totalRecords, icon: ShieldAlert,     bg: "bg-red-100",    text: "text-red-600" },
    { label: "Chờ xử lý",      value: pending,      icon: Clock,           bg: "bg-amber-100",  text: "text-amber-600" },
    { label: "Chưa nộp phạt",  value: unpaidPenalty,icon: BadgeDollarSign, bg: "bg-orange-100", text: "text-orange-600" },
    { label: "Tổng tiền phạt", value: new Intl.NumberFormat("vi-VN").format(totalPenalty) + "đ", icon: TrendingUp, bg: "bg-purple-100", text: "text-purple-600" },
  ];

  // Filter
  const filtered = useMemo(() => records.filter((r) => {
    const matchSearch = !search ||
      r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.student_id?.toLowerCase().includes(search.toLowerCase()) ||
      r.room_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    const matchLevel  = filterLevel  === "All" || r.disciplinary_level === filterLevel;
    const matchType   = filterType   === "All" || r.violation_type === filterType;
    return matchSearch && matchStatus && matchLevel && matchType;
  }), [records, search, filterStatus, filterLevel, filterType]);

  const pagination = usePagination(filtered, 10);
  const { currentItems, totalItems } = pagination;
  const hasFilter = search || filterStatus !== "All" || filterLevel !== "All" || filterType !== "All";

  const columns = [
    {
      header: "STT",
      accessor: (r) => {
        const idx = currentItems.indexOf(r);
        return <span className="text-xs text-slate-400 font-bold">{(pagination.currentPage - 1) * 10 + idx + 1}</span>;
      },
      width: "w-12",
    },
    {
      header: "Sinh viên",
      accessor: (r) => (
        <div>
          <p className="text-sm font-bold text-slate-900">{r.student_name}</p>
          <p className="text-xs text-slate-500">{r.student_id} • Phòng {r.room_number}</p>
        </div>
      ),
    },
    {
      header: "Loại vi phạm",
      accessor: (r) => <span className="text-sm text-slate-700 font-medium">{r.violation_type}</span>,
    },
    {
      header: "Ngày vi phạm",
      accessor: (r) => (
        <span className="text-xs text-slate-600">
          {new Date(r.violation_date).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      header: "Mức kỷ luật",
      accessor: (r) => <LevelBadge level={r.disciplinary_level} />,
    },
    {
      header: "Tiền phạt",
      accessor: (r) => r.penalty_amount > 0 ? (
        <div>
          <p className="text-sm font-bold text-orange-600">
            {new Intl.NumberFormat("vi-VN").format(r.penalty_amount)}đ
          </p>
          <p className={`text-[10px] font-bold ${r.penalty_paid ? "text-emerald-600" : "text-rose-500"}`}>
            {r.penalty_paid ? "Đã nộp" : "Chưa nộp"}
          </p>
        </div>
      ) : <span className="text-xs text-slate-400">—</span>,
    },
    {
      header: "Trạng thái",
      accessor: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: "",
      accessor: (r) => (
        <button
          onClick={() => setSelectedRecord(r)}
          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
        >
          <Eye size={15} />
        </button>
      ),
      width: "w-10",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <Icon size={20} className={s.text} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <FilterBar
        title="Bộ lọc vi phạm"
        search={{
          placeholder: "Tìm sinh viên, mã SV, phòng...",
          value: search,
          onChange: (val) => setSearch(val),
        }}
        customFilters={
          <>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-[2] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-red-50 text-slate-700 shadow-sm"
            >
              <option value="All">Tất cả trạng thái</option>
              <option>Chờ xử lý</option>
              <option>Đã xử lý</option>
              <option>Đã khiếu nại</option>
              <option>Đã hủy</option>
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="flex-[2] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-red-50 text-slate-700 shadow-sm"
            >
              <option value="All">Tất cả mức độ</option>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </>
        }
        hasActiveFilter={hasFilter}
        onReset={() => { setSearch(""); setFilterStatus("All"); setFilterLevel("All"); setFilterType("All"); }}
        actionButtons={
          <div className="flex flex-wrap gap-2">
            {["All", ...VIOLATION_TYPES].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filterType === t
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t === "All" ? "Tất cả loại" : t}
              </button>
            ))}
          </div>
        }
      />

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300 flex items-center justify-between">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider">
            Danh sách vi phạm kỷ luật ({filtered.length} bản ghi)
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold text-sm shadow-sm"
          >
            <Plus size={15} /> Lập phiếu
          </button>
        </div>

        <DataTable
          columns={columns}
          data={currentItems}
          isLoading={false}
          emptyMessage="Không có vi phạm nào"
          emptyIcon={<ShieldAlert size={40} className="text-slate-300" />}
          rowClassName={(r) => r.status === "Chờ xử lý" ? "bg-amber-50/30 hover:bg-amber-50/60" : "hover:bg-slate-50/50"}
        />

        <div className="px-6 py-4 border-t border-slate-100">
          <Pagination pagination={pagination} totalItems={totalItems} itemsPerPage={10} />
        </div>
      </div>

      {selectedRecord && <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
      {showAddModal && <AddRecordModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

// ── Detail Modal ─────────────────────────────────────────────────────────────
const RecordDetailModal = ({ record, onClose }) => (
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
          {[["Họ tên", record.student_name], ["Mã SV", record.student_id], ["Phòng", record.room_number]].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-slate-500">{k}</span>
              <span className="font-bold text-slate-900">{v}</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-red-50 rounded-2xl space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-3">Thông tin vi phạm</p>
          {[["Loại vi phạm", record.violation_type], ["Ngày vi phạm", new Date(record.violation_date).toLocaleString("vi-VN")]].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-slate-500">{k}</span>
              <span className="font-semibold text-slate-900">{v}</span>
            </div>
          ))}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Mức kỷ luật</span>
            <LevelBadge level={record.disciplinary_level} />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Trạng thái</span>
            <StatusBadge status={record.status} />
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Mô tả vi phạm</p>
          <p className="text-sm text-slate-700 leading-relaxed">{record.description}</p>
        </div>

        {record.penalty_amount > 0 && (
          <div className="p-4 bg-orange-50 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-1">Tiền phạt</p>
              <p className="text-xl font-black text-orange-600">
                {new Intl.NumberFormat("vi-VN").format(record.penalty_amount)}đ
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${record.penalty_paid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {record.penalty_paid ? "✓ Đã nộp" : "✗ Chưa nộp"}
            </span>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
          Đóng
        </button>
        <button className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
          Xử lý
        </button>
      </div>
    </div>
  </div>
);

// ── Add Modal ────────────────────────────────────────────────────────────────
const AddRecordModal = ({ onClose }) => (
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
          <label className="text-sm font-bold text-slate-700">Sinh viên vi phạm</label>
          <input placeholder="Tìm theo tên hoặc mã SV..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Loại vi phạm</label>
            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50 bg-white">
              {VIOLATION_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Mức kỷ luật</label>
            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50 bg-white">
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Tiền phạt (nếu có)</label>
          <input type="number" min={0} step={50000} placeholder="0" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Mô tả vi phạm</label>
          <textarea rows={3} placeholder="Mô tả chi tiết vi phạm..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-red-50 resize-none" />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
        <button className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">Lập phiếu</button>
      </div>
    </div>
  </div>
);

export default DisciplineList;

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronDown } from "lucide-react";
import Pagination from "../../../components/common/Pagination.jsx";
import { getActivityLogs } from "../../../api/apiLog.js";

const DATE_FILTERS = [
  { label: "Tất cả thời gian", value: "all" },
  { label: "Hôm nay",          value: "today" },
  { label: "7 ngày qua",       value: "7days" },
  { label: "30 ngày qua",      value: "30days" },
];

const ACTION_META = {
  // Xanh lá — tạo mới / phê duyệt
  APPROVE_REGISTRATION:   { label: "Phê duyệt hồ sơ",        cls: "bg-green-100 text-green-700" },
  CREATE_CONTRACT:        { label: "Tạo hợp đồng",            cls: "bg-green-100 text-green-700" },
  CREATE_INVOICE:         { label: "Tạo hóa đơn",             cls: "bg-green-100 text-green-700" },
  CREATE_NOTIFICATION:    { label: "Gửi thông báo",           cls: "bg-green-100 text-green-700" },
  CREATE_ROOM:            { label: "Tạo phòng",               cls: "bg-green-100 text-green-700" },
  CREATE_USER:            { label: "Tạo tài khoản",           cls: "bg-green-100 text-green-700" },
  CREATE_ASSET:           { label: "Thêm tài sản",            cls: "bg-green-100 text-green-700" },
  CREATE_FEEDBACK:        { label: "Tạo phản ánh",            cls: "bg-green-100 text-green-700" },
  IMPORT_REGISTRATIONS:   { label: "Nhập hồ sơ hàng loạt",   cls: "bg-green-100 text-green-700" },
  LOGIN:                  { label: "Đăng nhập",               cls: "bg-green-100 text-green-700" },
  // Đỏ — tiêu cực / kỷ luật / xóa
  REJECT_REGISTRATION:    { label: "Từ chối hồ sơ",           cls: "bg-red-100 text-red-700" },
  DELETE_REGISTRATION:    { label: "Xóa hồ sơ",               cls: "bg-red-100 text-red-700" },
  DELETE_CONTRACT:        { label: "Xóa hợp đồng",            cls: "bg-red-100 text-red-700" },
  DELETE_INVOICE:         { label: "Xóa hóa đơn",             cls: "bg-red-100 text-red-700" },
  DELETE_ROOM:            { label: "Xóa phòng",               cls: "bg-red-100 text-red-700" },
  DELETE_ASSET:           { label: "Xóa tài sản",             cls: "bg-red-100 text-red-700" },
  DELETE_USER:            { label: "Xóa tài khoản",           cls: "bg-red-100 text-red-700" },
  CREATE_DISCIPLINARY:    { label: "Lập phiếu kỷ luật",       cls: "bg-red-100 text-red-700" },
  UPDATE_DISCIPLINARY:    { label: "Cập nhật kỷ luật",        cls: "bg-red-100 text-red-700" },
  TERMINATE_CONTRACT:     { label: "Chấm dứt hợp đồng",       cls: "bg-red-100 text-red-700" },
  LOGOUT:                 { label: "Đăng xuất",               cls: "bg-red-100 text-red-700" },
  // Xanh dương — cập nhật / xử lý thông thường
  UPDATE_CONTRACT:        { label: "Cập nhật hợp đồng",       cls: "bg-blue-100 text-blue-700" },
  UPDATE_INVOICE:         { label: "Cập nhật hóa đơn",        cls: "bg-blue-100 text-blue-700" },
  RESOLVE_FEEDBACK:       { label: "Xử lý phản ánh",          cls: "bg-blue-100 text-blue-700" },
  UPDATE_FEEDBACK:        { label: "Cập nhật phản ánh",       cls: "bg-blue-100 text-blue-700" },
  UPDATE_ROOM:            { label: "Cập nhật phòng",          cls: "bg-blue-100 text-blue-700" },
  UPDATE_USER:            { label: "Cập nhật tài khoản",      cls: "bg-blue-100 text-blue-700" },
  UPDATE_REGISTRATION:    { label: "Cập nhật hồ sơ",          cls: "bg-blue-100 text-blue-700" },
  UPDATE_ASSET:           { label: "Cập nhật tài sản",        cls: "bg-blue-100 text-blue-700" },
  UPDATE_NOTIFICATION:    { label: "Cập nhật thông báo",      cls: "bg-blue-100 text-blue-700" },
  ASSIGN_ROOM:            { label: "Gán phòng",               cls: "bg-blue-100 text-blue-700" },
  REVERT_CONTRACT:        { label: "Hoàn tác hợp đồng",       cls: "bg-blue-100 text-blue-700" },
  UPDATE_SETTINGS:        { label: "Cập nhật cài đặt",        cls: "bg-blue-100 text-blue-700" },
  RECALCULATE_SCORES:     { label: "Tính lại Điểm xét duyệt",        cls: "bg-blue-100 text-blue-700" },
};

const ENTITY_LABEL = {
  register_forms:        "Hồ sơ đăng ký",
  invoices:              "Hóa đơn",
  student_contracts:     "Hợp đồng",
  notifications:         "Thông báo",
  feedbacks:             "Phản ánh",
  rooms:                 "Phòng",
  disciplinary_records:  "Kỷ luật",
  users:                 "Tài khoản",
  assets:                "Tài sản",
  settings:              "Cài đặt",
};

const formatTime = (iso) =>
  new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "2-digit", year: "numeric",
  });

const getDateRange = (range) => {
  const now = new Date();
  if (range === "today") {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    return { startDate: start.toISOString(), endDate: now.toISOString() };
  }
  if (range === "7days") {
    const start = new Date(now); start.setDate(start.getDate() - 7);
    return { startDate: start.toISOString(), endDate: now.toISOString() };
  }
  if (range === "30days") {
    const start = new Date(now); start.setDate(start.getDate() - 30);
    return { startDate: start.toISOString(), endDate: now.toISOString() };
  }
  return {};
};

const ActivityLog = () => {
  const [search, setSearch]             = useState("");
  const [filterAdmin, setFilterAdmin]   = useState("all");
  const [filterDate, setFilterDate]     = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [logs, setLogs]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [adminList, setAdminList] = useState([]);

  const actionList = Object.keys(ACTION_META);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const dateRange = getDateRange(filterDate);
      const res = await getActivityLogs({
        search:    search || undefined,
        action:    filterAction !== "all" ? filterAction : undefined,
        startDate: dateRange.startDate,
        endDate:   dateRange.endDate,
        page:      currentPage,
        limit:     itemsPerPage,
      });

      if (res.success) {
        const mapped = res.data.map(l => ({
          id:          l.id,
          admin:       l.user_name || "Không rõ",
          action:      l.action,
          entity_type: l.entity_type,
          entity_id:   l.entity_id,
          detail:      (() => {
            try {
              const nv = typeof l.new_value === 'string' ? JSON.parse(l.new_value) : l.new_value;
              return nv?.detail || l.action;
            } catch { return l.action; }
          })(),
          ip_address:  l.ip_address,
          created_at:  l.created_at,
        }));

        // Lọc theo admin ở client
        const filtered = filterAdmin === "all"
          ? mapped
          : mapped.filter(l => l.admin === filterAdmin);

        setLogs(filtered);
        setTotal(res.pagination?.total ?? filtered.length);

        // Cập nhật danh sách admin từ data thực
        setAdminList(prev => {
          const all = [...new Set([...prev, ...mapped.map(l => l.admin)])];
          return all;
        });
      } else {
        setLogs([]);
        setTotal(0);
      }
    } catch {
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, filterAdmin, filterDate, filterAction, currentPage, itemsPerPage]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const pagination = {
    currentPage,
    totalPages,
    totalItems: total,
    itemsPerPage,
    setItemsPerPage: (v) => { setItemsPerPage(v); setCurrentPage(1); },
    goToPage: setCurrentPage,
    nextPage: () => setCurrentPage(p => Math.min(p + 1, totalPages)),
    prevPage: () => setCurrentPage(p => Math.max(p - 1, 1)),
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Tìm kiếm theo nội dung, admin, mã đối tượng..."
            className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Filter admin */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <select
            value={filterAdmin}
            onChange={e => { setFilterAdmin(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm outline-none text-slate-700 cursor-pointer"
          >
            <option value="all">Tất cả admin</option>
            {adminList.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <ChevronDown size={14} className="text-slate-400 shrink-0" />
        </div>

        {/* Filter date */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <select
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm outline-none text-slate-700 cursor-pointer"
          >
            {DATE_FILTERS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <ChevronDown size={14} className="text-slate-400 shrink-0" />
        </div>

        {/* Filter action */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <select
            value={filterAction}
            onChange={e => { setFilterAction(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm outline-none text-slate-700 cursor-pointer"
          >
            <option value="all">Tất cả hành động</option>
            {actionList.map(a => (
              <option key={a} value={a}>{ACTION_META[a]?.label || a}</option>
            ))}
          </select>
          <ChevronDown size={14} className="text-slate-400 shrink-0" />
        </div>

        <span className="text-xs text-slate-400 ml-auto">{total} kết quả</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wide">
              <th className="px-5 py-3.5 text-left">Thời gian</th>
              <th className="px-5 py-3.5 text-left">Admin</th>
              <th className="px-5 py-3.5 text-left">Hành động</th>
              <th className="px-5 py-3.5 text-left">Đối tượng</th>
              <th className="px-5 py-3.5 text-left">Nội dung</th>
              <th className="px-5 py-3.5 text-left">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <Search size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-semibold">Không tìm thấy kết quả</p>
                </td>
              </tr>
            ) : logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                  {formatTime(log.created_at)}
                </td>
                <td className="px-5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                  {log.admin}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${ACTION_META[log.action]?.cls || "bg-blue-100 text-blue-700"}`}>
                    {ACTION_META[log.action]?.label || log.action}
                  </span>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="text-xs text-slate-500">{ENTITY_LABEL[log.entity_type] || log.entity_type}</div>
                  <div className="text-xs font-mono text-slate-400">{log.entity_id}</div>
                </td>
                <td className="px-5 py-3.5 text-slate-600 max-w-xs">
                  <p className="line-clamp-2">{log.detail}</p>
                </td>
                <td className="px-5 py-3.5 text-xs font-mono text-slate-400 whitespace-nowrap">
                  {log.ip_address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} />
    </div>
  );
};

export default ActivityLog;

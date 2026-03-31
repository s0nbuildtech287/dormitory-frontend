import { useState, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import Pagination from "../../../components/common/Pagination.jsx";

// Fake logs dựa theo schema log_system:
// action, entity_type, entity_id, old_value, new_value, user_id, ip_address, created_at
const FAKE_LOGS = [
  { id: "LOG001", admin: "Nguyễn Văn An",   action: "APPROVE_REGISTRATION",  entity_type: "register_forms",     entity_id: "RF2024001", detail: "Phê duyệt hồ sơ đăng ký của sinh viên Trần Thị Bình (SV2024001)", ip_address: "192.168.1.10", created_at: "2026-03-31T08:12:00" },
  { id: "LOG002", admin: "Lê Thị Hoa",      action: "CREATE_INVOICE",         entity_type: "invoices",           entity_id: "HD2026031", detail: "Tạo hóa đơn tháng 3/2026 cho phòng P301 - Tổng 1.250.000 VNĐ", ip_address: "192.168.1.11", created_at: "2026-03-31T08:45:00" },
  { id: "LOG003", admin: "Nguyễn Văn An",   action: "REJECT_REGISTRATION",    entity_type: "register_forms",     entity_id: "RF2024045", detail: "Từ chối hồ sơ đăng ký của sinh viên Phạm Văn Cường (SV2024045) - Không đủ điều kiện ưu tiên", ip_address: "192.168.1.10", created_at: "2026-03-31T09:10:00" },
  { id: "LOG004", admin: "Trần Minh Đức",   action: "UPDATE_ROOM",            entity_type: "rooms",              entity_id: "P301",      detail: "Cập nhật phòng P301 - Thay đổi sức chứa từ 4 lên 6 người", ip_address: "192.168.1.12", created_at: "2026-03-31T09:30:00" },
  { id: "LOG005", admin: "Lê Thị Hoa",      action: "CREATE_NOTIFICATION",    entity_type: "notifications",      entity_id: "NTF2026031",detail: "Gửi thông báo nhắc nhở đóng tiền phòng tháng 3 đến toàn bộ sinh viên", ip_address: "192.168.1.11", created_at: "2026-03-31T10:00:00" },
  { id: "LOG006", admin: "Trần Minh Đức",   action: "RESOLVE_FEEDBACK",       entity_type: "feedbacks",          entity_id: "FB2026031", detail: "Xử lý và đóng phản ánh #FB2026031 - Sửa chữa điều hòa phòng P205", ip_address: "192.168.1.12", created_at: "2026-03-31T10:22:00" },
  { id: "LOG007", admin: "Nguyễn Văn An",   action: "CREATE_CONTRACT",        entity_type: "student_contracts",  entity_id: "HD2026007", detail: "Tạo hợp đồng mới cho sinh viên Ngô Thị Dung - Phòng P402, kỳ 2026-2027", ip_address: "192.168.1.10", created_at: "2026-03-31T11:05:00" },
  { id: "LOG008", admin: "Phạm Thu Hằng",   action: "CREATE_DISCIPLINARY",    entity_type: "disciplinary_records",entity_id:"KL2026008", detail: "Lập phiếu kỷ luật cho sinh viên Lê Văn Em (SV2023112) - Vi phạm nội quy, về muộn giờ quy định", ip_address: "192.168.1.13", created_at: "2026-03-31T11:40:00" },
  { id: "LOG009", admin: "Lê Thị Hoa",      action: "UPDATE_INVOICE",         entity_type: "invoices",           entity_id: "HD2026031", detail: "Cập nhật trạng thái hóa đơn HD2026031 sang Đã thanh toán - Thu tiền mặt", ip_address: "192.168.1.11", created_at: "2026-03-31T13:15:00" },
  { id: "LOG010", admin: "Trần Minh Đức",   action: "CREATE_ROOM",            entity_type: "rooms",              entity_id: "P501",      detail: "Thêm phòng mới P501, P502, P503 vào hệ thống - Tầng 5 khu B", ip_address: "192.168.1.12", created_at: "2026-03-31T13:50:00" },
  { id: "LOG011", admin: "Nguyễn Văn An",   action: "APPROVE_REGISTRATION",   entity_type: "register_forms",     entity_id: "RF2024089", detail: "Phê duyệt hồ sơ đăng ký của sinh viên Hoàng Văn Phúc (SV2024089)", ip_address: "192.168.1.10", created_at: "2026-03-31T14:10:00" },
  { id: "LOG012", admin: "Phạm Thu Hằng",   action: "CREATE_NOTIFICATION",    entity_type: "notifications",      entity_id: "NTF2026032",detail: "Gửi thông báo lịch kiểm tra phòng định kỳ tháng 4 đến toàn bộ sinh viên", ip_address: "192.168.1.13", created_at: "2026-03-31T14:35:00" },
  { id: "LOG013", admin: "Lê Thị Hoa",      action: "DELETE_REGISTRATION",    entity_type: "register_forms",     entity_id: "RF2024102", detail: "Xóa hồ sơ đăng ký trùng lặp của sinh viên Vũ Thị Giang (SV2024102)", ip_address: "192.168.1.11", created_at: "2026-03-31T15:00:00" },
  { id: "LOG014", admin: "Trần Minh Đức",   action: "UPDATE_CONTRACT",        entity_type: "student_contracts",  entity_id: "HD2026014", detail: "Gia hạn hợp đồng cho 15 sinh viên hết hạn vào tháng 4/2026", ip_address: "192.168.1.12", created_at: "2026-03-31T15:20:00" },
  { id: "LOG015", admin: "Nguyễn Văn An",   action: "RESOLVE_FEEDBACK",       entity_type: "feedbacks",          entity_id: "FB2026028", detail: "Xử lý phản ánh #FB2026028 - Thay bóng đèn hành lang tầng 2", ip_address: "192.168.1.10", created_at: "2026-03-31T15:45:00" },
  { id: "LOG016", admin: "Phạm Thu Hằng",   action: "UPDATE_USER",            entity_type: "users",              entity_id: "USR011",    detail: "Cập nhật thông tin tài khoản admin Lê Thị Hoa - Đổi số điện thoại liên hệ", ip_address: "192.168.1.13", created_at: "2026-03-31T16:00:00" },
  { id: "LOG017", admin: "Lê Thị Hoa",      action: "CREATE_INVOICE",         entity_type: "invoices",           entity_id: "HD2026017", detail: "Tạo hóa đơn dịch vụ internet tháng 3/2026 cho 120 phòng", ip_address: "192.168.1.11", created_at: "2026-03-31T16:20:00" },
  { id: "LOG018", admin: "Trần Minh Đức",   action: "UPDATE_FEEDBACK",        entity_type: "feedbacks",          entity_id: "FB2026035", detail: "Đóng phản ánh #FB2026035 - Không đủ cơ sở xử lý, yêu cầu bổ sung thông tin", ip_address: "192.168.1.12", created_at: "2026-03-31T16:50:00" },
  { id: "LOG019", admin: "Nguyễn Văn An",   action: "UPDATE_DISCIPLINARY",    entity_type: "disciplinary_records",entity_id:"KL2026019", detail: "Nâng mức kỷ luật lên Cảnh cáo cho sinh viên Đinh Văn Hải (SV2022078) - Tái phạm lần 2", ip_address: "192.168.1.10", created_at: "2026-03-31T17:10:00" },
  { id: "LOG020", admin: "Phạm Thu Hằng",   action: "CREATE_NOTIFICATION",    entity_type: "notifications",      entity_id: "NTF2026033",detail: "Gửi thông báo kết quả xét duyệt đợt 1 tháng 4 đến 45 sinh viên đăng ký", ip_address: "192.168.1.13", created_at: "2026-03-31T17:30:00" },
];

const ADMINS = [...new Set(FAKE_LOGS.map(l => l.admin))];

const DATE_FILTERS = [
  { label: "Tất cả thời gian", value: "all" },
  { label: "Hôm nay",          value: "today" },
  { label: "7 ngày qua",       value: "7days" },
  { label: "30 ngày qua",      value: "30days" },
];

// action -> { label, color classes }
const ACTION_META = {
  // Xanh lá — tạo mới
  APPROVE_REGISTRATION:  { label: "Phê duyệt hồ sơ",      cls: "bg-green-100 text-green-700" },
  CREATE_CONTRACT:       { label: "Tạo hợp đồng",          cls: "bg-green-100 text-green-700" },
  CREATE_INVOICE:        { label: "Tạo hóa đơn",           cls: "bg-green-100 text-green-700" },
  CREATE_NOTIFICATION:   { label: "Gửi thông báo",         cls: "bg-green-100 text-green-700" },
  CREATE_ROOM:           { label: "Tạo phòng",             cls: "bg-green-100 text-green-700" },
  // Đỏ — tiêu cực / kỷ luật / xóa
  REJECT_REGISTRATION:   { label: "Từ chối hồ sơ",         cls: "bg-red-100 text-red-700" },
  DELETE_REGISTRATION:   { label: "Xóa hồ sơ",             cls: "bg-red-100 text-red-700" },
  CREATE_DISCIPLINARY:   { label: "Lập phiếu kỷ luật",     cls: "bg-red-100 text-red-700" },
  UPDATE_DISCIPLINARY:   { label: "Cập nhật kỷ luật",      cls: "bg-red-100 text-red-700" },
  // Xanh dương — cập nhật / bình thường
  UPDATE_CONTRACT:       { label: "Cập nhật hợp đồng",     cls: "bg-blue-100 text-blue-700" },
  UPDATE_INVOICE:        { label: "Cập nhật hóa đơn",      cls: "bg-blue-100 text-blue-700" },
  RESOLVE_FEEDBACK:      { label: "Xử lý phản ánh",        cls: "bg-blue-100 text-blue-700" },
  UPDATE_FEEDBACK:       { label: "Cập nhật phản ánh",     cls: "bg-blue-100 text-blue-700" },
  UPDATE_ROOM:           { label: "Cập nhật phòng",        cls: "bg-blue-100 text-blue-700" },
  UPDATE_USER:           { label: "Cập nhật tài khoản",    cls: "bg-blue-100 text-blue-700" },
};

const ENTITY_LABEL = {
  register_forms:       "Hồ sơ đăng ký",
  invoices:             "Hóa đơn",
  student_contracts:    "Hợp đồng",
  notifications:        "Thông báo",
  feedbacks:            "Phản ánh",
  rooms:                "Phòng",
  disciplinary_records: "Kỷ luật",
  users:                "Tài khoản",
};

const formatTime = (iso) =>
  new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "2-digit", year: "numeric",
  });

const isInRange = (iso, range) => {
  const d = new Date(iso);
  const now = new Date();
  if (range === "today") {
    return d.toDateString() === now.toDateString();
  }
  if (range === "7days") {
    return (now - d) / 86400000 <= 7;
  }
  if (range === "30days") {
    return (now - d) / 86400000 <= 30;
  }
  return true;
};

const ActivityLog = () => {
  const [search, setSearch]             = useState("");
  const [filterAdmin, setFilterAdmin]   = useState("all");
  const [filterDate, setFilterDate]     = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Danh sách action có trong data
  const availableActions = useMemo(() => [...new Set(FAKE_LOGS.map(l => l.action))], []);

  const filtered = useMemo(() => {
    return FAKE_LOGS.filter(log => {
      const matchSearch = search === "" ||
        log.detail.toLowerCase().includes(search.toLowerCase()) ||
        log.admin.toLowerCase().includes(search.toLowerCase()) ||
        log.entity_id.toLowerCase().includes(search.toLowerCase());
      const matchAdmin  = filterAdmin  === "all" || log.admin  === filterAdmin;
      const matchDate   = isInRange(log.created_at, filterDate);
      const matchAction = filterAction === "all" || log.action === filterAction;
      return matchSearch && matchAdmin && matchDate && matchAction;
    });
  }, [search, filterAdmin, filterDate, filterAction]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const pagination = {
    currentPage: safePage,
    totalPages,
    totalItems: filtered.length,
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
            {ADMINS.map(a => <option key={a} value={a}>{a}</option>)}
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
            {availableActions.map(a => (
              <option key={a} value={a}>{ACTION_META[a]?.label || a}</option>
            ))}
          </select>
          <ChevronDown size={14} className="text-slate-400 shrink-0" />
        </div>

        <span className="text-xs text-slate-400 ml-auto">{filtered.length} kết quả</span>
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
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <Search size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-semibold">Không tìm thấy kết quả</p>
                </td>
              </tr>
            ) : paginated.map(log => (
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

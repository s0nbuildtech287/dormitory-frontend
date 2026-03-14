import { useState, useMemo } from "react";
import { Building2, Wrench, SlidersHorizontal, Info, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Search, Save, RotateCcw } from "lucide-react";
import { updateRoom } from "../../../api/apiRoom.js";

// ─── Toggle switch helper ──────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
    <div
      className="w-11 h-6 bg-slate-300 rounded-full peer peer-focus:ring-4 peer-focus:ring-amber-100
            peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px]
            after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
            peer-checked:after:translate-x-full"
    />
  </label>
);

// ─── Section accordion wrapper ────────────────────────────────────────────────
const Section = ({ id, expanded, onToggle, icon: Icon, iconBg, iconColor, title, subtitle, children }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
    <button onClick={() => onToggle(id)} className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon size={24} className={iconColor} />
        </div>
        <div className="text-left">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
      </div>
      {expanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
    </button>
    {expanded && <div className="px-8 pb-8 border-t border-slate-100 space-y-6">{children}</div>}
  </div>
);

// ─── Status badge helper ───────────────────────────────────────────────────────
const StatusBadge = ({ room }) => {
  if (room.status === "Maintenance") return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase">Bảo trì</span>;
  if ((room.currentOccupancy || 0) >= room.capacity) return <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black uppercase">Đã đầy</span>;
  if ((room.currentOccupancy || 0) > 0) return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase">Đang ở</span>;
  return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase">Trống</span>;
};

// ═══════════════════════════════════════════════════════════════════════════════
const RoomSettings = ({ rooms = [], onRefresh }) => {
  const [expandedSection, setExpandedSection] = useState("buildings");
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "success" | "error"

  // ── Section 1: Tổng quan Tòa (read-only + editable display names) ─────────
  const buildingSummary = useMemo(() => {
    const map = {};
    (Array.isArray(rooms) ? rooms : []).forEach((r) => {
      const b = r.building || "?";
      if (!map[b]) map[b] = { id: b, displayName: `Tòa ${b}`, rooms: 0, capacity: 0, occupancy: 0 };
      map[b].rooms++;
      map[b].capacity += r.capacity || 0;
      map[b].occupancy += r.currentOccupancy || 0;
    });
    return Object.values(map).sort((a, b) => a.id.localeCompare(b.id));
  }, [rooms]);

  const [buildingNames, setBuildingNames] = useState({});
  const getDisplayName = (id) => buildingNames[id] ?? `Tòa ${id}`;

  // ── Section 2: Bảo trì phòng ──────────────────────────────────────────────
  const [maintSearch, setMaintSearch] = useState("");
  const [maintBuilding, setMaintBuilding] = useState("All");
  const [maintChanges, setMaintChanges] = useState({}); // roomId → true/false
  const [maintReasons, setMaintReasons] = useState({}); // roomId → reason text
  const [isSavingMaint, setIsSavingMaint] = useState(false);
  const [maintStatus, setMaintStatus] = useState(null);

  const uniqueBuildings = useMemo(() => [...new Set((Array.isArray(rooms) ? rooms : []).map((r) => r.building).filter(Boolean))].sort(), [rooms]);

  const maintRooms = useMemo(() => {
    const safeRooms = Array.isArray(rooms) ? rooms : [];
    return safeRooms.filter((r) => {
      const matchB = maintBuilding === "All" || r.building === maintBuilding;
      const matchS = !maintSearch || r.room_number?.toLowerCase().includes(maintSearch.toLowerCase()) || r.name?.toLowerCase().includes(maintSearch.toLowerCase());
      return matchB && matchS;
    });
  }, [rooms, maintBuilding, maintSearch]);

  const isMaintenance = (room) => {
    if (maintChanges[room.id] !== undefined) return maintChanges[room.id];
    return room.status === "Maintenance";
  };

  const toggleMaintenance = (room) => {
    setMaintChanges((prev) => ({ ...prev, [room.id]: !isMaintenance(room) }));
  };

  const pendingMaintCount = Object.keys(maintChanges).length;

  const saveMaintChanges = async () => {
    setIsSavingMaint(true);
    setMaintStatus("saving");
    try {
      await Promise.all(Object.entries(maintChanges).map(([id, isMaint]) => {
        const updateData = { 
          status: isMaint ? "Maintenance" : "Active",
          maintenance_reason: isMaint ? (maintReasons[id] || null) : null
        };
        return updateRoom(id, updateData);
      }));
      setMaintChanges({});
      setMaintReasons({});
      setMaintStatus("success");
      if (onRefresh) await onRefresh();
      setTimeout(() => setMaintStatus(null), 4000);
    } catch {
      setMaintStatus("error");
      setTimeout(() => setMaintStatus(null), 4000);
    } finally {
      setIsSavingMaint(false);
    }
  };

  // ── Section 3: Chỉnh nhanh một phòng ─────────────────────────────────────
  const [quickSearch, setQuickSearch] = useState("");
  const [quickRoom, setQuickRoom] = useState(null);
  const [quickForm, setQuickForm] = useState({});
  const [isSavingQuick, setIsSavingQuick] = useState(false);
  const [quickStatus, setQuickStatus] = useState(null);

  const quickResults = useMemo(() => {
    if (!quickSearch.trim()) return [];
    return (Array.isArray(rooms) ? rooms : []).filter((r) => r.room_number?.toLowerCase().includes(quickSearch.toLowerCase()) || r.name?.toLowerCase().includes(quickSearch.toLowerCase())).slice(0, 8);
  }, [rooms, quickSearch]);

  const selectQuickRoom = (room) => {
    setQuickRoom(room);
    setQuickSearch(room.room_number || room.name || "");
    setQuickForm({
      capacity: room.capacity ?? "",
      gender: room.gender ?? "",
      rent_price: room.rent_price ?? "",
      note: room.note ?? "",
    });
  };

  const saveQuickRoom = async () => {
    if (!quickRoom) return;
    setIsSavingQuick(true);
    setQuickStatus("saving");
    try {
      await updateRoom(quickRoom.id, {
        capacity: Number(quickForm.capacity) || quickRoom.capacity,
        gender: quickForm.gender || quickRoom.gender,
        rent_price: Number(quickForm.rent_price) || quickRoom.rent_price,
        note: quickForm.note,
      });
      setQuickStatus("success");
      if (onRefresh) await onRefresh();
      setTimeout(() => setQuickStatus(null), 4000);
    } catch {
      setQuickStatus("error");
      setTimeout(() => setQuickStatus(null), 4000);
    } finally {
      setIsSavingQuick(false);
    }
  };

  // ── Section 4: Cài đặt mặc định ──────────────────────────────────────────
  const [defaults, setDefaults] = useState({
    defaultCapacity: 4,
    defaultGender: "Nam",
    defaultRentPrice: 400000,
    autoCloseMaintenance: true,
    maxFloorsPerBuilding: 6,
  });

  const handleToggle = (id) => setExpandedSection((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">Điều chỉnh Quản lý Phòng</h3>
            <p className="text-slate-500 text-sm">Đặt tên hiển thị tòa, đánh dấu phòng bảo trì hàng loạt, chỉnh nhanh thông số một phòng và cấu hình mặc định cho phòng mới.</p>
          </div>
        </div>
        {saveStatus === "success" && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm">
            <CheckCircle size={16} /> Đã lưu thay đổi thành công!
          </div>
        )}
        {saveStatus === "error" && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle size={16} /> Có lỗi khi lưu, vui lòng thử lại.
          </div>
        )}
      </div>

      {/* ── Section 1: Tổng quan & Đặt tên Tòa ─────────────────────── */}
      <Section
        id="buildings"
        expanded={expandedSection === "buildings"}
        onToggle={handleToggle}
        icon={Building2}
        iconBg="bg-indigo-100"
        iconColor="text-indigo-600"
        title="1. Tổng quan & Tên hiển thị Tòa"
        subtitle="Xem số phòng, sức chứa theo tòa và tùy chỉnh tên hiển thị"
      >
        <div className="overflow-x-auto rounded-2xl border-2 border-slate-200">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-widest">
                <th className="px-6 py-4 border-r-2 border-slate-200">Tòa (ID)</th>
                <th className="px-6 py-4 border-r-2 border-slate-200">Tên hiển thị</th>
                <th className="px-6 py-4 border-r-2 border-slate-200 text-center">Số phòng</th>
                <th className="px-6 py-4 border-r-2 border-slate-200 text-center">Sức chứa</th>
                <th className="px-6 py-4 border-r-2 border-slate-200 text-center">Đang ở</th>
                <th className="px-6 py-4 text-center">Lấp đầy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buildingSummary.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">
                    Chưa có dữ liệu tòa
                  </td>
                </tr>
              )}
              {buildingSummary.map((b) => {
                const rate = b.capacity > 0 ? ((b.occupancy / b.capacity) * 100).toFixed(0) : 0;
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-700 border-r-2 border-slate-200">{b.id}</td>
                    <td className="px-6 py-4 border-r-2 border-slate-200">
                      <input
                        type="text"
                        value={getDisplayName(b.id)}
                        onChange={(e) => setBuildingNames((prev) => ({ ...prev, [b.id]: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-indigo-50 outline-none bg-slate-50/60"
                      />
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800 border-r-2 border-slate-200">{b.rooms}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800 border-r-2 border-slate-200">{b.capacity}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800 border-r-2 border-slate-200">{b.occupancy}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex-1 max-w-[80px] h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${rate >= 90 ? "bg-rose-500" : rate >= 70 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-9">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-indigo-50 rounded-xl flex items-start gap-3">
          <Info size={15} className="text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-700">Tên hiển thị chỉ có tác dụng trên giao diện người dùng và chưa đồng bộ với cơ sở dữ liệu trong phiên bản hiện tại.</p>
        </div>
      </Section>

      {/* ── Section 2: Đánh dấu bảo trì ─────────────────────────────── */}
      <Section
        id="maintenance"
        expanded={expandedSection === "maintenance"}
        onToggle={handleToggle}
        icon={Wrench}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        title="2. Đánh dấu Bảo trì phòng"
        subtitle="Bật / tắt trạng thái bảo trì cho từng phòng — phòng bảo trì sẽ không xuất hiện trong danh sách chỗ trống"
      >
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm số phòng..."
              value={maintSearch}
              onChange={(e) => setMaintSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-amber-50 outline-none bg-slate-50/50"
            />
          </div>
          <select
            value={maintBuilding}
            onChange={(e) => setMaintBuilding(e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-amber-50 text-slate-700"
          >
            <option value="All">Tất cả tòa</option>
            {uniqueBuildings.map((b) => (
              <option key={b} value={b}>
                Tòa {b}
              </option>
            ))}
          </select>
        </div>

        {/* Room list */}
        <div className="rounded-2xl border-2 border-slate-200 overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">{maintRooms.length} phòng</span>
            {pendingMaintCount > 0 && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">{pendingMaintCount} thay đổi chưa lưu</span>}
          </div>
          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
            {maintRooms.length === 0 && <div className="px-6 py-10 text-center text-slate-400 text-sm">Không tìm thấy phòng</div>}
            {maintRooms.map((room) => {
              const maint = isMaintenance(room);
              const changed = maintChanges[room.id] !== undefined;
              // Load existing maintenance reason from room data
              const currentReason = maintReasons[room.id] !== undefined ? maintReasons[room.id] : (room.maintenance_reason || "");
              
              return (
                <div key={room.id} className={`px-6 py-3.5 hover:bg-slate-50/50 transition-colors ${changed ? "bg-amber-50/40" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{room.room_number || room.name}</p>
                        <p className="text-xs text-slate-500">
                          Tòa {room.building} — Tầng {room.floor} — Sức chứa {room.capacity}
                        </p>
                      </div>
                      <StatusBadge room={{ ...room, status: maint ? "Maintenance" : room.status }} />
                      {changed && <span className="text-[10px] text-amber-600 font-bold bg-amber-100 px-1.5 py-0.5 rounded">Chưa lưu</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-semibold">{maint ? "Đang bảo trì" : "Hoạt động"}</span>
                      <Toggle checked={maint} onChange={() => toggleMaintenance(room)} />
                    </div>
                  </div>
                  
                  {/* Maintenance reason input - show when maintenance is enabled */}
                  {maint && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Lý do bảo trì
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Sửa điều hòa, thay ống nước..."
                        value={currentReason}
                        onChange={(e) => setMaintReasons(prev => ({ ...prev, [room.id]: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-50 outline-none bg-white"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Save bar */}
        <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            {maintStatus === "success" && (
              <span className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                <CheckCircle size={15} /> Đã lưu trạng thái bảo trì!
              </span>
            )}
            {maintStatus === "error" && (
              <span className="flex items-center gap-2 text-rose-700 text-sm font-semibold">
                <AlertCircle size={15} /> Lỗi khi lưu, thử lại.
              </span>
            )}
            {!maintStatus && pendingMaintCount > 0 && <span className="text-sm text-slate-500">{pendingMaintCount} phòng có thay đổi chưa được lưu</span>}
            {!maintStatus && pendingMaintCount === 0 && <span className="text-sm text-slate-400">Chưa có thay đổi</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMaintChanges({})}
              disabled={pendingMaintCount === 0 || isSavingMaint}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-colors disabled:opacity-40"
            >
              <RotateCcw size={14} /> Hoàn tác
            </button>
            <button
              onClick={saveMaintChanges}
              disabled={pendingMaintCount === 0 || isSavingMaint}
              className="flex items-center gap-2 px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all shadow-md shadow-amber-200 disabled:opacity-40"
            >
              <Save size={14} /> {isSavingMaint ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </Section>

      {/* ── Section 3: Chỉnh nhanh thông số 1 phòng ─────────────────── */}
      <Section
        id="quickedit"
        expanded={expandedSection === "quickedit"}
        onToggle={handleToggle}
        icon={SlidersHorizontal}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        title="3. Chỉnh nhanh thông số Phòng"
        subtitle="Tìm một phòng và điều chỉnh sức chứa, giới tính, giá phòng hoặc ghi chú"
      >
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Tìm và chọn phòng</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Nhập số phòng hoặc tên phòng..."
              value={quickSearch}
              onChange={(e) => {
                setQuickSearch(e.target.value);
                setQuickRoom(null);
              }}
              className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none bg-slate-50/50"
            />
          </div>
          {quickResults.length > 0 && !quickRoom && (
            <div className="border-2 border-slate-200 rounded-2xl overflow-hidden">
              {quickResults.map((r) => (
                <button
                  key={r.id}
                  onClick={() => selectQuickRoom(r)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
                >
                  <span className="font-bold text-slate-900 text-sm">{r.room_number || r.name}</span>
                  <span className="text-xs text-slate-500">
                    Tòa {r.building} – Tầng {r.floor} – {r.capacity} chỗ – <StatusBadge room={r} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Edit form */}
        {quickRoom && (
          <div className="space-y-6 p-6 bg-blue-50/50 rounded-2xl border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Phòng {quickRoom.room_number || quickRoom.name}</h4>
                <p className="text-xs text-slate-500">
                  Tòa {quickRoom.building} – Tầng {quickRoom.floor}
                </p>
              </div>
              <StatusBadge room={quickRoom} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Capacity */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Sức chứa (số chỗ)</label>
                <input
                  type="number"
                  min={1}
                  value={quickForm.capacity}
                  onChange={(e) => setQuickForm((f) => ({ ...f, capacity: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none bg-white"
                />
                <p className="text-xs text-slate-500">
                  Hiện tại: <strong>{quickRoom.capacity}</strong> chỗ &nbsp;|&nbsp; Đang ở: <strong>{quickRoom.currentOccupancy || 0}</strong>
                </p>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Giới tính phòng</label>
                <select
                  value={quickForm.gender}
                  onChange={(e) => setQuickForm((f) => ({ ...f, gender: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-50 outline-none bg-white text-slate-700"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
                <p className="text-xs text-slate-500">Giới tính quy định sinh viên được phép ở phòng này</p>
              </div>

              {/* Rent price */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Giá phòng (VNĐ/tháng/người)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={quickForm.rent_price}
                    onChange={(e) => setQuickForm((f) => ({ ...f, rent_price: e.target.value }))}
                    className="w-full px-4 py-3 pr-16 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none bg-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VNĐ</span>
                </div>
                <p className="text-xs text-slate-500">
                  Hiện tại: <strong>{Number(quickRoom.rent_price || 0).toLocaleString()} VNĐ</strong>
                </p>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Ghi chú phòng</label>
                <input
                  type="text"
                  placeholder="VD: Đang chờ sửa điều hòa..."
                  value={quickForm.note}
                  onChange={(e) => setQuickForm((f) => ({ ...f, note: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <div>
                {quickStatus === "success" && (
                  <span className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                    <CheckCircle size={15} /> Đã cập nhật phòng!
                  </span>
                )}
                {quickStatus === "error" && (
                  <span className="flex items-center gap-2 text-rose-700 text-sm font-semibold">
                    <AlertCircle size={15} /> Lỗi khi lưu.
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setQuickRoom(null);
                    setQuickSearch("");
                    setQuickStatus(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={saveQuickRoom}
                  disabled={isSavingQuick}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-40"
                >
                  <Save size={14} /> {isSavingQuick ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </div>
        )}

        {!quickRoom && !quickSearch && (
          <div className="p-6 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">Nhập số phòng ở ô tìm kiếm để bắt đầu chỉnh sửa</div>
        )}
      </Section>

      {/* ── Section 4: Cài đặt mặc định ─────────────────────────────── */}
      <Section
        id="defaults"
        expanded={expandedSection === "defaults"}
        onToggle={handleToggle}
        icon={SlidersHorizontal}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        title="4. Cài đặt mặc định khu ký túc xá"
        subtitle="Giá trị mặc định khi tạo phòng mới và các quy tắc vận hành toàn khu"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default capacity */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Sức chứa mặc định (chỗ/phòng)</label>
            <input
              type="number"
              min={1}
              max={20}
              value={defaults.defaultCapacity}
              onChange={(e) => setDefaults((d) => ({ ...d, defaultCapacity: Number(e.target.value) }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-purple-50 outline-none"
            />
            <p className="text-xs text-slate-500">Được áp dụng khi tạo phòng mới không nhập sức chứa</p>
          </div>

          {/* Default gender */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Giới tính mặc định</label>
            <select
              value={defaults.defaultGender}
              onChange={(e) => setDefaults((d) => ({ ...d, defaultGender: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-purple-50 outline-none text-slate-700"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          {/* Default rent price */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Giá phòng mặc định (VNĐ/tháng/người)</label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={50000}
                value={defaults.defaultRentPrice}
                onChange={(e) => setDefaults((d) => ({ ...d, defaultRentPrice: Number(e.target.value) }))}
                className="w-full px-4 py-3 pr-16 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-purple-50 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VNĐ</span>
            </div>
          </div>

          {/* Max floors */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Số tầng tối đa mỗi tòa</label>
            <input
              type="number"
              min={1}
              max={20}
              value={defaults.maxFloorsPerBuilding}
              onChange={(e) => setDefaults((d) => ({ ...d, maxFloorsPerBuilding: Number(e.target.value) }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-purple-50 outline-none"
            />
            <p className="text-xs text-slate-500">Dùng cho bộ lọc tầng trong danh sách phòng</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-900 text-sm">Tự động đóng phòng khi bật Bảo trì</p>
              <p className="text-xs text-slate-500 mt-0.5">Phòng bảo trì sẽ tự không hiện trong danh sách chọn phòng</p>
            </div>
            <Toggle checked={defaults.autoCloseMaintenance} onChange={(v) => setDefaults((d) => ({ ...d, autoCloseMaintenance: v }))} />
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-xl flex items-start gap-3">
          <Info size={15} className="text-purple-600 shrink-0 mt-0.5" />
          <p className="text-sm text-purple-700">
            Các cài đặt mặc định chỉ tác động đến phòng <strong>tạo mới</strong> sau khi lưu. Phòng hiện có không bị ảnh hưởng.
          </p>
        </div>
      </Section>
    </div>
  );
};

export default RoomSettings;

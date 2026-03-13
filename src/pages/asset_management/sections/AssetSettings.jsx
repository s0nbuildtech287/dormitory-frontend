import { useState, useEffect } from "react";
import { Package, Wrench, Archive, Settings, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Search, Save, RotateCcw, ArrowLeftRight } from "lucide-react";
import { getAssets, updateAsset } from "../../../api/apiAsset.js";
import { getRooms } from "../../../api/apiRoom.js";

// Toggle switch helper
const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
    <div
      className="w-11 h-6 bg-slate-300 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-100
            peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px]
            after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
            peer-checked:after:translate-x-full"
    />
  </label>
);

// Section accordion wrapper
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

const AssetSettings = ({ onRefresh }) => {
  const [expandedSection, setExpandedSection] = useState("limits");
  const [saveStatus, setSaveStatus] = useState(null);

  // Section 1: Asset Limits Configuration
  const [assetLimits, setAssetLimits] = useState({
    perRoom: {
      GIUONG: 5,      // Giường
      TU: 5,          // Tủ quần áo
      BAN: 5,         // Bàn học
      QUAT: 2,        // Quạt trần
      DIEUHOA: 1,     // Điều hòa
      DEN: 5,         // Đèn
    },
    perFloor: {
      WIFI: 1,        // Bộ phát Wifi
      CAMERA: 1,      // Camera an ninh
    }
  });
  const [limitsStatus, setLimitsStatus] = useState(null);

  // Section 2: Asset Recall from Rooms
  const [recallSearch, setRecallSearch] = useState("");
  const [recallBuilding, setRecallBuilding] = useState("All");
  const [recallRoom, setRecallRoom] = useState("");
  const [roomAssets, setRoomAssets] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRecalls, setSelectedRecalls] = useState({});
  const [recallLoading, setRecallLoading] = useState(false);
  const [recallStatus, setRecallStatus] = useState(null);

  // Section 3: Asset Transfer between Rooms
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAssets, setTransferAssets] = useState([]);
  const [selectedTransfers, setSelectedTransfers] = useState({});
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferStatus, setTransferStatus] = useState(null);

  // Section 4: Asset Regulations
  const [regulations, setRegulations] = useState({
    damageCompensation: true,
    compensationRate: 100,
    lostItemFine: 150,
    maintenanceResponsibility: 'student',
    inspectionFrequency: 'monthly',
    reportDamageDeadline: 24,
    allowPersonalItems: true,
    prohibitedItems: 'Thiết bị nấu ăn, vật nuôi, chất dễ cháy nổ',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await getRooms();
      setRooms(response.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const saveLimits = async () => {
    setLimitsStatus("saving");
    try {
      // Save to localStorage or API
      localStorage.setItem('assetLimits', JSON.stringify(assetLimits));
      setLimitsStatus("success");
      setTimeout(() => setLimitsStatus(null), 4000);
    } catch (error) {
      setLimitsStatus("error");
      setTimeout(() => setLimitsStatus(null), 4000);
    }
  };

  const handleToggle = (id) => setExpandedSection((prev) => (prev === id ? null : id));

  const uniqueBuildings = [...new Set(rooms.map((r) => r.building).filter(Boolean))].sort();

  const filteredRooms = rooms.filter((r) => {
    if (recallBuilding !== "All" && r.building !== recallBuilding) return false;
    if (recallRoom && !r.room_number?.includes(recallRoom)) return false;
    return true;
  });

  const handleRecallAssets = async () => {
    const recallIds = Object.keys(selectedRecalls).filter(id => selectedRecalls[id]);
    if (recallIds.length === 0) return;

    setRecallLoading(true);
    setRecallStatus("saving");
    try {
      await Promise.all(recallIds.map(id => 
        updateAsset(id, { room_id: null, location: 'Kho', status: 'Sẵn sàng' })
      ));
      setSelectedRecalls({});
      setRecallStatus("success");
      if (onRefresh) await onRefresh();
      setTimeout(() => setRecallStatus(null), 4000);
    } catch (error) {
      setRecallStatus("error");
      setTimeout(() => setRecallStatus(null), 4000);
    } finally {
      setRecallLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">Điều chỉnh Cơ sở vật chất</h3>
            <p className="text-slate-500 text-sm">
              Quản lý kho tài sản, thu hồi đồ từ phòng, chuyển đổi tài sản giữa các phòng và cấu hình mặc định
            </p>
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

      {/* Section 1: Asset Limits Configuration */}
      <Section
        id="limits"
        expanded={expandedSection === "limits"}
        onToggle={handleToggle}
        icon={Package}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        title="1. Giới hạn tài sản cho Phòng & Tầng"
        subtitle="Cấu hình số lượng tối đa tài sản cho mỗi phòng và mỗi tầng"
      >
        <div className="space-y-6">
          {/* Per Room Limits */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-blue-900 border-b border-blue-100 pb-2">
              Giới hạn tài sản cho mỗi Phòng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">1</span>
                  Giường (tối đa/phòng)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={assetLimits.perRoom.GIUONG}
                  onChange={(e) => setAssetLimits({
                    ...assetLimits,
                    perRoom: { ...assetLimits.perRoom, GIUONG: Number(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none"
                />
                <p className="text-xs text-slate-500">Mặc định: 5 giường/phòng</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">2</span>
                  Tủ quần áo (tối đa/phòng)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={assetLimits.perRoom.TU}
                  onChange={(e) => setAssetLimits({
                    ...assetLimits,
                    perRoom: { ...assetLimits.perRoom, TU: Number(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none"
                />
                <p className="text-xs text-slate-500">Mặc định: 5 tủ/phòng</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">3</span>
                  Bàn học (tối đa/phòng)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={assetLimits.perRoom.BAN}
                  onChange={(e) => setAssetLimits({
                    ...assetLimits,
                    perRoom: { ...assetLimits.perRoom, BAN: Number(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none"
                />
                <p className="text-xs text-slate-500">Mặc định: 5 bàn/phòng</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">4</span>
                  Quạt trần (tối đa/phòng)
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={assetLimits.perRoom.QUAT}
                  onChange={(e) => setAssetLimits({
                    ...assetLimits,
                    perRoom: { ...assetLimits.perRoom, QUAT: Number(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none"
                />
                <p className="text-xs text-slate-500">Mặc định: 2 quạt/phòng</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">5</span>
                  Điều hòa (tối đa/phòng)
                </label>
                <input
                  type="number"
                  min={0}
                  max={2}
                  value={assetLimits.perRoom.DIEUHOA}
                  onChange={(e) => setAssetLimits({
                    ...assetLimits,
                    perRoom: { ...assetLimits.perRoom, DIEUHOA: Number(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none"
                />
                <p className="text-xs text-slate-500">Mặc định: 1 điều hòa/phòng</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">6</span>
                  Đèn (tối đa/phòng)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={assetLimits.perRoom.DEN}
                  onChange={(e) => setAssetLimits({
                    ...assetLimits,
                    perRoom: { ...assetLimits.perRoom, DEN: Number(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none"
                />
                <p className="text-xs text-slate-500">Mặc định: 5 đèn/phòng</p>
              </div>
            </div>
          </div>

          {/* Per Floor Limits */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-cyan-900 border-b border-cyan-100 pb-2">
              Giới hạn tài sản cho mỗi Tầng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-700">1</span>
                  Bộ phát Wifi (tối đa/tầng)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={assetLimits.perFloor.WIFI}
                  onChange={(e) => setAssetLimits({
                    ...assetLimits,
                    perFloor: { ...assetLimits.perFloor, WIFI: Number(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-cyan-50 outline-none"
                />
                <p className="text-xs text-slate-500">Mặc định: 1 bộ phát wifi/tầng</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-cyan-100 flex items-center justify-center text-xs font-bold text-cyan-700">2</span>
                  Camera an ninh (tối đa/tầng)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={assetLimits.perFloor.CAMERA}
                  onChange={(e) => setAssetLimits({
                    ...assetLimits,
                    perFloor: { ...assetLimits.perFloor, CAMERA: Number(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-cyan-50 outline-none"
                />
                <p className="text-xs text-slate-500">Mặc định: 1 camera/tầng</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">Lưu ý về giới hạn tài sản:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Giới hạn này áp dụng khi xuất kho tài sản cho phòng/tầng</li>
                <li>Hệ thống sẽ cảnh báo nếu vượt quá giới hạn cho phép</li>
                <li>Admin có thể điều chỉnh giới hạn tùy theo nhu cầu thực tế</li>
              </ul>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              {limitsStatus === "success" && (
                <span className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                  <CheckCircle size={15} /> Đã lưu cấu hình giới hạn!
                </span>
              )}
              {limitsStatus === "error" && (
                <span className="flex items-center gap-2 text-rose-700 text-sm font-semibold">
                  <AlertCircle size={15} /> Lỗi khi lưu.
                </span>
              )}
              {!limitsStatus && (
                <span className="text-sm text-slate-500">Thay đổi giới hạn tài sản</span>
              )}
            </div>
            <button
              onClick={saveLimits}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
            >
              <Save size={14} /> Lưu cấu hình
            </button>
          </div>
        </div>
      </Section>

      {/* Section 2: Recall Assets from Rooms */}
      <Section
        id="recall"
        expanded={expandedSection === "recall"}
        onToggle={handleToggle}
        icon={Wrench}
        iconBg="bg-orange-100"
        iconColor="text-orange-600"
        title="2. Thu hồi tài sản từ phòng"
        subtitle="Thu hồi tài sản hư hỏng hoặc cần bảo trì về kho"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={recallBuilding}
            onChange={(e) => {
              setRecallBuilding(e.target.value);
              setRecallRoom("");
            }}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-orange-50 text-slate-700"
          >
            <option value="All">Tất cả tòa</option>
            {uniqueBuildings.map((b) => (
              <option key={b} value={b}>Tòa {b}</option>
            ))}
          </select>

          <select
            value={recallRoom}
            onChange={(e) => setRecallRoom(e.target.value)}
            disabled={recallBuilding === "All"}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-orange-50 text-slate-700 disabled:opacity-50"
          >
            <option value="">Tất cả phòng</option>
            {filteredRooms.map((r) => (
              <option key={r.id} value={r.room_number}>{r.room_number}</option>
            ))}
          </select>

          <button
            onClick={() => {/* Fetch room assets */}}
            className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors"
          >
            Tìm kiếm
          </button>
        </div>

        <div className="rounded-2xl border-2 border-slate-200 overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">
              Tài sản trong phòng
            </span>
            {Object.keys(selectedRecalls).filter(id => selectedRecalls[id]).length > 0 && (
              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold">
                {Object.keys(selectedRecalls).filter(id => selectedRecalls[id]).length} đã chọn
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
            <div className="px-6 py-10 text-center text-slate-400 text-sm">
              Chọn tòa và phòng để xem tài sản
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            {recallStatus === "success" && (
              <span className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                <CheckCircle size={15} /> Đã thu hồi tài sản về kho!
              </span>
            )}
            {recallStatus === "error" && (
              <span className="flex items-center gap-2 text-rose-700 text-sm font-semibold">
                <AlertCircle size={15} /> Lỗi khi thu hồi.
              </span>
            )}
            {!recallStatus && (
              <span className="text-sm text-slate-400">Chọn tài sản cần thu hồi</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedRecalls({})}
              disabled={Object.keys(selectedRecalls).length === 0 || recallLoading}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-colors disabled:opacity-40"
            >
              <RotateCcw size={14} /> Bỏ chọn
            </button>
            <button
              onClick={handleRecallAssets}
              disabled={Object.keys(selectedRecalls).filter(id => selectedRecalls[id]).length === 0 || recallLoading}
              className="flex items-center gap-2 px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-md shadow-orange-200 disabled:opacity-40"
            >
              <Save size={14} /> {recallLoading ? "Đang thu hồi..." : "Thu hồi về kho"}
            </button>
          </div>
        </div>
      </Section>

      {/* Section 3: Transfer Assets between Rooms */}
      <Section
        id="transfer"
        expanded={expandedSection === "transfer"}
        onToggle={handleToggle}
        icon={ArrowLeftRight}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        title="3. Chuyển đổi tài sản giữa phòng"
        subtitle="Di chuyển tài sản từ phòng này sang phòng khác"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Từ phòng</label>
            <select
              value={transferFrom}
              onChange={(e) => setTransferFrom(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-purple-50 outline-none bg-white text-slate-700"
            >
              <option value="">-- Chọn phòng nguồn --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Tòa {r.building} - {r.room_number}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Đến phòng</label>
            <select
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-purple-50 outline-none bg-white text-slate-700"
            >
              <option value="">-- Chọn phòng đích --</option>
              {rooms.filter(r => r.id !== transferFrom).map((r) => (
                <option key={r.id} value={r.id}>
                  Tòa {r.building} - {r.room_number}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 bg-purple-50/50 rounded-2xl border-2 border-purple-100 text-center text-slate-500 text-sm">
          Chọn phòng nguồn và phòng đích để xem danh sách tài sản có thể chuyển
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            disabled
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-200 disabled:opacity-40"
          >
            <ArrowLeftRight size={14} /> Chuyển tài sản
          </button>
        </div>
      </Section>

      {/* Section 4: Asset Regulations */}
      <Section
        id="regulations"
        expanded={expandedSection === "regulations"}
        onToggle={handleToggle}
        icon={Settings}
        iconBg="bg-green-100"
        iconColor="text-green-600"
        title="4. Điều lệ về Tài sản chung"
        subtitle="Quy định về bồi thường, trách nhiệm và sử dụng tài sản trong ký túc xá"
      >
        <div className="space-y-6">
          {/* Damage Compensation */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-green-900 border-b border-green-100 pb-2">
              Bồi thường hư hỏng tài sản
            </h4>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">Yêu cầu bồi thường khi hư hỏng</p>
                <p className="text-sm text-slate-600 mt-1">Sinh viên phải bồi thường khi làm hư hỏng tài sản</p>
              </div>
              <Toggle 
                checked={regulations.damageCompensation} 
                onChange={(val) => setRegulations({...regulations, damageCompensation: val})} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Tỷ lệ bồi thường (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={regulations.compensationRate}
                    onChange={(e) => setRegulations({...regulations, compensationRate: Number(e.target.value)})}
                    className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-green-50 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                </div>
                <p className="text-xs text-slate-500">100% = bồi thường đúng giá trị tài sản</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Phạt mất tài sản (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={100}
                    max={300}
                    value={regulations.lostItemFine}
                    onChange={(e) => setRegulations({...regulations, lostItemFine: Number(e.target.value)})}
                    className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-green-50 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                </div>
                <p className="text-xs text-slate-500">Phạt cao hơn khi làm mất hoàn toàn</p>
              </div>
            </div>
          </div>

          {/* Maintenance Responsibility */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-green-900 border-b border-green-100 pb-2">
              Trách nhiệm bảo trì & kiểm tra
            </h4>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Trách nhiệm bảo trì định kỳ</label>
              <select
                value={regulations.maintenanceResponsibility}
                onChange={(e) => setRegulations({...regulations, maintenanceResponsibility: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-green-50 outline-none bg-white text-slate-700"
              >
                <option value="student">Sinh viên tự bảo trì</option>
                <option value="dormitory">Ký túc xá bảo trì</option>
                <option value="shared">Chia sẻ trách nhiệm</option>
              </select>
              <p className="text-xs text-slate-500">Quy định ai chịu trách nhiệm bảo trì tài sản</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Tần suất kiểm tra tài sản</label>
              <select
                value={regulations.inspectionFrequency}
                onChange={(e) => setRegulations({...regulations, inspectionFrequency: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-green-50 outline-none bg-white text-slate-700"
              >
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
                <option value="quarterly">Hàng quý</option>
                <option value="semester">Mỗi học kỳ</option>
              </select>
              <p className="text-xs text-slate-500">Ban quản lý kiểm tra tình trạng tài sản</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Thời hạn báo cáo hư hỏng (giờ)</label>
              <input
                type="number"
                min={1}
                max={168}
                value={regulations.reportDamageDeadline}
                onChange={(e) => setRegulations({...regulations, reportDamageDeadline: Number(e.target.value)})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-green-50 outline-none"
              />
              <p className="text-xs text-slate-500">Sinh viên phải báo cáo hư hỏng trong thời gian này</p>
            </div>
          </div>

          {/* Personal Items & Prohibited */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-green-900 border-b border-green-100 pb-2">
              Đồ dùng cá nhân & Vật cấm
            </h4>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">Cho phép mang đồ dùng cá nhân</p>
                <p className="text-sm text-slate-600 mt-1">Sinh viên được mang thêm đồ dùng riêng vào phòng</p>
              </div>
              <Toggle 
                checked={regulations.allowPersonalItems} 
                onChange={(val) => setRegulations({...regulations, allowPersonalItems: val})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Danh sách vật cấm mang vào</label>
              <textarea
                value={regulations.prohibitedItems}
                onChange={(e) => setRegulations({...regulations, prohibitedItems: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-green-50 outline-none"
                placeholder="Liệt kê các vật cấm..."
              />
              <p className="text-xs text-slate-500">Các vật phẩm không được phép mang vào ký túc xá</p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-semibold mb-2">Lưu ý quan trọng về điều lệ:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Điều lệ này áp dụng cho tất cả sinh viên trong ký túc xá</li>
                  <li>Vi phạm điều lệ có thể dẫn đến xử lý kỷ luật</li>
                  <li>Sinh viên cần đọc kỹ và ký xác nhận khi nhận phòng</li>
                  <li>Ban quản lý có quyền điều chỉnh điều lệ khi cần thiết</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                localStorage.setItem('assetRegulations', JSON.stringify(regulations));
                setSaveStatus("success");
                setTimeout(() => setSaveStatus(null), 4000);
              }}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200"
            >
              <Save size={14} /> Lưu điều lệ
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default AssetSettings;

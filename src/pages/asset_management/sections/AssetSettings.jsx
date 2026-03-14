import { useState, useEffect } from "react";
import { Package, Wrench, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Save, RotateCcw, ArrowLeftRight } from "lucide-react";
import { getAssets, getAssetsByRoom, createAsset, updateAsset } from "../../../api/apiAsset.js";
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
  const [recallBuilding, setRecallBuilding] = useState("");
  const [recallRoom, setRecallRoom] = useState("");
  const [roomAssets, setRoomAssets] = useState([]);
  const [roomAssetsLoading, setRoomAssetsLoading] = useState(false);
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

  const filteredRooms = rooms.filter((r) => r.building === recallBuilding);

  useEffect(() => {
    if (!recallRoom) {
      setRoomAssets([]);
      setSelectedRecalls({});
      return;
    }

    const fetchRoomAssets = async () => {
      setRoomAssetsLoading(true);
      setRecallStatus(null);
      try {
        const response = await getAssetsByRoom(recallRoom);
        setRoomAssets(response.data || []);
      } catch (error) {
        console.error("Error fetching room assets:", error);
        setRoomAssets([]);
      } finally {
        setRoomAssetsLoading(false);
      }
    };

    fetchRoomAssets();
  }, [recallRoom]);

  const handleRecallAssets = async () => {
    const selectedAssets = roomAssets
      .map((asset) => {
        const assetKey = asset.asset_code || String(asset.id || "");
        const maxQuantity = Number(asset.quantity) || 0;
        const entry = selectedRecalls[assetKey];
        const recallQuantity = entry ? Number(entry.qty) || maxQuantity : 0;
        return { ...asset, assetKey, maxQuantity, recallQuantity };
      })
      .filter((asset) => asset.assetKey && asset.recallQuantity > 0 && asset.recallQuantity <= asset.maxQuantity);

    if (selectedAssets.length === 0) return;

    setRecallLoading(true);
    setRecallStatus("saving");
    try {
      for (const asset of selectedAssets) {
        const { asset_code, recallQuantity, maxQuantity } = asset;

        // Lấy tất cả bản ghi asset theo asset_code
        const assetsResponse = await getAssets({ search: asset_code });
        const allRecords = assetsResponse.data || [];

        // Tìm bản ghi trong phòng
        const roomAssetRecord = allRecords.find(
          (item) => item.asset_code === asset_code && String(item.room_id) === String(recallRoom)
        );
        if (!roomAssetRecord) continue;

        const remainQuantity = maxQuantity - recallQuantity;

        // Update bản ghi trong phòng (merge đầy đủ fields)
        if (remainQuantity <= 0) {
          await updateAsset(roomAssetRecord.id, {
            ...roomAssetRecord,
            room_id: null,
            location: "Kho",
            status: "Sẵn sàng",
            quantity: maxQuantity,
          });
        } else {
          await updateAsset(roomAssetRecord.id, {
            ...roomAssetRecord,
            quantity: remainQuantity,
          });
        }

        // Tìm bản ghi kho cùng asset_code
        const warehouseRecord = allRecords.find(
          (item) => item.asset_code === asset_code && item.room_id === null && item.status === "Sẵn sàng"
            && String(item.id) !== String(roomAssetRecord.id)
        );

        if (warehouseRecord) {
          await updateAsset(warehouseRecord.id, {
            ...warehouseRecord,
            quantity: (Number(warehouseRecord.quantity) || 0) + recallQuantity,
          });
        } else if (remainQuantity > 0) {
          // Tạo bản ghi kho mới nếu chưa có
          await createAsset({
            asset_code,
            name: roomAssetRecord.name || asset_code,
            category_name: roomAssetRecord.category_name || "Khác",
            unit: roomAssetRecord.unit || "Cái",
            room_id: null,
            location: "Kho",
            quantity: recallQuantity,
            status: "Sẵn sàng",
            condition: roomAssetRecord.condition || "Tốt",
            purchase_price: Number(roomAssetRecord.purchase_price) || 0,
            supplier: roomAssetRecord.supplier || "",
            warranty_period: Number(roomAssetRecord.warranty_period) || 0,
            description: roomAssetRecord.description || "",
          });
        }
      }

      setSelectedRecalls({});
      setRecallStatus("success");
      const latestRoomAssets = await getAssetsByRoom(recallRoom);
      setRoomAssets(latestRoomAssets.data || []);
      if (onRefresh) await onRefresh();
      setTimeout(() => setRecallStatus(null), 4000);
    } catch (error) {
      console.error("Error recalling assets:", error);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={recallBuilding}
            onChange={(e) => {
              setRecallBuilding(e.target.value);
              setRecallRoom("");
              setRoomAssets([]);
              setSelectedRecalls({});
            }}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-orange-50 text-slate-700"
          >
            <option value="">-- Chọn tòa --</option>
            {uniqueBuildings.map((b) => (
              <option key={b} value={b}>Tòa {b}</option>
            ))}
          </select>

          <select
            value={recallRoom}
            onChange={(e) => {
              setRecallRoom(e.target.value);
              setSelectedRecalls({});
            }}
            disabled={!recallBuilding}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-orange-50 text-slate-700 disabled:opacity-50"
          >
            <option value="">-- Chọn phòng --</option>
            {filteredRooms.map((r) => (
              <option key={r.id} value={r.id}>{r.room_number}</option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border-2 border-slate-200 overflow-hidden">
          <div className="px-6 py-3 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">
              Tài sản trong phòng
            </span>
            {Object.values(selectedRecalls).filter(Boolean).length > 0 && (
              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold">
                {Object.values(selectedRecalls).filter(Boolean).length} đã chọn
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
            {!recallRoom && (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">
                Chọn tòa và phòng để xem tài sản
              </div>
            )}
            {recallRoom && roomAssetsLoading && (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">
                Đang tải tài sản trong phòng...
              </div>
            )}
            {recallRoom && !roomAssetsLoading && roomAssets.length === 0 && (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">
                Phòng này chưa có tài sản để thu hồi
              </div>
            )}
            {recallRoom && !roomAssetsLoading && roomAssets.map((asset) => {
              const assetKey = asset.asset_code || String(asset.id || "");
              const currentQuantity = Number(asset.quantity) || 0;
              const recallEntry = selectedRecalls[assetKey];
              const isChecked = !!recallEntry;
              const recallQty = isChecked ? (recallEntry.qty ?? currentQuantity) : 0;
              const isDisabled = !assetKey || currentQuantity <= 0;

              return (
                <div
                  key={assetKey}
                  className={`px-6 py-4 flex items-center justify-between gap-4 transition-colors ${isChecked ? "bg-orange-50" : "hover:bg-slate-50"}`}
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => {
                      if (isDisabled || recallLoading) return;
                      setSelectedRecalls((prev) => {
                        if (prev[assetKey]) {
                          const next = { ...prev };
                          delete next[assetKey];
                          return next;
                        }
                        return { ...prev, [assetKey]: { qty: currentQuantity } };
                      });
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isDisabled || recallLoading}
                      readOnly
                      className="w-4 h-4 accent-orange-500 cursor-pointer shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{asset.asset_name || asset.name || asset.asset_code}</p>
                      <p className="text-xs text-slate-500">
                        {asset.asset_code} • Hiện có: {currentQuantity} {asset.unit || "cái"}
                      </p>
                    </div>
                  </div>
                  {isChecked && (
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        min={1}
                        max={currentQuantity}
                        value={recallQty}
                        disabled={recallLoading}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(currentQuantity, Number(e.target.value) || 1));
                          setSelectedRecalls((prev) => ({ ...prev, [assetKey]: { qty: val } }));
                        }}
                        className="w-20 px-3 py-2 border border-orange-300 rounded-lg text-sm font-semibold text-right outline-none focus:ring-2 focus:ring-orange-200"
                      />
                      <button
                        type="button"
                        disabled={recallLoading}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecalls((prev) => ({ ...prev, [assetKey]: { qty: currentQuantity } }));
                        }}
                        className="px-3 py-2 text-xs font-bold rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                      >
                        Tất cả
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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
              disabled={!Object.values(selectedRecalls).some(Boolean) || recallLoading}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-colors disabled:opacity-40"
            >
              <RotateCcw size={14} /> Bỏ chọn
            </button>
            <button
              onClick={handleRecallAssets}
              disabled={!Object.values(selectedRecalls).some(Boolean) || recallLoading}
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

    </div>
  );
};

export default AssetSettings;

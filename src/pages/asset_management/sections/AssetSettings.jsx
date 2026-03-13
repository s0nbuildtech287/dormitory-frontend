import { useState, useEffect } from "react";
import { Package, Wrench, Settings, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Save, RotateCcw, ArrowLeftRight } from "lucide-react";
import { getAssets, getAssetsByRoom, createAsset, updateAsset, getAssetLimits, updateAssetLimits, getAssetRegulations, updateAssetRegulations } from "../../../api/apiAsset.js";
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

  // Section 4: Asset Regulations
  const [regulations, setRegulations] = useState([
    {
      id: 1,
      title: "Điều 1: Trách nhiệm bảo quản tài sản",
      content: "Sinh viên có trách nhiệm bảo quản tài sản được giao trong phòng ở. Mọi hư hỏng do sử dụng không đúng mục đích hoặc cố ý phá hoại sẽ phải bồi thường 100% giá trị tài sản."
    },
    {
      id: 2,
      title: "Điều 2: Bồi thường khi làm mất hoặc hư hỏng",
      content: "Khi làm mất hoàn toàn tài sản, sinh viên phải bồi thường 150% giá trị. Trường hợp hư hỏng có thể sửa chữa, sinh viên chịu toàn bộ chi phí sửa chữa hoặc bồi thường theo giá trị hư hỏng."
    },
    {
      id: 3,
      title: "Điều 3: Báo cáo hư hỏng và bảo trì",
      content: "Sinh viên phải báo cáo ngay cho ban quản lý trong vòng 24 giờ khi phát hiện tài sản hư hỏng. Việc không báo cáo kịp thời có thể bị coi là cố ý che giấu và phải chịu trách nhiệm bồi thường."
    },
    {
      id: 4,
      title: "Điều 4: Kiểm tra định kỳ",
      content: "Ban quản lý ký túc xá sẽ tiến hành kiểm tra tình trạng tài sản trong phòng định kỳ mỗi tháng. Sinh viên có trách nhiệm hợp tác và tạo điều kiện cho việc kiểm tra."
    },
    {
      id: 5,
      title: "Điều 5: Vật dụng cá nhân và vật cấm",
      content: "Sinh viên được phép mang đồ dùng cá nhân vào phòng nhưng nghiêm cấm mang các thiết bị nấu ăn, vật nuôi, chất dễ cháy nổ, vũ khí và các vật phẩm vi phạm pháp luật."
    },
    {
      id: 6,
      title: "Điều 6: Chuyển nhượng và di chuyển tài sản",
      content: "Nghiêm cấm tự ý di chuyển tài sản giữa các phòng hoặc mang tài sản của ký túc xá ra ngoài. Mọi trường hợp cần di chuyển phải được sự đồng ý của ban quản lý."
    },
    {
      id: 7,
      title: "Điều 7: Trả phòng và bàn giao tài sản",
      content: "Khi trả phòng, sinh viên phải bàn giao đầy đủ tài sản theo danh mục ban đầu. Nếu thiếu hoặc hư hỏng, phải hoàn tất việc bồi thường trước khi được hoàn trả tiền đặt cọc."
    },
    {
      id: 8,
      title: "Điều 8: Xử lý vi phạm",
      content: "Vi phạm các quy định về tài sản sẽ bị xử lý theo quy chế của ký túc xá, có thể bao gồm: cảnh cáo, phạt tiền, đình chỉ tạm thời hoặc buộc thôi ở tùy theo mức độ vi phạm."
    }
  ]);
  const [editingRegulation, setEditingRegulation] = useState(null);
  const [regulationsStatus, setRegulationsStatus] = useState(null);

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
        const assetId = String(asset.id || "");
        const maxQuantity = Number(asset.quantity) || 0;
        const recallQuantity = Number(selectedRecalls[assetId]) || 0;
        return {
          ...asset,
          assetId,
          maxQuantity,
          recallQuantity,
        };
      })
      .filter((asset) => asset.assetId && asset.recallQuantity > 0 && asset.recallQuantity <= asset.maxQuantity);

    if (selectedAssets.length === 0) return;

    setRecallLoading(true);
    setRecallStatus("saving");
    try {
      for (const asset of selectedAssets) {
        const {
          assetId,
          asset_code,
          recallQuantity,
          maxQuantity,
        } = asset;
        const remainQuantity = maxQuantity - recallQuantity;

        if (remainQuantity <= 0) {
          await updateAsset(assetId, {
            room_id: null,
            location: "Kho",
            status: "Sẵn sàng",
            quantity: maxQuantity,
          });
        } else {
          await updateAsset(assetId, { quantity: remainQuantity });
        }

        const assetsResponse = await getAssets({ search: asset_code });
        const warehouseAsset = (assetsResponse.data || []).find(
          (item) =>
            item.asset_code === asset_code &&
            String(item.id) !== assetId &&
            item.room_id === null &&
            item.status === "Sẵn sàng"
        );

        if (warehouseAsset) {
          await updateAsset(warehouseAsset.id, {
            quantity: (Number(warehouseAsset.quantity) || 0) + recallQuantity,
            room_id: null,
            location: "Kho",
            status: "Sẵn sàng",
          });
        } else if (remainQuantity > 0) {
          await createAsset({
            asset_code,
            name: asset.name || asset.asset_name || asset_code,
            category_name: asset.category_name || "Khác",
            unit: asset.unit || "Cái",
            room_id: null,
            location: "Kho",
            quantity: recallQuantity,
            status: "Sẵn sàng",
            condition: asset.condition || "Tốt",
            purchase_price: Number(asset.purchase_price) || 0,
            supplier: asset.supplier || "",
            warranty_period: Number(asset.warranty_period) || 0,
            description: asset.description || "",
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
            {Object.values(selectedRecalls).filter((qty) => Number(qty) > 0).length > 0 && (
              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold">
                {Object.values(selectedRecalls).filter((qty) => Number(qty) > 0).length} đã chọn
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
              const assetId = String(asset.id || "");
              const currentQuantity = Number(asset.quantity) || 0;
              const selectedQuantity = Number(selectedRecalls[assetId]) || 0;
              const isDisabled = !assetId || currentQuantity <= 0;

              return (
                <div key={assetId || `${asset.asset_code}-${asset.asset_name}`} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{asset.asset_name || asset.name || asset.asset_code}</p>
                    <p className="text-xs text-slate-500">
                      {asset.asset_code} • Hiện có: {currentQuantity} {asset.unit || "cái"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={currentQuantity}
                      value={selectedQuantity}
                      disabled={isDisabled || recallLoading}
                      onChange={(e) => {
                        const inputValue = Number(e.target.value) || 0;
                        const nextValue = Math.max(0, Math.min(currentQuantity, inputValue));
                        setSelectedRecalls((prev) => ({
                          ...prev,
                          [assetId]: nextValue,
                        }));
                      }}
                      className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-right outline-none focus:ring-2 focus:ring-orange-100 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      disabled={isDisabled || recallLoading}
                      onClick={() => {
                        setSelectedRecalls((prev) => ({
                          ...prev,
                          [assetId]: currentQuantity,
                        }));
                      }}
                      className="px-3 py-2 text-xs font-bold rounded-lg border border-orange-200 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                    >
                      Tất cả
                    </button>
                  </div>
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
              disabled={Object.values(selectedRecalls).every((qty) => !Number(qty)) || recallLoading}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-colors disabled:opacity-40"
            >
              <RotateCcw size={14} /> Bỏ chọn
            </button>
            <button
              onClick={handleRecallAssets}
              disabled={Object.values(selectedRecalls).every((qty) => !Number(qty)) || recallLoading}
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
        subtitle="Quy định về bảo quản, sử dụng và bồi thường tài sản trong ký túc xá"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b-2 border-slate-200">
            <h3 className="text-xl font-bold text-slate-900">QUY ĐỊNH VỀ QUẢN LÝ VÀ SỬ DỤNG TÀI SẢN</h3>
            <p className="text-sm text-slate-600">KÝ TÚC XÁ SINH VIÊN</p>
            <p className="text-xs text-slate-500 italic">(Ban hành kèm theo Quyết định số ... ngày ... tháng ... năm ...)</p>
          </div>

          {/* Regulations List */}
          <div className="space-y-4">
            {regulations.map((regulation, index) => (
              <div key={regulation.id} className="border-2 border-slate-200 rounded-xl overflow-hidden hover:border-green-200 transition-colors">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900">{regulation.title}</h4>
                    <button
                      onClick={() => setEditingRegulation(editingRegulation === regulation.id ? null : regulation.id)}
                      className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold"
                    >
                      {editingRegulation === regulation.id ? "Xong" : "Chỉnh sửa"}
                    </button>
                  </div>
                </div>
                <div className="px-6 py-4">
                  {editingRegulation === regulation.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={regulation.title}
                        onChange={(e) => {
                          const newRegs = [...regulations];
                          newRegs[index].title = e.target.value;
                          setRegulations(newRegs);
                        }}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Tiêu đề điều khoản..."
                      />
                      <textarea
                        value={regulation.content}
                        onChange={(e) => {
                          const newRegs = [...regulations];
                          newRegs[index].content = e.target.value;
                          setRegulations(newRegs);
                        }}
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none leading-relaxed"
                        placeholder="Nội dung điều khoản..."
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed text-justify">
                      {regulation.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Regulation */}
          <button
            onClick={() => {
              const newId = Math.max(...regulations.map(r => r.id)) + 1;
              setRegulations([...regulations, {
                id: newId,
                title: `Điều ${newId}: Tiêu đề mới`,
                content: "Nội dung điều khoản mới..."
              }]);
            }}
            className="w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-colors"
          >
            + Thêm điều khoản mới
          </button>

          {/* Footer Notice */}
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-semibold mb-2">Lưu ý quan trọng:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Điều lệ này có hiệu lực kể từ ngày ban hành</li>
                  <li>Mọi sinh viên ở ký túc xá đều phải tuân thủ các quy định trên</li>
                  <li>Sinh viên cần đọc kỹ và ký xác nhận đã hiểu rõ khi nhận phòng</li>
                  <li>Ban quản lý có quyền sửa đổi, bổ sung điều lệ khi cần thiết</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              {regulationsStatus === "success" && (
                <span className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                  <CheckCircle size={15} /> Đã lưu điều lệ thành công!
                </span>
              )}
              {regulationsStatus === "error" && (
                <span className="flex items-center gap-2 text-rose-700 text-sm font-semibold">
                  <AlertCircle size={15} /> Lỗi khi lưu điều lệ.
                </span>
              )}
              {!regulationsStatus && (
                <span className="text-sm text-slate-500">
                  {regulations.length} điều khoản • Có thể chỉnh sửa
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (confirm("Bạn có chắc muốn xóa điều khoản cuối cùng?")) {
                    setRegulations(regulations.slice(0, -1));
                  }
                }}
                disabled={regulations.length <= 1}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-colors disabled:opacity-40"
              >
                <RotateCcw size={14} /> Xóa cuối
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('assetRegulations', JSON.stringify(regulations));
                  setRegulationsStatus("success");
                  setTimeout(() => setRegulationsStatus(null), 4000);
                }}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200"
              >
                <Save size={14} /> Lưu điều lệ
              </button>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default AssetSettings;

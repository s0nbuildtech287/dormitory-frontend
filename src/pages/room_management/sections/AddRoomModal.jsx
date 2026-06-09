import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, CheckCircle2, Home, Layers3, Plus, X } from "lucide-react";
import { createBuildingRooms, createFloorRooms, createRoom, getRoomStructure } from "../../../api/apiRoom.js";

const MODES = {
  ROOM: "room",
  FLOOR: "floor",
  BUILDING: "building",
};

const DEFAULT_BUILDINGS = ["A", "B", "C", "D"];
const DEFAULT_GENDER = (building) => (building === "A" || building === "C" ? "Nam" : "Nữ");
const RESERVED_FOR_OPTIONS = [
  { value: "general", label: "Phòng thường" },
  { value: "freshmen", label: "Tân sinh viên" },
  { value: "returning_students", label: "Lưu sinh viên" },
  { value: "international", label: "Sinh viên quốc tế" },
];
const fmt = (value) => new Intl.NumberFormat("vi-VN").format(Number(value || 0));

const basePricing = {
  capacity: 5,
  gender_type: "Nam",
  rent_price: 500000,
  internet_fee: 50000,
  parking_fee: 30000,
  garbage_fee: 20000,
  area: 25,
  status: "Active",
  reserved_for: "general",
};

const formatRoomCode = (sequence, building, floor) => `room-${sequence}-${building}-${floor}`;

const extractSequence = (roomNumber, building, floor) => {
  const match = /^room-(\d+)-([^-]+)-(\d+)$/i.exec(String(roomNumber || "").trim());
  if (!match) return null;
  const [, sequence, roomBuilding, roomFloor] = match;
  if (roomBuilding?.toUpperCase() !== String(building || "").toUpperCase()) return null;
  if (Number(roomFloor) !== Number(floor)) return null;
  return Number(sequence);
};

const getNextSequenceFromRooms = (rooms, building, floor, fallbackStart = 100) => {
  const sequences = (Array.isArray(rooms) ? rooms : [])
    .map((room) => extractSequence(room.room_number, building, floor))
    .filter((value) => Number.isFinite(value));

  if (sequences.length === 0) return fallbackStart;
  return Math.max(...sequences) + 1;
};

const initialState = {
  mode: MODES.ROOM,
  building: "",
  floor: "",
  room_number: "",
  rooms_count: 10,
  floors_count: 5,
  rooms_per_floor: 10,
  room_start_number: 100,
  start_floor: 1,
  ...basePricing,
};

const inputClass =
  "w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm bg-white";

const sectionTitleClass = "text-sm font-bold text-slate-800 mb-3";

function normalizeStructureData(data) {
  return (Array.isArray(data) ? data : data?.data || []).map((item) => ({
    ...item,
    floors: Array.isArray(item.floors) ? item.floors.map(Number) : [],
  }));
}

function buildRoomPreview(form) {
  if (!form.building || !form.floor) return [];
  return [
    {
      building: form.building,
      floor: Number(form.floor),
      room_number: form.room_number || formatRoomCode(100, form.building, Number(form.floor)),
    },
  ];
}

function buildFloorPreview(form) {
  if (!form.building || !form.floor || !form.rooms_count || !form.room_start_number) return [];
  const floor = Number(form.floor);
  const start = Number(form.room_start_number);
  const count = Number(form.rooms_count);

  return Array.from({ length: count }, (_, index) => ({
    building: form.building,
    floor,
    room_number: formatRoomCode(start + index, form.building, floor),
  }));
}

function buildBuildingPreview(form) {
  if (!form.building || !form.floors_count || !form.rooms_per_floor || !form.room_start_number) return [];
  const floorsCount = Number(form.floors_count);
  const roomsPerFloor = Number(form.rooms_per_floor);
  const startFloor = Number(form.start_floor || 1);
  const startNumber = Number(form.room_start_number);

  const preview = [];
  for (let floorOffset = 0; floorOffset < floorsCount; floorOffset++) {
    const floor = startFloor + floorOffset;
    for (let roomIndex = 0; roomIndex < roomsPerFloor; roomIndex++) {
      preview.push({
        building: form.building,
        floor,
        room_number: formatRoomCode(startNumber + roomIndex, form.building, floor),
      });
    }
  }
  return preview;
}

function validateForm(form, existingRoomNumbers) {
  if (!form.building.trim()) return "Vui lòng nhập hoặc chọn tòa.";
  if (!Number(form.capacity) || Number(form.capacity) <= 0) return "Sức chứa phải lớn hơn 0.";
  if (Number(form.rent_price) < 0) return "Giá thuê không hợp lệ.";

  if (form.mode === MODES.ROOM) {
    if (!Number(form.floor) || Number(form.floor) <= 0) return "Vui lòng nhập tầng hợp lệ.";
    if (!form.room_number.trim()) return "Vui lòng nhập mã phòng.";
    if (existingRoomNumbers.has(form.room_number.trim().toLowerCase())) return "Mã phòng đã tồn tại.";
  }

  if (form.mode === MODES.FLOOR) {
    if (!Number(form.floor) || Number(form.floor) <= 0) return "Vui lòng nhập tầng hợp lệ.";
    if (!Number(form.rooms_count) || Number(form.rooms_count) <= 0) return "Số phòng của tầng phải lớn hơn 0.";
    if (!Number(form.room_start_number) || Number(form.room_start_number) <= 0) return "Thứ tự bắt đầu phải lớn hơn 0.";
  }

  if (form.mode === MODES.BUILDING) {
    if (!Number(form.floors_count) || Number(form.floors_count) <= 0) return "Số tầng phải lớn hơn 0.";
    if (!Number(form.rooms_per_floor) || Number(form.rooms_per_floor) <= 0) return "Số phòng mỗi tầng phải lớn hơn 0.";
    if (!Number(form.start_floor) || Number(form.start_floor) <= 0) return "Tầng bắt đầu phải lớn hơn 0.";
    if (!Number(form.room_start_number) || Number(form.room_start_number) <= 0) return "Thứ tự bắt đầu phải lớn hơn 0.";
  }

  return "";
}

const AddRoomModal = ({ isOpen, onClose, rooms = [], onSuccess }) => {
  const [form, setForm] = useState(initialState);
  const [structure, setStructure] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setForm(initialState);
    setError("");
    setMetaLoading(true);

    getRoomStructure()
      .then((data) => setStructure(normalizeStructureData(data)))
      .catch(() => setStructure([]))
      .finally(() => setMetaLoading(false));
  }, [isOpen]);

  const existingBuildings = useMemo(() => {
    const values = new Set([
      ...DEFAULT_BUILDINGS,
      ...normalizeStructureData({ data: structure }).map((item) => item.building),
      ...rooms.map((room) => room.building).filter(Boolean),
    ]);
    return [...values].sort();
  }, [rooms, structure]);

  const selectedBuildingMeta = useMemo(
    () => structure.find((item) => item.building === form.building),
    [structure, form.building]
  );

  const existingFloors = useMemo(() => selectedBuildingMeta?.floors || [], [selectedBuildingMeta]);

  const existingRoomNumbers = useMemo(
    () => new Set(rooms.map((room) => room.room_number?.toLowerCase()).filter(Boolean)),
    [rooms]
  );

  useEffect(() => {
    if (!form.building || !DEFAULT_BUILDINGS.includes(form.building)) return;
    setForm((prev) => ({ ...prev, gender_type: DEFAULT_GENDER(form.building) }));
  }, [form.building]);

  useEffect(() => {
    if (form.mode !== MODES.ROOM) return;
    if (!form.building || !form.floor) return;
    if (form.room_number) return;

    const suggested = formatRoomCode(
      getNextSequenceFromRooms(rooms, form.building, Number(form.floor), 100),
      form.building,
      Number(form.floor)
    );
    setForm((prev) => ({ ...prev, room_number: suggested }));
  }, [form.mode, form.building, form.floor, form.room_number, rooms]);

  const preview = useMemo(() => {
    if (form.mode === MODES.ROOM) return buildRoomPreview(form);
    if (form.mode === MODES.FLOOR) return buildFloorPreview(form);
    return buildBuildingPreview(form);
  }, [form]);

  const previewConflicts = useMemo(
    () => preview.filter((item) => existingRoomNumbers.has(item.room_number.toLowerCase())).map((item) => item.room_number),
    [preview, existingRoomNumbers]
  );

  const validationError = useMemo(() => validateForm(form, existingRoomNumbers), [form, existingRoomNumbers]);
  const canSubmit = !loading && !validationError && previewConflicts.length === 0;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    try {
      if (form.mode === MODES.ROOM) {
        await createRoom({
          room_number: form.room_number.trim(),
          building: form.building.trim(),
          floor: Number(form.floor),
          capacity: Number(form.capacity),
          gender_type: form.gender_type,
          rent_price: Number(form.rent_price),
          internet_fee: Number(form.internet_fee || 0),
          parking_fee: Number(form.parking_fee || 0),
          garbage_fee: Number(form.garbage_fee || 0),
          area: Number(form.area || 0),
          status: form.status || "Active",
          reserved_for: form.reserved_for,
        });
      } else if (form.mode === MODES.FLOOR) {
        await createFloorRooms({
          building: form.building.trim(),
          floor: Number(form.floor),
          rooms_count: Number(form.rooms_count),
          room_start_number: Number(form.room_start_number),
          capacity: Number(form.capacity),
          gender_type: form.gender_type,
          rent_price: Number(form.rent_price),
          internet_fee: Number(form.internet_fee || 0),
          parking_fee: Number(form.parking_fee || 0),
          garbage_fee: Number(form.garbage_fee || 0),
          area: Number(form.area || 0),
          status: form.status || "Active",
          reserved_for: form.reserved_for,
        });
      } else {
        await createBuildingRooms({
          building: form.building.trim(),
          floors_count: Number(form.floors_count),
          rooms_per_floor: Number(form.rooms_per_floor),
          start_floor: Number(form.start_floor),
          room_start_number: Number(form.room_start_number),
          capacity: Number(form.capacity),
          gender_type: form.gender_type,
          rent_price: Number(form.rent_price),
          internet_fee: Number(form.internet_fee || 0),
          parking_fee: Number(form.parking_fee || 0),
          garbage_fee: Number(form.garbage_fee || 0),
          area: Number(form.area || 0),
          status: form.status || "Active",
          reserved_for: form.reserved_for,
        });
      }

      onSuccess?.();
      onClose();
    } catch (submitError) {
      setError(submitError.message || "Không thể tạo dữ liệu phòng.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Quản lý tạo phòng</h3>
            <p className="text-sm text-slate-500 mt-1">Tách riêng 3 luồng: tạo phòng lẻ, khởi tạo tầng và khởi tạo tòa.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: MODES.ROOM, title: "Thêm phòng", subtitle: "Tạo 1 phòng lẻ", icon: Home },
              { key: MODES.FLOOR, title: "Khởi tạo tầng", subtitle: "Sinh nhiều phòng cho 1 tầng", icon: Layers3 },
              { key: MODES.BUILDING, title: "Khởi tạo tòa", subtitle: "Sinh nhiều phòng cho cả tòa", icon: Building2 },
            ].map(({ key, title, subtitle, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...initialState,
                    mode: key,
                    building: prev.building,
                    gender_type: prev.gender_type,
                    reserved_for: prev.reserved_for,
                  }))
                }
                className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                  form.mode === key
                    ? "border-blue-950 bg-blue-950 text-white shadow-lg shadow-blue-950/20"
                    : "border-blue-100 bg-gradient-to-br from-blue-50 to-slate-100 text-slate-800 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <Icon size={18} className="mb-3" />
                <p className="font-bold">{title}</p>
                <p className={`text-xs mt-1 ${form.mode === key ? "text-blue-100" : "text-slate-500"}`}>{subtitle}</p>
              </button>
            ))}
          </div>

          {(error || validationError || previewConflicts.length > 0) && (
            <div className="space-y-2">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="shrink-0" />
                  {error}
                </div>
              )}
              {validationError && !error && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="shrink-0" />
                  {validationError}
                </div>
              )}
              {previewConflicts.length > 0 && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="shrink-0" />
                  Mã phòng bị trùng: {previewConflicts.slice(0, 8).join(", ")}
                  {previewConflicts.length > 8 ? "..." : ""}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tòa *</label>
              <input
                list="building-options"
                value={form.building}
                onChange={(e) => handleChange("building", e.target.value.toUpperCase())}
                placeholder="Ví dụ: A, B, E"
                className={inputClass}
              />
              <datalist id="building-options">
                {existingBuildings.map((building) => (
                  <option key={building} value={building} />
                ))}
              </datalist>
              {metaLoading ? (
                <p className="text-xs text-slate-400 mt-1">Đang tải metadata tòa/tầng...</p>
              ) : selectedBuildingMeta ? (
                <p className="text-xs text-slate-500 mt-1">
                  Tòa {form.building} hiện có {selectedBuildingMeta.room_count} phòng, {selectedBuildingMeta.floor_count} tầng.
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">Nếu nhập tòa mới, hệ thống sẽ tạo theo cấu hình bạn nhập.</p>
              )}
            </div>

            {form.mode === MODES.ROOM && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tầng *</label>
                <input
                  list="floor-options"
                  type="number"
                  min="1"
                  value={form.floor}
                  onChange={(e) => handleChange("floor", e.target.value)}
                  placeholder="Ví dụ: 3"
                  className={inputClass}
                />
                <datalist id="floor-options">
                  {existingFloors.map((floor) => (
                    <option key={floor} value={floor} />
                  ))}
                </datalist>
                <p className="text-xs text-slate-400 mt-1">Tạo 1 phòng đơn lẻ trong tòa và tầng đã chọn.</p>
              </div>
            )}

            {form.mode === MODES.FLOOR && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tầng *</label>
                <input type="number" min="1" value={form.floor} onChange={(e) => handleChange("floor", e.target.value)} className={inputClass} />
                <p className="text-xs text-slate-400 mt-1">Khởi tạo nhiều phòng trong cùng 1 tầng.</p>
              </div>
            )}

            {form.mode === MODES.BUILDING && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giới tính áp dụng *</label>
                <select value={form.gender_type} onChange={(e) => handleChange("gender_type", e.target.value)} className={inputClass}>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">Áp dụng cho toàn bộ các phòng được sinh ra.</p>
              </div>
            )}
          </div>

          {form.mode !== MODES.BUILDING && (
            <div className="grid grid-cols-3 gap-4">
              {form.mode === MODES.ROOM ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mã phòng *</label>
                  <input value={form.room_number} onChange={(e) => handleChange("room_number", e.target.value.toUpperCase())} className={inputClass} placeholder="Ví dụ: room-101-A-10" />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số phòng của tầng *</label>
                    <input type="number" min="1" value={form.rooms_count} onChange={(e) => handleChange("rooms_count", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Thứ tự bắt đầu *</label>
                    <input type="number" min="1" value={form.room_start_number} onChange={(e) => handleChange("room_start_number", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giới tính phòng *</label>
                    <select value={form.gender_type} onChange={(e) => handleChange("gender_type", e.target.value)} className={inputClass}>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {form.mode === MODES.BUILDING && (
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số tầng *</label>
                <input type="number" min="1" value={form.floors_count} onChange={(e) => handleChange("floors_count", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phòng / tầng *</label>
                <input type="number" min="1" value={form.rooms_per_floor} onChange={(e) => handleChange("rooms_per_floor", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tầng bắt đầu *</label>
                <input type="number" min="1" value={form.start_floor} onChange={(e) => handleChange("start_floor", e.target.value)} className={inputClass} />
              </div>
              <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Thứ tự bắt đầu *</label>
                <input type="number" min="1" value={form.room_start_number} onChange={(e) => handleChange("room_start_number", e.target.value)} className={inputClass} />
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
            <h4 className={sectionTitleClass}>Cấu hình chung</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sức chứa *</label>
                <input type="number" min="1" value={form.capacity} onChange={(e) => handleChange("capacity", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giá thuê / tháng *</label>
                <input type="number" min="0" value={form.rent_price} onChange={(e) => handleChange("rent_price", e.target.value)} className={inputClass} />
                <p className="text-xs text-slate-400 mt-1">{fmt(form.rent_price)} VNĐ</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Đối tượng sử dụng</label>
                <select value={form.reserved_for} onChange={(e) => handleChange("reserved_for", e.target.value)} className={inputClass}>
                  {RESERVED_FOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Giá trị này sẽ được lưu vào cột <code>reserved_for</code>.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Internet</label>
                <input type="number" min="0" value={form.internet_fee} onChange={(e) => handleChange("internet_fee", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gửi xe</label>
                <input type="number" min="0" value={form.parking_fee} onChange={(e) => handleChange("parking_fee", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phí rác</label>
                <input type="number" min="0" value={form.garbage_fee} onChange={(e) => handleChange("garbage_fee", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Diện tích</label>
                <input type="number" min="0" value={form.area} onChange={(e) => handleChange("area", e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h4 className="font-bold text-slate-800">Preview</h4>
                <p className="text-xs text-slate-500">
                  {form.mode === MODES.ROOM && "Xem trước phòng sẽ được tạo."}
                  {form.mode === MODES.FLOOR && "Xem trước danh sách phòng sẽ sinh cho tầng."}
                  {form.mode === MODES.BUILDING && "Xem trước danh sách phòng sẽ sinh cho cả tòa."}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{preview.length}</p>
                <p className="text-xs text-slate-500">phòng dự kiến</p>
              </div>
            </div>

            {preview.length === 0 ? (
              <p className="text-sm text-slate-400">Nhập đủ thông tin để xem preview.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {preview.slice(0, 20).map((item) => (
                  <div key={item.room_number} className="flex items-center justify-between rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm">
                    <div>
                      <p className="font-bold text-slate-800">{item.room_number}</p>
                      <p className="text-slate-500 text-xs">Tòa {item.building} · Tầng {item.floor}</p>
                    </div>
                    {existingRoomNumbers.has(item.room_number.toLowerCase()) ? (
                      <span className="text-red-600 text-xs font-bold">Trùng mã</span>
                    ) : (
                      <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Hợp lệ
                      </span>
                    )}
                  </div>
                ))}
                {preview.length > 20 && <p className="text-xs text-slate-400">Còn {preview.length - 20} phòng khác trong preview.</p>}
              </div>
            )}
          </div>
        </form>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm">
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition-colors font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
            {loading
              ? "Đang xử lý..."
              : form.mode === MODES.ROOM
                ? "Tạo phòng"
                : form.mode === MODES.FLOOR
                  ? "Khởi tạo tầng"
                  : "Khởi tạo tòa"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRoomModal;

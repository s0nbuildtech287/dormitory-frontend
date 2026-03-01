import { useState, useEffect, useMemo } from "react";
import { X, Plus, AlertTriangle, CheckCircle2, Info, Building2 } from "lucide-react";
import { createRoom } from "../../../api/apiRoom.js";

const DEFAULT_BUILDINGS = ["A", "B", "C", "D"];
// A, C = Nam | B, D = Nữ — chỉ áp dụng với tòa mặc định
const defaultGenderOf = (b) => (b === "A" || b === "C" ? "Nam" : "Nữ");
const isDefaultBuilding = (b) => DEFAULT_BUILDINGS.includes(b?.toUpperCase());

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n);

const AddRoomModal = ({ isOpen, onClose, rooms = [], onSuccess }) => {
  const defaultForm = {
    buildingSelect: "", // giá trị dropdown tòa ("A","B",... hoặc "__new__")
    buildingInput: "", // khi chọn "__new__", nhập tên tòa mới
    floorSelect: "", // giá trị dropdown tầng (số hoặc "__new__")
    floorInput: "", // khi chọn "__new__", nhập số tầng mới
    gender: "Nam",
    roomNumber: "",
    capacity: 5,
    rentPrice: 500000,
    internetFee: 50000,
    parkingFee: 30000,
    garbageFee: 20000,
    area: 25,
  };

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roomNumberManuallyEdited, setRoomNumberManuallyEdited] = useState(false);

  // Reset khi modal mở lại
  useEffect(() => {
    if (isOpen) {
      setForm(defaultForm);
      setError("");
      setRoomNumberManuallyEdited(false);
    }
  }, [isOpen]);

  // Danh sách tòa có trong database (duy nhất, có sắp xếp)
  const existingBuildings = useMemo(() => {
    const set = new Set(rooms.map((r) => r.building).filter(Boolean));
    return [...set].sort();
  }, [rooms]);

  // Tòa đang dùng (resolved)
  const activeBuilding = form.buildingSelect === "__new__" ? form.buildingInput.trim() : form.buildingSelect;

  // Danh sách tầng có trong tòa đang chọn
  const existingFloors = useMemo(() => {
    if (!activeBuilding) return [];
    const set = new Set(rooms.filter((r) => r.building === activeBuilding).map((r) => String(r.floor)));
    return [...set].sort((a, b) => parseInt(a) - parseInt(b));
  }, [rooms, activeBuilding]);

  // Tầng đang dùng (resolved)
  const activeFloor = form.floorSelect === "__new__" ? form.floorInput.trim() : form.floorSelect;

  // Phòng thuộc tầng + tòa đang chọn
  const roomsOnFloor = useMemo(() => {
    if (!activeBuilding || !activeFloor) return [];
    return rooms.filter((r) => r.building === activeBuilding && String(r.floor) === String(activeFloor));
  }, [rooms, activeBuilding, activeFloor]);

  // Giới tính tự động nếu là tòa mặc định
  useEffect(() => {
    if (form.buildingSelect !== "__new__" && form.buildingSelect) {
      setForm((prev) => ({ ...prev, gender: defaultGenderOf(form.buildingSelect) }));
    }
  }, [form.buildingSelect]);

  // Auto-suggest mã phòng — format: room-{XXX}-{tòa}-{tầng}
  useEffect(() => {
    if (!activeBuilding || !activeFloor || roomNumberManuallyEdited) return;
    const roomsInBuilding = rooms.filter((r) => r.building === activeBuilding);
    const nextNum = roomsInBuilding.length + 1;
    const suggested = `room-${String(nextNum).padStart(3, "0")}-${activeBuilding}-${activeFloor}`;
    setForm((prev) => ({ ...prev, roomNumber: suggested }));
  }, [activeBuilding, activeFloor, rooms, roomNumberManuallyEdited]);

  // Kiểm tra trùng mã phòng
  const isDuplicate = useMemo(() => {
    if (!form.roomNumber.trim()) return false;
    return rooms.some((r) => r.room_number?.toLowerCase() === form.roomNumber.trim().toLowerCase());
  }, [rooms, form.roomNumber]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleBuildingSelectChange = (val) => {
    setRoomNumberManuallyEdited(false);
    setForm((prev) => ({
      ...prev,
      buildingSelect: val,
      buildingInput: "",
      floorSelect: "",
      floorInput: "",
      roomNumber: "",
      gender: val !== "__new__" && val ? defaultGenderOf(val) : "Nam",
    }));
  };

  const handleFloorSelectChange = (val) => {
    setRoomNumberManuallyEdited(false);
    setForm((prev) => ({ ...prev, floorSelect: val, floorInput: "", roomNumber: "" }));
  };

  const canSubmit =
    !loading &&
    !isDuplicate &&
    activeBuilding &&
    activeFloor &&
    form.roomNumber.trim() &&
    // nếu nhập tòa mới thì phải có tên
    (form.buildingSelect !== "__new__" || form.buildingInput.trim()) &&
    // nếu nhập tầng mới thì phải là số hợp lệ
    (form.floorSelect !== "__new__" || (form.floorInput.trim() && !isNaN(parseInt(form.floorInput))));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");
    try {
      await createRoom({
        room_number: form.roomNumber.trim(),
        building: activeBuilding,
        floor: parseInt(activeFloor),
        capacity: parseInt(form.capacity),
        current_occupancy: 0,
        gender_type: form.gender,
        rent_price: parseFloat(form.rentPrice),
        internet_fee: parseFloat(form.internetFee),
        parking_fee: parseFloat(form.parkingFee),
        garbage_fee: parseFloat(form.garbageFee),
        area: parseFloat(form.area),
        status: "Active",
        equipment: JSON.stringify({ "Giường đơn": 1, "Tủ quần áo": 1, "Bàn học": 1, Ghế: 1, "Quạt máy": 1 }),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || "Thêm phòng thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl animate-in scale-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <h3 className="text-xl font-bold text-slate-900">Thêm phòng mới</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* ── Tòa nhà ── */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tòa nhà *</label>
            <select
              value={form.buildingSelect}
              onChange={(e) => handleBuildingSelectChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm bg-white"
              required
            >
              <option value="">— Chọn tòa —</option>
              {existingBuildings.map((b) => (
                <option key={b} value={b}>
                  Tòa {b}
                  {isDefaultBuilding(b) ? ` — ${defaultGenderOf(b)}` : ""}
                </option>
              ))}
              {/* Always show defaults not yet in DB */}
              {DEFAULT_BUILDINGS.filter((b) => !existingBuildings.includes(b)).map((b) => (
                <option key={b} value={b}>
                  Tòa {b} — {defaultGenderOf(b)} (chưa có phòng)
                </option>
              ))}
              <option value="__new__">✦ Thêm tòa mới...</option>
            </select>

            {/* Input tòa mới */}
            {form.buildingSelect === "__new__" && (
              <div className="mt-2 flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={form.buildingInput}
                    onChange={(e) => {
                      setRoomNumberManuallyEdited(false);
                      setForm((prev) => ({ ...prev, buildingInput: e.target.value.toUpperCase(), floorSelect: "", floorInput: "", roomNumber: "" }));
                    }}
                    placeholder="Tên tòa, ví dụ: E"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                    maxLength={10}
                  />
                </div>
                <div className="w-36">
                  <select
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm bg-white"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* ── Tầng ── */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tầng *</label>
            <select
              value={form.floorSelect}
              onChange={(e) => handleFloorSelectChange(e.target.value)}
              disabled={!activeBuilding && form.buildingSelect !== "__new__"}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm bg-white disabled:opacity-50"
              required
            >
              <option value="">— Chọn tầng —</option>
              {existingFloors.map((f) => {
                const count = rooms.filter((r) => r.building === activeBuilding && String(r.floor) === String(f)).length;
                return (
                  <option key={f} value={f}>
                    Tầng {f} — đang có {count} phòng
                  </option>
                );
              })}
              <option value="__new__">✦ Thêm tầng mới...</option>
            </select>

            {/* Input tầng mới */}
            {form.floorSelect === "__new__" && (
              <div className="mt-2">
                <input
                  type="number"
                  value={form.floorInput}
                  onChange={(e) => {
                    setRoomNumberManuallyEdited(false);
                    setForm((prev) => ({ ...prev, floorInput: e.target.value, roomNumber: "" }));
                  }}
                  placeholder="Số tầng, ví dụ: 11"
                  min="1"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                />
              </div>
            )}
          </div>

          {/* Thông tin tầng đang chọn (chỉ thông báo, không chặn) */}
          {activeBuilding && activeFloor && (
            <div className="flex items-start gap-2 text-sm rounded-xl px-4 py-3 border bg-slate-50 border-slate-200 text-slate-600">
              <Info size={16} className="shrink-0 mt-0.5 text-slate-400" />
              <span>
                Tòa <strong>{activeBuilding}</strong> — Tầng <strong>{activeFloor}</strong>: đang có <strong>{roomsOnFloor.length}</strong> phòng.
                {roomsOnFloor.length === 0 && " (tầng mới)"}
              </span>
            </div>
          )}

          {/* ── Mã phòng ── */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mã phòng *<span className="ml-2 text-xs font-normal text-slate-400">(tự động, có thể chỉnh)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.roomNumber}
                onChange={(e) => {
                  setRoomNumberManuallyEdited(true);
                  set("roomNumber", e.target.value);
                }}
                placeholder="Ví dụ: E01-01"
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-4 outline-none text-sm pr-10 ${
                  isDuplicate ? "border-red-400 focus:ring-red-50 bg-red-50" : form.roomNumber ? "border-green-400 focus:ring-green-50" : "border-slate-200 focus:ring-blue-50"
                }`}
                required
              />
              {form.roomNumber && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isDuplicate ? <AlertTriangle size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-green-500" />}
                </div>
              )}
            </div>
            {isDuplicate && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle size={12} /> Mã phòng này đã tồn tại, vui lòng dùng mã khác.
              </p>
            )}
            {!isDuplicate && form.roomNumber && <p className="text-xs text-green-600 mt-1">Mã phòng hợp lệ.</p>}
          </div>

          {/* ── Giới tính & Sức chứa ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giới tính phòng *</label>
              {form.buildingSelect === "__new__" ? (
                <select
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm bg-white"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              ) : (
                <>
                  <input
                    type="text"
                    value={activeBuilding ? defaultGenderOf(activeBuilding) : "—"}
                    readOnly
                    className="w-full px-4 py-2.5 border border-slate-100 rounded-xl bg-slate-50 text-slate-600 text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-1">Theo tòa (A/C=Nam, B/D=Nữ)</p>
                </>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sức chứa (người) *</label>
              <input
                type="number"
                value={form.capacity}
                onChange={(e) => set("capacity", e.target.value)}
                min="1"
                max="20"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                required
              />
            </div>
          </div>

          {/* ── Giá thuê + Diện tích ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giá thuê (VNĐ/tháng) *</label>
              <input
                type="number"
                value={form.rentPrice}
                onChange={(e) => set("rentPrice", e.target.value)}
                min="0"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                required
              />
              <p className="text-xs text-slate-400 mt-1">{fmt(form.rentPrice || 0)} VNĐ</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Diện tích (m²)</label>
              <input
                type="number"
                value={form.area}
                onChange={(e) => set("area", e.target.value)}
                min="1"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
              />
            </div>
          </div>

          {/* ── Phí dịch vụ ── */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-sm font-bold text-slate-700 mb-3">Phí dịch vụ</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Internet (VNĐ/tháng)</label>
                <input
                  type="number"
                  value={form.internetFee}
                  onChange={(e) => set("internetFee", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-50 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gửi xe (VNĐ/tháng)</label>
                <input
                  type="number"
                  value={form.parkingFee}
                  onChange={(e) => set("parkingFee", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-50 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phí rác (VNĐ/tháng)</label>
                <input
                  type="number"
                  value={form.garbageFee}
                  onChange={(e) => set("garbageFee", e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-50 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
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
            {loading ? "Đang thêm..." : "Thêm phòng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRoomModal;

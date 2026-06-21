import { useState, useEffect } from "react";
import { X, Receipt, AlertTriangle } from "lucide-react";
import { getRooms } from "../../../api/apiRoom.js";
import { createInvoiceFromRoom } from "../../../api/apiInvoice.js";
import useBuildingDisplayNames from "../../../hooks/useBuildingDisplayNames.js";

const CreateInvoiceModal = ({ isOpen, onClose, onSuccess }) => {
  const { getRoomLabel } = useBuildingDisplayNames();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [billingMonth, setBillingMonth] = useState("");
  const [electricEnd, setElectricEnd] = useState("");
  const [waterEnd, setWaterEnd] = useState("");
  
  // Pricing fields with defaults
  const [rentPerPerson, setRentPerPerson] = useState(500000);
  const [electricRate, setElectricRate] = useState(3500);
  const [waterRate, setWaterRate] = useState(15000);
  const [garbageFee, setGarbageFee] = useState(70000);
  const [internetFee, setInternetFee] = useState(300000);
  const [parkingFeePerVehicle, setParkingFeePerVehicle] = useState(50000);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
      // Set default billing month to previous month (YYYY-MM format)
      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const formatted = `${prevMonth.getFullYear()}-${(prevMonth.getMonth() + 1).toString().padStart(2, '0')}`;
      setBillingMonth(formatted);
    }
  }, [isOpen]);

  const fetchRooms = async () => {
    try {
      const response = await getRooms();
      if (response.success) {
        // Only show rooms with occupancy > 0
        const occupiedRooms = response.data.filter(r => r.currentOccupancy > 0);
        setRooms(occupiedRooms);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const handleRoomChange = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    setSelectedRoom(room);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedRoom) {
      setError("Vui lòng chọn phòng");
      return;
    }

    if (!electricEnd || !waterEnd) {
      setError("Vui lòng nhập đầy đủ số điện và số nước");
      return;
    }

    if (parseFloat(electricEnd) < 0 || parseFloat(waterEnd) < 0) {
      setError("Số điện và số nước phải lớn hơn hoặc bằng 0");
      return;
    }

    try {
      setLoading(true);
      // Convert YYYY-MM to YYYY-MM-01 for backend
      const billingMonthDate = `${billingMonth}-01`;
      await createInvoiceFromRoom(
        selectedRoom.id,
        billingMonthDate,
        {
          electric_end: parseFloat(electricEnd),
          water_end: parseFloat(waterEnd)
        }
      );
      
      onSuccess();
      handleClose();
    } catch (err) {
      // Display error message from backend
      const errorMessage = err.response?.data?.message || err.message || "Tạo hóa đơn thất bại";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRoom(null);
    setElectricEnd("");
    setWaterEnd("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  // Calculate preview amounts
  const rentAmount = selectedRoom ? selectedRoom.currentOccupancy * rentPerPerson : 0;
  const electricAmount = electricEnd ? parseFloat(electricEnd) * electricRate : 0;
  const waterAmount = waterEnd ? parseFloat(waterEnd) * waterRate : 0;
  const serviceFees = garbageFee + internetFee + (selectedRoom?.currentOccupancy || 0) * parkingFeePerVehicle;
  const totalAmount = rentAmount + electricAmount + waterAmount + serviceFees;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-in scale-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Receipt size={24} className="text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Tạo hóa đơn mới</h3>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Chọn phòng <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedRoom?.id || ""}
              onChange={(e) => handleRoomChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
              required
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {getRoomLabel(room.building, room.room_number)} ({room.currentOccupancy} người)
                </option>
              ))}
            </select>
          </div>

          {/* Billing Month */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Kỳ thanh toán <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Chọn tháng cần tạo hóa đơn</p>
          </div>

          {/* Meter Readings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Số điện (kWh) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={electricEnd}
                onChange={(e) => setElectricEnd(e.target.value)}
                placeholder="Ví dụ: 75"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Bắt đầu từ 0 kWh</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Số nước (m³) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={waterEnd}
                onChange={(e) => setWaterEnd(e.target.value)}
                placeholder="Ví dụ: 5"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Bắt đầu từ 0 m³</p>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-slate-700 mb-2">Bảng giá dịch vụ</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Giá phòng/người
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={rentPerPerson}
                  onChange={(e) => setRentPerPerson(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-50 outline-none text-sm"
                />
                <p className="text-xs text-slate-500 mt-0.5">{Math.round(rentPerPerson).toLocaleString('vi-VN')} VNĐ</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Giá điện/kWh
                </label>
                <input
                  type="number"
                  step="100"
                  min="0"
                  value={electricRate}
                  onChange={(e) => setElectricRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-50 outline-none text-sm"
                />
                <p className="text-xs text-slate-500 mt-0.5">{Math.round(electricRate).toLocaleString('vi-VN')} VNĐ</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Giá nước/m³
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={waterRate}
                  onChange={(e) => setWaterRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-50 outline-none text-sm"
                />
                <p className="text-xs text-slate-500 mt-0.5">{Math.round(waterRate).toLocaleString('vi-VN')} VNĐ</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phí rác/phòng
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={garbageFee}
                  onChange={(e) => setGarbageFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-50 outline-none text-sm"
                />
                <p className="text-xs text-slate-500 mt-0.5">{Math.round(garbageFee).toLocaleString('vi-VN')} VNĐ</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phí mạng/phòng
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={internetFee}
                  onChange={(e) => setInternetFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-50 outline-none text-sm"
                />
                <p className="text-xs text-slate-500 mt-0.5">{Math.round(internetFee).toLocaleString('vi-VN')} VNĐ</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phí xe/người
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={parkingFeePerVehicle}
                  onChange={(e) => setParkingFeePerVehicle(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-50 outline-none text-sm"
                />
                <p className="text-xs text-slate-500 mt-0.5">{Math.round(parkingFeePerVehicle).toLocaleString('vi-VN')} VNĐ</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {selectedRoom && electricEnd && waterEnd && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-bold text-slate-700 mb-3">Dự tính chi phí</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tiền phòng ({selectedRoom.currentOccupancy} người × {Math.round(rentPerPerson).toLocaleString('vi-VN')}đ)</span>
                  <span className="font-semibold text-slate-900">{Math.round(rentAmount).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tiền điện ({electricEnd} kWh × {Math.round(electricRate).toLocaleString('vi-VN')}đ)</span>
                  <span className="font-semibold text-slate-900">{Math.round(electricAmount).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tiền nước ({waterEnd} m³ × {Math.round(waterRate).toLocaleString('vi-VN')}đ)</span>
                  <span className="font-semibold text-slate-900">{Math.round(waterAmount).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Phí rác</span>
                  <span className="font-semibold text-slate-900">{Math.round(garbageFee).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Phí mạng</span>
                  <span className="font-semibold text-slate-900">{Math.round(internetFee).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Phí xe ({selectedRoom.currentOccupancy} người × {Math.round(parkingFeePerVehicle).toLocaleString('vi-VN')}đ)</span>
                  <span className="font-semibold text-slate-900">{Math.round(selectedRoom.currentOccupancy * parkingFeePerVehicle).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between">
                  <span className="font-bold text-slate-900">Tổng cộng</span>
                  <span className="font-bold text-blue-700 text-base">{Math.round(totalAmount).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRoom || !electricEnd || !waterEnd}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo hóa đơn"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;

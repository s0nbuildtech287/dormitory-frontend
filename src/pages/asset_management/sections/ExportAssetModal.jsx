import { useState, useEffect } from "react";
import { X, ArrowUpFromLine, Save, Eye, Package } from "lucide-react";
import { getRooms } from "../../../api/apiRoom.js";
import { exportAsset, getAssets, getAssetsByRoom } from "../../../api/apiAsset.js";

const ExportAssetModal = ({ isOpen, onClose, onSuccess }) => {
  // 8 loại tài sản cố định
  const assetTypes = [
    { code: 'GIUONG', name: 'Giường', category: 'Nội thất', unit: 'Cái' },
    { code: 'TU', name: 'Tủ quần áo', category: 'Nội thất', unit: 'Cái' },
    { code: 'BAN', name: 'Bàn học', category: 'Nội thất', unit: 'Cái' },
    { code: 'QUAT', name: 'Quạt trần', category: 'Thiết bị điện', unit: 'Cái' },
    { code: 'DIEUHOA', name: 'Điều hòa', category: 'Thiết bị điện', unit: 'Cái' },
    { code: 'DEN', name: 'Đèn', category: 'Thiết bị điện', unit: 'Cái' },
    { code: 'CAMERA', name: 'Camera an ninh', category: 'Thiết bị an ninh', unit: 'Cái' },
    { code: 'WIFI', name: 'Bộ phát Wifi', category: 'Thiết bị mạng', unit: 'Bộ' },
  ];

  const buildings = ['A', 'B', 'C', 'D'];

  const [formData, setFormData] = useState({
    asset_code: '',
    asset_name: '',
    category_name: '',
    unit: 'Cái',
    quantity: 1,
    available_quantity: 0,
    export_date: new Date().toISOString().split("T")[0],
    building: '',
    room_id: '',
    room_number: '',
    purpose: 'Sử dụng',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [showRoomAssetsModal, setShowRoomAssetsModal] = useState(false);
  const [roomAssets, setRoomAssets] = useState([]);
  const [loadingRoomAssets, setLoadingRoomAssets] = useState(false);

  // Fetch rooms when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRooms();
    }
  }, [isOpen]);

  // Filter rooms by building
  useEffect(() => {
    if (formData.building) {
      const filtered = rooms.filter(room => room.building === formData.building);
      setFilteredRooms(filtered);
    } else {
      setFilteredRooms([]);
    }
  }, [formData.building, rooms]);

  const fetchRooms = async () => {
    try {
      const response = await getRooms();
      setRooms(response.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleAssetTypeChange = async (e) => {
    const selectedType = assetTypes.find(type => type.code === e.target.value);
    if (selectedType) {
      setFormData(prev => ({
        ...prev,
        asset_code: selectedType.code,
        asset_name: selectedType.name,
        category_name: selectedType.category,
        unit: selectedType.unit,
        available_quantity: 0,
      }));
      
      // Fetch available quantity from warehouse
      try {
        const response = await getAssets({ search: selectedType.code });
        if (response.success && response.data) {
          // Find asset in warehouse (room_id = null, status = 'Sẵn sàng')
          const warehouseAsset = response.data.find(
            asset => asset.asset_code === selectedType.code && 
                    asset.room_id === null && 
                    asset.status === 'Sẵn sàng'
          );
          
          if (warehouseAsset) {
            setFormData(prev => ({
              ...prev,
              available_quantity: warehouseAsset.quantity || 0,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching available quantity:", error);
      }
    }
  };

  const handleBuildingChange = (e) => {
    setFormData(prev => ({
      ...prev,
      building: e.target.value,
      room_id: '',
      room_number: '',
    }));
  };

  const handleRoomChange = (e) => {
    const selectedRoom = filteredRooms.find(room => room.id === e.target.value);
    if (selectedRoom) {
      setFormData(prev => ({
        ...prev,
        room_id: selectedRoom.id,
        room_number: selectedRoom.room_number,
      }));
    }
  };

  const handleViewRoomAssets = async () => {
    if (!formData.room_id) {
      alert("Vui lòng chọn phòng trước");
      return;
    }

    setLoadingRoomAssets(true);
    setShowRoomAssetsModal(true);
    try {
      const response = await getAssetsByRoom(formData.room_id);
      const assets = response.data || [];
      console.log("Room assets response:", assets);
      setRoomAssets(assets);
    } catch (error) {
      console.error("Error fetching room assets:", error);
      setRoomAssets([]);
    } finally {
      setLoadingRoomAssets(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate quantity
    if (formData.quantity > formData.available_quantity) {
      setError(`Số lượng xuất không được vượt quá số lượng tồn kho (${formData.available_quantity} ${formData.unit})`);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await exportAsset(formData);
      onSuccess();
    } catch (err) {
      console.error("Error exporting asset:", err);
      setError(err.message || "Không thể xuất kho. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group assets by asset_code and sum quantities
  const groupedRoomAssets = roomAssets.reduce((acc, asset) => {
    const key = asset.asset_code;
    if (!acc[key]) {
      acc[key] = {
        asset_name: asset.asset_name,
        unit: asset.unit,
        quantity: 0
      };
    }
    acc[key].quantity += Number(asset.quantity) || 0;
    return acc;
  }, {});

  const groupedAssetsList = Object.values(groupedRoomAssets);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <ArrowUpFromLine className="w-5 h-5 text-slate-700" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Xuất kho tài sản</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Select Asset Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Loại tài sản <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.asset_code}
              onChange={handleAssetTypeChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">-- Chọn loại tài sản --</option>
              {assetTypes.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.name} ({type.category})
                </option>
              ))}
            </select>
          </div>

          {/* Display selected asset info */}
          {formData.asset_code && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 font-medium">Mã tài sản</p>
                  <p className="text-slate-900 font-semibold">{formData.asset_code}</p>
                </div>
                <div>
                  <p className="text-slate-600 font-medium">Tên tài sản</p>
                  <p className="text-slate-900 font-semibold">{formData.asset_name}</p>
                </div>
                <div>
                  <p className="text-slate-600 font-medium">Danh mục</p>
                  <p className="text-slate-900 font-semibold">{formData.category_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Available & Export Quantity */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tồn kho
              </label>
              <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-semibold">
                {formData.available_quantity} {formData.unit}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số lượng xuất <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                max={formData.available_quantity}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ngày xuất <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="export_date"
                value={formData.export_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Export Destination */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tòa nhà <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.building}
                onChange={handleBuildingChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">-- Chọn tòa --</option>
                {buildings.map((building) => (
                  <option key={building} value={building}>
                    Tòa {building}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phòng <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.room_id}
                  onChange={handleRoomChange}
                  required
                  disabled={!formData.building}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">-- Chọn phòng --</option>
                  {filteredRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.room_number} ({room.current_occupancy}/{room.capacity} người)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleViewRoomAssets}
                  disabled={!formData.room_id}
                  className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                  title="Xem trang thiết bị phòng"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mục đích xuất kho
            </label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="Sử dụng">Sử dụng</option>
              <option value="Bảo trì">Bảo trì</option>
              <option value="Sửa chữa">Sửa chữa</option>
              <option value="Thanh lý">Thanh lý</option>
              <option value="Chuyển kho">Chuyển kho</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="Ghi chú về lô hàng xuất..."
            />
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Tóm tắt xuất kho</h3>
            <div className="space-y-1 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Số lượng xuất:</span>
                <span className="font-semibold">{formData.quantity} {formData.unit}</span>
              </div>
              <div className="flex justify-between">
                <span>Tồn kho sau xuất:</span>
                <span className="font-semibold">
                  {formData.available_quantity - formData.quantity} {formData.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Xuất đến:</span>
                <span className="font-semibold">
                  {formData.building && formData.room_number 
                    ? `Tòa ${formData.building} - ${formData.room_number}` 
                    : '---'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSubmitting ? "Đang xử lý..." : "Xác nhận xuất kho"}
            </button>
          </div>
        </form>
      </div>

      {/* Room Assets Modal */}
      {showRoomAssetsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full max-h-[60vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Phòng {formData.room_number}
                </h3>
              </div>
              <button
                onClick={() => setShowRoomAssetsModal(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(60vh-100px)]">
              {loadingRoomAssets ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                </div>
              ) : groupedAssetsList.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Phòng chưa có trang thiết bị</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {groupedAssetsList.map((asset, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-slate-900">
                        {asset.asset_name}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {asset.quantity} {asset.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-4 py-3 bg-slate-50">
              <button
                onClick={() => setShowRoomAssetsModal(false)}
                className="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportAssetModal;

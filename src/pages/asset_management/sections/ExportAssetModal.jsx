import { useState } from "react";
import { X, ArrowUpFromLine, Save } from "lucide-react";

const ExportAssetModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

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

  const [formData, setFormData] = useState({
    asset_code: '',
    asset_name: '',
    category_name: '',
    unit: 'Cái',
    quantity: 1,
    available_quantity: 0,
    export_date: new Date().toISOString().split("T")[0],
    export_to: '',
    room_number: '',
    recipient_name: '',
    recipient_phone: '',
    purpose: 'Sử dụng',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAssetTypeChange = (e) => {
    const selectedType = assetTypes.find(type => type.code === e.target.value);
    if (selectedType) {
      // TODO: Fetch available quantity from API
      setFormData(prev => ({
        ...prev,
        asset_code: selectedType.code,
        asset_name: selectedType.name,
        category_name: selectedType.category,
        unit: selectedType.unit,
        available_quantity: 0, // Will be fetched from API
      }));
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
      // TODO: Call API to export asset
      console.log("Export asset:", formData);
      onSuccess();
    } catch (err) {
      console.error("Error exporting asset:", err);
      setError(err.response?.data?.message || "Không thể xuất kho. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ArrowUpFromLine className="w-5 h-5 text-orange-600" />
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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-orange-700 font-medium">Mã tài sản</p>
                  <p className="text-orange-900 font-semibold">{formData.asset_code}</p>
                </div>
                <div>
                  <p className="text-orange-700 font-medium">Tên tài sản</p>
                  <p className="text-orange-900 font-semibold">{formData.asset_name}</p>
                </div>
                <div>
                  <p className="text-orange-700 font-medium">Danh mục</p>
                  <p className="text-orange-900 font-semibold">{formData.category_name}</p>
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Export Destination */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Xuất đến <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="export_to"
                value={formData.export_to}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="VD: Tòa A, Phòng 101..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số phòng
              </label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="VD: A-101"
              />
            </div>
          </div>

          {/* Recipient Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Người nhận <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="recipient_name"
                value={formData.recipient_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Họ và tên"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="recipient_phone"
                value={formData.recipient_phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0123456789"
              />
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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ghi chú về lô hàng xuất..."
            />
          </div>

          {/* Summary Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-orange-900 mb-2">Tóm tắt xuất kho</h3>
            <div className="space-y-1 text-sm text-orange-800">
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
                <span>Người nhận:</span>
                <span className="font-semibold">{formData.recipient_name || "---"}</span>
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
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSubmitting ? "Đang xử lý..." : "Xác nhận xuất kho"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportAssetModal;

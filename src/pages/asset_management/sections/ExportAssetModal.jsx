import { useState } from "react";
import { X, ArrowUpFromLine, Save, Search } from "lucide-react";

const ExportAssetModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    asset_code: "",
    asset_name: "",
    quantity: 1,
    unit: "Cái",
    available_quantity: 0,
    export_date: new Date().toISOString().split("T")[0],
    export_to: "",
    room_number: "",
    recipient_name: "",
    recipient_phone: "",
    purpose: "Sử dụng",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Mock search results - sẽ thay bằng API call
  const mockAssets = [
    { asset_code: "NT001", name: "Giường đơn", unit: "Cái", category: "Nội thất", available: 15 },
    { asset_code: "NT002", name: "Tủ quần áo", unit: "Cái", category: "Nội thất", available: 20 },
    { asset_code: "TB001", name: "Quạt trần", unit: "Cái", category: "Thiết bị điện", available: 10 },
    { asset_code: "TB002", name: "Điều hòa", unit: "Cái", category: "Thiết bị điện", available: 5 },
  ];

  const searchResults = searchQuery
    ? mockAssets.filter(
        (asset) =>
          asset.asset_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectAsset = (asset) => {
    setFormData((prev) => ({
      ...prev,
      asset_code: asset.asset_code,
      asset_name: asset.name,
      unit: asset.unit,
      available_quantity: asset.available,
    }));
    setSearchQuery("");
    setShowSearchResults(false);
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

          {/* Search Asset */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tìm kiếm tài sản
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Tìm theo mã hoặc tên tài sản..."
              />
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((asset) => (
                  <button
                    key={asset.asset_code}
                    type="button"
                    onClick={() => handleSelectAsset(asset)}
                    className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{asset.name}</div>
                        <div className="text-sm text-slate-600">
                          Mã: {asset.asset_code} • {asset.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          Tồn: {asset.available} {asset.unit}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Asset Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mã tài sản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="asset_code"
                value={formData.asset_code}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="VD: NT001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tên tài sản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="asset_name"
                value={formData.asset_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="VD: Giường đơn"
              />
            </div>
          </div>

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

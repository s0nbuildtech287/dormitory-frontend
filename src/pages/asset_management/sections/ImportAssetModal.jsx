import { useState } from "react";
import { X, ArrowDownToLine, Save, Search } from "lucide-react";

const ImportAssetModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    asset_code: "",
    asset_name: "",
    quantity: 1,
    unit: "Cái",
    import_date: new Date().toISOString().split("T")[0],
    supplier: "",
    purchase_price: 0,
    total_price: 0,
    invoice_number: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Mock search results - sẽ thay bằng API call
  const mockAssets = [
    { asset_code: "NT001", name: "Giường đơn", unit: "Cái", category: "Nội thất" },
    { asset_code: "NT002", name: "Tủ quần áo", unit: "Cái", category: "Nội thất" },
    { asset_code: "TB001", name: "Quạt trần", unit: "Cái", category: "Thiết bị điện" },
    { asset_code: "TB002", name: "Điều hòa", unit: "Cái", category: "Thiết bị điện" },
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
    }));
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };

    // Auto calculate total price
    if (name === "quantity" || name === "purchase_price") {
      const quantity = name === "quantity" ? parseFloat(value) || 0 : parseFloat(formData.quantity) || 0;
      const price = name === "purchase_price" ? parseFloat(value) || 0 : parseFloat(formData.purchase_price) || 0;
      newFormData.total_price = quantity * price;
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // TODO: Call API to import asset
      console.log("Import asset:", formData);
      onSuccess();
    } catch (err) {
      console.error("Error importing asset:", err);
      setError(err.response?.data?.message || "Không thể nhập kho. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowDownToLine className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Nhập kho tài sản</h2>
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
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    <div className="font-semibold text-slate-900">{asset.name}</div>
                    <div className="text-sm text-slate-600">
                      Mã: {asset.asset_code} • {asset.category} • {asset.unit}
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="VD: Giường đơn"
              />
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số lượng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Đơn vị
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Cái, Bộ..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ngày nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="import_date"
                value={formData.import_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Supplier & Invoice */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nhà cung cấp
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Tên nhà cung cấp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số hóa đơn
              </label>
              <input
                type="text"
                name="invoice_number"
                value={formData.invoice_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="VD: HD001"
              />
            </div>
          </div>

          {/* Price Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Đơn giá (VNĐ)
              </label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Thành tiền (VNĐ)
              </label>
              <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-semibold">
                {formatCurrency(formData.total_price)} đ
              </div>
            </div>
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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ghi chú về lô hàng nhập..."
            />
          </div>

          {/* Summary Box */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-2">Tóm tắt nhập kho</h3>
            <div className="space-y-1 text-sm text-green-800">
              <div className="flex justify-between">
                <span>Số lượng:</span>
                <span className="font-semibold">{formData.quantity} {formData.unit}</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng giá trị:</span>
                <span className="font-semibold">{formatCurrency(formData.total_price)} đ</span>
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
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSubmitting ? "Đang xử lý..." : "Xác nhận nhập kho"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportAssetModal;

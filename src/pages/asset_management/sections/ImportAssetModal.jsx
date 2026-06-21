import { useState } from "react";
import { X, ArrowDownToLine, Save } from "lucide-react";
import { importAsset } from "../../../api/apiAsset.js";

const ImportAssetModal = ({ isOpen, onClose, onSuccess }) => {
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
    import_date: new Date().toISOString().split("T")[0],
    supplier: '',
    purchase_price: 0,
    total_price: 0,
    invoice_number: `HD${Date.now()}`, // Auto-generated
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAssetTypeChange = (e) => {
    const selectedType = assetTypes.find(type => type.code === e.target.value);
    if (selectedType) {
      setFormData(prev => ({
        ...prev,
        asset_code: selectedType.code,
        asset_name: selectedType.name,
        category_name: selectedType.category,
        unit: selectedType.unit,
      }));
    }
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
      await importAsset(formData);
      onSuccess();
    } catch (err) {
      console.error("Error importing asset:", err);
      setError(err.message || "Không thể nhập kho. Vui lòng thử lại.");
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
            <div className="p-2 bg-slate-100 rounded-lg">
              <ArrowDownToLine className="w-5 h-5 text-slate-700" />
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

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
                disabled
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
              />
            </div>
          </div>

          {/* Supplier */}
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Tên nhà cung cấp"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="Ghi chú về lô hàng nhập..."
            />
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Tóm tắt nhập kho</h3>
            <div className="space-y-1 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Số hóa đơn:</span>
                <span className="font-semibold">{formData.invoice_number}</span>
              </div>
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
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

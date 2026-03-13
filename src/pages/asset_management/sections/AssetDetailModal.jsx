import { X, Package, MapPin, Calendar, DollarSign, Wrench, Info } from "lucide-react";

const AssetDetailModal = ({ asset, onClose, onRefresh }) => {
  // Don't render if no asset
  if (!asset) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Đang sử dụng": "bg-green-100 text-green-700 border-green-200",
      "Sẵn sàng": "bg-blue-100 text-blue-700 border-blue-200",
      "Hư hỏng": "bg-red-100 text-red-700 border-red-200",
      "Đang bảo trì": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Thanh lý": "bg-gray-100 text-gray-700 border-gray-200",
    };
    return statusConfig[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getConditionBadge = (condition) => {
    const conditionConfig = {
      "Mới": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "Tốt": "bg-green-100 text-green-700 border-green-200",
      "Khá": "bg-blue-100 text-blue-700 border-blue-200",
      "Trung bình": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "Kém": "bg-red-100 text-red-700 border-red-200",
    };
    return conditionConfig[condition] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{asset.name}</h2>
              <p className="text-blue-100 text-sm">{asset.asset_code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusBadge(
                asset.status
              )}`}
            >
              {asset.status}
            </span>
            <span
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getConditionBadge(
                asset.condition
              )}`}
            >
              {asset.condition}
            </span>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Danh mục</label>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {asset.category_name}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500">Số lượng</label>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {asset.quantity} {asset.unit}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <MapPin size={14} />
                  Vị trí
                </label>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {asset.room_id ? asset.location : "Kho tổng"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Calendar size={14} />
                  Ngày mua
                </label>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {formatDate(asset.purchase_date)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <DollarSign size={14} />
                  Giá mua
                </label>
                <p className="text-base font-semibold text-slate-900 mt-1">
                  {formatCurrency(asset.purchase_price)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500">Giá trị hiện tại</label>
                <p className="text-base font-semibold text-green-600 mt-1">
                  {formatCurrency(asset.current_value)}
                </p>
              </div>
            </div>
          </div>

          {/* Supplier & Warranty */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Wrench size={16} />
              <span>Thông tin nhà cung cấp & Bảo hành</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500">Nhà cung cấp</label>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {asset.supplier || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Thời gian bảo hành</label>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {asset.warranty_period} tháng
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-slate-500">Hết hạn bảo hành</label>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {formatDate(asset.warranty_expiry)}
                </p>
              </div>
            </div>
          </div>

          {/* Specifications */}
          {asset.specifications && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <Info size={16} />
                <span>Thông số kỹ thuật</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(
                  typeof asset.specifications === "string"
                    ? JSON.parse(asset.specifications)
                    : asset.specifications
                ).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-blue-600 font-medium">{key}:</span>{" "}
                    <span className="text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {asset.description && (
            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">
                Mô tả
              </label>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-4">
                {asset.description}
              </p>
            </div>
          )}

          {/* Note */}
          {asset.note && (
            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">
                Ghi chú
              </label>
              <p className="text-sm text-slate-700 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                {asset.note}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
            <p>Mã QR: {asset.qr_code}</p>
            <p>Tạo lúc: {formatDate(asset.created_at)}</p>
            <p>Cập nhật: {formatDate(asset.updated_at)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailModal;

import { Package, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const AssetAnalytics = ({ assets }) => {
  // Calculate statistics
  const totalAssets = assets.length;
  const totalQuantity = assets.reduce((sum, asset) => sum + (asset.quantity || 0), 0);
  const totalValue = assets.reduce((sum, asset) => sum + (asset.purchase_price || 0) * (asset.quantity || 0), 0);

  const inUse = assets.filter((a) => a.status === "Đang sử dụng");
  const available = assets.filter((a) => a.status === "Sẵn sàng");
  const damaged = assets.filter((a) => a.status === "Hư hỏng");
  const maintenance = assets.filter((a) => a.status === "Đang bảo trì");

  // Group by category
  const byCategory = assets.reduce((acc, asset) => {
    const cat = asset.category_name || "Khác";
    if (!acc[cat]) {
      acc[cat] = { count: 0, quantity: 0, value: 0 };
    }
    acc[cat].count += 1;
    acc[cat].quantity += asset.quantity || 0;
    acc[cat].value += (asset.purchase_price || 0) * (asset.quantity || 0);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Phân loại theo danh mục</h3>
        <div className="space-y-4">
          {Object.entries(byCategory).map(([category, data]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{category}</span>
                <span className="text-sm text-slate-500">
                  {data.quantity} cái • {new Intl.NumberFormat("vi-VN").format(data.value)} đ
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(data.quantity / totalQuantity) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Value */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-2">Tổng giá trị tài sản</p>
            <p className="text-4xl font-bold">
              {new Intl.NumberFormat("vi-VN").format(totalValue)} đ
            </p>
          </div>
          <div className="p-4 bg-white/20 rounded-xl">
            <TrendingUp size={32} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetAnalytics;

import { Package, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const AssetAnalytics = ({ assets }) => {
  // Calculate statistics
  const totalAssets = assets.length;
  const totalQuantity = assets.reduce((sum, asset) => sum + (asset.quantity || 0), 0);
  const totalValue = assets.reduce((sum, asset) => sum + (asset.current_value || 0) * (asset.quantity || 0), 0);

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
    acc[cat].value += (asset.current_value || 0) * (asset.quantity || 0);
    return acc;
  }, {});

  // Group by condition
  const byCondition = assets.reduce((acc, asset) => {
    const cond = asset.condition || "Không xác định";
    if (!acc[cond]) {
      acc[cond] = 0;
    }
    acc[cond] += asset.quantity || 0;
    return acc;
  }, {});

  const stats = [
    {
      label: "Tổng tài sản",
      value: totalQuantity,
      icon: Package,
      color: "blue",
      subtext: `${totalAssets} loại`,
    },
    {
      label: "Đang sử dụng",
      value: inUse.reduce((sum, a) => sum + (a.quantity || 0), 0),
      icon: CheckCircle,
      color: "green",
      subtext: `${inUse.length} loại`,
    },
    {
      label: "Sẵn sàng (Kho)",
      value: available.reduce((sum, a) => sum + (a.quantity || 0), 0),
      icon: TrendingUp,
      color: "indigo",
      subtext: `${available.length} loại`,
    },
    {
      label: "Hư hỏng / Bảo trì",
      value: damaged.reduce((sum, a) => sum + (a.quantity || 0), 0) + maintenance.reduce((sum, a) => sum + (a.quantity || 0), 0),
      icon: AlertTriangle,
      color: "red",
      subtext: `${damaged.length + maintenance.length} loại`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            green: "bg-green-100 text-green-600",
            indigo: "bg-indigo-100 text-indigo-600",
            red: "bg-red-100 text-red-600",
          };

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Phân loại theo danh mục</h3>
        <div className="space-y-4">
          {Object.entries(byCategory).map(([category, data]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{category}</span>
                <span className="text-sm text-slate-500">
                  {data.quantity} {data.count > 1 ? "cái" : "cái"} • {new Intl.NumberFormat("vi-VN").format(data.value)} đ
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

      {/* Condition Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Tình trạng tài sản</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(byCondition).map(([condition, count]) => {
            const colorMap = {
              "Mới": "emerald",
              "Tốt": "green",
              "Khá": "blue",
              "Trung bình": "yellow",
              "Kém": "red",
            };
            const color = colorMap[condition] || "gray";

            return (
              <div
                key={condition}
                className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 text-center`}
              >
                <p className={`text-2xl font-bold text-${color}-700`}>{count}</p>
                <p className={`text-sm text-${color}-600 mt-1`}>{condition}</p>
              </div>
            );
          })}
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

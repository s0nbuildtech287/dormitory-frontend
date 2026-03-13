import { Package, TrendingUp, MapPin, PieChart, BarChart3, DollarSign } from "lucide-react";

const AssetAnalytics = ({ assets }) => {
  // Ensure assets is always an array
  const safeAssets = Array.isArray(assets) ? assets : [];

  // Calculate statistics
  const totalAssets = safeAssets.reduce((sum, asset) => sum + (parseInt(asset.total_quantity) || 0), 0);
  const totalValue = safeAssets.reduce((sum, asset) => sum + (parseInt(asset.total_quantity) || 0) * (parseFloat(asset.purchase_price) || 0), 0);

  const inUse = safeAssets.reduce((sum, asset) => sum + (parseInt(asset.in_use) || 0), 0);
  const available = safeAssets.reduce((sum, asset) => sum + (parseInt(asset.in_stock) || 0), 0);
  const damaged = safeAssets.reduce((sum, asset) => sum + (parseInt(asset.damaged) || 0), 0);

  // Group by category
  const byCategory = safeAssets.reduce((acc, asset) => {
    const cat = asset.category_name || "Khác";
    const qty = parseInt(asset.total_quantity) || 0;
    const value = qty * (parseFloat(asset.purchase_price) || 0);
    
    if (!acc[cat]) {
      acc[cat] = { quantity: 0, value: 0, items: [] };
    }
    acc[cat].quantity += qty;
    acc[cat].value += value;
    acc[cat].items.push(asset);
    return acc;
  }, {});

  // Asset distribution by location (rooms vs warehouse)
  const locationDistribution = safeAssets.map(asset => ({
    name: asset.name,
    asset_code: asset.asset_code,
    total: parseInt(asset.total_quantity) || 0,
    inUse: parseInt(asset.in_use) || 0,
    inStock: parseInt(asset.in_stock) || 0,
    damaged: parseInt(asset.damaged) || 0,
    value: (parseInt(asset.total_quantity) || 0) * (parseFloat(asset.purchase_price) || 0),
    unitPrice: parseFloat(asset.purchase_price) || 0,
  }));

  // Colors for charts
  const colors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", 
    "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Tổng số tài sản</p>
              <p className="text-2xl font-bold text-slate-900">{totalAssets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Đang sử dụng</p>
              <p className="text-2xl font-bold text-slate-900">{inUse}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Package size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Tồn kho</p>
              <p className="text-2xl font-bold text-slate-900">{available}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <DollarSign size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Tổng giá trị</p>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(totalValue)} đ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <PieChart size={20} />
          Phân loại theo danh mục
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Nội thất và Thiết bị an ninh */}
          <div>
            <div className="space-y-3">
              {Object.entries(byCategory)
                .filter(([category]) => category === 'Nội thất' || category === 'Thiết bị an ninh')
                .map(([category, data], index) => (
                <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-sm font-medium text-slate-700">{category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">{data.quantity} cái</div>
                    <div className="text-xs text-slate-500">{formatCurrency(data.value)} đ</div>
                    <div className="text-xs text-slate-400">
                      Chiếm {((data.quantity / totalAssets) * 100).toFixed(1)}% tổng số • {((data.value / totalValue) * 100).toFixed(1)}% tổng giá trị
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Điện và Mạng */}
          <div>
            <div className="space-y-3">
              {Object.entries(byCategory)
                .filter(([category]) => category === 'Thiết bị điện' || category === 'Thiết bị mạng')
                .map(([category, data], index) => (
                <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors[(index + 2) % colors.length] }}
                    />
                    <span className="text-sm font-medium text-slate-700">{category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">{data.quantity} cái</div>
                    <div className="text-xs text-slate-500">{formatCurrency(data.value)} đ</div>
                    <div className="text-xs text-slate-400">
                      Chiếm {((data.quantity / totalAssets) * 100).toFixed(1)}% tổng số • {((data.value / totalValue) * 100).toFixed(1)}% tổng giá trị
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Type Analysis */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 size={20} />
          Phân tích theo loại tài sản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {locationDistribution.map((asset, index) => (
            <div key={asset.asset_code} className="bg-slate-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 mb-1">{asset.total}</div>
                <div className="text-sm font-medium text-slate-700 mb-2">{asset.name}</div>
                <div className="text-xs text-slate-500 mb-3">
                  {formatCurrency(asset.value)} đ
                </div>
                
                {/* Mini bar chart */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Sử dụng</span>
                    <span>{asset.inUse}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full"
                      style={{ width: `${(asset.inUse / asset.total) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span>Kho</span>
                    <span>{asset.inStock}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: `${(asset.inStock / asset.total) * 100}%` }}
                    />
                  </div>
                  
                  {asset.damaged > 0 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span>Hư hỏng</span>
                        <span>{asset.damaged}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1">
                        <div
                          className="bg-red-500 h-1 rounded-full"
                          style={{ width: `${(asset.damaged / asset.total) * 100}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Distribution by Location */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <MapPin size={20} />
          Phân bổ tài sản theo vị trí
        </h3>
        <div className="space-y-6">
          {locationDistribution.map((asset, index) => (
            <div key={asset.asset_code} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">{asset.name}</h4>
                  <p className="text-xs text-slate-500">
                    Tổng: {asset.total} cái • Giá trị: {formatCurrency(asset.value)} đ
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-600">
                    {formatCurrency(asset.unitPrice)} đ/cái
                  </div>
                </div>
              </div>
              
              {/* Stacked Bar Chart */}
              <div className="relative">
                <div className="flex h-8 bg-slate-100 rounded-lg overflow-hidden">
                  {asset.inUse > 0 && (
                    <div
                      className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(asset.inUse / asset.total) * 100}%` }}
                      title={`Đang sử dụng: ${asset.inUse}`}
                    >
                      {asset.inUse > 0 && asset.inUse}
                    </div>
                  )}
                  {asset.inStock > 0 && (
                    <div
                      className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(asset.inStock / asset.total) * 100}%` }}
                      title={`Tồn kho: ${asset.inStock}`}
                    >
                      {asset.inStock > 0 && asset.inStock}
                    </div>
                  )}
                  {asset.damaged > 0 && (
                    <div
                      className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(asset.damaged / asset.total) * 100}%` }}
                      title={`Hư hỏng: ${asset.damaged}`}
                    >
                      {asset.damaged > 0 && asset.damaged}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span className="text-slate-600">Đang sử dụng: {asset.inUse}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <span className="text-slate-600">Tồn kho: {asset.inStock}</span>
                </div>
                {asset.damaged > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                    <span className="text-slate-600">Hư hỏng: {asset.damaged}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetAnalytics;
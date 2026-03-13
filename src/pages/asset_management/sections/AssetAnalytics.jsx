import { Package, TrendingUp, MapPin, PieChart, BarChart3, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { getAssetsByBuilding } from "../../../api/apiAsset.js";

const AssetAnalytics = ({ assets }) => {
  const [buildingData, setBuildingData] = useState([]);
  
  // Fetch building distribution data
  useEffect(() => {
    const fetchBuildingData = async () => {
      try {
        const response = await getAssetsByBuilding();
        setBuildingData(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching building data:", error);
        setBuildingData([]);
      }
    };
    fetchBuildingData();
  }, []);
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Type Analysis Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 size={20} />
            Phân tích theo loại tài sản
          </h3>
          
          {/* Pie Chart */}
          <div className="flex flex-col items-center">
            <div className="relative w-64 h-64 mb-4">
              <svg width="256" height="256" className="transform -rotate-90">
                {(() => {
                  let currentAngle = 0;
                  return locationDistribution.map((asset, index) => {
                    const percentage = totalAssets > 0 ? (asset.total / totalAssets) * 100 : 0;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    
                    const x1 = 128 + 100 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 128 + 100 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 128 + 100 * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = 128 + 100 * Math.sin((endAngle * Math.PI) / 180);
                    
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    
                    const pathData = [
                      `M 128 128`,
                      `L ${x1} ${y1}`,
                      `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      `Z`
                    ].join(' ');
                    
                    currentAngle += angle;
                    
                    return (
                      <path
                        key={asset.asset_code}
                        d={pathData}
                        fill={colors[index % colors.length]}
                        stroke="white"
                        strokeWidth="2"
                        className="hover:opacity-80 transition-opacity"
                        title={`${asset.name}: ${asset.total} (${percentage.toFixed(1)}%)`}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900">{totalAssets}</div>
                  <div className="text-xs text-slate-500">Tổng tài sản</div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {locationDistribution.map((asset, index) => (
                <div key={asset.asset_code} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-xs text-slate-600 truncate">{asset.name}</span>
                  <span className="text-xs text-slate-400 ml-auto">{asset.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset Distribution by Location Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MapPin size={20} />
            Phân bổ tài sản theo vị trí
          </h3>
          
          {/* Bar Chart */}
          <div className="space-y-4">
            {buildingData.length > 0 && (
              <div className="relative h-64">
                <svg width="100%" height="256" className="overflow-visible">
                  {buildingData.map((building, index) => {
                    const totalBuilding = parseInt(building.total_quantity) || 0;
                    const maxValue = Math.max(...buildingData.map(b => parseInt(b.total_quantity) || 0));
                    const barHeight = maxValue > 0 ? (totalBuilding / maxValue) * 200 : 0;
                    const barWidth = 40;
                    const barX = index * 60 + 20;
                    const barY = 220 - barHeight;
                    const buildingColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                    
                    return (
                      <g key={building.building}>
                        {/* Bar */}
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          fill={buildingColors[index % buildingColors.length]}
                          className="hover:opacity-80 transition-opacity"
                          rx="4"
                        />
                        
                        {/* Value label on top */}
                        <text
                          x={barX + barWidth / 2}
                          y={barY - 5}
                          textAnchor="middle"
                          className="text-xs fill-slate-700 font-medium"
                        >
                          {totalBuilding}
                        </text>
                        
                        {/* Building label at bottom */}
                        <text
                          x={barX + barWidth / 2}
                          y={240}
                          textAnchor="middle"
                          className="text-xs fill-slate-600"
                        >
                          {building.building === 'Kho' ? 'Kho' : `Tòa ${building.building}`}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
            
            {/* Legend with details */}
            <div className="space-y-2">
              {buildingData.map((building, index) => {
                const totalBuilding = parseInt(building.total_quantity) || 0;
                const buildingValue = parseFloat(building.total_value) || 0;
                const buildingColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                
                return (
                  <div key={building.building} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: buildingColors[index % buildingColors.length] }}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {building.building === 'Kho' ? 'Kho tổng' : `Tòa ${building.building}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">{totalBuilding} tài sản</div>
                      <div className="text-xs text-slate-500">{formatCurrency(buildingValue)} đ</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetAnalytics;
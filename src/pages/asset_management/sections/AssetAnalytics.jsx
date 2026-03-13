import { Package, TrendingUp, MapPin, BarChart3, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { getAssetsByBuilding } from "../../../api/apiAsset.js";

// Educational color palette - soft and professional
const ASSET_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", 
  "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"
];

const BUILDING_COLORS = [
  "#3B82F6", // Tòa A - Blue
  "#10B981", // Tòa B - Green  
  "#F59E0B", // Tòa C - Amber
  "#EF4444", // Tòa D - Red
  "#8B5CF6"  // Kho - Purple
];

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
          <BarChart3 size={20} />
          Phân loại theo danh mục
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Nội thất và Thiết bị an ninh */}
          <div>
            <h4 className="text-md font-semibold text-slate-800 mb-4">Nội thất & Thiết bị an ninh</h4>
            <div className="space-y-3">
              {Object.entries(byCategory)
                .filter(([category]) => category === 'Nội thất' || category === 'Thiết bị an ninh')
                .map(([category, data], index) => (
                <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: ASSET_COLORS[index % ASSET_COLORS.length] }}
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
            <h4 className="text-md font-semibold text-slate-800 mb-4">Điện & Mạng</h4>
            <div className="space-y-3">
              {Object.entries(byCategory)
                .filter(([category]) => category === 'Thiết bị điện' || category === 'Thiết bị mạng')
                .map(([category, data], index) => (
                <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: ASSET_COLORS[(index + 2) % ASSET_COLORS.length] }}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - 4 items */}
          <div className="space-y-3">
            {locationDistribution.slice(0, 4).map((asset, index) => (
              <div key={asset.asset_code} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: ASSET_COLORS[index % ASSET_COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-slate-700">{asset.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">{asset.total} cái</div>
                  <div className="text-xs text-slate-500">{formatCurrency(asset.value)} đ</div>
                  <div className="text-xs text-slate-400">
                    Chiếm {((asset.total / totalAssets) * 100).toFixed(1)}% tổng số • {((asset.value / totalValue) * 100).toFixed(1)}% tổng giá trị
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right side - 4 items */}
          <div className="space-y-3">
            {locationDistribution.slice(4, 8).map((asset, index) => (
              <div key={asset.asset_code} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: ASSET_COLORS[(index + 4) % ASSET_COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-slate-700">{asset.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">{asset.total} cái</div>
                  <div className="text-xs text-slate-500">{formatCurrency(asset.value)} đ</div>
                  <div className="text-xs text-slate-400">
                    Chiếm {((asset.total / totalAssets) * 100).toFixed(1)}% tổng số • {((asset.value / totalValue) * 100).toFixed(1)}% tổng giá trị
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Remaining items - centered */}
        {locationDistribution.length > 8 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex justify-center">
              <div className="w-full lg:w-1/2 space-y-3">
                {locationDistribution.slice(8).map((asset, index) => (
                  <div key={asset.asset_code} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: ASSET_COLORS[(index + 8) % ASSET_COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-slate-700">{asset.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">{asset.total} cái</div>
                      <div className="text-xs text-slate-500">{formatCurrency(asset.value)} đ</div>
                      <div className="text-xs text-slate-400">
                        Chiếm {((asset.total / totalAssets) * 100).toFixed(1)}% tổng số • {((asset.value / totalValue) * 100).toFixed(1)}% tổng giá trị
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Asset Distribution by Location */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <MapPin size={20} />
          Phân bổ tài sản theo vị trí
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Tòa A, B */}
          <div className="space-y-3">
            {buildingData.slice(0, 2).map((building, index) => {
              const totalBuilding = parseInt(building.total_quantity) || 0;
              const buildingValue = parseFloat(building.total_value) || 0;
              
              return (
                <div key={building.building} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: BUILDING_COLORS[index % BUILDING_COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {building.building === 'Kho' ? 'Kho tổng' : `Tòa ${building.building}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">{totalBuilding} tài sản</div>
                    <div className="text-xs text-slate-500">{formatCurrency(buildingValue)} đ</div>
                    <div className="text-xs text-slate-400">
                      Chiếm {((totalBuilding / totalAssets) * 100).toFixed(1)}% tổng số • {((buildingValue / totalValue) * 100).toFixed(1)}% tổng giá trị
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right side - Tòa C, D */}
          <div className="space-y-3">
            {buildingData.slice(2, 4).map((building, index) => {
              const totalBuilding = parseInt(building.total_quantity) || 0;
              const buildingValue = parseFloat(building.total_value) || 0;
              
              return (
                <div key={building.building} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: BUILDING_COLORS[(index + 2) % BUILDING_COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {building.building === 'Kho' ? 'Kho tổng' : `Tòa ${building.building}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">{totalBuilding} tài sản</div>
                    <div className="text-xs text-slate-500">{formatCurrency(buildingValue)} đ</div>
                    <div className="text-xs text-slate-400">
                      Chiếm {((totalBuilding / totalAssets) * 100).toFixed(1)}% tổng số • {((buildingValue / totalValue) * 100).toFixed(1)}% tổng giá trị
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kho tổng - centered at bottom */}
        {buildingData.length > 4 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex justify-center">
              <div className="w-full lg:w-1/2">
                {buildingData.slice(4).map((building, index) => {
                  const totalBuilding = parseInt(building.total_quantity) || 0;
                  const buildingValue = parseFloat(building.total_value) || 0;
                  
                  return (
                    <div key={building.building} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: BUILDING_COLORS[4] }}
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {building.building === 'Kho' ? 'Kho tổng' : `Tòa ${building.building}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">{totalBuilding} tài sản</div>
                        <div className="text-xs text-slate-500">{formatCurrency(buildingValue)} đ</div>
                        <div className="text-xs text-slate-400">
                          Chiếm {((totalBuilding / totalAssets) * 100).toFixed(1)}% tổng số • {((buildingValue / totalValue) * 100).toFixed(1)}% tổng giá trị
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetAnalytics;

import { useState, useEffect } from "react";
import { LayoutGrid, BarChart3, Settings } from "lucide-react";
import { getAssets } from "../../api/apiAsset.js";
import AssetList from "./sections/AssetList.jsx";
import AssetAnalytics from "./sections/AssetAnalytics.jsx";
import AssetSettings from "./sections/AssetSettings.jsx";
import PageTabs from "../../components/common/PageTabs.jsx";

const AssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("list");

  // Fetch assets data
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoadingAssets(true);
        // Call API with summary=true to get grouped data by asset_code
        const data = await getAssets({ summary: 'true' });
        setAssets(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error fetching assets:", error);
        setAssets([]);
      } finally {
        setIsLoadingAssets(false);
      }
    };
    fetchAssets();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoadingAssets(true);
      // Call API with summary=true to get grouped data by asset_code
      const data = await getAssets({ summary: 'true' });
      setAssets(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error refreshing assets:", error);
      setAssets([]);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <PageTabs
        tabs={[
          { id: "list", label: "Danh sách tài sản", icon: LayoutGrid },
          { id: "analytics", label: "Thống kê tài sản", icon: BarChart3 },
          { id: "settings", label: "Điều chỉnh", icon: Settings },
        ]}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
      />

      {/* Tab Content */}
      {activeSubTab === "list" && (
        <AssetList 
          assets={assets} 
          isLoadingAssets={isLoadingAssets} 
          onRefresh={handleRefresh} 
        />
      )}
      {activeSubTab === "analytics" && <AssetAnalytics assets={assets} />}
      {activeSubTab === "settings" && (
        <AssetSettings 
          assets={assets} 
          onRefresh={handleRefresh} 
        />
      )}
    </div>
  );
};

export default AssetManagement;

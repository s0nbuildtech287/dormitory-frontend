import { useState } from "react";
import { List, BarChart3, Settings } from "lucide-react";
import BillList from "./sections/BillList.jsx";
import InvoiceStatistics from "./sections/InvoiceStatistics.jsx";
import PricingSettings from "./sections/PricingSettings.jsx";
import PageTabs from "../../components/common/PageTabs.jsx";

const BillingManagement = ({ onNavigateToContract, initialInvoiceFilter, onNavigateToNotification }) => {
  const [bills, setBills] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState("list");
  const [invoiceFilter, setInvoiceFilter] = useState(initialInvoiceFilter || null);

  // Handle navigation from statistics to invoice list
  const handleNavigateToInvoice = (invoiceNumber) => {
    setInvoiceFilter({ searchTerm: invoiceNumber });
    setActiveSubTab("list");
  };

  // Reset filter when switching tabs
  const handleTabChange = (tab) => {
    if (tab !== "list") {
      setInvoiceFilter(null);
    }
    setActiveSubTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <PageTabs
        tabs={[
          { id: "list", label: "Danh sách hóa đơn", icon: List },
          { id: "statistics", label: "Thống kê hóa đơn", icon: BarChart3 },
          { id: "settings", label: "Điều chỉnh bảng giá", icon: Settings },
        ]}
        activeTab={activeSubTab}
        onTabChange={handleTabChange}
      />

      {/* Tab Content */}
      {activeSubTab === "list" && <BillList bills={bills} setBills={setBills} onNavigateToContract={onNavigateToContract} initialInvoiceFilter={invoiceFilter} onNavigateToNotification={onNavigateToNotification} />}
      {activeSubTab === "statistics" && <InvoiceStatistics bills={bills} onNavigateToInvoice={handleNavigateToInvoice} />}
      {activeSubTab === "settings" && <PricingSettings />}
    </div>
  );
};

export default BillingManagement;

import { useState } from "react";
import { ShieldAlert, BookOpen } from "lucide-react";
import DisciplineList from "./sections/DisciplineList.jsx";
import DisciplineRegulations from "./sections/DisciplineRegulations.jsx";
import PageTabs from "../../components/common/PageTabs.jsx";

const DisciplineManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState("list");

  return (
    <div className="space-y-6">
      <PageTabs
        tabs={[
          { id: "list", label: "Danh sách vi phạm", icon: ShieldAlert },
          { id: "regulations", label: "Bảng quy định", icon: BookOpen },
        ]}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
      />

      {activeSubTab === "list" && <DisciplineList />}
      {activeSubTab === "regulations" && <DisciplineRegulations />}
    </div>
  );
};

export default DisciplineManagement;

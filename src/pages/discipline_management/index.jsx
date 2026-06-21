import { useState } from "react";
import { ShieldAlert, BookOpen, Settings } from "lucide-react";
import DisciplineList from "./sections/DisciplineList.jsx";
import DisciplineRegulations from "./sections/DisciplineRegulations.jsx";
import DisciplineScoreSettings from "./sections/DisciplineScoreSettings.jsx";
import PageTabs from "../../components/common/PageTabs.jsx";

const DisciplineManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState("list");

  return (
    <div className="space-y-6">
      <PageTabs
        tabs={[
          { id: "list",        label: "Danh sách vi phạm", icon: ShieldAlert },
          { id: "regulations", label: "Bảng quy định",     icon: BookOpen    },
          { id: "settings",    label: "Điều chỉnh",        icon: Settings    },
        ]}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
      />

      {activeSubTab === "list"        && <DisciplineList />}
      {activeSubTab === "regulations" && <DisciplineRegulations />}
      {activeSubTab === "settings"    && <DisciplineScoreSettings />}
    </div>
  );
};

export default DisciplineManagement;

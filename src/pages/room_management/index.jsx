import { useState, useEffect } from "react";
import { LayoutGrid, BarChart3, Settings, ArrowLeft, Users } from "lucide-react";
import { getRooms } from "../../api/apiRoom.js";
import RoomList from "./sections/RoomList.jsx";
import RoomXungKich from "./sections/RoomXungKich.jsx";
import RoomAnalytics from "./sections/RoomAnalytics.jsx";
import RoomSettings from "./sections/RoomSettings.jsx";
import PageTabs from "../../components/common/PageTabs.jsx";

const RoomManagement = ({ onNavigateToContract, onNavigateToInvoice }) => {
  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("list");
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Fetch rooms data
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoadingRooms(true);
        const data = await getRooms();
        // Handle nested response structure - API might return { data: [...] }
        setRooms((Array.isArray(data) ? data : data.data || []).map(r => ({
          ...r,
          currentOccupancy: r.currentOccupancy ?? r.current_occupancy ?? 0,
          students: r.students || [],
        })));
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRooms([]); // Set to empty array on error
      } finally {
        setIsLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoadingRooms(true);
      const data = await getRooms();
      // Handle nested response structure - API might return { data: [...] }
      setRooms((Array.isArray(data) ? data : data.data || []).map(r => ({
        ...r,
        currentOccupancy: r.currentOccupancy ?? r.current_occupancy ?? 0,
        students: r.students || [],
      })));
    } catch (error) {
      console.error("Error refreshing rooms:", error);
      setRooms([]); // Set to empty array on error
    } finally {
      setIsLoadingRooms(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <PageTabs
        tabs={[
          { id: "list", label: "Danh sách phòng", icon: LayoutGrid },
          { id: "xung_kich", label: "Sinh viên xung kích", icon: Users },
          { id: "analytics", label: "Thống kê mật độ", icon: BarChart3 },
          { id: "settings", label: "Điều chỉnh", icon: Settings },
        ]}
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
      />

      {/* Tab Content */}
      {activeSubTab === "list" && <RoomList rooms={rooms} isLoadingRooms={isLoadingRooms} onRefresh={handleRefresh} selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} onNavigateToContract={onNavigateToContract} onNavigateToInvoice={onNavigateToInvoice} />}
      {activeSubTab === "xung_kich" && (
        <RoomXungKich
          rooms={rooms}
          isLoadingRooms={isLoadingRooms}
          onRefresh={handleRefresh}
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          onNavigateToContract={onNavigateToContract}
          onNavigateToInvoice={onNavigateToInvoice}
        />
      )}
      {activeSubTab === "analytics" && <RoomAnalytics rooms={rooms} />}
      {activeSubTab === "settings" && <RoomSettings rooms={rooms} onRefresh={handleRefresh} />}
    </div>
  );
};

export default RoomManagement;

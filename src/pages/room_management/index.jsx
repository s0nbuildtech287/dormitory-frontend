import { useState, useEffect } from "react";
import { LayoutGrid, BarChart3, Settings, ArrowLeft } from "lucide-react";
import { getRooms } from "../../api/apiRoom.js";
import RoomList from "./sections/RoomList.jsx";
import RoomAnalytics from "./sections/RoomAnalytics.jsx";
import RoomSettings from "./sections/RoomSettings.jsx";

const RoomManagement = () => {
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
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveSubTab("list")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeSubTab === "list" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <LayoutGrid size={18} /> Danh sách phòng
        </button>
        <button
          onClick={() => setActiveSubTab("analytics")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeSubTab === "analytics" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <BarChart3 size={18} /> Thống kê mật độ
        </button>
        <button
          onClick={() => setActiveSubTab("settings")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeSubTab === "settings" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Settings size={18} /> Điều chỉnh
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === "list" && <RoomList rooms={rooms} isLoadingRooms={isLoadingRooms} onRefresh={handleRefresh} selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} />}
      {activeSubTab === "analytics" && <RoomAnalytics rooms={rooms} />}
      {activeSubTab === "settings" && <RoomSettings rooms={rooms} onRefresh={handleRefresh} />}
    </div>
  );
};

export default RoomManagement;

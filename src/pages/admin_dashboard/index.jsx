import { useState, useEffect } from "react";
import {
  Home,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import DashboardHome from "./sections/DashboardHome.jsx";
import RegistrationStatistics from "../registration_management/sections/RegistrationStatistics.jsx";
import RoomAnalytics from "../room_management/sections/RoomAnalytics.jsx";
import ContractStatistics from "../contract_management/sections/ContractStatistics.jsx";
import InvoiceStatistics from "../billing_management/sections/InvoiceStatistics.jsx";
import FeedbackStatistics from "../feedback_management/sections/FeedbackStatistics.jsx";
import { getRegistrations } from "../../api/apiRegistration.js";
import { getRooms } from "../../api/apiRoom.js";
import { getContracts } from "../../api/apiContract.js";
import { getInvoices } from "../../api/apiInvoice.js";

const AdminDashboard = () => {
  const [activeSubTab, setActiveSubTab] = useState("home");
  
  // Data states for each statistics section
  const [registrations, setRegistrations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [bills, setBills] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data when switching to a statistics tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        switch (activeSubTab) {
          case "registration-stats":
            const regsData = await getRegistrations();
            setRegistrations(Array.isArray(regsData.data) ? regsData.data : []);
            break;
          case "room-stats":
            const roomsData = await getRooms();
            setRooms((Array.isArray(roomsData) ? roomsData : roomsData.data || []).map(r => ({
              ...r,
              currentOccupancy: r.currentOccupancy ?? r.current_occupancy ?? 0,
              students: r.students || [],
            })));
            break;
          case "contract-stats":
            const contractsData = await getContracts();
            setContracts(contractsData.success ? contractsData.data : []);
            break;
          case "invoice-stats":
            const invoicesData = await getInvoices();
            setBills(invoicesData.success ? invoicesData.data : []);
            break;
          case "feedback-stats":
            // TODO: Implement getFeedbacks API
            // For now, feedbacks will be empty array
            setFeedbacks([]);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeSubTab !== "home") {
      fetchData();
    }
  }, [activeSubTab]);

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveSubTab("home")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === "home"
              ? "border-blue-600 text-blue-700 bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Home size={18} /> Trang chủ
        </button>
        <button
          onClick={() => setActiveSubTab("registration-stats")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === "registration-stats"
              ? "border-blue-600 text-blue-700 bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <BarChart3 size={18} /> Thống kê & Phân tích
        </button>
        <button
          onClick={() => setActiveSubTab("room-stats")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === "room-stats"
              ? "border-blue-600 text-blue-700 bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <PieChart size={18} /> Thống kê mật độ
        </button>
        <button
          onClick={() => setActiveSubTab("contract-stats")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === "contract-stats"
              ? "border-blue-600 text-blue-700 bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Activity size={18} /> Thống kê hợp đồng
        </button>
        <button
          onClick={() => setActiveSubTab("invoice-stats")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === "invoice-stats"
              ? "border-blue-600 text-blue-700 bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <DollarSign size={18} /> Thống kê hóa đơn
        </button>
        <button
          onClick={() => setActiveSubTab("feedback-stats")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === "feedback-stats"
              ? "border-blue-600 text-blue-700 bg-blue-50/50"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <MessageSquare size={18} /> Thống kê phản ánh
        </button>
      </div>

      {/* Tab Content */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
      
      {!loading && (
        <>
          {activeSubTab === "home" && <DashboardHome />}
          {activeSubTab === "registration-stats" && <RegistrationStatistics regs={registrations} />}
          {activeSubTab === "room-stats" && <RoomAnalytics rooms={rooms} />}
          {activeSubTab === "contract-stats" && <ContractStatistics contracts={contracts} />}
          {activeSubTab === "invoice-stats" && <InvoiceStatistics bills={bills} />}
          {activeSubTab === "feedback-stats" && <FeedbackStatistics feedbacks={feedbacks} />}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

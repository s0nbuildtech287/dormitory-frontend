import React, { useState, useEffect } from "react";
import {
  Home,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  MessageSquare,
  History,
} from "lucide-react";
import DashboardHome from "./sections/DashboardHome.jsx";
import ActivityLog from "./sections/ActivityLog.jsx";
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
    <div>
      {/* Tabs Navigation */}
      <div className="flex justify-center -mt-4 md:-mt-6 xl:-mt-8 mb-4 pt-3 pb-1 bg-slate-50">
      <div className="inline-flex items-center bg-white border border-slate-200 rounded-2xl overflow-x-auto scrollbar-hide px-2 shadow-sm">
        {[
          { id: "home", icon: <Home size={16} />, label: "Trang chủ" },
          { id: "registration-stats", icon: <BarChart3 size={16} />, label: "Thống kê & Phân tích" },
          { id: "room-stats", icon: <PieChart size={16} />, label: "Thống kê mật độ" },
          { id: "contract-stats", icon: <Activity size={16} />, label: "Thống kê hợp đồng" },
          { id: "invoice-stats", icon: <DollarSign size={16} />, label: "Thống kê hóa đơn" },
          { id: "feedback-stats", icon: <MessageSquare size={16} />, label: "Thống kê phản ánh" },
          { id: "activity-log", icon: <History size={16} />, label: "Lịch sử hoạt động" },
        ].map((tab, idx, arr) => (
          <React.Fragment key={tab.id}>
            <button
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 xl:px-5 py-3 text-xs xl:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 rounded-xl my-1 ${
                activeSubTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
            {idx < arr.length - 1 && <span className="w-px h-5 bg-slate-200 shrink-0" />}
          </React.Fragment>
        ))}
      </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
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
            {activeSubTab === "activity-log" && <ActivityLog />}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

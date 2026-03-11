import React, { useState, useEffect } from "react";
import { List, BarChart3 } from "lucide-react";
import FeedbackList from "./sections/FeedbackList.jsx";
import FeedbackStatistics from "./sections/FeedbackStatistics.jsx";

const FeedbackManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState("list");
  const [feedbacks, setFeedbacks] = useState([]);

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("list")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeSubTab === "list" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <List size={18} /> Danh sách phản ánh
        </button>
        <button
          onClick={() => setActiveSubTab("statistics")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeSubTab === "statistics" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <BarChart3 size={18} /> Thống kê phản ánh
        </button>
      </div>

      {/* Tab Content */}
      {activeSubTab === "list" && <FeedbackList feedbacks={feedbacks} setFeedbacks={setFeedbacks} />}
      {activeSubTab === "statistics" && <FeedbackStatistics feedbacks={feedbacks} />}
    </div>
  );
};

export default FeedbackManagement;

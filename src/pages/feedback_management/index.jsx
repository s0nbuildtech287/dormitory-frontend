import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import FeedbackList from "./sections/FeedbackList.jsx";
import SearchBar from "./sections/SearchBar.jsx";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center text-slate-900">
          <MessageSquare className="mr-2 text-blue-600" /> Quản lý phản ánh
        </h3>
        <SearchBar />
      </div>

      <FeedbackList feedbacks={feedbacks} setFeedbacks={setFeedbacks} />
    </div>
  );
};

export default FeedbackManagement;

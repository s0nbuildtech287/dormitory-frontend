import React from "react";
import StatsCards from "./sections/StatsCards.jsx";
import Charts from "./sections/Charts.jsx";
import RecentActivity from "./sections/RecentActivity.jsx";

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <StatsCards />
      <Charts />
      <RecentActivity />
    </div>
  );
};

export default AdminDashboard;

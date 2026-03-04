import React from "react";
import StudentProfile from "./profile/index.jsx";
import StudentContract from "./contract/index.jsx";
import StudentBills from "./bills/index.jsx";
import StudentNotifications from "./notifications/index.jsx";
import StudentFeedback from "./feedback/index.jsx";

const StudentDashboard = ({ user, tab }) => {
  if (tab === "profile") {
    return <StudentProfile user={user} />;
  }

  if (tab === "contract") {
    return <StudentContract />;
  }

  if (tab === "bills") {
    return <StudentBills />;
  }

  if (tab === "notifications") {
    return <StudentNotifications />;
  }

  if (tab === "feedback") {
    return <StudentFeedback user={user} />;
  }

  return <div>Chọn tính năng bên trái</div>;
};

export default StudentDashboard;

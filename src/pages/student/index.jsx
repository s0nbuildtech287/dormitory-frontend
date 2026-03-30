import React from "react";
import StudentProfile from "./profile/index.jsx";
import StudentContract from "./contract/index.jsx";
import StudentBills from "./bills/index.jsx";
import StudentFeedback from "./feedback/index.jsx";
import StudentHome from "./home/index.jsx";
import StudentRegulations from "./regulations/index.jsx";

const StudentDashboard = ({ user, tab }) => {
  if (tab === "home") return <StudentHome />;
  if (tab === "profile") return <StudentProfile user={user} />;
  if (tab === "contract") return <StudentContract />;
  if (tab === "bills") return <StudentBills />;
  if (tab === "feedback") return <StudentFeedback user={user} />;
  if (tab === "regulations") return <StudentRegulations />;
  return <StudentHome />;
};

export default StudentDashboard;

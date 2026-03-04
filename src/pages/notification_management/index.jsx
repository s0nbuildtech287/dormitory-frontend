import React, { useState } from "react";
import { Megaphone, Plus } from "lucide-react";
import NotificationList from "./sections/NotificationList.jsx";
import CreateNotificationForm from "./sections/CreateNotificationForm.jsx";

const NotificationManagement = () => {
  const [notifs, setNotifs] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center text-slate-900">
          <Megaphone className="mr-2 text-blue-600" /> Quản lý thông báo
        </h3>
        <button onClick={() => setIsCreating(true)} className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm font-bold">
          <Plus size={18} className="mr-2" /> Gửi thông báo mới
        </button>
      </div>

      {isCreating && <CreateNotificationForm setIsCreating={setIsCreating} />}

      <NotificationList notifs={notifs} />
    </div>
  );
};

export default NotificationManagement;

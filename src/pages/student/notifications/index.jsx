import React from "react";
import { Bell } from "lucide-react";

const StudentNotifications = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {[].map((notif) => (
        <div key={notif.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-slate-900 flex gap-4 transition-all hover:shadow-md">
          <div className="shrink-0 p-3 bg-slate-50 text-slate-900 rounded-2xl h-fit">
            <Bell size={24} />
          </div>
          <div>
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-lg text-slate-900">{notif.title}</h4>
              <span className="text-[10px] text-slate-400 font-bold uppercase">{notif.date}</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{notif.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentNotifications;

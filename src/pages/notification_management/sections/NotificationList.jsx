import React from "react";
import { Bell, Trash2 } from "lucide-react";

const NotificationList = ({ notifs }) => {
  return (
    <div className="space-y-4">
      {notifs.map((notif) => (
        <div key={notif.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start group hover:border-blue-200 transition-all">
          <div className="flex gap-4">
            <div className="shrink-0 p-3 bg-slate-50 text-slate-900 rounded-2xl h-fit">
              <Bell size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h4 className="font-bold text-lg text-slate-900 leading-tight">{notif.title}</h4>
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase tracking-widest">{notif.type}</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{notif.content}</p>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Phát hành: {notif.date}</p>
            </div>
          </div>
          <button className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;

import React, { useState } from "react";
import { Bell, Send, Plus, Trash2, Megaphone } from "lucide-react";

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

      {isCreating && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 animate-in slide-in-from-top-4 duration-300">
          <h4 className="font-bold text-slate-900 mb-4">Soạn thảo văn bản thông báo</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tiêu đề thông báo</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                placeholder="Nhập tiêu đề ngắn gọn..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nội dung chi tiết</label>
              <textarea
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none h-32 resize-none transition-all"
                placeholder="Nhập nội dung chi tiết gửi đến sinh viên..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition-colors">
                Hủy bỏ
              </button>
              <button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-100">
                <Send size={18} className="mr-2" /> Phát hành ngay
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default NotificationManagement;

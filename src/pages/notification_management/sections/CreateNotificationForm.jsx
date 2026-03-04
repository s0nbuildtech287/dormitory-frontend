import React from "react";
import { Send } from "lucide-react";

const CreateNotificationForm = ({ setIsCreating }) => {
  return (
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
  );
};

export default CreateNotificationForm;

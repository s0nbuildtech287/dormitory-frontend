import React from "react";
import { Users, Home, AlertTriangle, FileText } from "lucide-react";

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
        <div className="p-3 bg-blue-50 text-blue-700 rounded-xl mr-4">
          <Users size={24} />
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium">Tổng sinh viên</p>
          <p className="text-2xl font-bold text-slate-900">1,240</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl mr-4">
          <Home size={24} />
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium">Tỷ lệ lấp đầy</p>
          <p className="text-2xl font-bold text-slate-900">92%</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
        <div className="p-3 bg-amber-50 text-amber-700 rounded-xl mr-4">
          <FileText size={24} />
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium">Đơn chờ duyệt</p>
          <p className="text-2xl font-bold text-slate-900">48</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
        <div className="p-3 bg-rose-50 text-rose-700 rounded-xl mr-4">
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium">Phản ánh mới</p>
          <p className="text-2xl font-bold text-slate-900">12</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;

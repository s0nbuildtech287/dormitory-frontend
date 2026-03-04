import React from "react";
import { FileText } from "lucide-react";

const StudentContract = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-xl font-bold flex items-center text-slate-900">
            <FileText className="mr-2 text-blue-600" /> Hợp đồng nội trú KTX
          </h3>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-tight">Đang hiệu lực</span>
        </div>
        <div className="space-y-4 divide-y divide-slate-50">
          <div className="py-4 grid grid-cols-2">
            <span className="text-slate-500 font-medium">Mã hợp đồng</span>
            <span className="font-bold text-slate-900 text-right md:text-left">HD-2024-8821</span>
          </div>
          <div className="py-4 grid grid-cols-2">
            <span className="text-slate-500 font-medium">Phòng lưu trú</span>
            <span className="font-bold text-blue-700 text-right md:text-left">P.201 - Tòa B1 (Nữ)</span>
          </div>
          <div className="py-4 grid grid-cols-2">
            <span className="text-slate-500 font-medium">Ngày bắt đầu</span>
            <span className="font-bold text-slate-800 text-right md:text-left">01/09/2023</span>
          </div>
          <div className="py-4 grid grid-cols-2">
            <span className="text-slate-500 font-medium">Ngày kết thúc</span>
            <span className="font-bold text-slate-800 text-right md:text-left">30/06/2024</span>
          </div>
          <div className="py-4 grid grid-cols-2">
            <span className="text-slate-500 font-medium">Phí nội trú / tháng</span>
            <span className="font-bold text-blue-700 text-lg text-right md:text-left">500,000 VNĐ</span>
          </div>
        </div>
        <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-200">Tải file hợp đồng (PDF)</button>
      </div>
    </div>
  );
};

export default StudentContract;

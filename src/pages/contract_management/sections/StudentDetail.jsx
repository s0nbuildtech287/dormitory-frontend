import React from "react";
import { ArrowLeft, Mail, Phone, FileText } from "lucide-react";

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="text-slate-400">{icon}</div>
    <div>
      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</p>
      <p className="font-semibold text-slate-800 text-sm">{value}</p>
    </div>
  </div>
);

const DataField = ({ label, value, highlight }) => (
  <div>
    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</p>
    <p className={`font-bold ${highlight ? "text-blue-700" : "text-slate-800"}`}>{value}</p>
  </div>
);

const StudentDetail = ({ student, onBack }) => {
  if (!student) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách sinh viên
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8">
            <img src={student.avatar} className="w-32 h-32 rounded-3xl border-4 border-slate-50" alt={student.name} />
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{student.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold uppercase">{student.studentId}</span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${student.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}>
                    {student.status === "Active" ? "Đang nội trú" : "Đã rời"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={<Mail size={16} />} label="Email" value={student.email} />
                <InfoItem icon={<Phone size={16} />} label="Số điện thoại" value={student.phone || "N/A"} />
              </div>
            </div>
          </div>

          {/* Contract details */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
              <FileText size={16} className="text-blue-600" /> Chi tiết hợp đồng
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <DataField label="Phòng" value={`${student.room || "N/A"} (${student.building || "N/A"})`} highlight />
              <DataField label="Tiền cọc" value={`${student.deposit?.toLocaleString() || "0"} VNĐ`} />
              <DataField label="Hết hạn" value="30/06/2024" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;

import React from "react";

const StudentProfile = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative">
          <img src={user.avatar} alt="Avatar" className="w-32 h-32 rounded-3xl border-4 border-slate-50 shadow-sm" />
          <div className="absolute bottom-1 right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white shadow-sm"></div>
        </div>
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{user.name}</h3>
            <p className="text-slate-500 font-medium tracking-tight">Mã sinh viên: {user.studentId}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Email</p>
              <p className="font-semibold text-slate-800">{user.email}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Giới tính</p>
              <p className="font-semibold text-slate-800">{user.gender}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Số điện thoại</p>
              <p className="font-semibold text-slate-800">0987-XXX-XXX</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Cơ sở đào tạo</p>
              <p className="font-semibold text-slate-800">Trường CNTT & Truyền thông</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

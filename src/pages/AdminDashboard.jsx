import React from "react";
import { CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis } from "recharts";
import { Users, Home, AlertTriangle, FileText } from "lucide-react";

const dataStats = [
  { name: "Tháng 8", value: 45000000 },
  { name: "Tháng 9", value: 52000000 },
  { name: "Tháng 10", value: 48000000 },
  { name: "Tháng 11", value: 61000000 },
];

const occupancyData = [
  { name: "Đang ở", value: 85 },
  { name: "Trống", value: 15 },
];

const COLORS = ["#1e40af", "#cbd5e1"];

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Doanh thu phí KTX (VNĐ)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tickFormatter={(val) => `${val / 1000000}M`} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#1e40af" strokeWidth={2} fill="url(#colorVal)" />
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e40af" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Trạng thái phòng</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancyData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Hoạt động gần đây</h3>
          <button className="text-blue-700 text-sm font-bold hover:underline">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-xs font-black capitalize tracking-widest">
                <th className="px-8 py-5 border-r-2 border-slate-300">Sự kiện</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Người thực hiện</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Thời gian</th>
                <th className="px-8 py-5">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 font-medium text-slate-900 border-r-2 border-slate-300">Phê duyệt hồ sơ SV2024001</td>
                <td className="px-8 py-5 text-slate-600 border-r-2 border-slate-300">Admin</td>
                <td className="px-8 py-5 text-slate-500 text-sm border-r-2 border-slate-300">10 phút trước</td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">Thành công</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 font-medium text-slate-900 border-r-2 border-slate-300">Tạo hóa đơn điện nước tầng 3</td>
                <td className="px-8 py-5 text-slate-600 border-r-2 border-slate-300">Admin</td>
                <td className="px-8 py-5 text-slate-500 text-sm border-r-2 border-slate-300">1 giờ trước</td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">Thành công</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 font-medium text-slate-900 border-r-2 border-slate-300">Cập nhật nội quy phòng cháy</td>
                <td className="px-8 py-5 text-slate-600 border-r-2 border-slate-300">Admin</td>
                <td className="px-8 py-5 text-slate-500 text-sm border-r-2 border-slate-300">3 giờ trước</td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase">Thông báo</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

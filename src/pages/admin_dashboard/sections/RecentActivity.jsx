import React from "react";

const RecentActivity = () => {
  return (
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
  );
};

export default RecentActivity;

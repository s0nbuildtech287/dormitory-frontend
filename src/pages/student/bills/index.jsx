import React, { useState } from "react";
import { BillStatus } from "../../../utils/types.js";
import { CreditCard, TrendingUp } from "lucide-react";

const StudentBills = () => {
  const [bills, setBills] = useState([]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl mr-4">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">Cần thanh toán</p>
            <p className="text-2xl font-bold text-slate-900">700,000đ</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mr-4">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">Đã quyết toán</p>
            <p className="text-2xl font-bold text-slate-900">1,450,000đ</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-0.5">Dự kiến kỳ sau</p>
            <p className="text-2xl font-bold text-slate-900">680,000đ</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Kỳ hóa đơn</th>
                <th className="px-6 py-4">Tiền phòng</th>
                <th className="px-6 py-4">Điện & Nước</th>
                <th className="px-6 py-4">Tổng cộng</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-center">Thanh toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{bill.month}</td>
                  <td className="px-6 py-4 text-slate-600">{bill.roomFee.toLocaleString()}đ</td>
                  <td className="px-6 py-4 text-slate-600">{(bill.electricity + bill.water).toLocaleString()}đ</td>
                  <td className="px-6 py-4 font-bold text-blue-700">{bill.total.toLocaleString()}đ</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                        bill.status === BillStatus.PAID ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {bill.status === BillStatus.UNPAID && (
                      <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-md shadow-slate-200 transition-all active:scale-95">
                        Cổng VNPay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentBills;

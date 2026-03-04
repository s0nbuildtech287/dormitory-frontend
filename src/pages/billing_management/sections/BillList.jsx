import React, { useState } from "react";
import { BillStatus } from "../../../utils/types.js";
import { Search, Plus, Download, Printer, Send } from "lucide-react";

const BillList = ({ bills, setBills }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || bill.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: filteredBills.reduce((sum, b) => sum + b.total, 0),
    unpaid: filteredBills.filter((b) => b.status === BillStatus.UNPAID).reduce((sum, b) => sum + b.total, 0),
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Tổng phải thu (Bộ lọc)</p>
          <p className="text-2xl font-black text-slate-900">{stats.total.toLocaleString()}đ</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Còn nợ</p>
          <p className="text-2xl font-black text-rose-600">{stats.unpaid.toLocaleString()}đ</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">
            <Plus size={18} className="mr-2" /> Hóa đơn mới
          </button>
          <button className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm">
            <Download size={18} className="mr-2" /> Export
          </button>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm mã SV..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-xs font-black capitalize tracking-widest">
                <th className="px-8 py-5 border-r-2 border-slate-300">Mã sinh viên</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Kỳ tháng</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Tổng tiền</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Hạn đóng</th>
                <th className="px-8 py-5 border-r-2 border-slate-300">Trạng thái</th>
                <th className="px-8 py-5 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-900 text-sm border-r-2 border-slate-300">{bill.studentId}</td>
                  <td className="px-8 py-5 text-slate-600 text-sm border-r-2 border-slate-300">{bill.month}</td>
                  <td className="px-8 py-5 font-bold text-blue-700 text-sm border-r-2 border-slate-300">{bill.total.toLocaleString()}đ</td>
                  <td className="px-8 py-5 text-slate-500 font-bold text-[11px] border-r-2 border-slate-300">{bill.dueDate}</td>
                  <td className="px-8 py-5 border-r-2 border-slate-300">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${bill.status === BillStatus.PAID ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center space-x-1">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600">
                        <Printer size={18} />
                      </button>
                      {bill.status === BillStatus.UNPAID && (
                        <button className="p-1.5 text-slate-400 hover:text-amber-600">
                          <Send size={18} />
                        </button>
                      )}
                    </div>
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

export default BillList;

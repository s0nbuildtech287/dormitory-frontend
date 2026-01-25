import React, { useState, useMemo } from "react";
import { MOCK_BILLS } from "../utils/constants.jsx";
import { BillStatus } from "../utils/types.js";
import { Search, Plus, Download, Printer, Send, Filter, List, TrendingUp, CreditCard, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const BillingManagement = () => {
  const [bills, setBills] = useState(MOCK_BILLS);
  const [activeSubTab, setActiveSubTab] = useState("list");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || bill.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const revenueData = useMemo(() => {
    return [
      { month: "T08", amount: 45000000, collected: 40000000 },
      { month: "T09", amount: 52000000, collected: 48000000 },
      { month: "T10", amount: 48000000, collected: 46000000 },
      { month: "T11", amount: 61000000, collected: 55000000 },
    ];
  }, []);

  const stats = useMemo(() => {
    const total = filteredBills.reduce((sum, b) => sum + b.total, 0);
    const unpaid = filteredBills.filter((b) => b.status === BillStatus.UNPAID).reduce((sum, b) => sum + b.total, 0);
    return { total, unpaid };
  }, [filteredBills]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab("list")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeSubTab === "list" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <List size={18} /> Danh sách hóa đơn
        </button>
        <button
          onClick={() => setActiveSubTab("revenue")}
          className={`px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeSubTab === "revenue" ? "border-blue-600 text-blue-700 bg-blue-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <TrendingUp size={18} /> Báo cáo doanh thu
        </button>
      </div>

      {activeSubTab === "list" && (
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

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-widest">
                    <th className="px-6 py-4">Mã sinh viên</th>
                    <th className="px-6 py-4">Kỳ tháng</th>
                    <th className="px-6 py-4">Tổng tiền</th>
                    <th className="px-6 py-4">Hạn đóng</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">{bill.studentId}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{bill.month}</td>
                      <td className="px-6 py-4 font-bold text-blue-700 text-sm">{bill.total.toLocaleString()}đ</td>
                      <td className="px-6 py-4 text-slate-500 font-bold text-[11px]">{bill.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${bill.status === BillStatus.PAID ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
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
      )}

      {activeSubTab === "revenue" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <DollarSign size={18} className="text-blue-600" /> Xu hướng doanh thu
              </h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                    <Tooltip />
                    <Area type="monotone" dataKey="amount" stroke="#1e40af" fill="#dbeafe" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" /> Thu thực tế vs Dự kiến
              </h4>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="amount" name="Dự kiến" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="collected" name="Đã thu" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;

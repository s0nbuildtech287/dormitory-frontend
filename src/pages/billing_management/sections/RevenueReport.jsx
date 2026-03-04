import React, { useMemo } from "react";
import { DollarSign, CreditCard } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

const RevenueReport = () => {
  const revenueData = useMemo(() => {
    return [
      { month: "T08", amount: 45000000, collected: 40000000 },
      { month: "T09", amount: 52000000, collected: 48000000 },
      { month: "T10", amount: 48000000, collected: 46000000 },
      { month: "T11", amount: 61000000, collected: 55000000 },
    ];
  }, []);

  return (
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
  );
};

export default RevenueReport;

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Gender } from "../../../utils/types.js";

const COLORS = ["#3b82f6", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

const ContractStatistics = ({ students }) => {
  const analysisData = useMemo(() => {
    const safeStudents = Array.isArray(students) ? students : [];

    const facultyCounts = safeStudents.reduce((acc, std) => {
      const f = std.faculty || "Khác";
      acc[f] = (acc[f] || 0) + 1;
      return acc;
    }, {});

    return {
      facultyStats: Object.keys(facultyCounts).map((name, i) => ({
        name,
        value: facultyCounts[name],
        color: COLORS[i % COLORS.length],
      })),
      genderDist: [
        {
          name: "Nam",
          value: safeStudents.filter((s) => s.gender === Gender.MALE).length,
          color: "#3b82f6",
        },
        {
          name: "Nữ",
          value: safeStudents.filter((s) => s.gender === Gender.FEMALE).length,
          color: "#f43f5e",
        },
      ],
    };
  }, [students]);

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender distribution */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-xs">Phân bố giới tính</h4>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={analysisData.genderDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {analysisData.genderDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Faculty distribution */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-widest text-xs">Phân bố theo khoa</h4>
          {analysisData.facultyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analysisData.facultyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Sinh viên" radius={[6, 6, 0, 0]}>
                  {analysisData.facultyStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-400 text-center py-16 text-sm">Chưa có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractStatistics;

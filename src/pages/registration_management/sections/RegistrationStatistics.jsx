import { useMemo } from "react";
import { RegistrationStatus, AISuggestionType } from "../../../utils/types.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const RegistrationStatistics = ({ regs }) => {
  const statsData = useMemo(() => {
    const statusCounts = {
      [RegistrationStatus.PENDING]: regs.filter((r) => r.status === RegistrationStatus.PENDING).length,
      [RegistrationStatus.APPROVED]: regs.filter((r) => r.status === RegistrationStatus.APPROVED).length,
      [RegistrationStatus.REJECTED]: regs.filter((r) => r.status === RegistrationStatus.REJECTED).length,
    };

    const pieData = [
      { name: "Chờ duyệt", value: statusCounts[RegistrationStatus.PENDING], color: "#f59e0b" },
      { name: "Đã chấp nhận", value: statusCounts[RegistrationStatus.APPROVED], color: "#10b981" },
      { name: "Đã từ chối", value: statusCounts[RegistrationStatus.REJECTED], color: "#f43f5e" },
    ];

    const aiDist = [
      { name: "Nên duyệt", value: regs.filter((r) => r.aiSuggestion === AISuggestionType.RECOMMENDED).length },
      { name: "Cân nhắc", value: regs.filter((r) => r.aiSuggestion === AISuggestionType.CONSIDER).length },
      { name: "Không ưu tiên", value: regs.filter((r) => r.aiSuggestion === AISuggestionType.LOW_PRIORITY).length },
    ];

    return { pieData, aiDist };
  }, [regs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h4 className="font-black text-slate-900 mb-8 flex items-center gap-2 uppercase text-xs tracking-widest">Tỷ lệ trạng thái hồ sơ</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statsData.pieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {statsData.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <h4 className="font-black text-slate-900 mb-8 flex items-center gap-2 uppercase text-xs tracking-widest">Đề xuất AI theo phân nhóm</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsData.aiDist}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: "bold" }} />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="value" fill="#1e40af" radius={[8, 8, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RegistrationStatistics;
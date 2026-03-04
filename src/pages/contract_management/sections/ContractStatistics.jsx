import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Tông màu xanh từ đậm đến nhạt
const COLORS = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
const CHART_COLORS = {
  primary: "#1e40af",    // Xanh đậm
  secondary: "#3b82f6",  // Xanh vừa
  success: "#2563eb",    // Xanh đậm vừa
  warning: "#60a5fa",    // Xanh nhạt vừa
  danger: "#1e3a8a",     // Xanh đậm nhất
  info: "#93c5fd",       // Xanh nhạt
};

const ContractStatistics = ({ contracts = [] }) => {
  const analysisData = useMemo(() => {
    const safe = Array.isArray(contracts) ? contracts : [];

    const facultyCounts = safe.reduce((acc, c) => {
      const f = c.snapshot_faculty || c.rf_faculty || "Khác";
      acc[f] = (acc[f] || 0) + 1;
      return acc;
    }, {});

    const yearCounts = safe.reduce((acc, c) => {
      const y = c.snapshot_year || c.rf_year;
      const k = y ? `Năm ${y}` : "Không xác định";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    const statusCounts = [
      { name: "Chờ phòng", value: safe.filter((c) => c.status === "Pending").length, color: "#f59e0b" },
      { name: "Nội trú", value: safe.filter((c) => c.status === "Active").length, color: "#10b981" },
      { name: "Hết hạn", value: safe.filter((c) => c.status === "Expired").length, color: "#94a3b8" },
      { name: "Chấm dứt", value: safe.filter((c) => c.status === "Terminated").length, color: "#f43f5e" },
    ].filter((s) => s.value > 0);

    return {
      facultyStats: Object.keys(facultyCounts).map((name, i) => ({
        name,
        value: facultyCounts[name],
        color: COLORS[i % COLORS.length],
      })),
      yearStats: Object.keys(yearCounts).map((name, i) => ({
        name,
        value: yearCounts[name],
        color: COLORS[i % COLORS.length],
      })),
      genderDist: [
        { name: "Nam", value: safe.filter((c) => c.snapshot_gender === "Nam").length, color: CHART_COLORS.primary },
        { name: "Nữ", value: safe.filter((c) => c.snapshot_gender === "Nữ").length, color: CHART_COLORS.info },
      ],
      statusCounts,
    };
  }, [contracts]);

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status distribution */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl shadow-md border-2 border-slate-200">
          <h4 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-900 rounded"></span>
            Trạng thái hợp đồng
          </h4>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={analysisData.statusCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                {analysisData.statusCounts.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: "13px", fontWeight: "500" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gender distribution */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl shadow-md border-2 border-slate-200">
          <h4 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-900 rounded"></span>
            Phân bố giới tính
          </h4>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={analysisData.genderDist} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                {analysisData.genderDist.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: "13px", fontWeight: "500" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Faculty distribution */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl shadow-md border-2 border-slate-200">
          <h4 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-900 rounded"></span>
            Phân bố theo khoa
          </h4>
          {analysisData.facultyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analysisData.facultyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#475569" }} />
                <YAxis tick={{ fontSize: 10, fill: "#475569" }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="value" name="Sinh viên" radius={[5, 5, 0, 0]}>
                  {analysisData.facultyStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-400 text-center py-16 text-sm">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Year distribution */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-2xl shadow-md border-2 border-slate-200">
          <h4 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-900 rounded"></span>
            Phân bố theo năm học
          </h4>
          {analysisData.yearStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analysisData.yearStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="value" name="Sinh viên" radius={[5, 5, 0, 0]}>
                  {analysisData.yearStats.map((_, index) => (
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

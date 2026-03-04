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
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Trạng thái hợp đồng</h3>
              <p className="text-sm text-slate-500">Phân bổ theo trạng thái hiện tại</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analysisData.statusCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {analysisData.statusCounts.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", fontWeight: "bold" }} />
                <Legend wrapperStyle={{ fontSize: "13px", fontWeight: "bold" }} formatter={(value) => <span style={{ color: "#1e293b" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Phân bố giới tính</h3>
              <p className="text-sm text-slate-500">Tỷ lệ nam/nữ trong hợp đồng</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analysisData.genderDist} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                  {analysisData.genderDist.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", fontWeight: "bold" }} />
                <Legend wrapperStyle={{ fontSize: "13px", fontWeight: "bold" }} formatter={(value) => <span style={{ color: "#1e293b" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Faculty distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Phân bố theo khoa</h3>
              <p className="text-sm text-slate-500">Số lượng sinh viên theo khoa</p>
            </div>
          </div>
          {analysisData.facultyStats.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisData.facultyStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: "bold", fill: "#1e293b" }} />
                  <YAxis tick={{ fontWeight: "bold", fill: "#1e293b" }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontWeight: "bold" }} />
                  <Bar dataKey="value" name="Sinh viên" radius={[5, 5, 0, 0]}>
                    {analysisData.facultyStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Year distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Phân bố theo năm học</h3>
              <p className="text-sm text-slate-500">Số lượng sinh viên theo khóa</p>
            </div>
          </div>
          {analysisData.yearStats.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisData.yearStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: "bold", fill: "#1e293b" }} />
                  <YAxis tick={{ fontWeight: "bold", fill: "#1e293b" }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontWeight: "bold" }} />
                  <Bar dataKey="value" name="Sinh viên" radius={[5, 5, 0, 0]}>
                    {analysisData.yearStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-400">Chưa có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractStatistics;

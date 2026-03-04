import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { AlertTriangle, Clock, Calendar } from "lucide-react";

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
    const now = new Date();

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

    // Tính toán hợp đồng sắp hết hạn - chỉ lấy Active contracts
    const activeContracts = safe.filter((c) => c.status === "Active" && c.end_date);
    
    const expiringContracts = activeContracts.filter((c) => {
      const endDate = new Date(c.end_date);
      const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    const expiring15Days = expiringContracts.filter((c) => {
      const endDate = new Date(c.end_date);
      const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 15;
    });

    const expiring30Days = expiringContracts.filter((c) => {
      const endDate = new Date(c.end_date);
      const daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 15 && daysUntilExpiry <= 30;
    });

    // Debug log
    console.log("Contract expiry analysis:", {
      totalContracts: safe.length,
      activeContracts: activeContracts.length,
      expiringIn30Days: expiringContracts.length,
      expiringIn15Days: expiring15Days.length,
      expiringIn16to30Days: expiring30Days.length,
    });

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
      expiringContracts,
      expiring15Days,
      expiring30Days,
    };
  }, [contracts]);

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Cảnh báo hợp đồng sắp hết hạn */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-amber-500" size={24} />
          <div>
            <h3 className="text-lg font-bold text-slate-900">Hợp đồng sắp hết hạn</h3>
            <p className="text-sm text-slate-500">
              Tổng: {analysisData.expiringContracts.length} hợp đồng cần xử lý trong 30 ngày
            </p>
          </div>
        </div>

        {analysisData.expiringContracts.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>✓ Không có hợp đồng nào sắp hết hạn</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Khẩn cấp - 15 ngày */}
            {analysisData.expiring15Days.length > 0 && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="text-red-600" size={18} />
                    <h4 className="font-bold text-red-900 text-sm">Khẩn cấp (≤ 15 ngày)</h4>
                  </div>
                  <span className="text-2xl font-black text-red-600">{analysisData.expiring15Days.length}</span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {analysisData.expiring15Days.slice(0, 3).map((contract) => {
                    const daysLeft = Math.ceil((new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={contract.contract_id} className="text-xs bg-white p-2 rounded border border-red-100">
                        <div className="font-semibold text-slate-800">{contract.snapshot_name || "N/A"}</div>
                        <div className="text-red-600">Còn {daysLeft} ngày</div>
                      </div>
                    );
                  })}
                  {analysisData.expiring15Days.length > 3 && (
                    <div className="text-xs text-red-600 font-semibold text-center">
                      +{analysisData.expiring15Days.length - 3} hợp đồng khác
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cần chú ý - 16-30 ngày */}
            {analysisData.expiring30Days.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-amber-600" size={18} />
                    <h4 className="font-bold text-amber-900 text-sm">Cần chú ý (16-30 ngày)</h4>
                  </div>
                  <span className="text-2xl font-black text-amber-600">{analysisData.expiring30Days.length}</span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {analysisData.expiring30Days.slice(0, 3).map((contract) => {
                    const daysLeft = Math.ceil((new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={contract.contract_id} className="text-xs bg-white p-2 rounded border border-amber-100">
                        <div className="font-semibold text-slate-800">{contract.snapshot_name || "N/A"}</div>
                        <div className="text-amber-600">Còn {daysLeft} ngày</div>
                      </div>
                    );
                  })}
                  {analysisData.expiring30Days.length > 3 && (
                    <div className="text-xs text-amber-600 font-semibold text-center">
                      +{analysisData.expiring30Days.length - 3} hợp đồng khác
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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

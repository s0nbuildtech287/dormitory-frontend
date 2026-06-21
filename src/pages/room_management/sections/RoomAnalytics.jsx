import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Building2, Home, Users, DoorOpen, CheckCircle2, AlertCircle, TrendingUp, LayoutGrid } from "lucide-react";
import StatCard from "../../../components/common/StatCard.jsx";
import useBuildingDisplayNames from "../../../hooks/useBuildingDisplayNames.js";

const BUILDING_COLORS = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

const RoomAnalytics = ({ rooms }) => {
  const { buildingNames } = useBuildingDisplayNames();
  const stats = useMemo(() => {
    const safeRooms = Array.isArray(rooms) ? rooms : [];
    if (safeRooms.length === 0) {
      return {
        totalBuildings: 0,
        totalRooms: 0,
        totalCapacity: 0,
        emptyCount: 0,
        occupiedCount: 0,
        fullCount: 0,
        overallRate: 0,
        buildingStats: [],
        statusPie: [],
        genderPie: [],
        floorStats: [],
        topBuilding: null,
        mostEmptyBuilding: null,
      };
    }

    const totalCapacity = safeRooms.reduce((s, r) => s + (r.capacity || 0), 0);
    const totalOccupied = safeRooms.reduce((s, r) => s + (r.currentOccupancy || 0), 0);

    const emptyCount = safeRooms.filter((r) => (r.currentOccupancy || 0) === 0).length;
    const fullCount = safeRooms.filter((r) => (r.currentOccupancy || 0) >= r.capacity).length;
    const occupiedCount = safeRooms.length - emptyCount - fullCount;
    const overallRate = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0;

    // --- Per-building stats ---
    const buildingMap = {};
    safeRooms.forEach((r) => {
      const b = r.building || "Khác";
      if (!buildingMap[b]) buildingMap[b] = { code: b, name: buildingNames[b] || `Tòa ${b}`, rooms: 0, capacity: 0, occupancy: 0, empty: 0, occupied: 0, full: 0 };
      buildingMap[b].rooms++;
      buildingMap[b].capacity += r.capacity || 0;
      buildingMap[b].occupancy += r.currentOccupancy || 0;
      if ((r.currentOccupancy || 0) === 0) buildingMap[b].empty++;
      else if ((r.currentOccupancy || 0) >= r.capacity) buildingMap[b].full++;
      else buildingMap[b].occupied++;
    });
    const buildingStats = Object.values(buildingMap).map((b) => ({
      ...b,
      rate: b.capacity > 0 ? parseFloat(((b.occupancy / b.capacity) * 100).toFixed(1)) : 0,
    }));

    const topBuilding = [...buildingStats].sort((a, b) => b.rate - a.rate)[0];
    const mostEmptyBuilding = [...buildingStats].sort((a, b) => b.empty - a.empty)[0];

    // --- Status pie ---
    const statusPie = [
      { name: "Trống", value: emptyCount, color: "#93c5fd" },
      { name: "Đang ở", value: occupiedCount, color: "#3b82f6" },
      { name: "Đã đầy", value: fullCount, color: "#1e40af" },
    ].filter((d) => d.value > 0);

    // --- Gender pie ---
    const maleRooms = safeRooms.filter((r) => r.gender === "Nam").length;
    const femaleRooms = safeRooms.filter((r) => r.gender === "Nữ").length;
    const otherRooms = safeRooms.length - maleRooms - femaleRooms;
    const genderPie = [
      { name: "Phòng Nam", value: maleRooms, color: "#2563eb" },
      { name: "Phòng Nữ", value: femaleRooms, color: "#93c5fd" },
      ...(otherRooms > 0 ? [{ name: "Khác", value: otherRooms, color: "#bfdbfe" }] : []),
    ].filter((d) => d.value > 0);

    // --- Floor breakdown ---
    const floorMap = {};
    safeRooms.forEach((r) => {
      const key = `Tầng ${r.floor || "?"}`;
      if (!floorMap[key]) floorMap[key] = { name: key, rooms: 0, capacity: 0, occupancy: 0 };
      floorMap[key].rooms++;
      floorMap[key].capacity += r.capacity || 0;
      floorMap[key].occupancy += r.currentOccupancy || 0;
    });
    const floorStats = Object.values(floorMap).sort((a, b) => {
      const fa = parseInt(a.name.replace("Tầng ", "")) || 0;
      const fb = parseInt(b.name.replace("Tầng ", "")) || 0;
      return fa - fb;
    });

    return {
      totalBuildings: Object.keys(buildingMap).length,
      totalRooms: safeRooms.length,
      totalCapacity,
      emptyCount,
      occupiedCount,
      fullCount,
      overallRate,
      buildingStats,
      statusPie,
      genderPie,
      floorStats,
      topBuilding,
      mostEmptyBuilding,
    };
  }, [buildingNames, rooms]);


  const pieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── 1. SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Building2} label="Số tòa" value={stats.totalBuildings} colorClass="bg-indigo-500 text-white" />
        <StatCard icon={LayoutGrid} label="Tổng phòng" value={stats.totalRooms} colorClass="bg-blue-500 text-white" />
        <StatCard icon={Users} label="Sức chứa tổng" value={stats.totalCapacity} subValue="chỗ" colorClass="bg-purple-500 text-white" />
        <StatCard icon={DoorOpen} label="Phòng trống" value={stats.emptyCount} colorClass="bg-emerald-500 text-white" />
        <StatCard icon={Home} label="Đang có người" value={stats.occupiedCount} colorClass="bg-amber-500 text-white" />
        <StatCard icon={CheckCircle2} label="Đã đầy" value={stats.fullCount} colorClass="bg-rose-500 text-white" />
      </div>

      {/* ── 2. INSIGHTS PANEL ── */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-3xl border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <TrendingUp className="text-indigo-600" size={26} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Phân tích & Gợi ý</h3>
            <p className="text-sm text-slate-600">Insights từ dữ liệu phòng ở hiện tại</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tỷ lệ lấp đầy */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <h4 className="font-bold text-slate-800">Tỷ lệ lấp đầy</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">●</span>
                <span>
                  Toàn khu lấp đầy <strong>{stats.overallRate}%</strong>
                  {stats.overallRate >= 90 ? " — đang gần hết chỗ" : stats.overallRate >= 70 ? " — mức bình thường" : " — còn nhiều phòng trống"}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">●</span>
                <span>
                  Tòa có tỷ lệ cao nhất: <strong>{stats.topBuilding?.name || "N/A"}</strong> ({stats.topBuilding?.rate || 0}%)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">●</span>
                <span>
                  <strong>{stats.fullCount}</strong> phòng đã đầy &mdash; chiếm <strong>{stats.totalRooms > 0 ? ((stats.fullCount / stats.totalRooms) * 100).toFixed(1) : 0}%</strong> tổng số phòng
                </span>
              </li>
            </ul>
          </div>

          {/* Phòng trống */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="font-bold text-slate-800">Phòng trống & Khả dụng</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">●</span>
                <span>
                  Còn <strong>{stats.emptyCount}</strong> phòng hoàn toàn trống, sẵn sàng nhận sinh viên mới
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">●</span>
                <span>
                  <strong>{stats.occupiedCount}</strong> phòng đang ở nhưng chưa đầy — còn chỗ bổ sung
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 mt-0.5">●</span>
                <span>
                  Tòa có nhiều phòng trống nhất: <strong>{stats.mostEmptyBuilding?.name || "N/A"}</strong> ({stats.mostEmptyBuilding?.empty || 0} phòng)
                </span>
              </li>
            </ul>
          </div>

          {/* Cơ cấu giới tính */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <h4 className="font-bold text-slate-800">Cơ cấu phòng Nam / Nữ</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {stats.genderPie.map((g) => (
                <li key={g.name} className="flex items-start gap-2">
                  <span style={{ color: g.color }} className="mt-0.5">
                    ●
                  </span>
                  <span>
                    <strong>{g.name}:</strong> {g.value} phòng ({stats.totalRooms > 0 ? ((g.value / stats.totalRooms) * 100).toFixed(1) : 0}%)
                  </span>
                </li>
              ))}
              {stats.genderPie.length === 0 && <li className="text-slate-400 text-xs italic">Chưa có dữ liệu giới tính phòng</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* ── 3. CHARTS ROW 1: Trạng thái theo Tòa + Tỷ lệ lấp đầy ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stacked bar: trạng thái (trống/đang ở/đầy) theo tòa */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="text-indigo-600" size={22} />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Trạng thái phòng theo Tòa</h3>
              <p className="text-sm text-slate-500">Số phòng Trống / Đang ở / Đã đầy</p>
            </div>
          </div>
          <div className="h-[300px]">
            {stats.buildingStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.buildingStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: "bold", fill: "#1e293b" }} />
                  <YAxis tick={{ fontWeight: "bold", fill: "#1e293b" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontWeight: "bold" }} />
                  <Legend wrapperStyle={{ fontWeight: "bold", fontSize: "13px" }} formatter={(v) => <span style={{ color: "#1e293b" }}>{v}</span>} />
                  <Bar dataKey="empty" name="Trống" stackId="a" fill="#bfdbfe" />
                  <Bar dataKey="occupied" name="Đang ở" stackId="a" fill="#60a5fa" />
                  <Bar dataKey="full" name="Đã đầy" stackId="a" fill="#1e40af" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        {/* Bar: tỷ lệ lấp đầy (%) theo tòa */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="text-amber-500" size={22} />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tỷ lệ lấp đầy theo Tòa</h3>
              <p className="text-sm text-slate-500">Phần trăm số chỗ đã có người ở</p>
            </div>
          </div>
          <div className="h-[300px]">
            {stats.buildingStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.buildingStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: "bold", fill: "#1e293b" }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontWeight: "bold", fill: "#1e293b" }} />
                  <Tooltip formatter={(v) => [`${v}%`, "Tỷ lệ lấp đầy"]} contentStyle={{ borderRadius: "8px", fontWeight: "bold" }} />
                  <defs>
                    <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#1e40af" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="rate" name="Tỷ lệ lấp đầy" fill="url(#rateGradient)" radius={[8, 8, 0, 0]} barSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. CHARTS ROW 2: Phân loại trạng thái tổng + Số phòng theo Tầng ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie: tổng trạng thái phòng */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Home className="text-emerald-600" size={22} />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tổng quan Trạng thái phòng</h3>
              <p className="text-sm text-slate-500">Phân bổ toàn khu ký túc xá</p>
            </div>
          </div>
          <div className="h-[300px]">
            {stats.statusPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.statusPie} cx="50%" cy="50%" outerRadius={105} dataKey="value" labelLine={false} label={pieLabel}>
                    {stats.statusPie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", fontWeight: "bold" }} />
                  <Legend
                    wrapperStyle={{ fontWeight: "bold", fontSize: "13px" }}
                    formatter={(value, entry) => {
                      const total = stats.statusPie.reduce((s, d) => s + d.value, 0);
                      const pct = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
                      return <span style={{ color: "#1e293b" }}>{`${value}: ${entry.payload.value} (${pct}%)`}</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        {/* Grouped bar: số phòng + sức chứa theo Tầng */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <LayoutGrid className="text-blue-600" size={22} />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Số phòng & Sức chứa theo Tầng</h3>
              <p className="text-sm text-slate-500">Phân bổ theo từng tầng toàn khu</p>
            </div>
          </div>
          <div className="h-[300px]">
            {stats.floorStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.floorStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: "bold", fill: "#1e293b" }} />
                  <YAxis tick={{ fontWeight: "bold", fill: "#1e293b" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontWeight: "bold" }} />
                  <Legend wrapperStyle={{ fontWeight: "bold", fontSize: "13px" }} formatter={(v) => <span style={{ color: "#1e293b" }}>{v}</span>} />
                  <Bar dataKey="rooms" name="Số phòng" fill="#93c5fd" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="capacity" name="Sức chứa" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="occupancy" name="Đang ở" fill="#1e40af" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomAnalytics;

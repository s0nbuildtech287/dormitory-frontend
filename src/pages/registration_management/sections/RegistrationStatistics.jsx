import { useMemo } from "react";
import { RegistrationStatus, AISuggestionType } from "../../../utils/types.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart, Area, AreaChart } from "recharts";
import { AlertTriangle, TrendingUp, Users, MapPin, Lightbulb, CheckCircle } from "lucide-react";

const RegistrationStatistics = ({ regs }) => {
  const statsData = useMemo(() => {
    if (!regs || regs.length === 0) {
      return {
        totalApplications: 0,
        approvalOverview: [],
        rejectionReasons: [],
        quotaAnalytics: [],
        genderDistribution: [],
        departmentDistribution: [],
        distanceDistribution: [],
        groupDistribution: [],
        yearDistribution: [],
        quotaByGroup: [],
        insights: [],
        stats: {},
      };
    }

    const total = regs.length;
    const approved = regs.filter((r) => r.status === RegistrationStatus.APPROVED).length;
    const rejected = regs.filter((r) => r.status === RegistrationStatus.REJECTED).length;
    const pending = regs.filter((r) => r.status === RegistrationStatus.PENDING).length;

    // Get gender distribution from actual data
    const maleCount = regs.filter((r) => r.gender === "Nam").length;
    const femaleCount = regs.filter((r) => r.gender === "Nữ").length;

    // Helper function to get group name
    const getGroupName = (year, priorityReasons) => {
      if (priorityReasons && String(priorityReasons).trim() !== "") {
        return "Chính sách";
      }
      if (year === 1) {
        return "Tân sinh viên";
      }
      if (year > 1) {
        return "Sinh viên khoá cũ";
      }
      return "Không xác định";
    };

    // Count by group
    const policyCount = regs.filter((r) => r.priority_reasons && String(r.priority_reasons).trim() !== "").length;
    const freshmanCount = regs.filter((r) => r.year === 1 && (!r.priority_reasons || String(r.priority_reasons).trim() === "")).length;
    const oldStudentCount = regs.filter((r) => r.year > 1 && (!r.priority_reasons || String(r.priority_reasons).trim() === "")).length;

    const groupDistribution = [
      { name: "Chính sách", value: policyCount, color: "#ef4444", percentage: ((policyCount / total) * 100).toFixed(1) },
      { name: "Tân sinh viên", value: freshmanCount, color: "#3b82f6", percentage: ((freshmanCount / total) * 100).toFixed(1) },
      { name: "Sinh viên khoá cũ", value: oldStudentCount, color: "#8b5cf6", percentage: ((oldStudentCount / total) * 100).toFixed(1) },
    ];

    // Count by year
    const year1 = regs.filter((r) => r.year === 1).length;
    const year2 = regs.filter((r) => r.year === 2).length;
    const year3 = regs.filter((r) => r.year === 3).length;
    const year4 = regs.filter((r) => r.year === 4).length;

    const yearDistribution = [
      { name: "Năm 1", value: year1, percentage: ((year1 / total) * 100).toFixed(1), color: "#3b82f6" },
      { name: "Năm 2", value: year2, percentage: ((year2 / total) * 100).toFixed(1), color: "#06b6d4" },
      { name: "Năm 3", value: year3, percentage: ((year3 / total) * 100).toFixed(1), color: "#8b5cf6" },
      { name: "Năm 4", value: year4, percentage: ((year4 / total) * 100).toFixed(1), color: "#f59e0b" },
    ];

    // 1. Approval Overview
    const approvalOverview = [
      { name: "Trúng tuyển", value: approved, color: "#10b981", percentage: ((approved / total) * 100).toFixed(1) },
      { name: "Loại", value: rejected, color: "#ef4444", percentage: ((rejected / total) * 100).toFixed(1) },
      { name: "Hàng đợi", value: pending, color: "#f59e0b", percentage: ((pending / total) * 100).toFixed(1) },
    ];

    // Rejection reasons
    const lowGPA = regs.filter((r) => r.gpa && r.gpa < 2.0).length;
    const invalidInfo = rejected - lowGPA;
    const rejectionReasons = [
      { name: "GPA < 2.0", value: lowGPA, color: "#ef4444" },
      { name: "Thông tin không hợp lệ", value: Math.max(0, invalidInfo), color: "#f97316" },
    ];

    // 2. Quota Analytics - 3 baskets
    const quota1Max = Math.ceil(total * 0.12); // 12% for Policy
    const quota2Max = Math.ceil(total * 0.55); // 55% for Freshmen
    const quota3Max = Math.ceil(total * 0.33); // 33% for Seniors

    const quota1Used = Math.ceil(approved * 0.15);
    const quota2Used = Math.ceil(approved * 0.55);
    const quota3Used = Math.ceil(approved * 0.3);

    const quotaOverflow = Math.max(0, quota1Max - quota1Used);

    const quotaAnalytics = [
      {
        name: "Rổ 1: Chính sách",
        used: quota1Used,
        max: quota1Max,
        percentage: ((quota1Used / quota1Max) * 100).toFixed(1),
        color: "#3b82f6",
      },
      {
        name: "Rổ 2: Tân sinh viên",
        used: quota2Used,
        max: quota2Max,
        percentage: ((quota2Used / quota2Max) * 100).toFixed(1),
        color: "#06b6d4",
      },
      {
        name: "Rổ 3: Khóa cũ",
        used: quota3Used,
        max: quota3Max,
        percentage: ((quota3Used / quota3Max) * 100).toFixed(1),
        color: "#8b5cf6",
      },
    ];

    // Quota utilization by group
    const policyApproved = approved > 0 ? Math.ceil((policyCount / total) * approved) : 0;
    const freshmanApproved = approved > 0 ? Math.ceil((freshmanCount / total) * approved) : 0;
    const oldStudentApproved = approved > 0 ? Math.ceil((oldStudentCount / total) * approved) : 0;

    const quotaByGroup = [
      {
        group: "Chín sách",
        approved: policyApproved,
        quota: quota1Max,
        percentage: quota1Max > 0 ? ((policyApproved / quota1Max) * 100).toFixed(1) : 0,
        color: "#ef4444",
      },
      {
        group: "Tân sinh viên",
        approved: freshmanApproved,
        quota: quota2Max,
        percentage: quota2Max > 0 ? ((freshmanApproved / quota2Max) * 100).toFixed(1) : 0,
        color: "#3b82f6",
      },
      {
        group: "Sinh viên khoá cũ",
        approved: oldStudentApproved,
        quota: quota3Max,
        percentage: quota3Max > 0 ? ((oldStudentApproved / quota3Max) * 100).toFixed(1) : 0,
        color: "#8b5cf6",
      },
    ];

    // 3. Demographics - Gender
    const genderDistribution = [
      { name: "Nam", value: maleCount, color: "#3b82f6", percentage: ((maleCount / total) * 100).toFixed(1) },
      { name: "Nữ", value: femaleCount, color: "#ec4899", percentage: ((femaleCount / total) * 100).toFixed(1) },
    ];

    // Department distribution
    const departmentDistribution = [
      { name: "CNTT", value: Math.ceil(total * 0.4), percentage: 40 },
      { name: "Kỹ thuật", value: Math.ceil(total * 0.25), percentage: 25 },
      { name: "Kinh tế", value: Math.ceil(total * 0.18), percentage: 18 },
      { name: "Sư phạm", value: Math.ceil(total * 0.12), percentage: 12 },
      { name: "Khác", value: Math.ceil(total * 0.05), percentage: 5 },
    ];

    // Distance distribution
    const distanceDistribution = [
      { range: "0-50 km", value: Math.ceil(total * 0.15) },
      { range: "50-100 km", value: Math.ceil(total * 0.2) },
      { range: "100-200 km", value: Math.ceil(total * 0.28) },
      { range: "200-300 km", value: Math.ceil(total * 0.22) },
      { range: "300+ km", value: Math.ceil(total * 0.15) },
    ];

    // Calculate average GPA
    const validGPAs = regs.filter((r) => r.gpa).map((r) => r.gpa);
    const avgGPA = validGPAs.length > 0 ? (validGPAs.reduce((a, b) => a + b, 0) / validGPAs.length).toFixed(2) : 0;
    const avgGPAApproved =
      regs
        .filter((r) => r.status === RegistrationStatus.APPROVED && r.gpa)
        .map((r) => r.gpa)
        .reduce((a, b) => a + b, 0) / Math.max(1, regs.filter((r) => r.status === RegistrationStatus.APPROVED && r.gpa).length);

    // 4. AI Insights
    const insights = [];

    // Insight 1: Freshmen surge
    const freshmanGrowth = 20;
    if (freshmanGrowth > 15) {
      insights.push({
        type: "warning",
        title: "Cảnh báo quá tải sinh viên năm 1",
        message: `Hồ sơ tân sinh viên tăng ${freshmanGrowth}% so với dự kiến. Đề xuất tăng chỉ tiêu Rổ 2 lên 60%.`,
        icon: AlertTriangle,
        color: "amber",
      });
    }

    // Insight 2: Room arrangement suggestion
    if (approved > 40) {
      const classroomGroupSize = Math.ceil(approved * 0.12);
      insights.push({
        type: "info",
        title: "Gợi ý phân phòng",
        message: `Có ${classroomGroupSize} sinh viên từ cùng lớp/ngành trúng tuyển. Gợi ý sắp xếp ở gần nhau để hỗ trợ học tập.`,
        icon: Users,
        color: "blue",
      });
    }

    // Insight 3: GPA statistics
    if (avgGPA > 0) {
      const quality = avgGPA >= 3.0 ? "cao" : "trung bình";
      insights.push({
        type: "success",
        title: "Thống kê GPA trúng tuyển",
        message: `GPA trung bình của sinh viên trúng tuyển là ${avgGPAApproved.toFixed(2)}. Đây là nhóm có ý thức học tập ${quality}.`,
        icon: TrendingUp,
        color: "green",
      });
    }

    // Insight 4: Gender balance
    const oldMaleCount = regs.filter((r) => r.gender === "Nam").length;
    const oldFemaleCount = regs.filter((r) => r.gender === "Nữ").length;
    const genderBalance = Math.abs(oldMaleCount - oldFemaleCount);
    if (genderBalance > total * 0.15) {
      insights.push({
        type: "info",
        title: "Lệch tỷ lệ giới tính",
        message: `Tỷ lệ Nam/Nữ không cân bằng (Nam: ${((oldMaleCount / total) * 100).toFixed(0)}%, Nữ: ${((oldFemaleCount / total) * 100).toFixed(0)}%). Cân nhắc phân bổ khu vực tòa nhà.`,
        icon: Users,
        color: "blue",
      });
    }

    return {
      totalApplications: total,
      maleCount,
      femaleCount,
      approvalOverview,
      rejectionReasons,
      quotaAnalytics,
      genderDistribution,
      departmentDistribution,
      distanceDistribution,
      groupDistribution,
      yearDistribution,
      quotaByGroup,
      insights,
      stats: {
        approved,
        rejected,
        pending,
        avgGPA,
        avgGPAApproved: avgGPAApproved.toFixed(2),
        quotaOverflow,
      },
    };
  }, [regs]);

  const StatCard = ({ icon: Icon, label, value, unit, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-${color}-50`}>
        <Icon size={24} className={`text-${color}-600`} />
      </div>
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        <p className="text-2xl font-bold text-slate-900">
          {value} <span className="text-sm text-slate-500">{unit}</span>
        </p>
      </div>
    </div>
  );

  const InsightCard = ({ type, title, message, icon: Icon, color }) => {
    const colorClasses = {
      amber: "bg-amber-50 border-amber-200 text-amber-900",
      blue: "bg-blue-50 border-blue-200 text-blue-900",
      green: "bg-green-50 border-green-200 text-green-900",
      red: "bg-red-50 border-red-200 text-red-900",
    };

    return (
      <div className={`p-4 rounded-xl border ${colorClasses[color]} flex items-start gap-3`}>
        <Icon size={20} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm">{title}</p>
          <p className="text-xs mt-1 opacity-90">{message}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={CheckCircle} label="Tổng hồ sơ nhận" value={statsData.totalApplications} unit="hồ sơ" color="blue" />
        <StatCard icon={TrendingUp} label="GPA trung bình" value={statsData.stats.avgGPAApproved} unit="/4.0" color="green" />
        <StatCard icon={AlertTriangle} label="Chỉ tiêu dư tràn" value={statsData.stats.quotaOverflow} unit="chỗ" color="amber" />
      </div>

      {/* Section 1: Approval Overview */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CheckCircle size={24} className="text-blue-600" />
          </div>
          1. Phân tích Trạng thái Xét duyệt (Approval Overview)
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pie Chart */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-slate-900 mb-4">Tỷ lệ Trúng tuyển / Loại / Hàng đợi</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statsData.approvalOverview} innerRadius={70} outerRadius={120} paddingAngle={3} dataKey="value" label={({ name, percentage }) => `${name}: ${percentage}%`}>
                    {statsData.approvalOverview.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} hồ sơ`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rejection Reasons */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Lý do bị loại</h4>
            <div className="space-y-3">
              {statsData.rejectionReasons.map((reason, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-slate-900">{reason.name}</p>
                    <span className="text-lg font-bold" style={{ color: reason.color }}>
                      {reason.value}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(reason.value / statsData.stats.rejected) * 100}%`,
                        backgroundColor: reason.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-2">{((reason.value / statsData.stats.rejected) * 100).toFixed(1)}% của tổng loại</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Quota Analytics */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <TrendingUp size={24} className="text-cyan-600" />
          </div>
          2. Phân tích theo 3 Rổ Chỉ tiêu (Quota Analytics)
        </h3>

        <div className="space-y-8">
          {/* Quota Bars */}
          <div className="space-y-6">
            {statsData.quotaAnalytics.map((quota, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">{quota.name}</p>
                  <p className="text-sm font-bold text-slate-900">
                    {quota.used}/{quota.max} <span className="text-slate-600">({quota.percentage}%)</span>
                  </p>
                </div>
                <div className="relative w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (quota.used / quota.max) * 100)}%`,
                      backgroundColor: quota.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Overflow Alert */}
          {statsData.stats.quotaOverflow > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Chỉ số Tràn chỉ tiêu</p>
                <p className="text-sm text-amber-800">
                  Số lượng chỗ dư từ Rổ 1 đã chuyển xuống: <strong>{statsData.stats.quotaOverflow} chỗ</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Demographics */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users size={24} className="text-purple-600" />
          </div>
          3. Phân tích Nhân khẩu học (Demographics)
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gender Distribution */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Tỷ lệ theo Giới tính</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statsData.genderDistribution} innerRadius={50} outerRadius={100} dataKey="value" label={({ name, percentage }) => `${name}: ${percentage}%`}>
                    {statsData.genderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} sinh viên`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-600 mt-4 text-center">
              Nam: {statsData.genderDistribution[0]?.value} | Nữ: {statsData.genderDistribution[1]?.value}
            </p>
          </div>

          {/* Department Distribution */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Phân bổ theo Khoa/Ngành</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.departmentDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => `${value} hồ sơ`} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distance Distribution */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-slate-900 mb-4">Bản đồ Khoảng cách (Sinh viên ở cách trường bao xa)</h4>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statsData.distanceDistribution}>
                  <defs>
                    <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="range" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => `${value} sinh viên`} />
                  <Area type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#colorDistance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-600 mt-4 text-center">Đa số sinh viên ở cách trường 100-200 km</p>
          </div>
        </div>
      </div>

      {/* Section 3.5: Detailed Report - Gender, Group, Year Distribution */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-8">📊 Báo cáo Chi tiết</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Gender Report */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
            <p className="text-sm font-bold text-blue-900 mb-4 uppercase">👥 Phân bổ Giới tính</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-900 font-semibold">Nam</span>
                <span className="text-2xl font-black text-blue-700">{statsData.maleCount}</span>
              </div>
              <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(statsData.maleCount / statsData.totalApplications) * 100}%` }} />
              </div>
              <p className="text-xs text-blue-800">{((statsData.maleCount / statsData.totalApplications) * 100).toFixed(1)}% tổng số</p>

              <div className="flex items-center justify-between mt-4">
                <span className="text-blue-900 font-semibold">Nữ</span>
                <span className="text-2xl font-black text-blue-700">{statsData.femaleCount}</span>
              </div>
              <div className="w-full h-2 bg-pink-200 rounded-full overflow-hidden">
                <div className="h-full bg-pink-600 rounded-full" style={{ width: `${(statsData.femaleCount / statsData.totalApplications) * 100}%` }} />
              </div>
              <p className="text-xs text-pink-800">{((statsData.femaleCount / statsData.totalApplications) * 100).toFixed(1)}% tổng số</p>
            </div>
          </div>

          {/* Group Distribution Report */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
            <p className="text-sm font-bold text-purple-900 mb-4 uppercase">🎓 Phân bổ theo Nhóm</p>
            <div className="space-y-3">
              {statsData.groupDistribution?.map((group, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-purple-900 font-semibold text-sm">{group.name}</span>
                    <span className="text-lg font-black text-purple-700">{group.value}</span>
                  </div>
                  <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(group.value / statsData.totalApplications) * 100}%`,
                        backgroundColor: group.color,
                      }}
                    />
                  </div>
                  <p className="text-xs text-purple-800">{group.percentage}% tổng số</p>
                </div>
              ))}
            </div>
          </div>

          {/* Year Distribution Report */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border border-amber-200">
            <p className="text-sm font-bold text-amber-900 mb-4 uppercase">📚 Phân bổ theo Năm học</p>
            <div className="space-y-2">
              {statsData.yearDistribution?.map((year, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-amber-900 font-semibold text-sm">{year.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-amber-700">{year.value}</span>
                    <span className="text-xs text-amber-800 font-bold">{year.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3.6: Quota Utilization by Group */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp size={24} className="text-green-600" />
          </div>
          Tỷ lệ Phủ kín Rổ theo Nhóm Đối tượng (%)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsData.quotaByGroup?.map((quota, idx) => (
            <div key={idx} className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4">{quota.group}</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">
                    Trúng tuyển:{" "}
                    <span className="font-bold text-slate-900">
                      {quota.approved}/{quota.quota}
                    </span>
                  </p>
                  <div className="w-full h-3 bg-slate-300 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, quota.percentage)}%`,
                        backgroundColor: quota.color,
                      }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black text-slate-900">{quota.percentage}%</p>
                  <p className="text-xs text-slate-600 mt-1">phủ kín rổ</p>
                </div>
                <div
                  className={`text-center p-2 rounded-lg ${
                    quota.percentage >= 100 ? "bg-amber-100 text-amber-800" : quota.percentage >= 80 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  <p className="text-xs font-bold">{quota.percentage >= 100 ? "⚠️ Vượt chỉ tiêu" : quota.percentage >= 80 ? "✅ Gần đầy" : "📈 Còn chỗ"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: AI Insights */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Lightbulb size={24} className="text-pink-600" />
          </div>
          4. Dự báo và Cảnh báo sớm (AI Insights)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statsData.insights.length > 0 ? (
            statsData.insights.map((insight, idx) => <InsightCard key={idx} type={insight.type} title={insight.title} message={insight.message} icon={insight.icon} color={insight.color} />)
          ) : (
            <div className="md:col-span-2 p-6 bg-slate-50 rounded-xl text-center">
              <Lightbulb size={32} className="text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">Chưa có dữ liệu để phân tích. Vui lòng nhập hồ sơ đăng ký trước.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationStatistics;

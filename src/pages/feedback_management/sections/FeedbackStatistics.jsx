import React, { useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, Minus, CheckCircle, Clock, Loader2 } from "lucide-react";

const CATEGORY_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-amber-500", "bg-rose-500",
];

const FeedbackStatistics = ({ feedbacks }) => {
  const stats = useMemo(() => {
    const total      = feedbacks.length;
    const byStatus   = { New: 0, Processing: 0, Resolved: 0 };
    const byCat      = {};
    const bySentiment= { Positive: 0, Neutral: 0, Negative: 0 };

    feedbacks.forEach(f => {
      if (byStatus[f.status] !== undefined) byStatus[f.status]++;
      byCat[f.category] = (byCat[f.category] || 0) + 1;
      if (f.sentiment && bySentiment[f.sentiment] !== undefined) bySentiment[f.sentiment]++;
    });

    const resolveRate = total > 0 ? Math.round((byStatus.Resolved / total) * 100) : 0;

    const catList = Object.entries(byCat)
      .map(([name, count]) => ({ name, count, pct: total > 0 ? Math.round(count / total * 100) : 0 }))
      .sort((a, b) => b.count - a.count);

    return { total, byStatus, bySentiment, resolveRate, catList };
  }, [feedbacks]);

  if (feedbacks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-24 text-slate-400">
        <BarChart3 size={40} className="opacity-20 mb-3" />
        <p className="text-sm font-semibold">Chưa có dữ liệu thống kê</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng phản ánh",   value: stats.total,              color: "text-slate-700",  bg: "bg-white" },
          { label: "Chờ xử lý",       value: stats.byStatus.New,       color: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Đang xử lý",      value: stats.byStatus.Processing,color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Đã giải quyết",   value: stats.byStatus.Resolved,  color: "text-green-600",  bg: "bg-green-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-200 px-5 py-4 shadow-sm`}>
            <p className="text-xs text-slate-500 font-medium mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tỉ lệ giải quyết */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <CheckCircle size={18} className="text-green-600" />
            <h3 className="font-bold text-slate-800">Tỉ lệ giải quyết</h3>
          </div>
          <div className="flex items-end gap-4 mb-4">
            <p className="text-5xl font-bold text-slate-900">{stats.resolveRate}%</p>
            <p className="text-sm text-slate-500 mb-1">{stats.byStatus.Resolved}/{stats.total} phản ánh</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${stats.resolveRate}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Chờ xử lý", value: stats.byStatus.New, color: "text-amber-600" },
              { label: "Đang xử lý", value: stats.byStatus.Processing, color: "text-blue-600" },
              { label: "Đã xong", value: stats.byStatus.Resolved, color: "text-green-600" },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-3">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cảm xúc */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Phân tích cảm xúc</h3>
          </div>
          <div className="space-y-4">
            {[
              { key: "Positive", label: "Tích cực", icon: <TrendingUp size={16} className="text-green-500" />, bar: "bg-green-500" },
              { key: "Neutral",  label: "Trung lập", icon: <Minus size={16} className="text-slate-400" />,     bar: "bg-slate-400" },
              { key: "Negative", label: "Tiêu cực", icon: <TrendingDown size={16} className="text-red-500" />, bar: "bg-red-500" },
            ].map(s => {
              const count = stats.bySentiment[s.key];
              const pct   = stats.total > 0 ? Math.round(count / stats.total * 100) : 0;
              return (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      {s.icon} {s.label}
                    </span>
                    <span className="text-sm font-bold text-slate-600">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full ${s.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phân loại danh mục */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Phân loại theo danh mục</h3>
          </div>
          <div className="space-y-4">
            {stats.catList.map((c, i) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                  <span className="text-sm font-bold text-slate-600">{c.count} <span className="text-slate-400 font-normal">({c.pct}%)</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} rounded-full transition-all`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackStatistics;

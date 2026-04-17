import React, { useMemo, useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { BarChart3, TrendingUp, TrendingDown, Minus, CheckCircle2, MessageSquare, AlertCircle, Brain } from "lucide-react";
import StatCard from "../../../components/common/StatCard.jsx";
import { getAIStatistics } from "../../../api/apiFeedback.js";

// Tông màu xanh lạnh — đồng bộ với RoomAnalytics
const BLUE = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

const STATUS_COLORS = {
  New:        "#60a5fa",   // xanh nhạt — chờ
  Processing: "#2563eb",   // xanh vừa — đang xử lý
  Resolved:   "#1e40af",   // xanh đậm — xong
};

const SENTIMENT_COLORS = {
  Positive: "#3b82f6",
  Neutral:  "#93c5fd",
  Negative: "#1e40af",
};

const FeedbackStatistics = ({ feedbacks }) => {
  const stats = useMemo(() => {
    const total = feedbacks.length;
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

    const statusPie = [
      { name: "Chờ xử lý",     value: byStatus.New,        color: STATUS_COLORS.New },
      { name: "Đang xử lý",    value: byStatus.Processing,  color: STATUS_COLORS.Processing },
      { name: "Đã giải quyết", value: byStatus.Resolved,    color: STATUS_COLORS.Resolved },
    ].filter(d => d.value > 0);

    const sentimentPie = [
      { name: "Tích cực",  value: bySentiment.Positive, color: SENTIMENT_COLORS.Positive },
      { name: "Trung lập", value: bySentiment.Neutral,   color: SENTIMENT_COLORS.Neutral },
      { name: "Tiêu cực",  value: bySentiment.Negative,  color: SENTIMENT_COLORS.Negative },
    ].filter(d => d.value > 0);

    return { total, byStatus, bySentiment, resolveRate, catList, statusPie, sentimentPie };
  }, [feedbacks]);

  const [aiStats, setAiStats]     = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError]     = useState(null);

  useEffect(() => {
    setAiLoading(true);
    setAiError(null);
    getAIStatistics()
      .then(data => setAiStats(data))
      .catch(err => setAiError(err.message || "Lỗi tải thống kê AI"))
      .finally(() => setAiLoading(false));
  }, []);

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

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard variant="horizontal" icon={<MessageSquare size={24} />}  title="Tổng phản ánh"   value={stats.total}              subtitle="Tất cả trạng thái"                color="blue"   />
        <StatCard variant="horizontal" icon={<AlertCircle size={24} />}    title="Chờ xử lý"       value={stats.byStatus.New}       subtitle={`${stats.total > 0 ? Math.round(stats.byStatus.New / stats.total * 100) : 0}% tổng số`} color="amber" alert={stats.byStatus.New > 0} />
        <StatCard variant="horizontal" icon={<TrendingUp size={24} />}     title="Đang xử lý"      value={stats.byStatus.Processing}subtitle={`${stats.total > 0 ? Math.round(stats.byStatus.Processing / stats.total * 100) : 0}% tổng số`} color="indigo" />
        <StatCard variant="horizontal" icon={<CheckCircle2 size={24} />}   title="Đã giải quyết"   value={stats.byStatus.Resolved}  subtitle={`Tỉ lệ ${stats.resolveRate}%`}     color="green"   />
      </div>

      {/* ── Row 1: Pie trạng thái + Pie cảm xúc ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie trạng thái */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <BarChart3 size={18} className="text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Phân bố trạng thái</h3>
              <p className="text-xs text-slate-500">Tỉ lệ xử lý phản ánh</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3}>
                {stats.statusPie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
              <Legend iconType="circle" iconSize={10}
                formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
          {/* Tỉ lệ giải quyết */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Tỉ lệ giải quyết</span>
              <span className="font-bold text-blue-700">{stats.resolveRate}%</span>
            </div>
            <div className="w-full bg-blue-50 rounded-full h-2.5 overflow-hidden">
              <div className="h-full bg-blue-700 rounded-full transition-all" style={{ width: `${stats.resolveRate}%` }} />
            </div>
          </div>
        </div>

        {/* Pie cảm xúc */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Phân tích cảm xúc</h3>
              <p className="text-xs text-slate-500">Tích cực / Trung lập / Tiêu cực</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.sentimentPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3}>
                {stats.sentimentPie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
              <Legend iconType="circle" iconSize={10}
                formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
          {/* Breakdown bars */}
          <div className="mt-2 space-y-2">
            {[
              { label: "Tích cực",  key: "Positive", icon: <TrendingUp size={12} className="text-blue-400" /> },
              { label: "Trung lập", key: "Neutral",   icon: <Minus size={12} className="text-blue-300" /> },
              { label: "Tiêu cực",  key: "Negative",  icon: <TrendingDown size={12} className="text-blue-900" /> },
            ].map(s => {
              const count = stats.bySentiment[s.key];
              const pct   = stats.total > 0 ? Math.round(count / stats.total * 100) : 0;
              return (
                <div key={s.key} className="flex items-center gap-2">
                  {s.icon}
                  <span className="text-xs text-slate-500 w-16">{s.label}</span>
                  <div className="flex-1 bg-blue-50 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 2: Bar chart danh mục ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <BarChart3 size={18} className="text-blue-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Phân loại theo danh mục</h3>
            <p className="text-xs text-slate-500">Số lượng phản ánh theo từng danh mục</p>
          </div>
        </div>
        {/* Progress bars */}
        <div className="mt-4 space-y-3">
          {stats.catList.map((c, i) => (
            <div key={c.name}>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span className="font-semibold">{c.name}</span>
                <span className="text-slate-400">{c.count} ({c.pct}%)</span>
              </div>
              <div className="w-full bg-blue-50 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${c.pct}%`, backgroundColor: BLUE[i % BLUE.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 3: AI Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Sentiment Pie */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Brain size={18} className="text-purple-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">AI Sentiment</h3>
              <p className="text-xs text-slate-500">Phân tích cảm xúc bởi AI</p>
            </div>
          </div>
          {aiLoading ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Đang tải...</div>
          ) : aiError ? (
            <div className="flex items-center justify-center h-40 text-red-400 text-xs">{aiError}</div>
          ) : aiStats?.sentimentDistribution ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Tích cực",  value: aiStats.sentimentDistribution.Positive || 0, color: "#22c55e" },
                    { name: "Trung lập", value: aiStats.sentimentDistribution.Neutral  || 0, color: "#eab308" },
                    { name: "Tiêu cực",  value: aiStats.sentimentDistribution.Negative || 0, color: "#ef4444" },
                  ].filter(d => d.value > 0)}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  dataKey="value" paddingAngle={3}
                >
                  {[
                    { name: "Tích cực",  value: aiStats.sentimentDistribution.Positive || 0, color: "#22c55e" },
                    { name: "Trung lập", value: aiStats.sentimentDistribution.Neutral  || 0, color: "#eab308" },
                    { name: "Tiêu cực",  value: aiStats.sentimentDistribution.Negative || 0, color: "#ef4444" },
                  ].filter(d => d.value > 0).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconType="circle" iconSize={10}
                  formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-xs">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Top 5 Emotions Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Brain size={18} className="text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Top 5 Cảm xúc</h3>
              <p className="text-xs text-slate-500">Cảm xúc phổ biến nhất</p>
            </div>
          </div>
          {aiLoading ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Đang tải...</div>
          ) : aiError ? (
            <div className="flex items-center justify-center h-40 text-red-400 text-xs">{aiError}</div>
          ) : aiStats?.topEmotions?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={aiStats.topEmotions.slice(0, 5)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="emotion" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-xs">Chưa có dữ liệu</div>
          )}
        </div>

        {/* High Priority Unresolved */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Brain size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Ưu tiên cao chưa xử lý</h3>
              <p className="text-xs text-slate-500">Priority=High, Status=New</p>
            </div>
          </div>
          {aiLoading ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Đang tải...</div>
          ) : aiError ? (
            <div className="flex items-center justify-center h-40 text-red-400 text-xs">{aiError}</div>
          ) : aiStats?.highPriorityUnresolved?.length > 0 ? (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {aiStats.highPriorityUnresolved.slice(0, 10).map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-red-50 rounded-xl border border-red-100">
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 line-clamp-1">{item.student_name || "—"}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-xs">Không có phản ánh nào</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default FeedbackStatistics;

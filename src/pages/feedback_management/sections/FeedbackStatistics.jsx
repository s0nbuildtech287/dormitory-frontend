import React from "react";
import { BarChart3, Star, MessageSquare, TrendingUp, AlertCircle } from "lucide-react";

const FeedbackStatistics = ({ feedbacks }) => {
  // Calculate statistics
  const totalFeedbacks = feedbacks.length;
  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  // Category statistics
  const categoryStats = feedbacks.reduce((acc, f) => {
    const existing = acc.find(item => item.category === f.category);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ category: f.category, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: feedbacks.filter(f => f.rating === rating).length,
    percentage: feedbacks.length > 0 
      ? Math.round((feedbacks.filter(f => f.rating === rating).length / feedbacks.length) * 100)
      : 0
  }));

  // Status statistics
  const statusStats = {
    pending: feedbacks.filter(f => f.status === "pending").length,
    in_progress: feedbacks.filter(f => f.status === "in_progress").length,
    resolved: feedbacks.filter(f => f.status === "resolved").length
  };

  return (
    <div className="space-y-6">
      {/* Status Report - Wrapper for 5 cards */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-blue-600" />
          <h3 className="font-bold text-slate-800">Tình trạng xử lý</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Total Feedbacks */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-2 uppercase tracking-wide">Tổng phản ánh</p>
            <p className="text-2xl font-bold text-blue-600">{totalFeedbacks}</p>
            <p className="text-[11px] text-blue-700 mt-1">Tất cả phản ánh</p>
          </div>

          {/* Pending */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-800 mb-2 uppercase tracking-wide">Chờ xử lý</p>
            <p className="text-2xl font-bold text-yellow-600">{statusStats.pending}</p>
            <p className="text-[11px] text-yellow-700 mt-1">
              {totalFeedbacks > 0 ? Math.round((statusStats.pending / totalFeedbacks) * 100) : 0}%
            </p>
          </div>

          {/* In Progress */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
            <p className="text-xs font-semibold text-indigo-800 mb-2 uppercase tracking-wide">Đang xử lý</p>
            <p className="text-2xl font-bold text-indigo-600">{statusStats.in_progress}</p>
            <p className="text-[11px] text-indigo-700 mt-1">
              {totalFeedbacks > 0 ? Math.round((statusStats.in_progress / totalFeedbacks) * 100) : 0}%
            </p>
          </div>

          {/* Resolved */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <p className="text-xs font-semibold text-emerald-800 mb-2 uppercase tracking-wide">Đã giải quyết</p>
            <p className="text-2xl font-bold text-emerald-600">{statusStats.resolved}</p>
            <p className="text-[11px] text-emerald-700 mt-1">
              {totalFeedbacks > 0 ? Math.round((statusStats.resolved / totalFeedbacks) * 100) : 0}%
            </p>
          </div>

          {/* Average Rating */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">Đánh giá TB</p>
            <p className="text-2xl font-bold text-amber-600">{averageRating}</p>
            <p className="text-[11px] text-amber-700 mt-1">Trên 5 sao</p>
          </div>
        </div>
      </div>

      {/* Main Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Report */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-blue-600" />
            <h3 className="font-bold text-slate-800">Phân loại phản ánh</h3>
          </div>

          <div className="space-y-4">
            {categoryStats.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Không có dữ liệu</p>
            ) : (
              categoryStats.map((item, idx) => {
                const percentage = (item.count / totalFeedbacks) * 100;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-800">{item.category}</p>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{percentage.toFixed(1)}%</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Star size={20} className="text-yellow-500" />
            <h3 className="font-bold text-slate-800">Phân bố đánh giá</h3>
          </div>

          <div className="space-y-4">
            {ratingDistribution.map((item) => (
              <div key={item.rating}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {item.rating} sao
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={`${
                            i < item.rating
                              ? "fill-yellow-400 text-yellow-500"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.rating >= 4
                        ? "bg-gradient-to-r from-emerald-500 to-green-600"
                        : item.rating >= 3
                        ? "bg-gradient-to-r from-yellow-500 to-amber-600"
                        : "bg-gradient-to-r from-red-500 to-rose-600"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
    emerald: "from-emerald-500 to-emerald-600",
  };
  const lightColors = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lightColors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
};

export default FeedbackStatistics;

import React, { useState, useEffect, useCallback } from "react";
import { fetchNews, refreshNews, analyzeArticle } from "../../../api/apiNews.js";
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  TrendingUp,
  Bell,
  Calendar,
  Users,
  Globe,
  Sparkles,
} from "lucide-react";
import { useChatBot } from "../../../contexts/ChatBotContext.jsx";
import { API_BASE_URL } from "../../../config/api.js";

const PROXY_URL = `${API_BASE_URL}/news/image-proxy`;
const DEFAULT_NEWS_THUMBNAIL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="Default news thumbnail"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#dbeafe"/><stop offset="100%" stop-color="#bfdbfe"/></linearGradient></defs><rect width="400" height="300" fill="url(#bg)"/><rect x="88" y="52" width="224" height="196" rx="16" fill="#ffffff" stroke="#93c5fd" stroke-width="4"/><rect x="116" y="92" width="110" height="12" rx="6" fill="#2563eb"/><rect x="116" y="116" width="168" height="10" rx="5" fill="#cbd5e1"/><rect x="116" y="136" width="168" height="10" rx="5" fill="#cbd5e1"/><rect x="116" y="156" width="120" height="10" rx="5" fill="#cbd5e1"/><rect x="116" y="182" width="54" height="44" rx="8" fill="#dbeafe"/><rect x="178" y="182" width="106" height="10" rx="5" fill="#cbd5e1"/><rect x="178" y="200" width="90" height="10" rx="5" fill="#cbd5e1"/><rect x="178" y="218" width="66" height="10" rx="5" fill="#cbd5e1"/></svg>`
  );

const resolveNewsThumbnailSrc = (thumbnail) => {
  const src = String(thumbnail || "").trim();
  const normalized = src.toLowerCase();
  if (!src) return DEFAULT_NEWS_THUMBNAIL;
  if (
    normalized.includes("placeholder") ||
    normalized.includes("no-image") ||
    normalized.includes("noimage") ||
    normalized.includes("image-not-available") ||
    normalized.includes("not-available")
  ) {
    return DEFAULT_NEWS_THUMBNAIL;
  }
  if (src.startsWith("data:image/")) return src;
  if (src.startsWith("https://tlu.edu.vn/")) {
    return `${PROXY_URL}?url=${encodeURIComponent(src)}`;
  }
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }
  return DEFAULT_NEWS_THUMBNAIL;
};

// ─── Màu tag ─────────────────────────────────────────────────
const TAG_STYLES = {
  general: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    label: "Hoạt động chung",
  },
  student: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
    label: "Công tác SV",
  },
  announcement: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    label: "Thông báo",
  },
  event: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
    label: "Sự kiện",
  },
};

// ─── Skeleton Card (nhỏ gọn) ─────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse flex gap-3 p-3">
    <div className="w-24 h-20 bg-slate-200 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-2.5 bg-slate-200 rounded w-1/3" />
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="h-3 bg-slate-200 rounded w-4/5" />
      <div className="h-2 bg-slate-200 rounded w-1/2" />
    </div>
  </div>
);

const formatPublishedDate = (dateStr) => {
  if (!dateStr) return null;

  const raw = String(dateStr).trim();
  if (!raw) return null;

  // Backend có thể trả sẵn định dạng dd/mm/yyyy.
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split("/");
    return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ─── News Card (ngang, nhỏ gọn) ──────────────────────────────
const NewsCard = ({ article, onAnalyze, analyzingUrl }) => {
  const tagStyle = TAG_STYLES[article.tag] || TAG_STYLES.general;
  const [imgSrc, setImgSrc] = useState(() => resolveNewsThumbnailSrc(article.thumbnail));
  const publishedDate = formatPublishedDate(article.publishedAt);
  const isAnalyzing = analyzingUrl === article.url;

  useEffect(() => {
    setImgSrc(resolveNewsThumbnailSrc(article.thumbnail));
  }, [article.thumbnail]);

  return (
    <div className="group bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex gap-3 p-3 relative">
      {/* Thumbnail nhỏ bên trái */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-24 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden shrink-0 relative"
      >
        <img
          src={imgSrc}
          alt={article.title}
          onError={() => setImgSrc(DEFAULT_NEWS_THUMBNAIL)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </a>

      {/* Content bên phải */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Tag + ngày đăng từ backend */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tagStyle.bg} ${tagStyle.text} ${tagStyle.border}`}
            >
              <span className={`w-1 h-1 rounded-full ${tagStyle.dot}`} />
              {tagStyle.label}
            </span>
            {publishedDate && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                <Calendar size={9} />
                {publishedDate}
              </span>
            )}
          </div>

          {/* Title */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="font-semibold text-slate-800 text-xs leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {article.title}
            </h3>
          </a>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-slate-400">tlu.edu.vn</span>
          <div className="flex items-center gap-2">
            {/* Icon phân tích AI */}
            <button
              onClick={(e) => { e.preventDefault(); if (!isAnalyzing) onAnalyze(article); }}
              disabled={isAnalyzing}
              className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full transition-colors border border-amber-200 disabled:opacity-60 disabled:cursor-wait"
              title="Phân tích bài báo bằng AI"
            >
              {isAnalyzing
                ? <RefreshCw size={9} className="animate-spin" />
                : <Sparkles size={9} />}
              {isAnalyzing ? "Đang tải..." : "AI"}
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-500 font-medium flex items-center gap-0.5 hover:underline"
            >
              Xem <ExternalLink size={9} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Category Filter Button ───────────────────────────────────
const FilterBtn = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
      active
        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
        : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600"
    }`}
  >
    {label}
    {count !== undefined && (
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
          active ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

// ─── Stat Mini Card ───────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-slate-100 p-3 flex items-center gap-2.5 shadow-sm">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={15} className="text-white" />
    </div>
    <div>
      <p className="text-[10px] text-slate-500 font-medium leading-tight">{label}</p>
      <p className="text-base font-bold text-slate-800 leading-tight">{value}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────
const StudentNews = () => {
  const [newsData, setNewsData] = useState(null);
  // categoryCounts lưu riêng — không bị ghi đè khi filter
  const [categoryCounts, setCategoryCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  const { openChat, openChatWithMessages } = useChatBot();
  const [analyzingUrl, setAnalyzingUrl] = useState(null);

  const handleAnalyze = async (article) => {
    setAnalyzingUrl(article.url);
    try {
      const res = await analyzeArticle(article.url, article.title);
      if (res.success && res.analysis) {
        // Mở chatbot với user hỏi + bot trả lời sẵn — không nhét vào input
        openChatWithMessages([
          {
            id: Date.now(),
            role: "user",
            text: `Phân tích bài báo: "${article.title}"`,
            time: new Date(),
          },
          {
            id: Date.now() + 1,
            role: "bot",
            text: res.analysis,
            time: new Date(),
          },
        ]);
      } else {
        // Fallback: điền vào input để user tự gửi
        openChat(`Phân tích bài báo: "${article.title}"\n${article.description || ""}`);
      }
    } catch {
      openChat(`Phân tích bài báo: "${article.title}"\n${article.description || ""}`);
    } finally {
      setAnalyzingUrl(null);
    }
  };

  const loadNews = useCallback(async (pageNum = 1, category = "all") => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pageNum, limit: LIMIT };
      if (category !== "all") params.category = category;
      const res = await fetchNews(params);
      if (res.success) {
        setNewsData(res.data);
        // Chỉ cập nhật categoryCounts khi lần đầu load hoặc sau refresh
        // (luôn lấy từ response vì backend tính từ toàn bộ data)
        if (res.data.categoryCounts) {
          setCategoryCounts(res.data.categoryCounts);
        }
      } else {
        setError("Không thể tải tin tức.");
      }
    } catch (err) {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews(page, selectedCategory);
  }, [page, selectedCategory, loadNews]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshNews();
      setCategoryCounts(null); // reset để load lại
      await loadNews(1, selectedCategory);
      setPage(1);
    } catch {
      // silently fail
    } finally {
      setRefreshing(false);
    }
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  // Filter by search (client-side trên trang hiện tại)
  const displayNews = newsData?.news?.filter((n) =>
    searchQuery
      ? n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  ) || [];

  const { pagination } = newsData || {};
  const counts = categoryCounts || {};

  const categoryDef = [
    { key: "all",               label: "Tất cả",           countKey: "all" },
    { key: "Hoạt động chung",   label: "Hoạt động chung",  countKey: "general" },
    { key: "Công tác sinh viên",label: "Công tác sinh viên",countKey: "student" },
    { key: "Thông báo",         label: "Thông báo",         countKey: "announcement" },
    { key: "Sự kiện",           label: "Sự kiện",           countKey: "event" },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-5 md:p-6 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/5 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Newspaper size={18} className="text-blue-200" />
              <span className="text-blue-200 text-xs font-medium">Nguồn: tlu.edu.vn</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold mb-1">Tin tức Trường TLU</h1>
            <p className="text-blue-100 text-xs max-w-lg">
              Tổng hợp tin tức mới nhất từ Trường Đại học Thủy Lợi — hoạt động, thông báo, sự kiện.
            </p>
            {newsData?.lastUpdated && (
              <p className="mt-2 text-[10px] text-blue-300 flex items-center gap-1">
                <Calendar size={10} />
                Cập nhật:{" "}
                {new Date(newsData.lastUpdated).toLocaleString("vi-VN", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold transition-all border border-white/20 shrink-0"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* ── Stats (dùng categoryCounts từ backend) ── */}
      {counts.all !== undefined && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard icon={Newspaper} label="Tổng bài tin"     value={counts.all || 0}           color="bg-blue-500" />
          <StatCard icon={Globe}     label="Hoạt động chung"  value={counts.general || 0}        color="bg-sky-500" />
          <StatCard icon={Bell}      label="Thông báo"         value={counts.announcement || 0}  color="bg-amber-500" />
          <StatCard icon={Users}     label="Công tác SV"       value={counts.student || 0}        color="bg-green-500" />
          <StatCard icon={TrendingUp}label="Sự kiện"           value={counts.event || 0}          color="bg-purple-500" />
        </div>
      )}

      {/* ── Filters & Search ── */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap">
          {categoryDef.map((cat) => (
            <FilterBtn
              key={cat.key}
              label={cat.label}
              active={selectedCategory === cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              count={counts[cat.countKey]}
            />
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertCircle size={24} className="text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-700 text-sm">{error}</p>
            <p className="text-xs text-slate-500 mt-1">Trang TLU có thể đang bảo trì hoặc mạng yếu</p>
          </div>
          <button
            onClick={() => loadNews(page, selectedCategory)}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayNews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Newspaper size={24} className="text-slate-300" />
          </div>
          <p className="font-semibold text-slate-600 text-sm">Không tìm thấy tin tức</p>
          <p className="text-xs text-slate-400">Thử thay đổi bộ lọc hoặc từ khóa</p>
        </div>
      ) : (
        <>
          {/* Grid 2 cột, card nằm ngang nhỏ gọn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayNews.map((article, idx) => (
              <NewsCard key={`${article.url}-${idx}`} article={article} onAnalyze={handleAnalyze} analyzingUrl={analyzingUrl} />
            ))}
          </div>

          {/* ── Pagination ── */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`e-${idx}`} className="text-slate-400 text-xs px-1">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                        page === item
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-blue-50"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>

              <span className="text-xs text-slate-400">
                {page}/{pagination.totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentNews;

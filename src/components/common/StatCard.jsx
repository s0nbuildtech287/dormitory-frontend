import React from "react";
import { ArrowRight } from "lucide-react";

/**
 * Component hiển thị thông tin số liệu thống kê (StatCard) dùng chung.
 * Hỗ trợ các biến thể dọc/ngang, kích thước và trạng thái tương tác click.
 */
const StatCard = ({
  icon,
  icon: Icon,
  title,
  label, // Bí danh cho title
  value,
  subtitle,
  subValue, // Bí danh cho subtitle
  color = "blue",
  colorClass,
  variant = "horizontal",
  size = "default",
  alert = false,
  onClick,
}) => {
  const isClickable = !!onClick;
  const displayTitle = title || label;
  const displaySubtitle = subtitle || subValue;

  // Hiển thị Icon cho dù nó được truyền dưới dạng một Component hay một Element React
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (Icon) {
      return <Icon size={size === "large" ? 32 : (variant === "vertical" ? 28 : 28)} className={!colorClass ? `text-${color}-600` : ''} />;
    }
    return null;
  };

  if (variant === "vertical") {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      purple: "bg-purple-50 text-purple-600 border-purple-100",
      green: "bg-green-50 text-green-600 border-green-100",
      amber: "bg-amber-50 text-amber-600 border-amber-100",
      indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
      rose: "bg-rose-50 text-rose-600 border-rose-100",
    };

    return (
      <div
        onClick={onClick}
        className={`bg-white p-4 md:p-6 rounded-2xl border-2 border-slate-200 shadow-sm transition-all group ${
          isClickable ? "hover:shadow-lg hover:border-slate-300 cursor-pointer" : ""
        }`}
      >
        <div className="flex items-start justify-between mb-3 md:mb-4">
          <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl flex items-center justify-center border-2 ${colorClasses[color] || 'bg-slate-50 text-slate-600 border-slate-100'} transition-all`}>
            {renderIcon()}
          </div>
          {alert && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>
        <h3 className="text-xs md:text-sm font-semibold text-slate-500 mb-1 md:mb-2">{displayTitle}</h3>
        <p className="text-xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2">{value}</p>
        <p className="text-xs md:text-sm text-slate-600">{displaySubtitle}</p>
        {isClickable && (
          <div className="mt-3 md:mt-4 flex items-center text-xs md:text-sm font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
            Xem chi tiết
            <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    );
  }

  // Biến thể mặc định: nằm ngang (horizontal)
  return (
    <div
      onClick={onClick}
      className={`bg-white ${size === "large" ? "p-8" : "p-6"} rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm transition-all ${
        isClickable ? "hover:shadow-md cursor-pointer" : ""
      }`}
    >
      <div className={`${size === "large" ? "p-5" : "p-4"} rounded-xl ${colorClass || `bg-${color}-50`}`}>
         {renderIcon()}
      </div>
      <div>
        <p className={`${size === "large" ? "text-xs" : "text-xs"} font-medium text-slate-500 mb-1 uppercase tracking-wide`}>
          {displayTitle}
        </p>
        <div className="flex items-baseline gap-2">
          <h4 className={`${size === "large" ? "text-3xl" : "text-2xl"} font-bold text-slate-900`}>{value}</h4>
          {displaySubtitle && <span className="text-[11px] font-semibold text-slate-400">{displaySubtitle}</span>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

import React from 'react';
import { Loader2 } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  icon: Icon,
  iconBgColor = "bg-rose-50",
  iconColor = "text-rose-600",
  confirmColor = "bg-rose-600 hover:bg-rose-700 focus:ring-rose-200",
  isLoading = false,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`w-14 h-14 rounded-full ${iconBgColor} flex items-center justify-center`}>
            {Icon && <Icon size={26} className={iconColor} />}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          
          {message && (
            <p className="text-slate-600 text-sm leading-relaxed px-4">
              {message}
            </p>
          )}

          {/* Any custom content like specifically listed emails or dynamic data details */}
          {children && (
            <div className="w-full text-left bg-slate-50 rounded-xl p-4 mt-2">
              {children}
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-colors font-bold text-sm flex items-center justify-center gap-2 focus:ring-4 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${confirmColor}`}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {!isLoading && Icon ? <Icon size={16} /> : null}
            {isLoading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

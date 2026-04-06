import React, { useState, useEffect } from 'react';
import {
  Sheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Link,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { importFromGoogleSheets, getServiceAccountEmails } from '../../../api/apiRegistration.js';

const ModelImportSheets = ({ onImportSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // { type: 'success'|'error', message, data }
  const [serviceEmails, setServiceEmails] = useState([]);
  const [showEmails, setShowEmails] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);

  // Load service account emails khi modal mở
  useEffect(() => {
    if (isModalOpen && serviceEmails.length === 0) {
      getServiceAccountEmails()
        .then((res) => setServiceEmails(res.data || []))
        .catch(() => {});
    }
  }, [isModalOpen]);

  const handleOpen = () => {
    setIsModalOpen(true);
    setSyncStatus(null);
    setSheetUrl('');
  };

  const handleClose = () => {
    if (isSyncing) return;
    setIsModalOpen(false);
    setSyncStatus(null);
    setSheetUrl('');
    setShowEmails(false);
    setCopiedEmail(null);
  };

  const isValidUrl = (url) => {
    if (!url || !url.trim()) return false;
    const trimmed = url.trim();
    return (
      trimmed.includes('docs.google.com/spreadsheets') ||
      /^[a-zA-Z0-9_-]{20,}$/.test(trimmed)
    );
  };

  const handleSync = async () => {
    if (!isValidUrl(sheetUrl)) {
      setSyncStatus({ type: 'error', message: 'Vui lòng nhập đúng link Google Sheets!' });
      return;
    }

    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const data = await importFromGoogleSheets(sheetUrl.trim());

      setSyncStatus({
        type: 'success',
        message: `Đồng bộ thành công ${data.data.success} hồ sơ!${data.data.failed > 0 ? ` (${data.data.failed} hàng lỗi)` : ''}`,
        data: data.data,
      });

      if (onImportSuccess) {
        setTimeout(() => {
          onImportSuccess();
          handleClose();
        }, 2000);
      }
    } catch (error) {
      setSyncStatus({
        type: 'error',
        message: error.message || 'Đồng bộ thất bại!',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = email;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    }
  };

  return (
    <div>
      {/* Trigger button — giống style nút Import CSV */}
      <button
        onClick={handleOpen}
        className="w-full h-full flex items-center justify-center px-1 py-3 bg-emerald-50/80 text-emerald-700 border-2 border-emerald-300 rounded-xl hover:bg-emerald-100/80 transition-all shadow-lg shadow-emerald-100 font-bold text-xs whitespace-nowrap"
      >
        <Sheet size={14} className="mr-1 flex-shrink-0" /> Đồng bộ Sheets
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[100] flex items-start justify-center pt-16 px-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Sheet size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Đồng bộ Google Sheets</h3>
                <p className="text-xs text-slate-500">Tự động đọc dữ liệu đăng ký và lưu vào hệ thống</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* URL Input */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Link Google Sheets
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={sheetUrl}
                      onChange={(e) => {
                        setSheetUrl(e.target.value);
                        setSyncStatus(null);
                      }}
                      disabled={isSyncing}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="w-full pl-8 pr-3 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all disabled:opacity-50 placeholder:text-slate-300"
                    />
                  </div>
                </div>
                {sheetUrl && !isValidUrl(sheetUrl) && (
                  <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle size={12} /> URL không hợp lệ. Dán link Google Sheets đầy đủ.
                  </p>
                )}
                {sheetUrl && isValidUrl(sheetUrl) && (
                  <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> URL hợp lệ
                  </p>
                )}
              </div>

              {/* Sync Status */}
              {syncStatus && (
                <div
                  className={`p-4 rounded-xl border text-sm ${
                    syncStatus.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {syncStatus.type === 'success' ? (
                      <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-rose-600" />
                    )}
                    <div>
                      <p className="font-semibold">{syncStatus.message}</p>
                      {syncStatus.data?.errors?.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {syncStatus.data.errors.slice(0, 3).map((err, i) => (
                            <li key={i} className="text-xs opacity-80">
                              • Hàng {err.row} ({err.studentName}): {err.error}
                            </li>
                          ))}
                          {syncStatus.data.errors.length > 3 && (
                            <li className="text-xs opacity-60">... và {syncStatus.data.errors.length - 3} lỗi khác</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Service Account Emails accordion */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowEmails(!showEmails)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-semibold text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs">🔑</span>
                    Chia sẻ Sheet với các tài khoản hệ thống
                  </span>
                  {showEmails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showEmails && (
                  <div className="p-4 bg-white space-y-2">
                    <p className="text-[11px] text-slate-500 mb-3">
                      Đảm bảo đã chia sẻ Google Sheets (quyền <b>Viewer</b>) với các email sau:
                    </p>
                    {serviceEmails.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Đang tải...</p>
                    ) : (
                      serviceEmails.map((email, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                        >
                          <span className="text-xs font-mono text-slate-700 truncate">{email}</span>
                          <button
                            onClick={() => handleCopyEmail(email)}
                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                            title="Copy email"
                          >
                            {copiedEmail === email ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={12} className="text-slate-400" />
                            )}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* How it works note */}
              <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-50 rounded-xl p-3">
                <b className="text-slate-500">Lưu ý:</b> Hệ thống sẽ đọc hàng đầu tiên làm tiêu đề cột (header). Các hàng trùng lặp (email/mã SV đã tồn tại trong DB) sẽ bị bỏ qua và ghi vào báo lỗi. Ảnh minh chứng sẽ hiển thị nếu Sheets chứa cột <i>Ảnh minh chứng</i> với link Drive.
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                onClick={handleClose}
                disabled={isSyncing}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSync}
                disabled={isSyncing || !isValidUrl(sheetUrl)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Đang đồng bộ...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} /> Đồng bộ ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelImportSheets;

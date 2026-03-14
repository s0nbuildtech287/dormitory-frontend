import { useState, useEffect } from "react";
import {
  Shield, Save, RotateCcw, CheckCircle, AlertCircle,
  Volume2, Package, Droplets, Zap, Home, FileWarning, HelpCircle, Mail
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:1234/api";

// Cấu hình mặc định (mirror disciplinaryConfig.js)
const DEFAULT_CONFIG = {
  'Vi phạm nội quy':           { default: 5,  min: 2,  max: 15, penalty: 0 },
  'Gây mất trật tự':           { default: 3,  min: 2,  max: 10, penalty: 100000 },
  'Hư hại tài sản':            { default: 10, min: 5,  max: 20, penalty: 0 },
  'Vệ sinh kém':               { default: 3,  min: 2,  max: 5,  penalty: 0 },
  'Trốn phòng':                { default: 10, min: 5,  max: 15, penalty: 500000 },
  'Nộp tiền trễ':              { default: 5,  min: 2,  max: 10, penalty: 0 },
  'Sử dụng điện sai quy định': { default: 8,  min: 5,  max: 15, penalty: 200000 },
  'Khác':                      { default: 3,  min: 1,  max: 10, penalty: 0 },
};

const LEVEL_SCORE = {
  'Nhắc nhở': 2, 'Cảnh cáo': 5, 'Phạt tiền': 10, 'Đình chỉ tạm thời': 20, 'Buộc thôi ở': 0,
};

const ICONS = {
  'Vi phạm nội quy':           { icon: Home,        bg: 'bg-blue-100',   color: 'text-blue-600'   },
  'Gây mất trật tự':           { icon: Volume2,      bg: 'bg-orange-100', color: 'text-orange-600' },
  'Hư hại tài sản':            { icon: Package,      bg: 'bg-red-100',    color: 'text-red-600'    },
  'Vệ sinh kém':               { icon: Droplets,     bg: 'bg-cyan-100',   color: 'text-cyan-600'   },
  'Trốn phòng':                { icon: Shield,       bg: 'bg-purple-100', color: 'text-purple-600' },
  'Nộp tiền trễ':              { icon: FileWarning,  bg: 'bg-yellow-100', color: 'text-yellow-600' },
  'Sử dụng điện sai quy định': { icon: Zap,          bg: 'bg-amber-100',  color: 'text-amber-600'  },
  'Khác':                      { icon: HelpCircle,   bg: 'bg-slate-100',  color: 'text-slate-600'  },
};

const fmt = (n) => n?.toLocaleString('vi-VN') || '0';

const DisciplineScoreSettings = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [emailThreshold, setEmailThreshold] = useState(3);
  const [suspendThreshold, setSuspendThreshold] = useState(40);
  const [status, setStatus] = useState(null); // null | 'saving' | 'success' | 'error'

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/disciplinary/settings/score-config`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          if (res.data.score) setConfig(res.data.score);
          if (res.data.emailThreshold) setEmailThreshold(res.data.emailThreshold);
          if (res.data.suspendThreshold) setSuspendThreshold(res.data.suspendThreshold);
        }
      })
      .catch(() => {}); // fallback về default
  }, []);

  const handleChange = (vType, field, value) => {
    setConfig(prev => ({
      ...prev,
      [vType]: { ...prev[vType], [field]: Number(value) }
    }));
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setEmailThreshold(3);
    setSuspendThreshold(40);
  };

  const handleSave = async () => {
    setStatus('saving');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/disciplinary/settings/score-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ score: config, emailThreshold, suspendThreshold }),
      });
      const json = await res.json();
      setStatus(json.success ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-2xl">
            <Shield size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Cấu hình điểm trừ rèn luyện</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Điều chỉnh số điểm bị trừ theo từng loại vi phạm. Điểm ban đầu mỗi sinh viên là 100.
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-purple-50 rounded-xl flex items-start gap-2">
          <AlertCircle size={14} className="text-purple-600 shrink-0 mt-0.5" />
          <p className="text-xs text-purple-700">
            Thay đổi chỉ áp dụng cho phiếu vi phạm <span className="font-semibold">tạo mới</span> sau khi lưu.
            Các phiếu cũ không bị ảnh hưởng.
          </p>
        </div>
      </div>

      {/* Điểm trừ theo loại vi phạm */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h4 className="font-bold text-slate-900">Điểm trừ theo loại vi phạm</h4>
          <p className="text-xs text-slate-500 mt-0.5">Mỗi loại có giá trị mặc định và khoảng min–max admin có thể override khi lập phiếu</p>
        </div>
        <div className="divide-y divide-slate-100">
          {Object.entries(config).map(([vType, cfg]) => {
            const { icon: Icon, bg, color } = ICONS[vType] || ICONS['Khác'];
            return (
              <div key={vType} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Label */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl ${bg} shrink-0`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{vType}</p>
                    {cfg.penalty > 0 && (
                      <p className="text-xs text-slate-400">Tiền phạt mặc định: {fmt(cfg.penalty)} VNĐ</p>
                    )}
                  </div>
                </div>

                {/* Inputs */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Min</p>
                    <input
                      type="number" min={0} max={cfg.max}
                      value={cfg.min}
                      onChange={e => handleChange(vType, 'min', e.target.value)}
                      className="w-16 px-2 py-2 border border-slate-200 rounded-xl text-sm text-center font-semibold outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-purple-600 mb-1">Mặc định</p>
                    <input
                      type="number" min={cfg.min} max={cfg.max}
                      value={cfg.default}
                      onChange={e => handleChange(vType, 'default', e.target.value)}
                      className="w-20 px-2 py-2 border-2 border-purple-300 rounded-xl text-sm text-center font-bold outline-none focus:ring-2 focus:ring-purple-200 bg-purple-50"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Max</p>
                    <input
                      type="number" min={cfg.default} max={100}
                      value={cfg.max}
                      onChange={e => handleChange(vType, 'max', e.target.value)}
                      className="w-16 px-2 py-2 border border-slate-200 rounded-xl text-sm text-center font-semibold outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Đơn vị</p>
                    <div className="w-16 px-2 py-2 bg-slate-100 rounded-xl text-sm text-center font-semibold text-slate-500">
                      điểm
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ngưỡng email & cảnh báo */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h4 className="font-bold text-slate-900">Ngưỡng cảnh báo tự động</h4>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Mail size={15} className="text-blue-500" />
              Gửi email cảnh báo khi vi phạm ≥
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number" min={1} max={10}
                value={emailThreshold}
                onChange={e => setEmailThreshold(Number(e.target.value))}
                className="w-24 px-3 py-2.5 border-2 border-blue-200 rounded-xl text-sm font-bold text-center outline-none focus:ring-2 focus:ring-blue-200 bg-blue-50"
              />
              <span className="text-sm text-slate-500">lần (cùng loại vi phạm)</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <AlertCircle size={15} className="text-orange-500" />
              Cảnh báo đình chỉ khi điểm ≤
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number" min={0} max={100}
                value={suspendThreshold}
                onChange={e => setSuspendThreshold(Number(e.target.value))}
                className="w-24 px-3 py-2.5 border-2 border-orange-200 rounded-xl text-sm font-bold text-center outline-none focus:ring-2 focus:ring-orange-200 bg-orange-50"
              />
              <span className="text-sm text-slate-500">điểm rèn luyện</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div>
          {status === 'success' && (
            <span className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
              <CheckCircle size={15} /> Đã lưu cấu hình!
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-2 text-rose-700 text-sm font-semibold">
              <AlertCircle size={15} /> Lỗi khi lưu.
            </span>
          )}
          {!status && <span className="text-sm text-slate-400">Thay đổi sẽ áp dụng cho phiếu vi phạm mới</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-white transition-colors"
          >
            <RotateCcw size={14} /> Đặt lại mặc định
          </button>
          <button
            onClick={handleSave}
            disabled={status === 'saving'}
            className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-200 disabled:opacity-50"
          >
            <Save size={14} /> {status === 'saving' ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisciplineScoreSettings;

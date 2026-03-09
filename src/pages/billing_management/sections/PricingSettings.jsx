import { useState, useEffect } from "react";
import { DollarSign, Zap, Droplet, Trash2, Wifi, Car, Save, RotateCcw, CheckCircle, AlertCircle, Info } from "lucide-react";

// ─── Section accordion wrapper ────────────────────────────────────────────────
const Section = ({ id, expanded, onToggle, icon: Icon, iconBg, iconColor, title, subtitle, children }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
    <button 
      onClick={() => onToggle(id)} 
      className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon size={24} className={iconColor} />
        </div>
        <div className="text-left">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
      </div>
      <span className="text-slate-400">{expanded ? "▲" : "▼"}</span>
    </button>
    {expanded && <div className="px-8 pb-8 border-t border-slate-100 space-y-6">{children}</div>}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
const PricingSettings = () => {
  const [expandedSection, setExpandedSection] = useState("rent");
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "success" | "error"
  const [hasChanges, setHasChanges] = useState(false);

  // ── Pricing state ──────────────────────────────────────────────────────────
  const [pricing, setPricing] = useState({
    // Tiền phòng
    rentPerPerson: 500000,
    
    // Điện
    electricRate: 3500,
    electricStart: 0,
    
    // Nước
    waterRate: 15000,
    waterStart: 0,
    
    // Dịch vụ
    garbageFee: 70000,
    internetFee: 300000,
    parkingFeePerVehicle: 50000,
    
    // Hạn thanh toán
    dueDateDay: 10, // Ngày 10 hàng tháng
  });

  const [originalPricing, setOriginalPricing] = useState({ ...pricing });

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(pricing) !== JSON.stringify(originalPricing);
    setHasChanges(changed);
  }, [pricing, originalPricing]);

  const handleToggle = (id) => setExpandedSection((prev) => (prev === id ? null : id));

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      // TODO: Call API to save pricing settings
      // await updatePricingSettings(pricing);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOriginalPricing({ ...pricing });
      setSaveStatus("success");
      setHasChanges(false);
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handleReset = () => {
    setPricing({ ...originalPricing });
    setHasChanges(false);
  };

  const updatePricing = (field, value) => {
    setPricing(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">Điều chỉnh Bảng giá Hóa đơn</h3>
            <p className="text-slate-500 text-sm">
              Cấu hình giá tiền phòng, điện, nước và các dịch vụ. Thay đổi sẽ áp dụng cho các hóa đơn mới được tạo.
            </p>
          </div>
        </div>
        
        {saveStatus === "success" && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm">
            <CheckCircle size={16} /> Đã lưu bảng giá thành công!
          </div>
        )}
        {saveStatus === "error" && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle size={16} /> Có lỗi khi lưu, vui lòng thử lại.
          </div>
        )}
      </div>

      {/* ── Section 1: Tiền phòng ─────────────────────────────────────── */}
      <Section
        id="rent"
        expanded={expandedSection === "rent"}
        onToggle={handleToggle}
        icon={DollarSign}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        title="1. Tiền phòng"
        subtitle="Giá thuê phòng tính theo số người ở"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Giá phòng / người / tháng</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={pricing.rentPerPerson}
                  onChange={(e) => updatePricing('rentPerPerson', Number(e.target.value))}
                  className="w-full px-4 py-3 pr-16 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VNĐ</span>
              </div>
              <p className="text-xs text-slate-500">
                Ví dụ: Phòng 3 người = {(pricing.rentPerPerson * 3).toLocaleString('vi-VN')}đ/tháng
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
            <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Tiền phòng được tính tự động dựa trên số người đang ở trong phòng. Sinh viên trong phòng sẽ tự chia tiền và đóng chung.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Section 2: Điện & Nước ────────────────────────────────────── */}
      <Section
        id="utilities"
        expanded={expandedSection === "utilities"}
        onToggle={handleToggle}
        icon={Zap}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        title="2. Điện & Nước"
        subtitle="Đơn giá điện, nước và chỉ số đầu kỳ"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Điện */}
          <div className="space-y-4 p-6 bg-amber-50/50 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-amber-600" />
              <h4 className="font-bold text-slate-900">Điện</h4>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Đơn giá điện (VNĐ/kWh)</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={pricing.electricRate}
                  onChange={(e) => updatePricing('electricRate', Number(e.target.value))}
                  className="w-full px-4 py-3 pr-20 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-amber-50 outline-none bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VNĐ/kWh</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Chỉ số đầu kỳ (kWh)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={pricing.electricStart}
                onChange={(e) => updatePricing('electricStart', Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-amber-50 outline-none bg-white"
              />
              <p className="text-xs text-slate-500">Mặc định: 0 kWh (reset mỗi tháng)</p>
            </div>

            <div className="p-3 bg-amber-100 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Ví dụ:</strong> Tiêu thụ 75 kWh = {(75 * pricing.electricRate).toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>

          {/* Nước */}
          <div className="space-y-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Droplet size={18} className="text-blue-600" />
              <h4 className="font-bold text-slate-900">Nước</h4>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Đơn giá nước (VNĐ/m³)</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={pricing.waterRate}
                  onChange={(e) => updatePricing('waterRate', Number(e.target.value))}
                  className="w-full px-4 py-3 pr-20 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VNĐ/m³</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Chỉ số đầu kỳ (m³)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={pricing.waterStart}
                onChange={(e) => updatePricing('waterStart', Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none bg-white"
              />
              <p className="text-xs text-slate-500">Mặc định: 0 m³ (reset mỗi tháng)</p>
            </div>

            <div className="p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Ví dụ:</strong> Tiêu thụ 5 m³ = {(5 * pricing.waterRate).toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl flex items-start gap-3">
          <Info size={15} className="text-slate-600 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600">
            Chỉ số điện và nước được reset về 0 mỗi đầu tháng để dễ dàng tính toán. Chỉ cần nhập số cuối kỳ khi tạo hóa đơn.
          </p>
        </div>
      </Section>

      {/* ── Section 3: Dịch vụ ────────────────────────────────────────── */}
      <Section
        id="services"
        expanded={expandedSection === "services"}
        onToggle={handleToggle}
        icon={Wifi}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
        title="3. Phí dịch vụ"
        subtitle="Phí rác, internet và gửi xe"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rác */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 size={16} className="text-emerald-600" />
              <label className="text-sm font-bold text-slate-900">Phí rác / phòng / tháng</label>
            </div>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={1000}
                value={pricing.garbageFee}
                onChange={(e) => updatePricing('garbageFee', Number(e.target.value))}
                className="w-full px-4 py-3 pr-16 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-purple-50 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VNĐ</span>
            </div>
            <p className="text-xs text-slate-500">Tính theo phòng, không phụ thuộc số người</p>
          </div>

          {/* Internet */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Wifi size={16} className="text-blue-600" />
              <label className="text-sm font-bold text-slate-900">Phí mạng / phòng / tháng</label>
            </div>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={10000}
                value={pricing.internetFee}
                onChange={(e) => updatePricing('internetFee', Number(e.target.value))}
                className="w-full px-4 py-3 pr-16 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-purple-50 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VNĐ</span>
            </div>
            <p className="text-xs text-slate-500">Tính theo phòng, không phụ thuộc số người</p>
          </div>

          {/* Xe */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Car size={16} className="text-amber-600" />
              <label className="text-sm font-bold text-slate-900">Phí xe / người / tháng</label>
            </div>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={1000}
                value={pricing.parkingFeePerVehicle}
                onChange={(e) => updatePricing('parkingFeePerVehicle', Number(e.target.value))}
                className="w-full px-4 py-3 pr-16 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-purple-50 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VNĐ</span>
            </div>
            <p className="text-xs text-slate-500">Tính theo số người trong phòng</p>
          </div>
        </div>

        {/* Example calculation */}
        <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
          <h4 className="font-bold text-slate-900 mb-3">Ví dụ tính phí dịch vụ (phòng 3 người)</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Phí rác</span>
              <span className="font-semibold text-slate-900">{pricing.garbageFee.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Phí mạng</span>
              <span className="font-semibold text-slate-900">{pricing.internetFee.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Phí xe (3 người × {pricing.parkingFeePerVehicle.toLocaleString('vi-VN')}đ)</span>
              <span className="font-semibold text-slate-900">{(pricing.parkingFeePerVehicle * 3).toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="border-t border-purple-200 pt-2 mt-2 flex justify-between">
              <span className="font-bold text-slate-900">Tổng phí dịch vụ</span>
              <span className="font-bold text-purple-700 text-base">
                {(pricing.garbageFee + pricing.internetFee + pricing.parkingFeePerVehicle * 3).toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 4: Hạn thanh toán ─────────────────────────────────── */}
      <Section
        id="duedate"
        expanded={expandedSection === "duedate"}
        onToggle={handleToggle}
        icon={DollarSign}
        iconBg="bg-rose-100"
        iconColor="text-rose-600"
        title="4. Hạn thanh toán"
        subtitle="Ngày đến hạn thanh toán hóa đơn hàng tháng"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Ngày đến hạn (mỗi tháng)</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={pricing.dueDateDay}
                  onChange={(e) => updatePricing('dueDateDay', Number(e.target.value))}
                  className="w-full px-4 py-3 pr-24 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-rose-50 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">của tháng sau</span>
              </div>
              <p className="text-xs text-slate-500">
                Ví dụ: Hóa đơn tháng 2 sẽ đến hạn ngày {pricing.dueDateDay} tháng 3
              </p>
            </div>
          </div>

          <div className="p-4 bg-rose-50 rounded-xl flex items-start gap-3">
            <Info size={15} className="text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">
              Hóa đơn quá hạn thanh toán sẽ tự động chuyển sang trạng thái "Quá hạn" và có thể bị tính phí phạt.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Save bar ──────────────────────────────────────────────────── */}
      {hasChanges && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-4 flex items-center gap-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle size={18} />
              <span className="text-sm font-semibold">Bạn có thay đổi chưa lưu</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                disabled={saveStatus === "saving"}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                <RotateCcw size={14} /> Hoàn tác
              </button>
              <button
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-40"
              >
                <Save size={14} /> {saveStatus === "saving" ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingSettings;

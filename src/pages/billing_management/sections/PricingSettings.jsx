import { useState, useEffect } from "react";
import { DollarSign, Zap, Droplet, Trash2, Wifi, Car, Save, RotateCcw, CheckCircle, AlertCircle, Info } from "lucide-react";
import { getPricingSettings, updatePricingSettings } from "../../../api/apiSettings";

// ─── Section accordion wrapper ────────────────────────────────────────────────
const Section = ({ id, expanded, onToggle, icon: Icon, iconBg, iconColor, title, subtitle, children, onSave, onReset, hasChanges, saveStatus }) => (
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
    {expanded && (
      <div className="px-8 pb-8 border-t border-slate-100">
        <div className="space-y-6 pt-6">
          {children}
        </div>
        
        {/* Save buttons at bottom of each section */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {hasChanges && (
              <span className="flex items-center gap-2 text-amber-600">
                <AlertCircle size={16} />
                Có thay đổi chưa lưu
              </span>
            )}
            {saveStatus === "success" && (
              <span className="flex items-center gap-2 text-emerald-600">
                <CheckCircle size={16} />
                Đã lưu thành công
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onReset}
              disabled={!hasChanges || saveStatus === "saving"}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw size={14} /> Hoàn tác
            </button>
            <button
              onClick={onSave}
              disabled={!hasChanges || saveStatus === "saving"}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save size={14} /> {saveStatus === "saving" ? "Đang lưu..." : "Lưu cài đặt"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
const PricingSettings = () => {
  const [expandedSection, setExpandedSection] = useState("rent");
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "success" | "error"
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

  // Load pricing settings from API
  useEffect(() => {
    const loadPricingSettings = async () => {
      try {
        setLoading(true);
        const response = await getPricingSettings();
        
        if (response.success && response.data) {
          // If we have a single pricing_config object
          if (response.data.value) {
            const loadedPricing = response.data.value;
            setPricing(loadedPricing);
            setOriginalPricing(loadedPricing);
          } 
          // If we have an array of settings
          else if (Array.isArray(response.data) && response.data.length > 0) {
            const pricingConfig = response.data.find(s => s.name === 'pricing_config');
            if (pricingConfig && pricingConfig.value) {
              setPricing(pricingConfig.value);
              setOriginalPricing(pricingConfig.value);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load pricing settings:", error);
        setErrorMessage("Không thể tải cấu hình giá. Sử dụng giá mặc định.");
      } finally {
        setLoading(false);
      }
    };

    loadPricingSettings();
  }, []);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(pricing) !== JSON.stringify(originalPricing);
    setHasChanges(changed);
  }, [pricing, originalPricing]);

  const handleToggle = (id) => setExpandedSection((prev) => (prev === id ? null : id));

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage("");
    
    try {
      const response = await updatePricingSettings(pricing);
      
      if (response.success) {
        setOriginalPricing({ ...pricing });
        setSaveStatus("success");
        setHasChanges(false);
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        throw new Error(response.message || "Lỗi khi lưu cấu hình");
      }
    } catch (error) {
      console.error("Save pricing settings error:", error);
      setErrorMessage(error.message || "Có lỗi khi lưu, vui lòng thử lại.");
      setSaveStatus("error");
      setTimeout(() => {
        setSaveStatus(null);
        setErrorMessage("");
      }, 4000);
    }
  };

  const handleReset = () => {
    setPricing({ ...originalPricing });
    setHasChanges(false);
  };

  const updatePricing = (field, value) => {
    setPricing(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Đang tải cấu hình giá...</p>
        </div>
      </div>
    );
  }

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

        {/* Important notice */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
          <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Thay đổi giá chỉ áp dụng cho <strong>hóa đơn mới</strong> được tạo sau khi lưu</li>
              <li>Hóa đơn đã tồn tại sẽ <strong>không bị ảnh hưởng</strong></li>
              <li>Để thấy thay đổi, hãy tạo hóa đơn mới sau khi lưu cài đặt</li>
            </ul>
          </div>
        </div>
        
        {errorMessage && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-700 text-sm">
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}
        
        {saveStatus === "success" && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-sm">
            <CheckCircle size={16} /> Đã lưu bảng giá thành công! Giá mới sẽ được áp dụng cho hóa đơn tiếp theo.
          </div>
        )}
        {saveStatus === "error" && !errorMessage && (
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
        onSave={handleSave}
        onReset={handleReset}
        hasChanges={hasChanges}
        saveStatus={saveStatus}
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
                = {Math.round(pricing.rentPerPerson).toLocaleString('vi-VN')} VNĐ
              </p>
              <p className="text-xs text-slate-500">
                Ví dụ: Phòng 3 người = {Math.round(pricing.rentPerPerson * 3).toLocaleString('vi-VN')}đ/tháng
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
        onSave={handleSave}
        onReset={handleReset}
        hasChanges={hasChanges}
        saveStatus={saveStatus}
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
              <p className="text-xs text-slate-500">= {Math.round(pricing.electricRate).toLocaleString('vi-VN')} VNĐ/kWh</p>
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
              <p className="text-xs text-slate-500">= {Math.round(pricing.waterRate).toLocaleString('vi-VN')} VNĐ/m³</p>
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
        onSave={handleSave}
        onReset={handleReset}
        hasChanges={hasChanges}
        saveStatus={saveStatus}
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
            <p className="text-xs text-slate-500">= {Math.round(pricing.garbageFee).toLocaleString('vi-VN')} VNĐ</p>
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
            <p className="text-xs text-slate-500">= {Math.round(pricing.internetFee).toLocaleString('vi-VN')} VNĐ</p>
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
            <p className="text-xs text-slate-500">= {Math.round(pricing.parkingFeePerVehicle).toLocaleString('vi-VN')} VNĐ</p>
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
        onSave={handleSave}
        onReset={handleReset}
        hasChanges={hasChanges}
        saveStatus={saveStatus}
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
    </div>
  );
};

export default PricingSettings;

import { useState, useEffect } from "react";
import { Target, Zap, BarChart3, Info, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from "lucide-react";
import { getScoringWeights, updateScoringWeights, recalculateAllScores } from "../../../api/apiRegistration.js";

const RegistrationSettings = ({ onSettingsUpdated }) => {
  // Quota Settings state
  const [quotas, setQuotas] = useState({
    totalSlots: 1000,
    policy_priority: 10,
    freshmen: 60,
    seniors: 30,
    waterfall_enabled: true,
  });

  // Weighting Factors state - Separate weights for each basket
  const [weights, setWeights] = useState({
    basket1: {
      w1_priority: 0.4,
      w2_year: 0.3,
      w3_gpa: 0.3,
    },
    basket2: {
      w1_priority: 0.2,
      w2_year: 0.5,
      w3_gpa: 0.3,
    },
    basket3: {
      w1_priority: 0.1,
      w2_year: 0.2,
      w3_gpa: 0.7,
    },
  });

  // Score Mapping Rules state
  const [scoreMappings, setScoreMappings] = useState({
    priority: {
      absolute_policy: 100,
      priority_area: 70,
      other_objects: 30,
      non_priority: 0,
    },
    year: {
      year1: 100,
      year2: 60,
      year3: 40,
      year4: 20,
    },
    gpa: {
      conversion_factor: 25,
      min_gpa_filter: 2.0,
    },
  });

  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [expandedSection, setExpandedSection] = useState("quotas");
  const [saveStatus, setSaveStatus] = useState(null);

  const fetchSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const data = await getScoringWeights();
      if (data.success && data.data && data.data.value) {
        const settingsValue = data.data.value;
        
        // Load quotas
        if (settingsValue.quotas) {
          setQuotas({
            totalSlots: settingsValue.quotas.totalSlots || 1000,
            policy_priority: settingsValue.quotas.policy_priority || 10,
            freshmen: settingsValue.quotas.freshmen || 60,
            seniors: settingsValue.quotas.seniors || 30,
            waterfall_enabled: settingsValue.quotas.waterfall_enabled !== undefined ? settingsValue.quotas.waterfall_enabled : true,
          });
        }
        
        // Load weights (3 basket structure)
        if (settingsValue.weights) {
          if (settingsValue.weights.basket1 || settingsValue.weights.basket2 || settingsValue.weights.basket3) {
            setWeights({
              basket1: {
                w1_priority: settingsValue.weights.basket1?.w1_priority || 0.4,
                w2_year: settingsValue.weights.basket1?.w2_year || 0.3,
                w3_gpa: settingsValue.weights.basket1?.w3_gpa || 0.3,
              },
              basket2: {
                w1_priority: settingsValue.weights.basket2?.w1_priority || 0.2,
                w2_year: settingsValue.weights.basket2?.w2_year || 0.5,
                w3_gpa: settingsValue.weights.basket2?.w3_gpa || 0.3,
              },
              basket3: {
                w1_priority: settingsValue.weights.basket3?.w1_priority || 0.1,
                w2_year: settingsValue.weights.basket3?.w2_year || 0.2,
                w3_gpa: settingsValue.weights.basket3?.w3_gpa || 0.7,
              },
            });
          }
        }
        
        // Load score mappings
        if (settingsValue.scoreMappings) {
          setScoreMappings({
            priority: {
              absolute_policy: settingsValue.scoreMappings.priority?.absolute_policy || 100,
              priority_area: settingsValue.scoreMappings.priority?.priority_area || 70,
              other_objects: settingsValue.scoreMappings.priority?.other_objects || 30,
              non_priority: settingsValue.scoreMappings.priority?.non_priority || 0,
            },
            year: {
              year1: settingsValue.scoreMappings.year?.year1 || 100,
              year2: settingsValue.scoreMappings.year?.year2 || 60,
              year3: settingsValue.scoreMappings.year?.year3 || 40,
              year4: settingsValue.scoreMappings.year?.year4 || 20,
            },
            gpa: {
              conversion_factor: settingsValue.scoreMappings.gpa?.conversion_factor || 25,
              min_gpa_filter: settingsValue.scoreMappings.gpa?.min_gpa_filter || 2.0,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      setIsLoadingSettings(true);
      setSaveStatus("saving");
      
      // Step 1: Update settings
      const allSettings = { quotas, weights, scoreMappings };
      await updateScoringWeights(allSettings);
      
      // Step 2: Recalculate all registration scores with new weights
      setSaveStatus("recalculating");
      await recalculateAllScores();
      
      // Step 3: Fetch updated settings to confirm save
      await fetchSettings();
      
      // Step 4: Notify parent to reload registrations
      if (onSettingsUpdated) {
        onSettingsUpdated();
      }
      
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (error) {
      console.error("Error updating settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 5000);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Validation helpers
  const basket1Total = (weights.basket1.w1_priority + weights.basket1.w2_year + weights.basket1.w3_gpa).toFixed(2);
  const basket2Total = (weights.basket2.w1_priority + weights.basket2.w2_year + weights.basket2.w3_gpa).toFixed(2);
  const basket3Total = (weights.basket3.w1_priority + weights.basket3.w2_year + weights.basket3.w3_gpa).toFixed(2);
  const weightsValid = Math.abs(parseFloat(basket1Total) - 1) < 0.01 && Math.abs(parseFloat(basket2Total) - 1) < 0.01 && Math.abs(parseFloat(basket3Total) - 1) < 0.01;
  const totalQuota = quotas.policy_priority + quotas.freshmen + quotas.seniors;
  const quotaValid = Math.abs(totalQuota - 100) < 1;

  // Fetch settings when component mounts
  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Cấu hình Hệ thống Đăng ký</h3>
            <p className="text-slate-500">Quản lý chỉ tiêu, trọng số điểm và quy tắc quy đổi điểm</p>
          </div>
          <button
            onClick={handleUpdateSettings}
            disabled={isLoadingSettings}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saveStatus === "success" && <CheckCircle size={18} />}
            {saveStatus === "error" && <AlertCircle size={18} />}
            {isLoadingSettings ? 
              (saveStatus === "recalculating" ? "Đang tính lại điểm..." : "Đang lưu...") : 
              "Lưu tất cả cài đặt"}
          </button>
        </div>
        {saveStatus === "success" && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle size={16} />
            Cài đặt đã được lưu và điểm đã được tính lại cho tất cả hồ sơ!
          </div>
        )}
        {saveStatus === "recalculating" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-blue-700 text-sm">
            <AlertCircle size={16} className="animate-pulse" />
            Đang tính lại điểm cho tất cả hồ sơ đăng ký...
          </div>
        )}
        {saveStatus === "error" && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} />
            Có lỗi khi lưu cài đặt, vui lòng thử lại!
          </div>
        )}
      </div>

      {/* Section 1: Quota Settings */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <button onClick={() => setExpandedSection(expandedSection === "quotas" ? null : "quotas")} className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target size={24} className="text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-slate-900">1. Cấu hình Chỉ tiêu (Quota Settings)</h3>
              <p className="text-sm text-slate-500 mt-1">Cấu hình tổng số slot và phân bổ tỷ lệ phần trăm chỗ ở cho các nhóm ưu tiên</p>
            </div>
          </div>
          {expandedSection === "quotas" ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </button>

        {expandedSection === "quotas" && (
          <div className="px-8 pb-8 border-t border-slate-100 space-y-6">
            {/* Total Slots Input */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900">Tổng số lượng Slot</label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  value={quotas.totalSlots}
                  onChange={(e) => setQuotas({ ...quotas, totalSlots: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                  min="1"
                  step="1"
                />
              </div>
              <p className="text-xs text-slate-500">
                <strong>Mặc định:</strong> 1000 | Tổng số chỗ ở có sẵn
              </p>
            </div>

            {/* Quota Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Policy Priority */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">Nhóm 1: Ưu tiên chính sách ({quotas.policy_priority}%) - {Math.round((quotas.policy_priority / 100) * quotas.totalSlots)} slots</label>
                <div className="relative">
                  <input
                    type="number"
                    value={quotas.policy_priority}
                    onChange={(e) => setQuotas({ ...quotas, policy_priority: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">%</span>
                </div>
                <p className="text-xs text-slate-500">
                  <strong>Mặc định:</strong> 10% | Dành cho hộ nghèo, khuyết tật, lưu học sinh
                </p>
              </div>

              {/* Freshmen */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">Nhóm 2: Tân sinh viên ({quotas.freshmen}%) - {Math.round((quotas.freshmen / 100) * quotas.totalSlots)} slots</label>
                <div className="relative">
                  <input
                    type="number"
                    value={quotas.freshmen}
                    onChange={(e) => setQuotas({ ...quotas, freshmen: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">%</span>
                </div>
                <p className="text-xs text-slate-500">
                  <strong>Mặc định:</strong> 60% | Ưu tiên sinh viên năm nhất
                </p>
              </div>

              {/* Seniors */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">Nhóm 3: Sinh viên khóa cũ ({quotas.seniors}%) - {Math.round((quotas.seniors / 100) * quotas.totalSlots)} slots</label>
                <div className="relative">
                  <input
                    type="number"
                    value={quotas.seniors}
                    onChange={(e) => setQuotas({ ...quotas, seniors: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">%</span>
                </div>
                <p className="text-xs text-slate-500">
                  <strong>Mặc định:</strong> 40% | Cạnh tranh bằng GPA
                </p>
              </div>
            </div>

            {/* Total Quota Display */}
            <div className={`p-4 rounded-xl flex items-center justify-between ${quotaValid ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className={quotaValid ? "text-green-600" : "text-orange-600"} />
                <div>
                  <p className={`font-bold ${quotaValid ? "text-green-900" : "text-orange-900"}`}>Tổng chỉ tiêu: {totalQuota.toFixed(1)}% ({quotas.totalSlots} slots)</p>
                  <p className={`text-xs ${quotaValid ? "text-green-700" : "text-orange-700"}`}>{quotaValid ? "✓ Hợp lệ (tổng = 100%)" : "⚠ Phải bằng 100% để hợp lệ"}</p>
                </div>
              </div>
            </div>

            {/* Waterfall Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-slate-900">Cộng dồn chỉ tiêu dư (Waterfall)</p>
                <p className="text-sm text-slate-600 mt-1">Nếu bật, số chỗ dư từ nhóm trên sẽ tự động tràn xuống nhóm dưới</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={quotas.waterfall_enabled} onChange={(e) => setQuotas({ ...quotas, waterfall_enabled: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Weighting Factors */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <button onClick={() => setExpandedSection(expandedSection === "weights" ? null : "weights")} className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Zap size={24} className="text-amber-600" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-slate-900">2. Cấu hình Trọng số điểm theo Nhóm</h3>
              <p className="text-sm text-slate-500 mt-1">Thiết lập hệ số riêng cho từng nhóm (W₁ + W₂ + W₃ = 1.0 cho Mỗi nhóm)</p>
            </div>
          </div>
          {expandedSection === "weights" ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </button>

        {expandedSection === "weights" && (
          <div className="px-8 pb-8 border-t border-slate-100 space-y-8">
            {/* Basket 1 Weights */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-rose-600 border-b border-rose-100 pb-2">Nhóm 1: Chính sách ưu tiên</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">W₁: Trọng số Ưu tiên</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket1.w1_priority}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket1: { ...weights.basket1, w1_priority: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">{(weights.basket1.w1_priority * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Quan trọng nhất cho nhóm chính sách</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">W₂: Trọng số Năm học</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket1.w2_year}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket1: { ...weights.basket1, w2_year: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">{(weights.basket1.w2_year * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Ít quan trọng hơn cho nhóm này</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">W₃: Trọng số GPA</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket1.w3_gpa}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket1: { ...weights.basket1, w3_gpa: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">{(weights.basket1.w3_gpa * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Điểm trung bình quan trọng</p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-rose-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-rose-700">Tổng trọng số Nhóm 1:</span>
                <span className={`font-bold ${parseFloat(basket1Total) === 1 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {basket1Total} {parseFloat(basket1Total) === 1 ? '✓' : '✗'}
                </span>
              </div>
            </div>

            {/* Basket 2 Weights */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-blue-600 border-b border-blue-100 pb-2">Nhóm 2: Tân sinh viên</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">W₁: Trọng số Ưu tiên</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket2.w1_priority}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket2: { ...weights.basket2, w1_priority: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">{(weights.basket2.w1_priority * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Ít quan trọng cho tân sinh viên</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">W₂: Trọng số Năm học</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket2.w2_year}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket2: { ...weights.basket2, w2_year: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">{(weights.basket2.w2_year * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Quan trọng nhất cho nhóm tân sinh viên</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">W₃: Trọng số GPA</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket2.w3_gpa}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket2: { ...weights.basket2, w3_gpa: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">{(weights.basket2.w3_gpa * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Điểm đầu vào quan trọng</p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Tổng trọng số Nhóm 2:</span>
                <span className={`font-bold ${parseFloat(basket2Total) === 1 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {basket2Total} {parseFloat(basket2Total) === 1 ? '✓' : '✗'}
                </span>
              </div>
            </div>

            {/* Basket 3 Weights */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-purple-600 border-b border-purple-100 pb-2">Nhóm 3: Sinh viên khóa cũ</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">W₁: Trọng số Ưu tiên</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket3.w1_priority}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket3: { ...weights.basket3, w1_priority: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">{(weights.basket3.w1_priority * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Ít quan trọng cho khóa cũ</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">W₂: Trọng số Năm học</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket3.w2_year}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket3: { ...weights.basket3, w2_year: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">{(weights.basket3.w2_year * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Ít quan trọng cho nhóm này</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">W₃: Trọng số GPA</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket3.w3_gpa}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket3: { ...weights.basket3, w3_gpa: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">{(weights.basket3.w3_gpa * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-500">Quan trọng nhất cho nhóm khóa cũ</p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-purple-700">Tổng trọng số Nhóm 3:</span>
                <span className={`font-bold ${parseFloat(basket3Total) === 1 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {basket3Total} {parseFloat(basket3Total) === 1 ? '✓' : '✗'}
                </span>
              </div>
            </div>

            {/* Overall Validation */}
            <div className={`p-4 rounded-xl ${weightsValid ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
              <div className="flex items-center gap-2">
                {weightsValid ? <CheckCircle className="text-emerald-600" size={20} /> : <AlertCircle className="text-rose-600" size={20} />}
                <span className={`font-bold ${weightsValid ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {weightsValid ? 'Tất cả trọng số hợp lệ' : 'Một số trọng số không hợp lệ'}
                </span>
              </div>
              <p className={`text-sm mt-1 ${weightsValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                Mỗi nhóm phải có tổng trọng số = 1.0 để hợp lệ
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
              <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                <strong>Gợi ý:</strong> Tăng W₃ cho Nhóm 3 nếu muốn ưu tiên sinh viên có học lực giỏi. Tăng W₁ cho Nhóm 1 nếu muốn ưu tiên hoàn cảnh khó khăn.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Score Mapping Rules */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <button onClick={() => setExpandedSection(expandedSection === "mappings" ? null : "mappings")} className="w-full p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <BarChart3 size={24} className="text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-slate-900">3. Cấu hình Thang điểm Quy đổi (Score Mapping)</h3>
              <p className="text-sm text-slate-500 mt-1">Bảng quy đổi điểm thành phần thành thang 100</p>
            </div>
          </div>
          {expandedSection === "mappings" ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </button>

        {expandedSection === "mappings" && (
          <div className="px-8 pb-8 border-t border-slate-100 space-y-8">
            {/* 1. Priority Score Mapping */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">1</span>
                Điểm Ưu tiên (PriorityScore - Thang 100)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Chính sách tuyệt đối</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority.absolute_policy}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority: { ...scoreMappings.priority, absolute_policy: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">đ</span>
                  </div>
                  <p className="text-xs text-slate-500">Hộ nghèo, cận nghèo, con thương binh, khuyết tật, lưu học sinh</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Khu vực ưu tiên</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority.priority_area}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority: { ...scoreMappings.priority, priority_area: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">đ</span>
                  </div>
                  <p className="text-xs text-slate-500">Vùng sâu vùng xa, hải đảo, điều kiện kinh tế đặc biệt khó khăn</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Đối tượng khác</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority.other_objects}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority: { ...scoreMappings.priority, other_objects: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">đ</span>
                  </div>
                  <p className="text-xs text-slate-500">Có giấy xác nhận ưu tiên từ địa phương hoặc nhà trường</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Không thuộc diện ưu tiên</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority.non_priority}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority: { ...scoreMappings.priority, non_priority: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">đ</span>
                  </div>
                  <p className="text-xs text-slate-500">Không có giấy xác nhận ưu tiên</p>
                </div>
              </div>
            </div>

            {/* 2. Year Score Mapping */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">2</span>
                Điểm theo Khóa/Năm học (YearScore - Thang 100)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Sinh viên năm 1</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.year.year1}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          year: { ...scoreMappings.year, year1: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">đ</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Sinh viên năm 2</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.year.year2}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          year: { ...scoreMappings.year, year2: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">đ</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Sinh viên năm 3</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.year.year3}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          year: { ...scoreMappings.year, year3: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">đ</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Sinh viên năm 4</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.year.year4}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          year: { ...scoreMappings.year, year4: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-8 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. GPA Score Mapping */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">3</span>
                Điểm Học tập (GPAScore - Thang 100)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Hệ số quy đổi</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.gpa.conversion_factor}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          gpa: { ...scoreMappings.gpa, conversion_factor: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">×</span>
                  </div>
                  <p className="text-xs text-slate-500">Công thức: GPA × {scoreMappings.gpa.conversion_factor} (Áp dụng cho hệ 4.0)</p>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Ví dụ:</strong> GPA 3.5 sẽ được quy đổi thành {(3.5 * scoreMappings.gpa.conversion_factor).toFixed(0)} điểm
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">GPA tối thiểu (Filter)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.gpa.min_gpa_filter}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          gpa: { ...scoreMappings.gpa, min_gpa_filter: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      step="0.1"
                      max="4"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold">/4.0</span>
                  </div>
                  <p className="text-xs text-slate-500">GPA dưới ngưỡng này sẽ bị loại, trạng thái hồ sơ: "Không đủ điều kiện"</p>
                  <div className="mt-2 p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-700">
                      <strong>⚠ Lưu ý:</strong> GPA &lt; {scoreMappings.gpa.min_gpa_filter} sẽ bị loại trực tiếp
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-purple-50 rounded-xl flex items-start gap-3">
              <Info size={16} className="text-purple-600 shrink-0 mt-0.5" />
              <div className="text-sm text-purple-700">
                <p>
                  <strong>Công thức tính Điểm xét duyệt:</strong>
                </p>
                <p className="mt-2">aiScore = (PriorityScore × W₁) + (YearScore × W₂) + (GPAScore × W₃)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationSettings;

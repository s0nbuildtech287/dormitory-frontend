import { useState, useEffect } from "react";
import { Target, Zap, BarChart3, Info, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from "lucide-react";
import { getScoringWeights, updateScoringWeights, recalculateAllScores } from "../../../api/apiRegistration.js";

const RegistrationSettings = ({ onSettingsUpdated }) => {
  const [quotas, setQuotas] = useState({
    totalSlots: 1000,
    policy_priority: 0,
    freshmen: 60,
    seniors: 40,
    waterfall_enabled: true,
    facultyQuotas: {},
  });
  const [facultiesList, setFacultiesList] = useState([]);

  const [weights, setWeights] = useState({
    basket1: {
      trongso_chinhsach: 0.4,
      trongso_namhoc: 0.3,
      trongso_hocluc: 0.3,
    },
    basket2: {
      trongso_chinhsach: 0.2,
      trongso_namhoc: 0.5,
      trongso_hocluc: 0.3,
    },
    basket3: {
      trongso_chinhsach: 0.1,
      trongso_namhoc: 0.2,
      trongso_hocluc: 0.7,
    },
  });

  // Bảng quy đổi điểm chi tiết cho từng chính sách
  const [scoreMappings, setScoreMappings] = useState({
    priority: {
      absolute_policy: 100,
      priority_area: 70,
      other_objects: 30,
      non_priority: 0,
    },
    priority_detailed: {
      ho_ngheo: 40,
      can_ngheo: 35,
      khuyet_tat: 30,
      liet_sy: 50,
      thuong_binh: 45,
      luu_hoc_sinh: 40,
      vung_sau_xa: 20,
      hai_dao: 25,
      hoan_canh_kho_khan: 30,
      giay_xac_nhan: 15,
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

        // Load quotas and dynamic faculties
        if (data.data.faculties) {
          setFacultiesList(data.data.faculties);
        }
        if (settingsValue.quotas) {
          const loadedFacultyQuotas = settingsValue.quotas.facultyQuotas || {};
          if (data.data.faculties) {
            data.data.faculties.forEach(fac => {
              const facVal = loadedFacultyQuotas[fac.name];
              if (facVal === undefined) {
                loadedFacultyQuotas[fac.name] = { freshmen: 0, seniors: 0 };
              } else if (typeof facVal === 'object' && facVal !== null) {
                loadedFacultyQuotas[fac.name] = {
                  freshmen: facVal.freshmen !== undefined ? Number(facVal.freshmen) : 0,
                  seniors: facVal.seniors !== undefined ? Number(facVal.seniors) : 0
                };
              } else {
                const numVal = Number(facVal) || 0;
                loadedFacultyQuotas[fac.name] = {
                  freshmen: numVal,
                  seniors: numVal
                };
              }
            });
          }
          setQuotas({
            totalSlots: settingsValue.quotas.totalSlots !== undefined ? settingsValue.quotas.totalSlots : 1000,
            policy_priority: settingsValue.quotas.policy_priority !== undefined ? settingsValue.quotas.policy_priority : 0,
            freshmen: settingsValue.quotas.freshmen !== undefined ? settingsValue.quotas.freshmen : 60,
            seniors: settingsValue.quotas.seniors !== undefined ? settingsValue.quotas.seniors : 40,
            waterfall_enabled: settingsValue.quotas.waterfall_enabled !== undefined ? settingsValue.quotas.waterfall_enabled : true,
            facultyQuotas: loadedFacultyQuotas,
          });
        }

        // Load weights (3 basket structure)
        if (settingsValue.weights && (settingsValue.weights.basket1 || settingsValue.weights.basket2 || settingsValue.weights.basket3)) {
            setWeights({
              basket1: {
                trongso_chinhsach: settingsValue.weights.basket1?.trongso_chinhsach || settingsValue.weights.basket1?.w1_priority || 0.4,
                trongso_namhoc: settingsValue.weights.basket1?.trongso_namhoc || settingsValue.weights.basket1?.w2_year || 0.3,
                trongso_hocluc: settingsValue.weights.basket1?.trongso_hocluc || settingsValue.weights.basket1?.w3_gpa || 0.3,
              },
              basket2: {
                trongso_chinhsach: settingsValue.weights.basket2?.trongso_chinhsach || settingsValue.weights.basket2?.w1_priority || 0.2,
                trongso_namhoc: settingsValue.weights.basket2?.trongso_namhoc || settingsValue.weights.basket2?.w2_year || 0.5,
                trongso_hocluc: settingsValue.weights.basket2?.trongso_hocluc || settingsValue.weights.basket2?.w3_gpa || 0.3,
              },
              basket3: {
                trongso_chinhsach: settingsValue.weights.basket3?.trongso_chinhsach || settingsValue.weights.basket3?.w1_priority || 0.1,
                trongso_namhoc: settingsValue.weights.basket3?.trongso_namhoc || settingsValue.weights.basket3?.w2_year || 0.2,
                trongso_hocluc: settingsValue.weights.basket3?.trongso_hocluc || settingsValue.weights.basket3?.w3_gpa || 0.7,
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
            priority_detailed: {
              ho_ngheo: settingsValue.scoreMappings.priority_detailed?.ho_ngheo || 40,
              can_ngheo: settingsValue.scoreMappings.priority_detailed?.can_ngheo || 35,
              khuyet_tat: settingsValue.scoreMappings.priority_detailed?.khuyet_tat || 30,
              liet_sy: settingsValue.scoreMappings.priority_detailed?.liet_sy || 50,
              thuong_binh: settingsValue.scoreMappings.priority_detailed?.thuong_binh || 45,
              luu_hoc_sinh: settingsValue.scoreMappings.priority_detailed?.luu_hoc_sinh || 40,
              vung_sau_xa: settingsValue.scoreMappings.priority_detailed?.vung_sau_xa || 20,
              hai_dao: settingsValue.scoreMappings.priority_detailed?.hai_dao || 25,
              hoan_canh_kho_khan: settingsValue.scoreMappings.priority_detailed?.hoan_canh_kho_khan || 30,
              giay_xac_nhan: settingsValue.scoreMappings.priority_detailed?.giay_xac_nhan || 15,
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
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleFacultyQuotaSplitChange = (facName, type, val) => {
    setQuotas(prev => {
      const currentQuota = prev.facultyQuotas?.[facName] || { freshmen: 0, seniors: 0 };
      const updatedQuota = typeof currentQuota === 'object' && currentQuota !== null 
        ? { ...currentQuota } 
        : { freshmen: Number(currentQuota) || 0, seniors: Number(currentQuota) || 0 };
      
      updatedQuota[type] = parseInt(val) || 0;

      return {
        ...prev,
        facultyQuotas: {
          ...prev.facultyQuotas,
          [facName]: updatedQuota
        }
      };
    });
  };

  const handleUpdateSettings = async () => {
    try {
      setIsLoadingSettings(true);
      setSaveStatus("saving");
      
      // Step 1: Update settings
      const updatedQuotas = { ...quotas, policy_priority: 0 };
      const allSettings = { quotas: updatedQuotas, weights, scoreMappings };
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

  // Kiểm tra tổng trọng số
  const basket1Total = (weights.basket1.trongso_chinhsach + weights.basket1.trongso_namhoc + weights.basket1.trongso_hocluc).toFixed(2);
  const basket2Total = (weights.basket2.trongso_chinhsach + weights.basket2.trongso_namhoc + weights.basket2.trongso_hocluc).toFixed(2);
  const basket3Total = (weights.basket3.trongso_chinhsach + weights.basket3.trongso_namhoc + weights.basket3.trongso_hocluc).toFixed(2);
  const weightsValid = Math.abs(parseFloat(basket1Total) - 1) < 0.01 && Math.abs(parseFloat(basket2Total) - 1) < 0.01 && Math.abs(parseFloat(basket3Total) - 1) < 0.01;
  const totalQuota = quotas.freshmen + quotas.seniors;
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
              <h3 className="text-xl font-bold text-slate-900">1. Cấu hình Chỉ tiêu</h3>
              <p className="text-sm text-slate-500 mt-1">Cấu hình tổng số chỗ ở và phân bổ tỷ lệ phần trăm cho các nhóm xét duyệt</p>
            </div>
          </div>
          {expandedSection === "quotas" ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </button>

        {expandedSection === "quotas" && (
          <div className="px-8 pb-8 border-t border-slate-100 space-y-6">
            {/* Total Slots Input */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-900">Tổng số chỗ ở</label>
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
                <strong>Mặc định:</strong> 1000 chỗ
              </p>
            </div>

            {/* Quota Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Freshmen */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">Nhóm 1: Tân sinh viên ({quotas.freshmen}%) — {Math.round((quotas.freshmen / 100) * quotas.totalSlots)} chỗ</label>
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
                  <strong>Mặc định:</strong> 60% — Ưu tiên sinh viên năm nhất (gồm cả tân sinh viên diện chính sách)
                </p>
              </div>

              {/* Seniors */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900">Nhóm 2: Sinh viên khóa cũ ({quotas.seniors}%) — {Math.round((quotas.seniors / 100) * quotas.totalSlots)} chỗ</label>
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
                  <strong>Mặc định:</strong> 40% — Xét theo điểm học tập (gồm cả sinh viên khóa cũ diện chính sách)
                </p>
              </div>
            </div>

            {/* Total Quota Display */}
            <div className={`p-4 rounded-xl flex items-center justify-between ${quotaValid ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className={quotaValid ? "text-green-600" : "text-orange-600"} />
                <div>
                  <p className={`font-bold ${quotaValid ? "text-green-900" : "text-orange-900"}`}>Tổng chỉ tiêu: {totalQuota.toFixed(1)}% ({quotas.totalSlots} chỗ)</p>
                  <p className={`text-xs ${quotaValid ? "text-green-700" : "text-orange-700"}`}>{quotaValid ? "✓ Hợp lệ (tổng = 100%)" : "⚠ Cần điều chỉnh để tổng bằng 100%"}</p>
                </div>
              </div>
            </div>


            {/* Cấu hình chỉ tiêu theo Khoa */}
            {facultiesList && facultiesList.length > 0 && (
              <div className="space-y-4 border-t border-slate-100 pt-6 mt-6">
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Cấu hình Chỉ tiêu theo Khoa (Tùy chọn)</h4>
                  <p className="text-xs text-slate-500 mt-1">Để chỉ tiêu là 0 nếu không muốn giới hạn riêng theo Khoa (hệ thống sẽ dùng chỉ tiêu tsv/lsv chung)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {facultiesList.map((fac) => {
                    const quotaVal = quotas.facultyQuotas?.[fac.name] || { freshmen: 0, seniors: 0 };
                    const currentVal = typeof quotaVal === 'object' && quotaVal !== null
                      ? { freshmen: quotaVal.freshmen || 0, seniors: quotaVal.seniors || 0 }
                      : { freshmen: Number(quotaVal) || 0, seniors: Number(quotaVal) || 0 };
                    
                    return (
                      <div key={fac.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in duration-200">
                        <div className="text-left flex-1 pr-4">
                          <span className="font-semibold text-slate-800 text-sm block">{fac.name}</span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold mt-1">
                            {fac.count} hồ sơ chờ ({fac.freshmenCount || 0} Tân SV, {fac.seniorsCount || 0} Lưu SV)
                          </span>
                        </div>
                        <div className="flex gap-4 flex-shrink-0">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Tân SV</span>
                            <input
                              type="number"
                              value={currentVal.freshmen}
                              onChange={(e) => handleFacultyQuotaSplitChange(fac.name, 'freshmen', e.target.value)}
                              className="w-24 px-3 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold text-center bg-white"
                              min="0"
                              step="5"
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Lưu SV</span>
                            <input
                              type="number"
                              value={currentVal.seniors}
                              onChange={(e) => handleFacultyQuotaSplitChange(fac.name, 'seniors', e.target.value)}
                              className="w-24 px-3 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold text-center bg-white"
                              min="0"
                              step="5"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
              <h3 className="text-xl font-bold text-slate-900">2. Cấu hình Trọng số điểm</h3>
              <p className="text-sm text-slate-500 mt-1">Thiết lập mức độ ảnh hưởng của từng tiêu chí (Tổng = 100% cho mỗi nhóm)</p>
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
                  <label className="block text-sm font-bold text-slate-900">Trọng số Chính sách</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket1.trongso_chinhsach}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket1: { ...weights.basket1, trongso_chinhsach: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white px-2 text-slate-500 font-bold text-sm pointer-events-none">
                      {(weights.basket1.trongso_chinhsach * 100).toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Quan trọng nhất cho nhóm chính sách</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Trọng số Năm học</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket1.trongso_namhoc}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket1: { ...weights.basket1, trongso_namhoc: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white px-2 text-slate-500 font-bold text-sm pointer-events-none">
                      {(weights.basket1.trongso_namhoc * 100).toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Ít quan trọng hơn cho nhóm này</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Trọng số Học lực</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket1.trongso_hocluc}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket1: { ...weights.basket1, trongso_hocluc: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white px-2 text-slate-500 font-bold text-sm pointer-events-none">
                      {(weights.basket1.trongso_hocluc * 100).toFixed(0)}%
                    </div>
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
                  <label className="block text-sm font-bold text-slate-900">Trọng số Chính sách</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket2.trongso_chinhsach}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket2: { ...weights.basket2, trongso_chinhsach: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white px-2 text-slate-500 font-bold text-sm pointer-events-none">
                      {(weights.basket2.trongso_chinhsach * 100).toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Ít quan trọng cho tân sinh viên</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Trọng số Năm học</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket2.trongso_namhoc}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket2: { ...weights.basket2, trongso_namhoc: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white px-2 text-slate-500 font-bold text-sm pointer-events-none">
                      {(weights.basket2.trongso_namhoc * 100).toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Quan trọng nhất cho nhóm tân sinh viên</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Trọng số Học lực</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket2.trongso_hocluc}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket2: { ...weights.basket2, trongso_hocluc: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white px-2 text-slate-500 font-bold text-sm pointer-events-none">
                      {(weights.basket2.trongso_hocluc * 100).toFixed(0)}%
                    </div>
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
                  <label className="block text-sm font-bold text-slate-900">Trọng số Chính sách</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket3.trongso_chinhsach}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket3: { ...weights.basket3, trongso_chinhsach: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white px-2 text-slate-500 font-bold text-sm pointer-events-none">
                      {(weights.basket3.trongso_chinhsach * 100).toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Ít quan trọng cho khóa cũ</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Trọng số Năm học</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket3.trongso_namhoc}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket3: { ...weights.basket3, trongso_namhoc: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white px-2 text-slate-500 font-bold text-sm pointer-events-none">
                      {(weights.basket3.trongso_namhoc * 100).toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Ít quan trọng cho nhóm này</p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Trọng số Học lực</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weights.basket3.trongso_hocluc}
                      onChange={(e) => setWeights({
                        ...weights,
                        basket3: { ...weights.basket3, trongso_hocluc: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="1"
                      step="0.01"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white px-2 text-slate-500 font-bold text-sm pointer-events-none">
                      {(weights.basket3.trongso_hocluc * 100).toFixed(0)}%
                    </div>
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
              <h3 className="text-xl font-bold text-slate-900">3. Cấu hình Thang điểm Quy đổi</h3>
              <p className="text-sm text-slate-500 mt-1">Bảng quy đổi từng tiêu chí thành thang 100 điểm</p>
            </div>
          </div>
          {expandedSection === "mappings" ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </button>

        {expandedSection === "mappings" && (
          <div className="px-8 pb-8 border-t border-slate-100 space-y-8">
            {/* 1. Priority Score Mapping - DETAILED */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">1</span>
                Điểm Chính sách (Thang 100 - Có thể cộng dồn)
              </h4>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700">
                  <strong>⚠️ Lưu ý:</strong> Nếu sinh viên đáp ứng nhiều chính sách, điểm sẽ được <strong>cộng dồn</strong> (tối đa 100 điểm).
                  <br />
                  <strong>Ví dụ:</strong> Hộ nghèo (40đ) + Khuyết tật (30đ) = <strong>70 điểm</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Hộ nghèo */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Hộ nghèo</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority_detailed.ho_ngheo}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority_detailed: { ...scoreMappings.priority_detailed, ho_ngheo: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">đ</span>
                  </div>
                </div>

                {/* Cận nghèo */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Cận nghèo</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority_detailed.can_ngheo}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority_detailed: { ...scoreMappings.priority_detailed, can_ngheo: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">đ</span>
                  </div>
                </div>

                {/* Khuyết tật */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Khuyết tật</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority_detailed.khuyet_tat}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority_detailed: { ...scoreMappings.priority_detailed, khuyet_tat: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">đ</span>
                  </div>
                </div>

                {/* Con liệt sỹ */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Con liệt sỹ</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority_detailed.liet_sy}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority_detailed: { ...scoreMappings.priority_detailed, liet_sy: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">đ</span>
                  </div>
                </div>

                {/* Con thương binh */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Con thương binh</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority_detailed.thuong_binh}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority_detailed: { ...scoreMappings.priority_detailed, thuong_binh: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">đ</span>
                  </div>
                </div>

                {/* Lưu học sinh */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Lưu học sinh</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority_detailed.luu_hoc_sinh}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority_detailed: { ...scoreMappings.priority_detailed, luu_hoc_sinh: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">đ</span>
                  </div>
                </div>

                {/* Vùng sâu vùng xa */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Vùng sâu vùng xa</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority_detailed.vung_sau_xa}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority_detailed: { ...scoreMappings.priority_detailed, vung_sau_xa: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">đ</span>
                  </div>
                </div>

                {/* Hải đảo */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Hải đảo</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority_detailed.hai_dao}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority_detailed: { ...scoreMappings.priority_detailed, hai_dao: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">đ</span>
                  </div>
                </div>

                {/* Hoàn cảnh khó khăn */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Hoàn cảnh khó khăn</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority_detailed.hoan_canh_kho_khan}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority_detailed: { ...scoreMappings.priority_detailed, hoan_canh_kho_khan: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">đ</span>
                  </div>
                </div>

                {/* Giấy xác nhận ưu tiên khác */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-900">Giấy xác nhận khác</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scoreMappings.priority_detailed.giay_xac_nhan}
                      onChange={(e) =>
                        setScoreMappings({
                          ...scoreMappings,
                          priority_detailed: { ...scoreMappings.priority_detailed, giay_xac_nhan: parseFloat(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-50 outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-bold text-sm">đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Year Score Mapping */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">2</span>
                Điểm Khóa/Năm học (Thang 100)
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
                Điểm Học lực (Thang 100)
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
                  <p className="text-xs text-slate-500">Công thức: Điểm học lực × {scoreMappings.gpa.conversion_factor} (Áp dụng cho hệ 4.0)</p>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>Ví dụ:</strong> Điểm 3.5 sẽ được quy đổi thành {(3.5 * scoreMappings.gpa.conversion_factor).toFixed(0)} điểm
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900">Điểm tối thiểu (Lọc)</label>
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
                  <p className="text-xs text-slate-500">Dưới ngưỡng này sẽ bị loại, trạng thái: "Không đủ điều kiện"</p>
                  <div className="mt-2 p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-700">
                      <strong>⚠ Lưu ý:</strong> Điểm học lực &lt; {scoreMappings.gpa.min_gpa_filter} sẽ bị loại trực tiếp
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
                <p className="mt-2">Điểm = (Điểm Chính sách × Trọng số) + (Điểm Năm học × Trọng số) + (Điểm Học lực × Trọng số)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationSettings;

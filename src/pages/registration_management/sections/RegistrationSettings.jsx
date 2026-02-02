import { useState, useMemo } from "react";
import { Calendar, MapPin, BookOpen, Star, Info } from "lucide-react";

const RegistrationSettings = () => {
  const [settings, setSettings] = useState({
    year: { weight: 20, max_year: 5 },
    distance: { weight: 30, max_distance: 100 },
    gpa: { weight: 25, min_gpa: 2.0 },
    circumstance: { weight: 25, max_points: 20 }
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/scoring-weights', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data.value);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const updateSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const response = await fetch('/api/settings/scoring-weights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ scoringWeights: settings })
      });
      const data = await response.json();
      if (data.success) {
        alert('Cài đặt đã được cập nhật thành công!');
      } else {
        alert('Có lỗi xảy ra khi cập nhật cài đặt');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Có lỗi xảy ra khi cập nhật cài đặt');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSettingChange = (key, field, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: parseFloat(value) || 0
      }
    }));
  };

  // Fetch settings when component mounts
  useMemo(() => {
    fetchSettings();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Điều chỉnh thông số tính điểm</h3>
            <p className="text-slate-500">Thiết lập trọng số và ngưỡng cho hệ thống đánh giá hồ sơ đăng ký</p>
          </div>
          <button
            onClick={updateSettings}
            disabled={isLoadingSettings}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingSettings ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Năm học */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              Năm học (Year)
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trọng số (%)</label>
                <input
                  type="number"
                  value={settings.year.weight}
                  onChange={(e) => handleSettingChange('year', 'weight', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Năm tối đa</label>
                <input
                  type="number"
                  value={settings.year.max_year}
                  onChange={(e) => handleSettingChange('year', 'max_year', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Khoảng cách */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={20} className="text-green-600" />
              Khoảng cách (Distance)
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trọng số (%)</label>
                <input
                  type="number"
                  value={settings.distance.weight}
                  onChange={(e) => handleSettingChange('distance', 'weight', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Khoảng cách tối đa (km)</label>
                <input
                  type="number"
                  value={settings.distance.max_distance}
                  onChange={(e) => handleSettingChange('distance', 'max_distance', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* GPA */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen size={20} className="text-purple-600" />
              Điểm trung bình (GPA)
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trọng số (%)</label>
                <input
                  type="number"
                  value={settings.gpa.weight}
                  onChange={(e) => handleSettingChange('gpa', 'weight', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GPA tối thiểu</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.gpa.min_gpa}
                  onChange={(e) => handleSettingChange('gpa', 'min_gpa', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                  min="0"
                  max="4"
                />
              </div>
            </div>
          </div>

          {/* Hoàn cảnh */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Star size={20} className="text-amber-600" />
              Điểm ưu tiên (Circumstance)
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trọng số (%)</label>
                <input
                  type="number"
                  value={settings.circumstance.weight}
                  onChange={(e) => handleSettingChange('circumstance', 'weight', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Điểm tối đa</label>
                <input
                  type="number"
                  value={settings.circumstance.max_points}
                  onChange={(e) => handleSettingChange('circumstance', 'max_points', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-50 rounded-xl">
          <h5 className="font-bold text-slate-900 mb-2">Tổng trọng số: {Object.values(settings).reduce((sum, item) => sum + (item.weight || 0), 0)}%</h5>
          <p className="text-sm text-slate-600">Tổng trọng số phải bằng 100% để hệ thống hoạt động chính xác.</p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
          <div className="p-1 bg-blue-100 rounded text-blue-600 shrink-0">
            <Info size={14} />
          </div>
          <p className="text-sm text-blue-700 leading-tight">Các cài đặt này sẽ được áp dụng làm mặc định cho việc đánh giá hồ sơ đăng ký mới.</p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSettings;
import { Settings, Save } from "lucide-react";

const AssetSettings = ({ assets, onRefresh }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Cài đặt tài sản</h2>
          <p className="text-sm text-slate-500">
            Quản lý cấu hình và thiết lập cho tài sản
          </p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Cài đặt tài sản
          </h3>
          <p className="text-slate-500">
            Chức năng đang được phát triển...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssetSettings;

import React from "react";
import { Package } from "lucide-react";

/**
 * Asset Management Page
 * Quản lý cơ sở vật chất
 */
const AssetManagement = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Cơ sở vật chất</h1>
            <p className="text-sm text-slate-500 mt-1">
              Quản lý tài sản và thiết bị trong ký túc xá
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Trang Cơ sở vật chất
          </h3>
          <p className="text-slate-500">
            Chức năng đang được phát triển...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssetManagement;

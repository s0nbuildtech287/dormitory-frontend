import { useState } from "react";
import { Plus, Eye, Trash2, Package, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react";
import { usePagination } from "../../../hooks/usePagination.js";
import Pagination from "../../../components/common/Pagination.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import AddAssetModal from "./AddAssetModal.jsx";
import AssetDetailModal from "./AssetDetailModal.jsx";
import { deleteAsset } from "../../../api/apiAsset.js";

const AssetList = ({ assets, isLoadingAssets, onRefresh }) => {
  // Modal states
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Ensure assets is always an array
  const safeAssets = Array.isArray(assets) ? assets : [];

  // Assets are already grouped by asset_code from API
  const summaryData = safeAssets;

  // Calculate statistics from summary data
  const totalAssets = summaryData.reduce((sum, a) => sum + (parseInt(a.total_quantity) || 0), 0);
  const inUse = summaryData.reduce((sum, a) => sum + (parseInt(a.in_use) || 0), 0);
  const available = summaryData.reduce((sum, a) => sum + (parseInt(a.in_stock) || 0), 0);
  const damaged = summaryData.reduce((sum, a) => sum + (parseInt(a.damaged) || 0), 0);

  const stats = [
    {
      label: "Tổng tài sản",
      value: totalAssets,
      icon: Package,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Đang sử dụng",
      value: inUse,
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      label: "Sẵn sàng (Kho)",
      value: available,
      icon: TrendingUp,
      color: "indigo",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
    },
    {
      label: "Hư hỏng / Bảo trì",
      value: damaged,
      icon: AlertTriangle,
      color: "red",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
  ];

  // Pagination
  const pagination = usePagination(summaryData, 10);
  const { currentItems, totalItems } = pagination;

  // Add STT to each item
  const itemsWithSTT = currentItems.map((item, index) => ({
    ...item,
    stt: index + 1,
  }));

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;

    try {
      setDeleteLoading(true);
      setDeleteError("");
      await deleteAsset(assetToDelete.id);
      await onRefresh();
      setAssetToDelete(null);
    } catch (error) {
      console.error("Error deleting asset:", error);
      setDeleteError(error.message || "Không thể xóa tài sản. Vui lòng thử lại.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon size={20} className={stat.textColor} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300 flex items-center justify-between">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider text-left">
            Bảng thông tin cơ sở vật chất ({totalItems} loại tài sản)
          </h3>

          <button
            onClick={() => setShowAddAssetModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-sm"
          >
            <Plus size={16} /> Thêm mới
          </button>
        </div>

        <DataTable
          columns={[
            {
              header: "STT",
              align: "center",
              width: "w-[8%]",
              accessor: (asset) => (
                <span className="text-xs font-semibold text-slate-900">
                  {asset.stt}
                </span>
              ),
            },
            {
              header: "Tên tài sản",
              align: "center",
              width: "w-[20%]",
              accessor: (asset) => (
                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-900">{asset.name}</div>
                  <div className="text-xs text-slate-500">{asset.category_name}</div>
                </div>
              ),
            },
            {
              header: "Tổng số lượng",
              align: "center",
              width: "w-[12%]",
              accessor: (asset) => (
                <span className="text-xs font-bold text-slate-900">
                  {asset.total_quantity} {asset.unit}
                </span>
              ),
            },
            {
              header: "Sử dụng",
              align: "center",
              width: "w-[12%]",
              accessor: (asset) => (
                <span className="text-xs font-semibold text-green-700">
                  {asset.in_use} {asset.unit}
                </span>
              ),
            },
            {
              header: "Tồn kho",
              align: "center",
              width: "w-[12%]",
              accessor: (asset) => (
                <span className="text-xs font-semibold text-blue-700">
                  {asset.in_stock} {asset.unit}
                </span>
              ),
            },
            {
              header: "Ngày mua",
              align: "center",
              width: "w-[12%]",
              accessor: (asset) => (
                <span className="text-xs text-slate-700">{formatDate(asset.purchase_date)}</span>
              ),
            },
            {
              header: "Giá tiền / cái",
              align: "center",
              width: "w-[14%]",
              accessor: (asset) => (
                <span className="text-xs font-semibold text-slate-900">
                  {formatCurrency(asset.purchase_price)} đ
                </span>
              ),
            },
            {
              header: "Thao tác",
              align: "center",
              width: "w-[10%]",
              accessor: (asset) => (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      // Show detail modal with summary info
                      setSelectedAsset(asset);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteError("");
                      setAssetToDelete(asset);
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ),
            },
          ]}
          data={itemsWithSTT}
          keyExtractor={(asset) => asset.asset_code}
          loading={isLoadingAssets}
          emptyState={{
            icon: Package,
            title: "Chưa có tài sản nào",
            description: "Hãy thêm tài sản để bắt đầu",
          }}
        />
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} />

      {/* MODALS */}
      <AddAssetModal
        isOpen={showAddAssetModal}
        onClose={() => setShowAddAssetModal(false)}
        onSuccess={() => {
          setShowAddAssetModal(false);
          onRefresh();
        }}
      />

      <AssetDetailModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onRefresh={onRefresh}
      />

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!assetToDelete}
        onClose={() => {
          setAssetToDelete(null);
          setDeleteError("");
        }}
        onConfirm={handleDeleteConfirm}
        title="Xóa tài sản"
        message={`Bạn có chắc chắn muốn xóa tài sản ${assetToDelete?.name}? Hành động này không thể hoàn tác.`}
        confirmText="Xóa tài sản"
        icon={Trash2}
        iconBgColor="bg-red-50"
        iconColor="text-red-600"
        confirmColor="bg-red-600 hover:bg-red-700 focus:ring-red-200"
        isLoading={deleteLoading}
      >
        {deleteError && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2 border border-red-200">
            {deleteError}
          </p>
        )}
      </ConfirmModal>
    </div>
  );
};

export default AssetList;

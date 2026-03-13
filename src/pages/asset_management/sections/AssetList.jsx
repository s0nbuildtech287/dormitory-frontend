import { useState } from "react";
import { Plus, Eye, Trash2, Package, MapPin, AlertCircle, X } from "lucide-react";
import { usePagination } from "../../../hooks/usePagination.js";
import { useSelection } from "../../../hooks/useSelection.js";
import Pagination from "../../../components/common/Pagination.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import FilterBar from "../../../components/common/FilterBar.jsx";
import AddAssetModal from "./AddAssetModal.jsx";
import AssetDetailModal from "./AssetDetailModal.jsx";
import { deleteAsset } from "../../../api/apiAsset.js";

const AssetList = ({ assets, isLoadingAssets, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCondition, setFilterCondition] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All");

  // Modal states
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Ensure assets is always an array
  const safeAssets = Array.isArray(assets) ? assets : [];

  // Filter assets
  const filteredAssets = safeAssets.filter((asset) => {
    const matchesSearch =
      searchTerm === "" ||
      asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.asset_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "All" || asset.category_name === filterCategory;

    const matchesStatus =
      filterStatus === "All" || asset.status === filterStatus;

    const matchesCondition =
      filterCondition === "All" || asset.condition === filterCondition;

    const matchesLocation =
      filterLocation === "All" ||
      (filterLocation === "Kho" && !asset.room_id) ||
      (filterLocation === "Phòng" && asset.room_id);

    return matchesSearch && matchesCategory && matchesStatus && matchesCondition && matchesLocation;
  });

  // Get unique values for filters
  const categories = ["All", ...new Set(safeAssets.map((a) => a.category_name).filter(Boolean))];

  // Pagination
  const pagination = usePagination(filteredAssets, 10);
  const { currentItems, totalItems } = pagination;

  // Selection
  const {
    selectedItems: selectedAssets,
    showCheckboxColumn,
    toggleSelectionMode: handleToggleCheckbox,
    handleSelectItem: handleSelectAsset,
    handleSelectAll,
    clearSelection,
  } = useSelection(filteredAssets.map((a) => a.id));

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
      setDeleteError(
        error.message || "Không thể xóa tài sản. Vui lòng thử lại."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Đang sử dụng": "bg-green-100 text-green-700",
      "Sẵn sàng": "bg-blue-100 text-blue-700",
      "Hư hỏng": "bg-red-100 text-red-700",
      "Đang bảo trì": "bg-yellow-100 text-yellow-700",
      "Thanh lý": "bg-gray-100 text-gray-700",
    };
    return statusConfig[status] || "bg-gray-100 text-gray-700";
  };

  const getConditionBadge = (condition) => {
    const conditionConfig = {
      "Mới": "bg-emerald-100 text-emerald-700",
      "Tốt": "bg-green-100 text-green-700",
      "Khá": "bg-blue-100 text-blue-700",
      "Trung bình": "bg-yellow-100 text-yellow-700",
      "Kém": "bg-red-100 text-red-700",
    };
    return conditionConfig[condition] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filters */}
      <FilterBar
        title="Bộ lọc tài sản"
        filterContainerClass="grid grid-cols-7 gap-4 items-center"
        search={{
          placeholder: "Tìm theo tên, mã tài sản...",
          value: searchTerm,
          onChange: setSearchTerm,
          className: "col-span-2 relative",
        }}
        filters={[
          {
            value: filterCategory,
            onChange: setFilterCategory,
            className: "col-span-1",
            options: categories.map((cat) => ({ value: cat, label: cat === "All" ? "Tất cả danh mục" : cat })),
          },
          {
            value: filterStatus,
            onChange: setFilterStatus,
            className: "col-span-1",
            options: [
              { value: "All", label: "Tất cả trạng thái" },
              { value: "Đang sử dụng", label: "Đang sử dụng" },
              { value: "Sẵn sàng", label: "Sẵn sàng" },
              { value: "Hư hỏng", label: "Hư hỏng" },
              { value: "Đang bảo trì", label: "Đang bảo trì" },
              { value: "Thanh lý", label: "Thanh lý" },
            ],
          },
          {
            value: filterCondition,
            onChange: setFilterCondition,
            className: "col-span-1",
            options: [
              { value: "All", label: "Tất cả tình trạng" },
              { value: "Mới", label: "Mới" },
              { value: "Tốt", label: "Tốt" },
              { value: "Khá", label: "Khá" },
              { value: "Trung bình", label: "Trung bình" },
              { value: "Kém", label: "Kém" },
            ],
          },
          {
            value: filterLocation,
            onChange: setFilterLocation,
            className: "col-span-1",
            options: [
              { value: "All", label: "Tất cả vị trí" },
              { value: "Kho", label: "Kho" },
              { value: "Phòng", label: "Phòng" },
            ],
          },
        ]}
        hasActiveFilter={
          searchTerm !== "" ||
          filterCategory !== "All" ||
          filterStatus !== "All" ||
          filterCondition !== "All" ||
          filterLocation !== "All"
        }
        onReset={() => {
          setSearchTerm("");
          setFilterCategory("All");
          setFilterStatus("All");
          setFilterCondition("All");
          setFilterLocation("All");
        }}
        customFilters={
          <button
            onClick={() => setShowAddAssetModal(true)}
            className="flex items-center justify-center col-span-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-sm"
          >
            <Plus size={16} className="mr-1 flex-shrink-0" /> Thêm mới
          </button>
        }
      />

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300 flex items-center justify-between">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider text-left">
            Bảng thông tin cơ sở vật chất ({totalItems} kết quả)
          </h3>

          <div className="flex items-center gap-2">
            {/* Toggle Checkbox Column Button */}
            <button
              onClick={handleToggleCheckbox}
              className={`px-3 py-2 border text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
                showCheckboxColumn
                  ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Package size={13} /> {showCheckboxColumn ? "Tắt chế độ chọn" : "Chọn nhiều"}
            </button>
          </div>
        </div>

        <DataTable
          columns={[
            {
              header: "Mã tài sản",
              align: "center",
              width: showCheckboxColumn ? "w-[10%]" : "w-[11%]",
              accessor: (asset) => (
                <span className="text-xs font-mono font-semibold text-slate-900">
                  {asset.asset_code}
                </span>
              ),
            },
            {
              header: "Tên tài sản",
              align: "left",
              width: "w-[18%]",
              accessor: (asset) => (
                <div>
                  <div className="text-xs font-semibold text-slate-900">{asset.name}</div>
                  <div className="text-[10px] text-slate-500">{asset.category_name}</div>
                </div>
              ),
            },
            {
              header: "Số lượng",
              align: "center",
              width: "w-[10%]",
              accessor: (asset) => (
                <span className="text-xs font-semibold text-slate-900">
                  {asset.quantity} {asset.unit}
                </span>
              ),
            },
            {
              header: "Vị trí",
              align: "center",
              width: "w-[15%]",
              accessor: (asset) => (
                <div className="flex items-center justify-center gap-1">
                  <MapPin size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-700">
                    {asset.room_id ? asset.location : "Kho tổng"}
                  </span>
                </div>
              ),
            },
            {
              header: "Trạng thái",
              align: "center",
              width: "w-[12%]",
              accessor: (asset) => (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight ${getStatusBadge(
                    asset.status
                  )}`}
                >
                  {asset.status}
                </span>
              ),
            },
            {
              header: "Tình trạng",
              align: "center",
              width: "w-[12%]",
              accessor: (asset) => (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight ${getConditionBadge(
                    asset.condition
                  )}`}
                >
                  {asset.condition}
                </span>
              ),
            },
            {
              header: "Giá trị hiện tại",
              align: "right",
              width: "w-[12%]",
              accessor: (asset) => (
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-900">
                    {new Intl.NumberFormat("vi-VN").format(asset.current_value || 0)} đ
                  </div>
                  {asset.purchase_price && (
                    <div className="text-[10px] text-slate-500">
                      Mua: {new Intl.NumberFormat("vi-VN").format(asset.purchase_price)} đ
                    </div>
                  )}
                </div>
              ),
            },
            {
              header: "Hành động",
              align: "center",
              width: "w-[10%]",
              accessor: (asset) => (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedAsset(asset)}
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
          data={currentItems}
          keyExtractor={(asset) => asset.id}
          loading={isLoadingAssets}
          emptyState={{
            icon: Package,
            title: "Chưa có tài sản nào",
            description: "Hãy thêm tài sản để bắt đầu",
          }}
          selection={{
            selectedItems: selectedAssets,
            showCheckboxColumn,
            onSelectAll: handleSelectAll,
            onSelectRow: handleSelectAsset,
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
        message={`Bạn có chắc chắn muốn xóa tài sản ${assetToDelete?.name} (${assetToDelete?.asset_code})? Hành động này không thể hoàn tác.`}
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

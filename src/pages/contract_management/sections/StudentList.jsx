import React, { useState, useEffect } from "react";
import { Search, Eye, Clock, CheckCircle2, XCircle, FileX, Trash2, FileText, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Mail, Send, Square, CheckSquare, RotateCcw } from "lucide-react";
import { usePagination } from "../../../hooks/usePagination.js";
import { useSelection } from "../../../hooks/useSelection.js";
import Pagination from "../../../components/common/Pagination.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import FilterBar from "../../../components/common/FilterBar.jsx";
import EmailComposeModal, { EMAIL_TEMPLATES } from "../../../components/common/EmailComposeModal.jsx";
import { revertContract } from "../../../api/apiContract.js";

const STATUS_CONFIG = {
  Pending: { label: "Chờ gán phòng", cls: "bg-amber-100 text-amber-700", icon: <Clock size={11} /> },
  Active: { label: "Đang nội trú", cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={11} /> },
  Expired: { label: "Hết hạn", cls: "bg-slate-100 text-slate-600", icon: <FileX size={11} /> },
  Terminated: { label: "Chấm dứt", cls: "bg-rose-100 text-rose-700", icon: <XCircle size={11} /> },
};

const StudentList = ({ contracts = [], loading, onViewDetail, onRefresh, onDeleteContract, onAutoAssign, initialFilter }) => {
  const [searchTerm, setSearchTerm] = useState(initialFilter?.searchTerm || "");
  const [filterStatus, setFilterStatus] = useState(initialFilter?.filterStatus || "All");
  const [filterGender, setFilterGender] = useState(initialFilter?.filterGender || "All");
  const [dateFrom, setDateFrom] = useState(initialFilter?.dateFrom || "");
  const [dateTo, setDateTo] = useState(initialFilter?.dateTo || "");
  // Track email sent locally (chưa dùng backend)
  const [emailSentSet, setEmailSentSet] = useState(new Set());

  // Apply initial filter when it changes
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.searchTerm !== undefined) setSearchTerm(initialFilter.searchTerm);
      if (initialFilter.filterStatus !== undefined) setFilterStatus(initialFilter.filterStatus);
      if (initialFilter.filterGender !== undefined) setFilterGender(initialFilter.filterGender);
      if (initialFilter.dateFrom !== undefined) setDateFrom(initialFilter.dateFrom);
      if (initialFilter.dateTo !== undefined) setDateTo(initialFilter.dateTo);
    }
  }, [initialFilter]);

  const markEmailSent = (id) => setEmailSentSet((prev) => new Set([...prev, id]));

  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [bulkDeleteContracts, setBulkDeleteContracts] = useState([]);
  const [composeEmail, setComposeEmail] = useState(null);
  const [revertTarget, setRevertTarget] = useState(null); // contract to revert
  const [revertLoading, setRevertLoading] = useState(false);

  const filtered = contracts.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = (c.student_name?.toLowerCase().includes(q) ?? false) || (c.snapshot_student_id?.toLowerCase().includes(q) ?? false) || (c.contract_number?.toLowerCase().includes(q) ?? false);
    const matchStatus =
      filterStatus === "All" ? true :
        filterStatus === "Pending" ? c.status === "Pending" :
          filterStatus === "Active" ? c.status === "Active" :
            filterStatus === "Expired" ? c.status === "Expired" :
              filterStatus === "Terminated" ? c.status === "Terminated" :
                filterStatus === "deposit_paid" ? !!c.deposit_paid :
                  filterStatus === "deposit_unpaid" ? !c.deposit_paid :
                    filterStatus === "hardcopy_received" ? !!c.hard_copy_received :
                      filterStatus === "hardcopy_not" ? !c.hard_copy_received :
                        true;
    const matchGender = filterGender === "All" || c.snapshot_gender === filterGender;
    
    // Lọc theo ngày đăng ký hợp đồng (created_at)
    const contractDate = c.created_at ? new Date(c.created_at) : null;
    const matchDateFrom = !dateFrom || (contractDate && contractDate >= new Date(dateFrom));
    const matchDateTo = !dateTo || (contractDate && contractDate <= new Date(dateTo + "T23:59:59"));
    
    return matchSearch && matchStatus && matchGender && matchDateFrom && matchDateTo;
  });

  // Hooks
  const pagination = usePagination(filtered, 10);
  const { currentItems, totalItems } = pagination;
  const { 
    selectedItems: selectedContracts, 
    showCheckboxColumn, 
    toggleSelectionMode: handleToggleCheckbox, 
    handleSelectItem: handleSelectContract, 
    handleSelectAll, 
    clearSelection 
  } = useSelection(filtered.map(c => c.id));

  const handleBulkEmail = () => {
    if (selectedContracts.size === 0) {
      alert("Vui lòng chọn ít nhất một hợp đồng");
      return;
    }
    setShowBulkEmailModal(true);
  };

  const handleConfirmBulkEmail = () => {
    const selected = contracts.filter(c => selectedContracts.has(c.id));
    const emails = [...new Set(selected.map(c => c.email || c.student_email).filter(Boolean))];
    setShowBulkEmailModal(false);
    setComposeEmail({
      to: emails,
      subject: "",
      body: "",
      recipientCount: selected.length,
    });
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    pagination.goToPage(1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setFilterGender("All");
    setDateFrom("");
    setDateTo("");
    pagination.goToPage(1);
  };

  const hasActiveFilter = searchTerm || filterStatus !== "All" || filterGender !== "All" || dateFrom || dateTo;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filters */}
      <FilterBar
        title="Bộ lọc hợp đồng"
        search={{
          placeholder: "Tìm tên, mã SV, số HĐ...",
          value: searchTerm,
          onChange: (val) => handleFilterChange(setSearchTerm, val)
        }}
        customFilters={
          <>
            {/* Trạng thái (gộp cọc + bản cứng) */}
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
              className="flex-[2] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
            >
              <option value="All">Tất cả trạng thái</option>
              <optgroup label="— Trạng thái hợp đồng">
                <option value="Pending">Chờ gán phòng</option>
                <option value="Active">Đang nội trú</option>
                <option value="Expired">Hết hạn</option>
                <option value="Terminated">Chấm dứt</option>
              </optgroup>
              <optgroup label="— Tiền cọc">
                <option value="deposit_paid">Đã cọc</option>
                <option value="deposit_unpaid">Chưa cọc</option>
              </optgroup>
              <optgroup label="— Bản cứng hợp đồng">
                <option value="hardcopy_received">Đã có bản cứng</option>
                <option value="hardcopy_not">Chưa có bản cứng</option>
              </optgroup>
            </select>

            {/* Giới tính */}
            <select
              value={filterGender}
              onChange={(e) => handleFilterChange(setFilterGender, e.target.value)}
              className="flex-[2] text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
            >
              <option value="All">Tất cả giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>

            {/* Ngày từ */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              className="flex-1 text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
              title="Ngày đăng ký HĐ từ"
            />

            {/* Ngày đến */}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              className="flex-1 text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
              title="Ngày đăng ký HĐ đến"
            />
          </>
        }
        hasActiveFilter={hasActiveFilter}
        onReset={handleReset}
        actionButtons={
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-200 transition-colors"
            >
              Áp dụng
            </button>
            <button
              onClick={onAutoAssign}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-200 transition-colors"
            >
              Gán tự động
            </button>
          </>
        }
      />



      {/* Table - giống room_management */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300 flex items-center justify-between">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider text-left">Bảng hợp đồng sinh viên ({totalItems} kết quả)</h3>
          
          <div className="flex items-center gap-2">
            {/* Toggle Checkbox Column Button */}
            <button
              onClick={handleToggleCheckbox}
              className={`px-3 py-2 border text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
                showCheckboxColumn 
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {showCheckboxColumn ? <CheckSquare size={13} /> : <Square size={13} />} {showCheckboxColumn ? 'Tắt chế độ chọn' : 'Chọn nhiều'}
            </button>
          </div>
        </div>
        <DataTable
          columns={[
            {
              header: "Số / Mã HĐ",
              align: "center",
              width: showCheckboxColumn ? "w-[10%]" : "w-[11%]",
              accessor: (c) =>
                c.contract_number ? (
                  <span className="font-bold text-blue-700 text-xs font-mono">{c.contract_number}</span>
                ) : (
                  <span className="font-semibold text-slate-400 italic text-xs">Chưa có số</span>
                ),
            },
            {
              header: "Sinh viên",
              align: "center",
              width: "w-[18%]",
              accessor: (c) => (
                <>
                  <p className="font-semibold text-slate-900 text-xs truncate max-w-[150px] mx-auto">
                    {c.student_name || "—"}
                  </p>
                  {c.snapshot_student_id && (
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate max-w-[150px] mx-auto">
                      {c.snapshot_student_id}
                    </p>
                  )}
                </>
              ),
            },
            {
              header: "Phòng",
              align: "center",
              width: "w-[10%]",
              accessor: (c) =>
                c.room_number ? (
                  <span className="font-semibold text-blue-700 text-xs">
                    {c.room_number}
                    {c.building ? ` (${c.building})` : ""}
                  </span>
                ) : (
                  <span className="text-amber-600 text-xs font-semibold italic">Chưa có phòng</span>
                ),
            },
            {
              header: "Trạng thái",
              align: "center",
              width: "w-[20%]",
              accessor: (c) => {
                const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.Active;
                return (
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${statusCfg.cls}`}>
                      {statusCfg.icon} {statusCfg.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${c.deposit_paid ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {c.deposit_paid ? "Đã cọc" : "Chưa cọc"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${c.hard_copy_received ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {c.hard_copy_received ? "Đã bản cứng" : "Chưa bản cứng"}
                    </span>
                  </div>
                );
              },
            },
            {
              header: "Thời hạn",
              align: "center",
              width: "w-[16%]",
              accessor: (c) =>
                c.start_date ? (
                  <span className="text-xs text-slate-700 font-semibold whitespace-nowrap">
                    {new Date(c.start_date).toLocaleDateString("vi-VN")} → {c.end_date ? new Date(c.end_date).toLocaleDateString("vi-VN") : "—"}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic">Chưa xác định</span>
                ),
            },
            {
              header: "Thao tác",
              align: "center",
              width: "w-[12%]",
              accessor: (c) => {
                const emailSent = emailSentSet.has(c.id) || !!c.email_sent_at;
                const isPending = c.status === "Pending";
                const canRevert = isPending && !c.deposit_paid && !c.hard_copy_received;
                return (
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => onViewDetail(c.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={isPending ? "Gán phòng" : "Xem chi tiết"}>
                      <Eye size={15} />
                    </button>
                    {canRevert && (
                      <button
                        onClick={() => setRevertTarget(c)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Hoàn tác – trả hồ sơ về danh sách đăng ký"
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (showCheckboxColumn && selectedContracts.size > 0) {
                          setShowBulkEmailModal(true);
                        } else {
                          setComposeEmail({
                            to: c.email || c.student_email || "",
                            subject: "",
                            body: "",
                          });
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${emailSent ? "text-slate-800 hover:bg-slate-100" : "text-blue-500 hover:bg-blue-50"}`}
                      title={showCheckboxColumn && selectedContracts.size > 0 ? "Gửi email hàng loạt" : emailSent ? `Đã gửi email${c.email_sent_at ? " " + new Date(c.email_sent_at).toLocaleDateString("vi-VN") : ""}` : "Gửi email thông báo"}
                    >
                      <Send size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (showCheckboxColumn && selectedContracts.size > 0) {
                          setBulkDeleteContracts([...selectedContracts]);
                        } else {
                          onDeleteContract(c.id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={showCheckboxColumn && selectedContracts.size > 0 ? "Xóa hàng loạt" : "Xóa hợp đồng"}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              },
            },
          ]}
          data={currentItems}
          keyExtractor={(c) => c.id}
          loading={loading}
          emptyState={{ icon: FileText, title: "Không có hợp đồng nào", description: "Thử thay đổi bộ lọc để tìm kiếm" }}
          selection={{
            selectedItems: selectedContracts,
            showCheckboxColumn,
            onSelectAll: handleSelectAll,
            onSelectRow: handleSelectContract,
          }}
          rowClassName={(c) => c.status === "Pending" ? "bg-amber-50/30" : ""}
        />
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} />

      {/* Bulk Email Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkEmailModal}
        onClose={() => setShowBulkEmailModal(false)}
        onConfirm={handleConfirmBulkEmail}
        title="Xác nhận gửi email hàng loạt"
        confirmText="Gửi email"
        icon={Send}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
        confirmColor="bg-amber-600 hover:bg-amber-700 focus:ring-amber-200"
      >
        <p className="text-sm text-slate-600">
          Số hợp đồng được chọn: <span className="font-bold text-slate-900">{selectedContracts.size}</span>
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Số email sẽ gửi: <span className="font-bold text-slate-900">
            {[...new Set(
              contracts
                .filter(c => selectedContracts.has(c.id))
                .map(c => c.student_email || c.email)
                .filter(Boolean)
            )].length} email
          </span>
        </p>
      </ConfirmModal>

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteContracts.length > 0}
        onClose={() => setBulkDeleteContracts([])}
        onConfirm={() => {
          bulkDeleteContracts.forEach(id => onDeleteContract(id));
          setBulkDeleteContracts([]);
          clearSelection();
        }}
        title="Xóa hàng loạt hợp đồng?"
        confirmText="Xóa tất cả"
        icon={Trash2}
        iconBgColor="bg-red-50"
        iconColor="text-red-600"
        confirmColor="bg-red-600 hover:bg-red-700 focus:ring-red-200"
      >
        <p className="text-sm text-slate-600">
          Số hợp đồng sẽ xóa: <span className="font-bold text-slate-900">{bulkDeleteContracts.length}</span>
        </p>
      </ConfirmModal>

      {/* Revert Contract Modal */}
      <ConfirmModal
        isOpen={!!revertTarget}
        onClose={() => setRevertTarget(null)}
        onConfirm={async () => {
          if (!revertTarget) return;
          setRevertLoading(true);
          try {
            await revertContract(revertTarget.id);
            setRevertTarget(null);
            if (onRefresh) onRefresh();
          } catch (err) {
            alert(err.message || "Hoàn tác thất bại");
          } finally {
            setRevertLoading(false);
          }
        }}
        title="Hoàn tác hợp đồng?"
        confirmText="Hoàn tác"
        icon={RotateCcw}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
        confirmColor="bg-amber-600 hover:bg-amber-700 focus:ring-amber-200"
        isLoading={revertLoading}
      >
        <p className="text-sm text-slate-600">
          Hợp đồng của <span className="font-bold text-slate-900">{revertTarget?.student_name}</span> sẽ bị xóa và hồ sơ đăng ký sẽ trở về trạng thái <span className="font-bold text-amber-700">Chờ duyệt</span>.
        </p>
        <p className="text-xs text-slate-400 mt-1">Tài khoản sinh viên cũng sẽ bị xóa. Hành động này không thể hoàn tác.</p>
      </ConfirmModal>

      <EmailComposeModal
        isOpen={!!composeEmail}
        onClose={() => { setComposeEmail(null); clearSelection(); }}
        defaultTo={composeEmail?.to}
        defaultSubject={composeEmail?.subject}
        defaultBody={composeEmail?.body}
        recipientCount={composeEmail?.recipientCount > 1 ? composeEmail.recipientCount : undefined}
        templates={[
          EMAIL_TEMPLATES.CONTRACT_CREATED(),
          EMAIL_TEMPLATES.DEPOSIT_CONFIRMED(),
          EMAIL_TEMPLATES.HARDCOPY_CONFIRMED(),
          EMAIL_TEMPLATES.APPROVED_REGISTRATION(),
        ]}
        onSend={({ to, subject, body }) => {
          console.log("Gửi email:", { to, subject, body });
        }}
      />
    </div>
  );
};

export default StudentList;

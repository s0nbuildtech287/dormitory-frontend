import { useState, useEffect } from "react";
import { Search, Plus, Download, Printer, Send, CreditCard, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Users, X, ArrowRight, Trash2, AlertTriangle, Ban, Square, CheckSquare } from "lucide-react";
import { getInvoices, deleteInvoice } from "../../../api/apiInvoice.js";
import { getRoomById } from "../../../api/apiRoom.js";
import { usePagination } from "../../../hooks/usePagination.js";
import { useSelection } from "../../../hooks/useSelection.js";
import Pagination from "../../../components/common/Pagination.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import FilterBar from "../../../components/common/FilterBar.jsx";
import InvoiceDetailModal from "./InvoiceDetailModal.jsx";
import CreateInvoiceModal from "./CreateInvoiceModal.jsx";
import EmailComposeModal from "../../../components/common/EmailComposeModal.jsx";
import AnomalyModal from "./AnomalyModal.jsx";
import useBuildingDisplayNames from "../../../hooks/useBuildingDisplayNames.js";
import ModalPortal from "../../../components/ModalPortal.jsx";

const BillList = ({ bills, setBills, onNavigateToContract, initialInvoiceFilter, onNavigateToNotification }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterBuilding, setFilterBuilding] = useState("All");
  const [loading, setLoading] = useState(false);
  const [selectedRoomStudents, setSelectedRoomStudents] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [highlightedInvoice, setHighlightedInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteWarning, setDeleteWarning] = useState(null);
  // Ẩn hóa đơn tháng trước đã thanh toán (mặc định bật)
  const [hidePastPaid, setHidePastPaid] = useState(true);
  
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [bulkDeleteInvoices, setBulkDeleteInvoices] = useState([]);
  const [composeEmail, setComposeEmail] = useState(null);
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);
  const { getBuildingLabel, getRoomLabel } = useBuildingDisplayNames();

  const uniqueBuildings = [...new Set((Array.isArray(bills) ? bills : []).map((bill) => bill.building).filter(Boolean))].sort();

  // Fetch invoices from API
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Apply initial filter when provided
  useEffect(() => {
    if (initialInvoiceFilter?.searchTerm) {
      setSearchTerm(initialInvoiceFilter.searchTerm);
      setHighlightedInvoice(initialInvoiceFilter.searchTerm);

      // Scroll to highlighted row after a short delay
      setTimeout(() => {
        const highlightedRow = document.querySelector('.bg-yellow-100');
        if (highlightedRow) {
          highlightedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightedInvoice(null), 3000);
    }
  }, [initialInvoiceFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      console.log("Fetching invoices...");
      const response = await getInvoices();
      console.log("Invoice response:", response);
      if (response.success) {
        console.log("Invoices data:", response.data);
        setBills(response.data || []);
      } else {
        console.error("Response not successful:", response);
        setBills([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowStudents = async (bill) => {
    try {
      const response = await getRoomById(bill.room_id);
      if (response.success) {
        setSelectedRoomStudents({
          ...response.data,
          room_number: bill.room_number,
          building: bill.building
        });
      }
    } catch (error) {
      console.error("Error fetching room students:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteInvoice(invoiceToDelete.id);
      setInvoiceToDelete(null);
      fetchInvoices(); // Refresh list
    } catch (err) {
      setDeleteError(err.message || "Xóa hóa đơn thất bại, vui lòng thử lại.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handlers deleted in favor of useSelection hook

  // Handle bulk email
  const handleBulkEmail = () => {
    if (selectedInvoices.size === 0) {
      alert("Vui lòng chọn ít nhất một hóa đơn");
      return;
    }
    setShowBulkEmailModal(true);
  };

  const handleConfirmBulkEmail = () => {
    const selectedBills = safeBills.filter(bill => selectedInvoices.has(bill.id));
    const emails = [...new Set(
      selectedBills
        .map(bill => bill.student_emails)
        .filter(Boolean)
        .flatMap(e => e.split(',').map(x => x.trim()))
    )];
    setShowBulkEmailModal(false);
    setComposeEmail({
      to: emails,
      subject: "Nhắc nhở thanh toán hóa đơn",
      body: "",
      recipientCount: selectedBills.length,
    });
  };

  // Ensure bills is always an array
  const safeBills = Array.isArray(bills) ? bills : [];

  // Tháng trước YYYY-MM: hóa đơn từ tháng này trở đi vẫn hiện (dù đã TT)
  // Ví dụ: đang tháng 3 → prevYearMonth = "2026-02" → tháng 2 vẫn hiện, tháng 1 trở về ẩn
  const prevYearMonth = (() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prev.getFullYear()}-${(prev.getMonth() + 1).toString().padStart(2, '0')}`;
  })();

  const filteredBills = safeBills.filter((bill) => {
    const matchesSearch =
      bill.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.student_names?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || bill.status === filterStatus;
    const matchesBuilding = filterBuilding === "All" || bill.building === filterBuilding;
    const matchesMonth = filterMonth === "All" || (() => {
      const bm = bill.billing_month || '';
      if (!bm) return false;
      // Luôn parse qua Date() local để tránh timezone shift
      // Nếu là "YYYY-MM-DD", thêm T12:00:00 để tránh UTC midnight bị lệch ngày
      const dateStr = bm.includes('T') ? bm : bm.substring(0, 10) + 'T12:00:00';
      const d = new Date(dateStr);
      const billYearMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      return billYearMonth === filterMonth;
    })();
    // Ẩn hóa đơn tháng trước & đã thanh toán nếu toggle bật
    // billing_month từ PG có thể là "YYYY-MM-DD" hoặc UTC ISO "2026-01-31T17:00:00.000Z"
    // (pg driver serialize DATE -> Date object -> UTC ISO, cần dùng local getMonth để đúng timezone)
    const matchesHidePastPaid = !hidePastPaid || (() => {
      const bm = bill.billing_month || '';
      let billYearMonth;
      if (bm.includes('T')) {
        // UTC ISO timestamp → dùng local Date methods để ra đúng tháng theo múi giờ browser
        const d = new Date(bm);
        billYearMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      } else {
        // Date string "YYYY-MM-DD" → lấy trực tiếp không qua Date() để tránh TZ shift
        billYearMonth = bm.substring(0, 7);
      }
      return billYearMonth >= prevYearMonth || bill.status !== "Đã thanh toán";
    })();
    return matchesSearch && matchesStatus && matchesBuilding && matchesMonth && matchesHidePastPaid;
  });

  // Hooks
  const pagination = usePagination(filteredBills, 10);
  const { currentItems, totalItems } = pagination;
  const { 
    selectedItems: selectedInvoices, 
    showCheckboxColumn, 
    toggleSelectionMode: handleToggleCheckbox, 
    handleSelectItem: handleSelectInvoice, 
    handleSelectAll, 
    clearSelection 
  } = useSelection(filteredBills.map(b => b.id));

  const handleFilterChange = (setter, value) => {
    setter(value);
    pagination.goToPage(1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setFilterMonth("All");
    setFilterBuilding("All");
    setHidePastPaid(true);
    pagination.goToPage(1);
  };

  const hasActiveFilter = searchTerm || filterStatus !== "All" || filterMonth !== "All" || filterBuilding !== "All" || !hidePastPaid;

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filters */}
      <FilterBar
        title="Bộ lọc hóa đơn"
        search={{
          placeholder: "Tìm số phòng, mã hóa đơn, tên sinh viên...",
          value: searchTerm,
          onChange: (val) => handleFilterChange(setSearchTerm, val)
        }}
        filters={[
          {
            value: filterBuilding,
            onChange: (val) => handleFilterChange(setFilterBuilding, val),
            options: [
              { value: "All", label: "Tất cả tòa" },
              ...uniqueBuildings.map((building) => ({ value: building, label: getBuildingLabel(building) })),
            ]
          },
          {
            value: filterStatus,
            onChange: (val) => handleFilterChange(setFilterStatus, val),
            options: [
              { value: "All", label: "Tất cả trạng thái" },
              { value: "Đã thanh toán", label: "Đã thanh toán" },
              { value: "Chưa thanh toán", label: "Chưa thanh toán" },
              { value: "Quá hạn", label: "Quá hạn" },
            ]
          },
          {
            value: filterMonth,
            onChange: (val) => handleFilterChange(setFilterMonth, val),
            options: [
              { value: "All", label: "Tất cả tháng" },
              ...Array.from({ length: 6 }, (_, i) => {
                const now = new Date();
                const d = new Date(now.getFullYear(), now.getMonth() - 1 - i, 1);
                const val = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                return { value: val, label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}` };
              }),
            ]
          }
        ]}
        hasActiveFilter={hasActiveFilter}
        onReset={handleReset}
        actionButtons={
          <>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-200 transition-colors flex items-center gap-2"
            >
              <Plus size={14} /> Hóa đơn mới
            </button>
            <button className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2">
              <Download size={14} /> Export
            </button>
            
            {/* Toggle ẩn hóa đơn tháng trước đã TT */}
            <label className="flex items-center gap-2 cursor-pointer ml-auto select-none">
              <div
                onClick={() => { setHidePastPaid(v => !v); pagination.goToPage(1); }}
                className={`relative w-9 h-5 rounded-full transition-colors ${hidePastPaid ? 'bg-blue-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hidePastPaid ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-xs font-semibold text-slate-600">Ẩn đã TT tháng trước</span>
            </label>
          </>
        }
      />

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider text-left">Bảng hóa đơn ({totalItems} kết quả)</h3>
            {/* Nút phát hiện bất thường */}
            <button
              onClick={() => setShowAnomalyModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 text-xs font-bold rounded-lg transition-colors"
              title="Phát hiện bất thường điện/nước"
            >
              <AlertTriangle size={13} className="text-amber-500" />
            </button>
          </div>
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
              header: "Mã HĐ",
              align: "center",
              width: showCheckboxColumn ? "w-[11%]" : "w-[12%]",
              accessor: (bill) => <span className="font-bold text-slate-900 text-xs font-mono">{bill.invoice_number}</span>,
            },
            {
              header: "Phòng",
              align: "center",
              width: showCheckboxColumn ? "w-[12%]" : "w-[13%]",
              accessor: (bill) => <span className="text-slate-700 text-xs font-bold">{getRoomLabel(bill.building, bill.room_number)}</span>,
            },
            {
              header: "Sinh viên",
              align: "center",
              width: "w-[9%]",
              accessor: (bill) => (
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs font-semibold text-slate-700">
                    {bill.occupancy || 0}/{bill.current_occupancy || 5}
                  </span>
                  <button
                    onClick={() => handleShowStudents(bill)}
                    className="inline-flex items-center justify-center p-1 text-purple-500 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                    title="Xem danh sách sinh viên"
                  >
                    <Users size={14} />
                  </button>
                </div>
              ),
            },
            {
              header: "Tháng",
              align: "center",
              width: showCheckboxColumn ? "w-[9%]" : "w-[10%]",
              accessor: (bill) => {
                let year, month;
                if (typeof bill.billing_month === "string") {
                  if (bill.billing_month.includes("T")) {
                    const billingDate = new Date(bill.billing_month);
                    year = billingDate.getFullYear();
                    month = billingDate.getMonth() + 1;
                  } else {
                    const [y, m] = bill.billing_month.split("-");
                    year = parseInt(y);
                    month = parseInt(m);
                  }
                } else {
                  const billingDate = new Date(bill.billing_month);
                  year = billingDate.getFullYear();
                  month = billingDate.getMonth() + 1;
                }
                return <span className="text-slate-600 text-xs font-semibold">Tháng {month}/{year}</span>;
              },
            },
            {
              header: "Tổng tiền",
              align: "center",
              width: showCheckboxColumn ? "w-[11%]" : "w-[12%]",
              accessor: (bill) => <span className="font-bold text-blue-700 text-xs">{Math.round(bill.total_amount || 0).toLocaleString("vi-VN")}đ</span>,
            },
            {
              header: "Hạn đóng",
              align: "center",
              width: showCheckboxColumn ? "w-[10%]" : "w-[11%]",
              accessor: (bill) => {
                const dueDate = bill.due_date ? new Date(bill.due_date.includes("T") ? bill.due_date : bill.due_date + "T00:00:00") : null;
                return <span className="text-slate-500 font-semibold text-xs">{dueDate ? dueDate.toLocaleDateString("vi-VN") : "—"}</span>;
              },
            },
            {
              header: "Trạng thái",
              align: "center",
              width: showCheckboxColumn ? "w-[11%]" : "w-[12%]",
              accessor: (bill) => (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    bill.status === "Đã thanh toán"
                      ? "bg-emerald-100 text-emerald-700"
                      : bill.status === "Quá hạn"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {bill.status}
                </span>
              ),
            },
            {
              header: "Hành động",
              align: "center",
              width: "w-[11%]",
              accessor: (bill) => (
                <div className="flex justify-center gap-1.5">
                  <button
                    onClick={() => setSelectedInvoice(bill)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye size={15} />
                  </button>
                  <button className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="In hóa đơn">
                    <Printer size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (showCheckboxColumn && selectedInvoices.size > 0) {
                        setShowBulkEmailModal(true);
                      } else {
                        setComposeEmail({
                          to: bill.student_emails?.split(',').map(e => e.trim()).filter(Boolean) || [],
                          subject: `Nhắc nhở thanh toán hóa đơn ${bill.invoice_number || ""}`,
                          body: "",
                        });
                      }
                    }}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title={showCheckboxColumn && selectedInvoices.size > 0 ? "Gửi nhắc nhở hàng loạt" : "Gửi nhắc nhở"}
                  >
                    <Send size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (showCheckboxColumn && selectedInvoices.size > 0) {
                        setBulkDeleteInvoices([...selectedInvoices]);
                      } else if (bill.status === "Chưa thanh toán" || bill.status === "Quá hạn") {
                        setDeleteWarning(bill);
                      } else {
                        setDeleteError("");
                        setInvoiceToDelete(bill);
                      }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={showCheckboxColumn && selectedInvoices.size > 0 ? "Xóa hàng loạt" : "Xóa hóa đơn"}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ),
            },
          ]}
          data={currentItems}
          keyExtractor={(bill) => bill.id}
          loading={loading}
          emptyState={{ icon: CreditCard, title: "Không có hóa đơn nào", description: "Thử thay đổi bộ lọc để tìm kiếm" }}
          selection={{
            selectedItems: selectedInvoices,
            showCheckboxColumn,
            onSelectAll: handleSelectAll,
            onSelectRow: handleSelectInvoice,
          }}
          rowClassName={(bill) => {
            const isHighlighted = highlightedInvoice && bill.invoice_number === highlightedInvoice;
            return isHighlighted ? "bg-yellow-100 animate-pulse" : "";
          }}
        />
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} />
      </div>

      {/* Students Modal */}
      {selectedRoomStudents && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-2xl p-6 animate-in scale-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Sinh viên phòng {getRoomLabel(selectedRoomStudents.building, selectedRoomStudents.room_number)}
              </h3>
              <button
                onClick={() => setSelectedRoomStudents(null)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600 mb-3">
                Đang có <strong>{selectedRoomStudents.current_occupancy || 0}</strong>/{selectedRoomStudents.capacity} sinh viên
              </p>
              {selectedRoomStudents.students && selectedRoomStudents.students.length > 0 ? (
                <div className="space-y-2">
                  {selectedRoomStudents.students.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{s.name || '—'}</p>
                        {s.id && <p className="text-xs text-slate-500 font-mono mt-0.5">{s.id}</p>}
                      </div>
                      {s.contract_number && (
                        <button
                          onClick={() => {
                            setSelectedRoomStudents(null);
                            if (onNavigateToContract) {
                              onNavigateToContract(s.contract_number);
                            }
                          }}
                          className="flex items-center gap-1.5 text-xs font-mono text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer group"
                          title="Xem hợp đồng"
                        >
                          <span>{s.contract_number}</span>
                          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">Chưa có sinh viên nào trong phòng này</p>
              )}
            </div>
            <button
              onClick={() => setSelectedRoomStudents(null)}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Delete Warning Modal (unpaid / overdue) */}
      {deleteWarning && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 animate-in scale-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Ban size={22} className="text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Không thể xóa hóa đơn</h3>
              <p className="text-sm text-slate-500">
                Hóa đơn <span className="font-bold text-slate-800">{deleteWarning.invoice_number}</span> đang ở trạng thái{" "}
                <span className={`font-bold ${deleteWarning.status === "Quá hạn" ? "text-rose-600" : "text-amber-600"}`}>
                  {deleteWarning.status}
                </span>.<br />
                Chỉ được xóa hóa đơn đã thanh toán.
              </p>
            </div>
            <button
              onClick={() => setDeleteWarning(null)}
              className="w-full mt-6 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!invoiceToDelete}
        onClose={() => { setInvoiceToDelete(null); setDeleteError(""); }}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa hóa đơn"
        message={
          <>
            Bạn có chắc muốn xóa hóa đơn <span className="font-bold text-slate-800">{invoiceToDelete?.invoice_number}</span>?<br />
            Hành động này không thể hoàn tác.
          </>
        }
        confirmText="Xóa hóa đơn"
        icon={Trash2}
        iconBgColor="bg-red-50"
        iconColor="text-red-500"
        confirmColor="bg-red-600 hover:bg-red-700 focus:ring-red-200"
        isLoading={deleteLoading}
      >
        {deleteError && (
          <div className="w-full flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2 mt-2">
            <AlertTriangle size={14} className="shrink-0" />
            {deleteError}
          </div>
        )}
      </ConfirmModal>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onUpdated={() => { setSelectedInvoice(null); fetchInvoices(); }}
      />

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchInvoices}
      />

      {/* Bulk Email Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkEmailModal}
        onClose={() => setShowBulkEmailModal(false)}
        onConfirm={handleConfirmBulkEmail}
        title="Xác nhận gửi email nhắc nhở"
        confirmText="Tiếp tục"
        icon={Send}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
        confirmColor="bg-amber-600 hover:bg-amber-700 focus:ring-amber-200"
      >
        <p className="text-sm text-slate-600">
          Số hóa đơn được chọn: <span className="font-bold text-slate-900">{selectedInvoices.size}</span>
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Số email sẽ gửi: <span className="font-bold text-slate-900">
            {[...new Set(
              safeBills
                .filter(bill => selectedInvoices.has(bill.id))
                .map(bill => bill.student_emails)
                .filter(Boolean)
                .flatMap(emails => emails.split(',').map(e => e.trim()))
            )].length} email
          </span>
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Bạn sẽ được chuyển đến trang soạn thảo thông báo để hoàn tất nội dung email.
        </p>
      </ConfirmModal>

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteInvoices.length > 0}
        onClose={() => setBulkDeleteInvoices([])}
        onConfirm={async () => {
          try {
            setDeleteLoading(true);
            await Promise.all(bulkDeleteInvoices.map(id => deleteInvoice(id)));
            setBulkDeleteInvoices([]);
            clearSelection();
            fetchInvoices();
          } catch (err) {
            setDeleteError(err.message || "Xóa hàng loạt thất bại");
          } finally {
            setDeleteLoading(false);
          }
        }}
        title="Xóa hàng loạt hóa đơn?"
        confirmText="Xóa tất cả"
        icon={Trash2}
        iconBgColor="bg-red-50"
        iconColor="text-red-500"
        confirmColor="bg-red-600 hover:bg-red-700 focus:ring-red-200"
        isLoading={deleteLoading}
      >
        <p className="text-sm text-slate-600">
          Số hóa đơn sẽ xóa: <span className="font-bold text-slate-900">{bulkDeleteInvoices.length}</span>
        </p>
        <p className="text-xs text-slate-500 mt-1">Chỉ xóa được hóa đơn đã thanh toán. Hóa đơn chưa thanh toán sẽ bị bỏ qua.</p>
      </ConfirmModal>

      <EmailComposeModal
        isOpen={!!composeEmail}
        onClose={() => { setComposeEmail(null); clearSelection(); }}
        defaultTo={composeEmail?.to}
        defaultSubject={composeEmail?.subject}
        defaultBody={composeEmail?.body}
        recipientCount={composeEmail?.recipientCount > 1 ? composeEmail.recipientCount : undefined}
        onSend={({ to, subject, body }) => {
          console.log("Gửi email:", { to, subject, body });
        }}
      />

      {/* Anomaly Detection Modal */}
      <AnomalyModal
        isOpen={showAnomalyModal}
        onClose={() => setShowAnomalyModal(false)}
      />
    </>
  );
};

export default BillList
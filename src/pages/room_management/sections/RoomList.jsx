import { useState } from "react";
import { Plus, Search, Eye, Users, FileText, BarChart2, X, Home, Wifi, Car, Droplet, Zap, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2, AlertTriangle, ArrowRight, Info, Send, Square, CheckSquare } from "lucide-react";
import { usePagination } from "../../../hooks/usePagination.js";
import { useSelection } from "../../../hooks/useSelection.js";
import Pagination from "../../../components/common/Pagination.jsx";
import ConfirmModal from "../../../components/common/ConfirmModal.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import FilterBar from "../../../components/common/FilterBar.jsx";
import AddRoomModal from "./AddRoomModal.jsx";
import RoomDetailModal from "./RoomDetailModal.jsx";
import InvoiceDetailModal from "../../billing_management/sections/InvoiceDetailModal.jsx";
import { deleteRoom } from "../../../api/apiRoom.js";
import { getInvoices } from "../../../api/apiInvoice.js";

const RoomList = ({ rooms, isLoadingRooms, onRefresh, selectedRoom, setSelectedRoom, onNavigateToContract, onNavigateToInvoice }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("All");
  const [filterFloor, setFilterFloor] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal states
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [selectedRoomStudents, setSelectedRoomStudents] = useState(null);
  const [selectedRoomInvoice, setSelectedRoomInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [maintenanceReasonModal, setMaintenanceReasonModal] = useState(null); // { room, reason }
  const [chartRoom, setChartRoom] = useState(null);       // room được chọn xem biểu đồ
  const [chartData, setChartData] = useState([]);         // mảng { month, total_amount, ... }
  const [chartLoading, setChartLoading] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [bulkDeleteRooms, setBulkDeleteRooms] = useState([]);

  const handleShowInvoice = async (room) => {
    try {
      setLoadingInvoice(true);
      // Fetch latest invoice for this room
      const response = await getInvoices({ search: room.room_number, limit: 1 });

      if (response.success && response.data && response.data.length > 0) {
        // Found real invoice
        setSelectedRoomInvoice(response.data[0]);
      } else {
        // No invoice found - create temporary one
        const rentPrice = Number(room.rent_price) || 500000;
        const occupancy = Number(room.currentOccupancy) || 0;
        const electricReading = Number(room.electric_meter_reading) || 0;
        const waterReading = Number(room.water_meter_reading) || 0;
        const garbageFee = Number(room.garbage_fee) || 70000;
        const internetFee = Number(room.internet_fee) || 300000;
        const parkingFee = Number(room.parking_fee) || 0;

        const rentAmount = rentPrice * occupancy;
        const electricAmount = electricReading * 3500;
        const waterAmount = waterReading * 15000;
        const serviceFees = garbageFee + internetFee + parkingFee;
        const totalAmount = rentAmount + electricAmount + waterAmount + serviceFees;

        setSelectedRoomInvoice({
          invoice_number: null, // No real invoice number
          room_number: room.room_number,
          building: room.building,
          occupancy: occupancy,
          billing_month: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          rent_per_person: rentPrice,
          rent_amount: rentAmount,
          electric_start: 0,
          electric_end: electricReading,
          electric_rate: 3500,
          electric_amount: electricAmount,
          water_start: 0,
          water_end: waterReading,
          water_rate: 15000,
          water_amount: waterAmount,
          garbage_fee: garbageFee,
          internet_fee: internetFee,
          parking_fee: parkingFee,
          parking_count: 0,
          service_fees: serviceFees,
          discount_amount: 0,
          penalty_amount: 0,
          total_amount: totalAmount,
          status: "Chưa có hóa đơn",
          note: "Chưa có hóa đơn chính thức cho phòng này. Đây là ước tính từ thông tin phòng."
        });
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      // Show error or temporary invoice
      alert("Không thể tải hóa đơn. Vui lòng thử lại.");
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteRoom(roomToDelete.id);
      setRoomToDelete(null);
      onRefresh();
    } catch (err) {
      setDeleteError(err.message || "Xóa phòng thất bại, vui lòng thử lại.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleShowChart = async (room) => {
    setChartRoom(room);
    setChartData([]);
    setHoveredBar(null);
    setChartLoading(true);
    try {
      // Lọc chính xác theo room_id (không dùng text search để tránh nhầm phòng)
      // Backend trả về sorted theo billing_month ASC phù hợp cho chart
      const response = await getInvoices({ room_id: room.id });
      if (response.success && response.data) {
        // Nhóm theo tháng (mỗi tháng 1 hóa đơn, nhưng phòng hợp lệ nếu sau này có nhiều)
        const byMonth = {};
        response.data.forEach((inv) => {
          const d = new Date(inv.billing_month + (inv.billing_month.includes("T") ? "" : "T00:00:00"));
          const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
          if (!byMonth[key]) {
            byMonth[key] = {
              month: key,
              total_amount: 0,
              electric_amount: 0,
              water_amount: 0,
              rent_amount: 0,
              service_fees: 0,
              status: inv.status,
            };
          }
          byMonth[key].total_amount += Number(inv.total_amount) || 0;
          byMonth[key].electric_amount += Number(inv.electric_amount) || 0;
          byMonth[key].water_amount += Number(inv.water_amount) || 0;
          byMonth[key].rent_amount += Number(inv.rent_amount) || 0;
          byMonth[key].service_fees += Number(inv.service_fees) || 0;
          // Lấy status của hóa đơn mới nhất trong tháng (nếu nhiều)
          byMonth[key].status = inv.status;
        });
        // Backend đã sort ASC, Object.values giữ thứ tự chèn → đúng thứ tự tháng
        setChartData(Object.values(byMonth));
      }
    } catch (e) {
      console.error("Error loading chart data:", e);
    } finally {
      setChartLoading(false);
    }
  };

  // Handlers deleted in favor of useSelection hook

  const handleBulkEmail = () => {
    if (selectedRooms.size === 0) {
      alert("Vui lòng chọn ít nhất một phòng");
      return;
    }
    setShowBulkEmailModal(true);
  };

  const handleConfirmBulkEmail = () => {
    const selected = safeRooms.filter(r => selectedRooms.has(r.id));
    
    // Gathers emails using the students array for each room
    const emails = [];
    selected.forEach(room => {
      if (room.students && Array.isArray(room.students)) {
        room.students.forEach(s => {
          if (s.email || s.student_email) {
             emails.push(s.email || s.student_email);
          }
        });
      }
    });
    
    const uniqueEmails = [...new Set(emails)];
    
    setShowBulkEmailModal(false);
    clearSelection();
    
    alert(`Đã mô phỏng gửi email cho các sinh viên trong ${selected.length} phòng.\nTổng số email khả dụng: ${uniqueEmails.length}\n${uniqueEmails.join(', ')}`);
  };

  // Ensure rooms is always an array
  const safeRooms = Array.isArray(rooms) ? rooms : [];

  // Dynamic filter options from data
  const uniqueBuildings = [...new Set(safeRooms.map((r) => r.building).filter(Boolean))].sort();
  const uniqueFloors = [...new Set(safeRooms.map((r) => r.floor).filter(Boolean))].sort((a, b) => a - b);

  // Filter and pagination logic
  const filteredRooms = safeRooms.filter((r) => {
    const matchesBuilding = filterBuilding === "All" || r.building === filterBuilding;
    const matchesFloor = filterFloor === "All" || r.floor === parseInt(filterFloor);
    const matchesSearch = r.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) || r.name?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === "Maintenance") matchesStatus = r.status === "Maintenance";
    else if (filterStatus === "Full") matchesStatus = r.currentOccupancy >= r.capacity;
    else if (filterStatus === "Occupied") matchesStatus = r.currentOccupancy > 0 && r.currentOccupancy < r.capacity;
    else if (filterStatus === "Empty") matchesStatus = r.currentOccupancy === 0;

    return matchesBuilding && matchesFloor && matchesSearch && matchesStatus;
  });

  // Hooks
  const pagination = usePagination(filteredRooms, 10);
  const { currentItems, totalItems } = pagination;
  const { 
    selectedItems: selectedRooms, 
    showCheckboxColumn, 
    toggleSelectionMode: handleToggleCheckbox, 
    handleSelectItem: handleSelectRoom, 
    handleSelectAll, 
    clearSelection 
  } = useSelection(filteredRooms.map(r => r.id));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filters */}
      <FilterBar
        title="Bộ lọc phòng"
        filterContainerClass="grid grid-cols-7 gap-4 items-center"
        search={{
          placeholder: "Tìm theo số phòng...",
          value: searchTerm,
          onChange: setSearchTerm,
          className: "col-span-2 relative"
        }}
        filters={[
          {
            value: filterBuilding,
            onChange: setFilterBuilding,
            className: "col-span-1",
            options: [
              { value: "All", label: "Tất cả tòa" },
              ...uniqueBuildings.map((b) => ({ value: b, label: `Tòa ${b}` })),
            ]
          },
          {
            value: filterFloor,
            onChange: setFilterFloor,
            className: "col-span-1",
            options: [
              { value: "All", label: "Tất cả tầng" },
              ...uniqueFloors.map((f) => ({ value: String(f), label: `Tầng ${f}` })),
            ]
          },
          {
            value: filterStatus,
            onChange: setFilterStatus,
            className: "col-span-1",
            options: [
              { value: "All", label: "Tất cả trạng thái" },
              { value: "Empty", label: "Trống" },
              { value: "Occupied", label: "Đang ở" },
              { value: "Full", label: "Đã đầy" },
              { value: "Maintenance", label: "Bảo trì" },
            ]
          }
        ]}
        hasActiveFilter={searchTerm !== "" || filterBuilding !== "All" || filterFloor !== "All" || filterStatus !== "All"} 
        onReset={() => {
          setSearchTerm("");
          setFilterBuilding("All");
          setFilterFloor("All");
          setFilterStatus("All");
        }}
        customFilters={
          <button
            onClick={() => setShowAddRoomModal(true)}
            className="flex items-center justify-center col-span-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-sm"
          >
            <Plus size={16} className="mr-1 flex-shrink-0" /> Thêm mới
          </button>
        }
      />

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300 flex items-center justify-between">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider text-left">Bảng thông tin phòng ({totalItems} kết quả)</h3>
          
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
              header: "Số phòng",
              align: "center",
              width: showCheckboxColumn ? "w-[11%]" : "w-[12%]",
              accessor: (room) => <span className="text-xs font-mono font-semibold text-slate-900">{room.room_number || room.name}</span>,
            },
            {
              header: "Vị trí",
              align: "center",
              width: "w-[15%]",
              accessor: (room) => (
                <span className="text-xs font-semibold text-slate-900">
                  Tòa {room.building} - Tầng {room.floor}
                </span>
              ),
            },
            {
              header: "Sinh viên",
              align: "center",
              width: "w-[14%]",
              accessor: (room) => (
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs font-semibold text-slate-700">
                    {room.currentOccupancy || 0}/{room.capacity}
                  </span>
                  <button
                    onClick={() => setSelectedRoomStudents(room)}
                    className="inline-flex items-center justify-center p-1 text-purple-500 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors"
                    title="Xem danh sách sinh viên"
                  >
                    <Users size={14} />
                  </button>
                </div>
              ),
            },
            {
              header: "Hóa đơn",
              align: "center",
              width: "w-[14%]",
              accessor: (room) => (
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => handleShowInvoice(room)}
                    disabled={loadingInvoice}
                    className="inline-flex items-center justify-center p-1.5 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                    title="Xem hóa đơn mới nhất"
                  >
                    <FileText size={16} />
                  </button>
                  {onNavigateToInvoice && (
                    <button
                      onClick={() => handleShowChart(room)}
                      className="inline-flex items-center justify-center p-1.5 text-teal-500 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors"
                      title="Biểu đồ hóa đơn theo tháng"
                    >
                      <BarChart2 size={16} />
                    </button>
                  )}
                </div>
              ),
            },
            {
              header: "TT thanh toán",
              align: "center",
              width: "w-[15%]",
              accessor: (room) => (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-black">Chờ</span>
              ),
            },
            {
              header: "Trạng thái",
              align: "center",
              width: "w-[15%]",
              accessor: (room) => (
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight ${room.status === "Maintenance"
                      ? "bg-orange-100 text-orange-700"
                      : (room.currentOccupancy || 0) >= room.capacity
                        ? "bg-rose-100 text-rose-700"
                        : (room.currentOccupancy || 0) > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                  >
                    {room.status === "Maintenance" ? "Bảo trì" : (room.currentOccupancy || 0) >= room.capacity ? "Đã đầy" : (room.currentOccupancy || 0) > 0 ? "Đang ở" : "Trống"}
                  </span>
                  {room.status === "Maintenance" && room.maintenance_reason && (
                    <button
                      onClick={() => setMaintenanceReasonModal({ room, reason: room.maintenance_reason })}
                      className="p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                      title="Xem lý do bảo trì"
                    >
                      <Info size={14} />
                    </button>
                  )}
                </div>
              ),
            },
            {
              header: "Hành động",
              align: "center",
              width: "w-[15%]",
              accessor: (room) => (
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setSelectedRoomDetail(room)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết">
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (showCheckboxColumn && selectedRooms.size > 0) {
                        setShowBulkEmailModal(true);
                      } else {
                        alert(`Đã mô phỏng gửi email nhắc nhở cho tất cả sinh viên phòng ${room.room_number}`);
                      }
                    }}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title={showCheckboxColumn && selectedRooms.size > 0 ? "Gửi email hàng loạt" : "Gửi email nhắc nhở"}
                  >
                    <Send size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (showCheckboxColumn && selectedRooms.size > 0) {
                        setBulkDeleteRooms([...selectedRooms]);
                      } else {
                        setDeleteError("");
                        setRoomToDelete(room);
                      }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={showCheckboxColumn && selectedRooms.size > 0 ? "Xóa hàng loạt" : "Xóa phòng"}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ),
            },
          ]}
          data={currentItems}
          keyExtractor={(room) => room.id}
          loading={isLoadingRooms}
          emptyState={{ icon: Home, title: "Chưa có phòng nào", description: "Hãy thêm phòng để bắt đầu" }}
          selection={{
            selectedItems: selectedRooms,
            showCheckboxColumn,
            onSelectAll: handleSelectAll,
            onSelectRow: handleSelectRoom,
          }}
        />
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} />

      {/* MODALS */}
      <AddRoomModal
        isOpen={showAddRoomModal}
        onClose={() => setShowAddRoomModal(false)}
        rooms={rooms}
        onSuccess={() => {
          setShowAddRoomModal(false);
          onRefresh();
        }}
      />

      <RoomDetailModal room={selectedRoomDetail} onClose={() => setSelectedRoomDetail(null)} />

      {/* Delete Confirm Modal */}
      {roomToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 animate-in scale-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa phòng</h3>
              <p className="text-sm text-slate-500">
                Bạn có chắc muốn xóa phòng <span className="font-bold text-slate-800">{roomToDelete.room_number}</span>?<br />
                Hành động này không thể hoàn tác.
              </p>
              {deleteError && (
                <div className="w-full flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  {deleteError}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setRoomToDelete(null);
                  setDeleteError("");
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleteLoading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Trash2 size={14} />}
                {deleteLoading ? "Đang xóa..." : "Xóa phòng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {selectedRoomStudents && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-2xl p-6 animate-in scale-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Sinh viên phòng {selectedRoomStudents.room_number}</h3>
              <button onClick={() => setSelectedRoomStudents(null)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600 mb-3">
                Đang có <strong>{selectedRoomStudents.currentOccupancy || 0}</strong>/{selectedRoomStudents.capacity} sinh viên
              </p>
              {selectedRoomStudents.students && selectedRoomStudents.students.length > 0 ? (
                <div className="space-y-2">
                  {selectedRoomStudents.students.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{s.student_name || '—'}</p>
                        {s.student_id && <p className="text-xs text-slate-500 font-mono mt-0.5">{s.student_id}</p>}
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
            <button onClick={() => setSelectedRoomStudents(null)} className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm">
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Invoice Modal - Using InvoiceDetailModal */}
      <InvoiceDetailModal
        invoice={selectedRoomInvoice}
        onClose={() => setSelectedRoomInvoice(null)}
        onNavigateToInvoice={onNavigateToInvoice && selectedRoomInvoice?.invoice_number ? () => {
          const invoiceNumber = selectedRoomInvoice.invoice_number;
          setSelectedRoomInvoice(null);
          onNavigateToInvoice(invoiceNumber);
        } : null}
      />

      {/* Chart Modal */}
      {chartRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-2xl p-6 animate-in scale-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Biểu đồ hóa đơn — Phòng {chartRoom.building}-{chartRoom.room_number}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Tổng tiền theo từng tháng</p>
              </div>
              <button onClick={() => { setChartRoom(null); setChartData([]); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {chartLoading ? (
              <div className="flex items-center justify-center h-48 text-slate-400">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <BarChart2 size={40} className="mb-2 opacity-30" />
                <p className="text-sm">Chưa có dữ liệu hóa đơn</p>
              </div>
            ) : (() => {
              const maxAmt = Math.max(...chartData.map(d => d.total_amount), 1);
              const chartH = 180;
              const topPad = 22; // space for value labels above tallest bar
              const barW = Math.min(60, Math.floor(560 / chartData.length) - 12);
              const gap = Math.floor(560 / chartData.length);

              const statusColor = (status) => {
                if (status === "Đã thanh toán") return { fill: "#10b981", text: "text-emerald-600" };
                if (status === "Quá hạn") return { fill: "#f43f5e", text: "text-rose-600" };
                return { fill: "#f59e0b", text: "text-amber-600" };
              };

              return (
                <>
                  {/* SVG Bar Chart */}
                  <div className="overflow-x-auto">
                    <svg width={Math.max(560, chartData.length * gap)} height={topPad + chartH + 60} className="block mx-auto">
                      {/* Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                        <g key={idx}>
                          <line
                            x1={30} y1={topPad + chartH * (1 - ratio)}
                            x2={Math.max(560, chartData.length * gap)} y2={topPad + chartH * (1 - ratio)}
                            stroke="#e2e8f0" strokeWidth={1} strokeDasharray={ratio === 0 ? "0" : "4,4"}
                          />
                          <text x={24} y={topPad + chartH * (1 - ratio) + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
                            {ratio === 0 ? "0" : `${Math.round(maxAmt * ratio / 1000000 * 10) / 10}M`}
                          </text>
                        </g>
                      ))}

                      {/* Bars */}
                      {chartData.map((d, i) => {
                        const barH = Math.max(4, (d.total_amount / maxAmt) * chartH);
                        const x = 36 + i * gap + (gap - barW) / 2;
                        const y = topPad + chartH - barH;
                        const col = statusColor(d.status);
                        const [yr, mo] = d.month.split("-");
                        const isSelected = hoveredBar === i;

                        return (
                          <g key={i}
                            onClick={() => setHoveredBar(isSelected ? null : i)}
                            style={{ cursor: "pointer" }}
                          >
                            {/* Bar */}
                            <rect
                              x={x} y={y} width={barW} height={barH}
                              fill={col.fill}
                              rx={6}
                              opacity={isSelected ? 1 : 0.75}
                              stroke={isSelected ? col.fill : "none"}
                              strokeWidth={2}
                            />
                            {/* Value on top - always visible, now has topPad so never clips */}
                            <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fill={col.fill} fontWeight="bold">
                              {Math.round(d.total_amount / 1000)}k
                            </text>
                            {/* Month label */}
                            <text x={x + barW / 2} y={topPad + chartH + 16} textAnchor="middle" fontSize={10} fill={isSelected ? "#1e293b" : "#475569"} fontWeight={isSelected ? "800" : "600"}>
                              T{mo}
                            </text>
                            <text x={x + barW / 2} y={topPad + chartH + 28} textAnchor="middle" fontSize={9} fill="#94a3b8">
                              {yr}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Detail panel - chỉ hiện khi click vào cột */}
                  {hoveredBar !== null && chartData[hoveredBar] && (() => {
                    const d = chartData[hoveredBar];
                    const col = statusColor(d.status);
                    return (
                      <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-slate-700">
                            Chi tiết — Tháng {d.month.split("-").reverse().join("/")}
                          </p>
                          <button
                            onClick={() => setHoveredBar(null)}
                            className="text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors"
                          >
                            × Đóng
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                          <span className="text-slate-500">Tiền phòng</span>
                          <span className="font-semibold text-slate-800 text-right">{Math.round(d.rent_amount).toLocaleString("vi-VN")}đ</span>
                          <span className="text-slate-500">Điện</span>
                          <span className="font-semibold text-slate-800 text-right">{Math.round(d.electric_amount).toLocaleString("vi-VN")}đ</span>
                          <span className="text-slate-500">Nước</span>
                          <span className="font-semibold text-slate-800 text-right">{Math.round(d.water_amount).toLocaleString("vi-VN")}đ</span>
                          <span className="text-slate-500">Dịch vụ</span>
                          <span className="font-semibold text-slate-800 text-right">{Math.round(d.service_fees).toLocaleString("vi-VN")}đ</span>
                          <div className="col-span-2 border-t border-slate-200 my-1" />
                          <span className="font-bold text-slate-700">Tổng cộng</span>
                          <span className={`font-black text-right ${col.text}`}>{Math.round(d.total_amount).toLocaleString("vi-VN")}đ</span>
                          <span className="text-slate-500">Trạng thái</span>
                          <span className={`font-bold text-right ${col.text}`}>{d.status}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-3 justify-center flex-wrap">
                    {[["#10b981", "Đã thanh toán"], ["#f59e0b", "Chưa thanh toán"], ["#f43f5e", "Quá hạn"]].map(([color, label]) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-xs text-slate-500">{label}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            <button onClick={() => { setChartRoom(null); setChartData([]); }}
              className="w-full mt-5 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Maintenance Reason Modal */}
      {maintenanceReasonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-md p-6 animate-in scale-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Lý do bảo trì</h3>
              <button
                onClick={() => setMaintenanceReasonModal(null)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={18} className="text-orange-600" />
                  <span className="text-sm font-bold text-orange-900">Phòng đang bảo trì</span>
                </div>
                <div className="text-xs text-orange-700 space-y-1">
                  <p><strong>Phòng:</strong> {maintenanceReasonModal.room.room_number}</p>
                  <p><strong>Tòa:</strong> {maintenanceReasonModal.room.building} - Tầng {maintenanceReasonModal.room.floor}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Lý do:</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800">
                  {maintenanceReasonModal.reason || "Không có lý do cụ thể"}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMaintenanceReasonModal(null)}
              className="w-full mt-6 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Bulk Email Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkEmailModal}
        onClose={() => setShowBulkEmailModal(false)}
        onConfirm={handleConfirmBulkEmail}
        title="Xác nhận nhắc nhở phòng"
        confirmText="Gửi email"
        icon={Send}
        iconBgColor="bg-amber-50"
        iconColor="text-amber-600"
        confirmColor="bg-amber-600 hover:bg-amber-700 focus:ring-amber-200"
      >
        <p className="text-sm text-slate-600">
          Số phòng được chọn: <span className="font-bold text-slate-900">{selectedRooms.size}</span>
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Mail sẽ được gửi tới tất cả sinh viên trong phòng.
        </p>
      </ConfirmModal>

      {/* Delete Room Confirmation Modal */}
      <ConfirmModal
        isOpen={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa phòng"
        message={`Bạn có chắc chắn muốn xóa phòng ${roomToDelete?.room_number}? Mọi dữ liệu liên quan sẽ bị xóa và không thể khôi phục.`}
        confirmText="Xóa phòng"
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

      {/* Bulk Delete Rooms Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteRooms.length > 0}
        onClose={() => setBulkDeleteRooms([])}
        onConfirm={async () => {
          try {
            setDeleteLoading(true);
            await Promise.all(bulkDeleteRooms.map(id => deleteRoom(id)));
            setBulkDeleteRooms([]);
            clearSelection();
            onRefresh();
          } catch (err) {
            setDeleteError(err.message || "Xóa hàng loạt thất bại");
          } finally {
            setDeleteLoading(false);
          }
        }}
        title="Xóa hàng loạt phòng?"
        confirmText="Xóa tất cả"
        icon={Trash2}
        iconBgColor="bg-red-50"
        iconColor="text-red-600"
        confirmColor="bg-red-600 hover:bg-red-700 focus:ring-red-200"
        isLoading={deleteLoading}
      >
        <p className="text-sm text-slate-600">
          Số phòng sẽ xóa: <span className="font-bold text-slate-900">{bulkDeleteRooms.length}</span>
        </p>
      </ConfirmModal>
    </div>
  );
};

export default RoomList;

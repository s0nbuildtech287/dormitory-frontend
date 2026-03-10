import { useState } from "react";
import { Plus, Search, Eye, Users, FileText, BarChart2, X, Home, Wifi, Car, Droplet, Zap, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2, AlertTriangle, ArrowRight, Info } from "lucide-react";
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Ensure rooms is always an array
  const safeRooms = Array.isArray(rooms) ? rooms : [];

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

  // Pagination calculations
  const totalItems = filteredRooms.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredRooms.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-200">
        <h3 className="text-slate-800 font-medium text-sm mb-4 uppercase tracking-wider">Bộ lọc phòng</h3>
        <div className="grid grid-cols-6 gap-4 items-center">
          <div className="relative col-span-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo số phòng..."
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 outline-none text-sm transition-all bg-slate-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả tòa</option>
            <option value="A">Tòa A</option>
            <option value="B">Tòa B</option>
            <option value="C">Tòa C</option>
            <option value="D">Tòa D</option>
          </select>

          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả tầng</option>
            <option value="1">Tầng 1</option>
            <option value="2">Tầng 2</option>
            <option value="3">Tầng 3</option>
            <option value="4">Tầng 4</option>
            <option value="5">Tầng 5</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs font-bold bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 text-slate-700 shadow-sm"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Empty">Trống</option>
            <option value="Occupied">Đang ở</option>
            <option value="Full">Đã đầy</option>
            <option value="Maintenance">Bảo trì</option>
          </select>

          <button
            onClick={() => setShowAddRoomModal(true)}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-bold text-sm"
          >
            <Plus size={14} className="mr-2 flex-shrink-0" /> Thêm phòng
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider text-left">Bảng thông tin phòng ({totalItems} kết quả)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b-2 border-slate-300">
              <tr className="bg-slate-200 text-slate-700 text-xs font-black capitalize tracking-widest">
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[12%] text-center">Số phòng</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[15%] text-center">Vị trí</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[14%] text-center">Sinh viên</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[14%] text-center">Hóa đơn</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[15%] text-center">TT thanh toán</th>
                <th className="px-6 py-3 border-r-2 border-slate-300 w-[15%] text-center">Trạng thái</th>
                <th className="px-6 py-3 w-[15%] text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {isLoadingRooms ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Home size={48} className="mb-4 opacity-50" />
                      <p className="text-sm font-medium">Chưa có phòng nào</p>
                      <p className="text-xs mt-1">Hãy thêm phòng để bắt đầu</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((room) => {
                  return (
                    <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Room Number */}
                      <td className="px-6 py-2 text-xs font-mono font-semibold text-slate-900 border-r-2 border-slate-300 text-center">{room.room_number || room.name}</td>

                      {/* Location */}
                      <td className="px-6 py-2 text-xs font-semibold text-slate-900 border-r-2 border-slate-300 text-center">
                        Tòa {room.building} - Tầng {room.floor}
                      </td>

                      {/* Students */}
                      <td className="px-6 py-2 text-center border-r-2 border-slate-300">
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
                      </td>

                      {/* Invoice */}
                      <td className="px-6 py-2 text-center border-r-2 border-slate-300">
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
                      </td>

                      {/* Payment Status */}
                      <td className="px-6 py-2 text-center border-r-2 border-slate-300">
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-black">Chờ</span>
                      </td>

                      {/* Room Status */}
                      <td className="px-6 py-2 text-center border-r-2 border-slate-300">
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
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setSelectedRoomDetail(room)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết">
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteError("");
                              setRoomToDelete(room);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa phòng"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Hiển thị</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-slate-200 rounded text-xs font-medium"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>mục mỗi trang</span>
            </div>

            <div className="text-sm text-slate-600">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, totalItems)} của {totalItems} mục
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum ? "bg-blue-600 text-white" : "border border-slate-200 hover:bg-slate-50"}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default RoomList;

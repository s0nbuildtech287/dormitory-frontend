import { useState } from "react";
import { Plus, Search, Eye, Users, FileText, X, Home, Wifi, Car, Droplet, Zap, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from "lucide-react";
import AddRoomModal from "./AddRoomModal.jsx";
import RoomDetailModal from "./RoomDetailModal.jsx";

const RoomList = ({ rooms, isLoadingRooms, onRefresh, selectedRoom, setSelectedRoom }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("All");
  const [filterFloor, setFilterFloor] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal states
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [selectedRoomStudents, setSelectedRoomStudents] = useState(null);
  const [selectedRoomInvoice, setSelectedRoomInvoice] = useState(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Ensure rooms is always an array
  const safeRooms = Array.isArray(rooms) ? rooms : [];

  // Filter and pagination logic
  const filteredRooms = safeRooms.filter((r) => {
    const matchesBuilding = filterBuilding === "All" || r.building === filterBuilding;
    const matchesFloor = filterFloor === "All" || r.floor === parseInt(filterFloor);
    const matchesSearch = r.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) || r.name?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (filterStatus === "Full") matchesStatus = r.currentOccupancy >= r.capacity;
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
                        <button
                          onClick={() => setSelectedRoomInvoice(room)}
                          className="inline-flex items-center justify-center p-1.5 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors"
                          title="Xem hóa đơn"
                        >
                          <FileText size={16} />
                        </button>
                      </td>

                      {/* Payment Status */}
                      <td className="px-6 py-2 text-center border-r-2 border-slate-300">
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-black">Chờ</span>
                      </td>

                      {/* Room Status */}
                      <td className="px-6 py-2 text-center border-r-2 border-slate-300">
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight ${
                            (room.currentOccupancy || 0) >= room.capacity
                              ? "bg-rose-100 text-rose-700"
                              : (room.currentOccupancy || 0) > 0
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {(room.currentOccupancy || 0) >= room.capacity ? "Đã đầy" : (room.currentOccupancy || 0) > 0 ? "Đang ở" : "Trống"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setSelectedRoomDetail(room)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => console.log("Delete room", room.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa phòng">
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
              <p className="text-sm text-slate-600">
                Đang có {selectedRoomStudents.currentOccupancy}/{selectedRoomStudents.capacity} sinh viên
              </p>
              <p className="text-xs text-slate-500 italic">Danh sách sinh viên sẽ hiển thị ở đây...</p>
            </div>
            <button onClick={() => setSelectedRoomStudents(null)} className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm">
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedRoomInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-md p-6 animate-in scale-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Hóa đơn phòng {selectedRoomInvoice.room_number}</h3>
              <button onClick={() => setSelectedRoomInvoice(null)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Home size={14} /> Tiền phòng:
                </span>
                <span className="text-sm font-bold text-slate-900">{selectedRoomInvoice.rent_price?.toLocaleString()} VNĐ</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Zap size={14} /> Tiền điện:
                </span>
                <span className="text-sm font-bold text-slate-900">{(selectedRoomInvoice.electric_meter_reading * 3000 || 0).toLocaleString()} VNĐ</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Droplet size={14} /> Tiền nước:
                </span>
                <span className="text-sm font-bold text-slate-900">{(selectedRoomInvoice.water_meter_reading * 10000 || 0).toLocaleString()} VNĐ</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-600">Phí rác:</span>
                <span className="text-sm font-bold text-slate-900">{selectedRoomInvoice.garbage_fee?.toLocaleString()} VNĐ</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Wifi size={14} /> Internet:
                </span>
                <span className="text-sm font-bold text-slate-900">{selectedRoomInvoice.internet_fee?.toLocaleString()} VNĐ</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  <Car size={14} /> Gửi xe:
                </span>
                <span className="text-sm font-bold text-slate-900">{selectedRoomInvoice.parking_fee?.toLocaleString()} VNĐ</span>
              </div>
              <div className="border-t-2 border-slate-200 pt-3 mt-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-base font-bold text-slate-900">Tổng cộng:</span>
                  <span className="text-lg font-black text-blue-700">
                    {(
                      (Number(selectedRoomInvoice.rent_price) || 0) +
                      (Number(selectedRoomInvoice.electric_meter_reading) || 0) * 3000 +
                      (Number(selectedRoomInvoice.water_meter_reading) || 0) * 10000 +
                      (Number(selectedRoomInvoice.garbage_fee) || 0) +
                      (Number(selectedRoomInvoice.internet_fee) || 0) +
                      (Number(selectedRoomInvoice.parking_fee) || 0)
                    ).toLocaleString()}{" "}
                    VNĐ
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedRoomInvoice(null)} className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm">
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;

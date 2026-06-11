import { useEffect, useMemo, useState } from "react";
import { Search, Eye, Users, X, Home, Trash2, Send, CheckSquare, Plus } from "lucide-react";
import { usePagination } from "../../../hooks/usePagination.js";
import Pagination from "../../../components/common/Pagination.jsx";
import DataTable from "../../../components/common/DataTable.jsx";
import FilterBar from "../../../components/common/FilterBar.jsx";
import RoomDetailModal from "./RoomDetailModal.jsx";
import EmailComposeModal from "../../../components/common/EmailComposeModal.jsx";
import { getContracts, transferRoom } from "../../../api/apiContract.js";
import { updateRoom } from "../../../api/apiRoom.js";
import useBuildingDisplayNames from "../../../hooks/useBuildingDisplayNames.js";

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const hasAnyKeyword = (value, keywords = []) => {
  const text = normalizeText(value);
  return keywords.some((keyword) => text.includes(normalizeText(keyword)));
};

const INTERNATIONAL_KEYWORDS = [
  "luu hoc sinh",
  "quoc te",
  "nuoc ngoai",
  "du hoc sinh",
  "du hoc",
  "lao",
  "campuchia",
];

const RoomXungKich = ({
  rooms,
  isLoadingRooms,
  onRefresh,
  onNavigateToContract,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBuilding, setFilterBuilding] = useState("All");
  const [filterFloor, setFilterFloor] = useState("All");
  const { getBuildingLabel } = useBuildingDisplayNames();

  // Modals state
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [composeEmail, setComposeEmail] = useState(null);
  const [showXungKichPicker, setShowXungKichPicker] = useState(false);
  const [xungKichSearch, setXungKichSearch] = useState("");
  const [xungKichTargetRoom, setXungKichTargetRoom] = useState(null);
  const [showXungKichAssignModal, setShowXungKichAssignModal] = useState(false);
  const [xungKichAssignSearch, setXungKichAssignSearch] = useState("");
  const [xungKichAssignLoading, setXungKichAssignLoading] = useState(false);
  const [xungKichActiveContracts, setXungKichActiveContracts] = useState([]);
  const [selectedXungKichStudent, setSelectedXungKichStudent] = useState(null);
  const [selectedXungKichRoom, setSelectedXungKichRoom] = useState(null);

  const safeRooms = Array.isArray(rooms) ? rooms : [];

  // Dynamic filter options from data
  const uniqueBuildings = [...new Set(safeRooms.map((r) => r.building).filter(Boolean))].sort();
  const uniqueRoomNumbers = [...new Set(
    safeRooms
      .filter((r) => (r.reserved_for || "general") === "xung_kich")
      .filter((r) => filterBuilding === "All" || r.building === filterBuilding)
      .map((r) => r.room_number)
      .filter(Boolean)
  )].sort((a, b) => String(a).localeCompare(String(b), "vi", { numeric: true, sensitivity: "base" }));
  
  useEffect(() => {
    if (filterFloor !== "All" && !uniqueRoomNumbers.includes(filterFloor)) {
      setFilterFloor("All");
    }
  }, [filterFloor, uniqueRoomNumbers]);

  // Compute and filter volunteer students flat list
  const filteredStudents = useMemo(() => {
    const xungKichRooms = safeRooms.filter((r) => (r.reserved_for || "general") === "xung_kich");

    const students = xungKichRooms.flatMap((room) => {
      const roomStudents = Array.isArray(room.students) ? room.students : [];
      return roomStudents.map((student, index) => ({
        ...student,
        id: `${room.id}-${student.student_id || student.contract_number || index}`,
        room_id: room.id,
        room_number: room.room_number,
        building: room.building,
        floor: room.floor,
        capacity: room.capacity,
        currentOccupancy: room.currentOccupancy ?? room.current_occupancy ?? roomStudents.length,
        status: room.status,
        reserved_for: room.reserved_for || "general",
      }));
    });

    return students
      .filter((student) => {
        const matchesBuilding = filterBuilding === "All" || student.building === filterBuilding;
        const matchesRoom = filterFloor === "All" || String(student.room_number || "") === String(filterFloor);

        const q = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          student.room_number?.toLowerCase().includes(q) ||
          student.student_name?.toLowerCase().includes(q) ||
          student.student_id?.toLowerCase().includes(q);

        return matchesBuilding && matchesRoom && matchesSearch;
      })
      .sort((a, b) => {
        // Group by room_number first so roommates stay together
        const roomCompare = String(a.room_number || "").localeCompare(String(b.room_number || ""));
        if (roomCompare !== 0) return roomCompare;
        // Sort by name inside room
        return String(a.student_name || "").localeCompare(String(b.student_name || ""));
      });
  }, [safeRooms, filterBuilding, filterFloor, searchTerm]);

  // Pagination hook
  const pagination = usePagination(filteredStudents, 10);
  const { currentItems, totalItems } = pagination;

  // Xung kích assignment helpers
  const openXungKichPicker = () => {
    setXungKichSearch("");
    setXungKichTargetRoom(null);
    setShowXungKichPicker(true);
  };

  const confirmMarkXungKich = async (room) => {
    if (!room) return;
    try {
      await updateRoom(room.id, { reserved_for: "xung_kich" });
      setShowXungKichPicker(false);
      setXungKichTargetRoom(null);
      onRefresh?.();
    } catch (error) {
      alert(error.message || "Không thể chuyển phòng thành xung kích");
    }
  };

  const openXungKichAssignModal = async () => {
    setShowXungKichAssignModal(true);
    setXungKichAssignSearch("");
    setSelectedXungKichStudent(null);
    setSelectedXungKichRoom(null);
    try {
      setXungKichAssignLoading(true);
      const response = await getContracts({ status: "Active" });
      const list = Array.isArray(response?.data) ? response.data : [];
      setXungKichActiveContracts(list);
    } catch (error) {
      alert(error.message || "Không thể tải danh sách sinh viên");
    } finally {
      setXungKichAssignLoading(false);
    }
  };

  const handleTransferToXungKich = async () => {
    if (!selectedXungKichStudent || !selectedXungKichRoom) {
      alert("Vui lòng chọn sinh viên và phòng xung kích");
      return;
    }

    try {
      setXungKichAssignLoading(true);
      await transferRoom(selectedXungKichStudent.id, selectedXungKichRoom.id);
      setShowXungKichAssignModal(false);
      setSelectedXungKichStudent(null);
      setSelectedXungKichRoom(null);
      setXungKichAssignSearch("");
      onRefresh?.();
    } catch (error) {
      alert(error.message || "Không thể chuyển sinh viên vào phòng xung kích");
    } finally {
      setXungKichAssignLoading(false);
    }
  };

  // Room picker candidate filtering
  const xungKichCandidates = safeRooms.filter((room) => {
    const currentReserved = room.reserved_for || "general";
    if (currentReserved === "xung_kich") return false;
    const students = Array.isArray(room.students) ? room.students : [];
    const hasInternational = students.some((s) => hasAnyKeyword(s.priority_reasons, INTERNATIONAL_KEYWORDS));
    return !hasInternational && room.status !== "Maintenance";
  }).filter((room) => {
    if (!xungKichSearch.trim()) return true;
    const q = xungKichSearch.toLowerCase();
    return room.room_number?.toLowerCase().includes(q) || String(room.building || "").toLowerCase().includes(q);
  });

  // Columns definition
  const columns = useMemo(() => [
    {
      header: "Mã sinh viên",
      align: "center",
      width: "w-[12%]",
      accessor: (student) => (
        <span className="text-xs font-mono font-semibold text-slate-900">
          {student.student_id || "—"}
        </span>
      ),
    },
    {
      header: "Họ và tên",
      align: "left",
      width: "w-[18%]",
      accessor: (student) => (
        <span className="text-xs font-semibold text-slate-900">
          {student.student_name || "—"}
        </span>
      ),
    },
    {
      header: "Phòng",
      align: "center",
      width: "w-[12%]",
      accessor: (student) => (
        <span className="text-xs font-semibold text-slate-900">
          {student.room_number || "—"}
        </span>
      ),
    },
    {
      header: "Vị trí",
      align: "center",
      width: "w-[15%]",
      accessor: (student) => (
        <span className="text-xs font-semibold text-slate-900">
          {getBuildingLabel(student.building)} - Tầng {student.floor}
        </span>
      ),
    },
    {
      header: "Email",
      align: "left",
      width: "w-[20%]",
      accessor: (student) => (
        <span className="text-xs font-normal text-slate-600 font-mono">
          {student.email || student.student_email || "—"}
        </span>
      ),
    },
    {
      header: "Mã hợp đồng",
      align: "center",
      width: "w-[13%]",
      accessor: (student) =>
        student.contract_number ? (
          <button
            onClick={() => {
              if (onNavigateToContract) {
                onNavigateToContract(student.contract_number);
              }
            }}
            className="flex items-center gap-1 mx-auto text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
            title="Xem hợp đồng"
          >
            <span>{student.contract_number}</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400 italic">Chưa có</span>
        ),
    },
    {
      header: "Hành động",
      align: "center",
      width: "w-[10%]",
      accessor: (student) => {
        const originalRoom = safeRooms.find((r) => r.id === student.room_id);
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                if (originalRoom) {
                  setSelectedRoomDetail(originalRoom);
                }
              }}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Xem chi tiết phòng"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => {
                setComposeEmail({
                  to: [student.email || student.student_email],
                  subject: `Thông báo sinh viên xung kích phòng ${student.room_number}`,
                  body: "",
                });
              }}
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Gửi email nhắc nhở"
            >
              <Send size={16} />
            </button>
          </div>
        );
      },
    },
  ], [onNavigateToContract, safeRooms, getBuildingLabel]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filters */}
      <FilterBar
        title="Bộ lọc xung kích"
        filterContainerClass="grid grid-cols-7 gap-4 items-center"
        search={{
          placeholder: "Tìm tên, mã SV hoặc phòng...",
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
              ...uniqueBuildings.map((b) => ({ value: b, label: getBuildingLabel(b) })),
            ]
          },
          {
            value: filterFloor,
            onChange: setFilterFloor,
            className: "col-span-1",
            options: [
              { value: "All", label: "Tất cả phòng" },
              ...uniqueRoomNumbers.map((roomNumber) => ({ value: String(roomNumber), label: `Phòng ${roomNumber}` })),
            ]
          }
        ]}
        hasActiveFilter={searchTerm !== "" || filterBuilding !== "All" || filterFloor !== "All"}
        onReset={() => {
          setSearchTerm("");
          setFilterBuilding("All");
          setFilterFloor("All");
        }}
        customFilters={
          <div className="col-span-2 flex gap-2">
            <button
              onClick={openXungKichPicker}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-sm"
            >
              <Users size={16} className="mr-1 flex-shrink-0" /> Chọn phòng xung kích
            </button>
            <button
              onClick={openXungKichAssignModal}
              className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm shadow-sm"
            >
              <Users size={16} className="mr-1 flex-shrink-0" /> Thêm sinh viên xung kích
            </button>
          </div>
        }
      />

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-300 flex items-center justify-between">
          <h3 className="text-slate-800 font-medium text-sm uppercase tracking-wider text-left">
            Bảng thông tin sinh viên xung kích ({totalItems} kết quả)
          </h3>
        </div>
        <DataTable
          columns={columns}
          data={currentItems}
          keyExtractor={(item) => item.id}
          loading={isLoadingRooms}
          emptyState={{
            icon: Users,
            title: "Chưa có sinh viên xung kích nào",
            description: "Hãy gán sinh viên xung kích để hiển thị"
          }}
        />
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} />

      {/* MODALS */}
      <RoomDetailModal room={selectedRoomDetail} onClose={() => setSelectedRoomDetail(null)} />

      {/* Xung kích Picker Modal */}
      {showXungKichPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-4xl p-6 animate-in scale-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Chọn phòng xung kích</h3>
                <p className="text-sm text-slate-500 mt-1">Chỉ chọn phòng không có sinh viên quốc tế. Mỗi tòa nên duy trì 2 phòng xung kích.</p>
              </div>
              <button onClick={() => setShowXungKichPicker(false)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={xungKichSearch}
                    onChange={(e) => setXungKichSearch(e.target.value)}
                    placeholder="Tìm số phòng hoặc tòa..."
                    className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none bg-slate-50/50"
                  />
                </div>
                <div className="max-h-[420px] overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100">
                  {xungKichCandidates.length === 0 && (
                    <div className="px-4 py-10 text-center text-slate-400 text-sm">Không tìm thấy phòng phù hợp</div>
                  )}
                  {xungKichCandidates.map((room) => {
                    const selected = xungKichTargetRoom?.id === room.id;
                    return (
                      <button
                        key={room.id}
                        onClick={() => setXungKichTargetRoom(room)}
                        className={`w-full text-left px-4 py-3 transition-colors ${selected ? "bg-blue-50" : "hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">{room.room_number}</p>
                            <p className="text-xs text-slate-500">Tòa {getBuildingLabel(room.building)} - Tầng {room.floor}</p>
                          </div>
                          <span className="px-2 py-1 rounded-md text-[10px] font-black bg-slate-100 text-slate-700">
                            {room.currentOccupancy || 0}/{room.capacity}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                {xungKichTargetRoom ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900">Phòng đã chọn</h4>
                      <p className="text-sm text-slate-600 mt-1">{xungKichTargetRoom.room_number} - Tòa {getBuildingLabel(xungKichTargetRoom.building)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500 text-xs">Sức chứa</p>
                        <p className="font-bold text-slate-900">{xungKichTargetRoom.capacity}</p>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500 text-xs">Đang ở</p>
                        <p className="font-bold text-slate-900">{xungKichTargetRoom.currentOccupancy || 0}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-sm text-blue-800">
                      Phòng này sẽ được chuyển sang trạng thái <strong>xung kích</strong>. Phòng không được chứa sinh viên quốc tế.
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowXungKichPicker(false)}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => confirmMarkXungKich(xungKichTargetRoom)}
                        className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                      >
                        Chuyển thành xung kích
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[240px] flex items-center justify-center text-slate-400 text-sm">
                    Chọn một phòng bên trái để xem chi tiết
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Xung kích Assign Modal */}
      {showXungKichAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-4xl p-6 animate-in scale-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Thêm sinh viên xung kích vào phòng</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Chọn sinh viên đang nội trú (không phải quốc tế) và phòng xung kích đích để chuyển xếp phòng.
                </p>
              </div>
              <button onClick={() => setShowXungKichAssignModal(false)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Student Selection */}
              <div className="flex flex-col space-y-3">
                <label className="text-sm font-bold text-slate-700">1. Chọn sinh viên</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={xungKichAssignSearch}
                    onChange={(e) => setXungKichAssignSearch(e.target.value)}
                    placeholder="Tìm tên, mã SV hoặc phòng hiện tại..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-50 outline-none bg-slate-50/50"
                  />
                </div>
                
                {xungKichAssignLoading ? (
                  <div className="flex items-center justify-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mr-2" />
                    Đang tải danh sách sinh viên...
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100">
                    {(() => {
                      const filteredContracts = xungKichActiveContracts.filter(c => {
                        // Exclude international students
                        const priorityReasons = c.rf_priority_reasons || c.priority_reasons || "";
                        if (hasAnyKeyword(priorityReasons, INTERNATIONAL_KEYWORDS)) return false;

                        // Search filter
                        if (!xungKichAssignSearch.trim()) return true;
                        const q = xungKichAssignSearch.toLowerCase();
                        return (
                          c.student_name?.toLowerCase().includes(q) ||
                          c.snapshot_student_id?.toLowerCase().includes(q) ||
                          c.room_number?.toLowerCase().includes(q)
                        );
                      });

                      if (filteredContracts.length === 0) {
                        return <div className="px-4 py-8 text-center text-slate-400 text-sm">Không tìm thấy sinh viên nào</div>;
                      }

                      return filteredContracts.map((c) => {
                        const selected = selectedXungKichStudent?.id === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => setSelectedXungKichStudent(c)}
                            className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between ${
                              selected ? "bg-blue-50 text-blue-900" : "hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <p className="font-bold text-sm text-slate-900">{c.student_name}</p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">
                                MSV: {c.snapshot_student_id || "—"} | Phòng hiện tại: {c.room_number || "Không"}
                              </p>
                            </div>
                            {selected && <CheckSquare size={16} className="text-blue-600 shrink-0" />}
                          </button>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Right Column: Room Selection & Summary */}
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-3">
                  <label className="text-sm font-bold text-slate-700">2. Chọn phòng xung kích</label>
                  <div className="max-h-[220px] overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100">
                    {(() => {
                      const xungKichRooms = safeRooms.filter(r => (r.reserved_for || "general") === "xung_kich");
                      if (xungKichRooms.length === 0) {
                        return (
                          <div className="px-4 py-8 text-center text-slate-400 text-sm">
                            Chưa có phòng nào được gán là xung kích.
                          </div>
                        );
                      }
                      return xungKichRooms.map((room) => {
                        const isFull = room.currentOccupancy >= room.capacity;
                        const selected = selectedXungKichRoom?.id === room.id;
                        return (
                          <button
                            key={room.id}
                            disabled={isFull}
                            onClick={() => setSelectedXungKichRoom(room)}
                            className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between ${
                              selected ? "bg-blue-50 text-blue-900" : isFull ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <p className="font-bold text-sm text-slate-900">Phòng {room.room_number}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Tòa {getBuildingLabel(room.building)} - Tầng {room.floor}
                              </p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isFull ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {room.currentOccupancy || 0}/{room.capacity} {isFull ? "Đầy" : "Trống"}
                            </span>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Assignment Summary Card */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Tóm tắt thông tin gán</h4>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Sinh viên:</span>
                      <span className="font-bold text-slate-950">{selectedXungKichStudent?.student_name || "Chưa chọn"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Phòng cũ:</span>
                      <span className="font-semibold text-slate-700">{selectedXungKichStudent?.room_number || "Chưa có"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Phòng xung kích mới:</span>
                      <span className="font-black text-blue-700">{selectedXungKichRoom ? `Phòng ${selectedXungKichRoom.room_number} (Tòa ${getBuildingLabel(selectedXungKichRoom.building)})` : "Chưa chọn"}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setShowXungKichAssignModal(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 text-sm transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleTransferToXungKich}
                      disabled={!selectedXungKichStudent || !selectedXungKichRoom || xungKichAssignLoading}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {xungKichAssignLoading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                      Xác nhận gán
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EmailComposeModal */}
      <EmailComposeModal
        isOpen={!!composeEmail}
        onClose={() => { setComposeEmail(null); }}
        defaultTo={composeEmail?.to}
        defaultSubject={composeEmail?.subject}
        defaultBody={composeEmail?.body}
        recipientCount={composeEmail?.recipientCount > 1 ? composeEmail.recipientCount : undefined}
        onSend={({ to, subject, body }) => {
          console.log("Gửi email:", { to, subject, body });
        }}
      />
    </div>
  );
};

export default RoomXungKich;

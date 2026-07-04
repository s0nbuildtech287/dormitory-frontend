import React, { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Mail, Phone, FileText, User, Home, Building2, CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw, Sparkles, Star, ChevronDown } from "lucide-react";
import { getContractById, getSuggestedRooms, assignRoom, transferRoom, unassignRoom, terminateContract } from "../../../api/apiContract.js";
import useBuildingDisplayNames from "../../../hooks/useBuildingDisplayNames.js";

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (v) => (v !== null && v !== undefined && v !== "" ? v : "—");
const fmtMoney = (v) => (v ? Number(v).toLocaleString("vi-VN") + " VNĐ" : "—");
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—");

const STATUS_CONFIG = {
  Pending: { label: "Chờ gán phòng", cls: "bg-amber-100 text-amber-700", icon: <Clock size={13} /> },
  Active: { label: "Đang nội trú", cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={13} /> },
  Expired: { label: "Hết hạn", cls: "bg-slate-100 text-slate-600", icon: <FileText size={13} /> },
  Terminated: { label: "Đã chấm dứt", cls: "bg-rose-100 text-rose-700", icon: <XCircle size={13} /> },
};

const InfoRow = ({ label, value, highlight }) => (
  <div>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{label}</p>
    <p className={`font-bold text-sm ${highlight ? "text-blue-700" : "text-slate-800"}`}>{fmt(value)}</p>
  </div>
);

// ─── Room assign modal ────────────────────────────────────────────────────────
const AssignRoomModal = ({ contractId, mode = "assign", currentRoomId = null, onSuccess, onClose }) => {
  const { getBuildingLabel, getRoomLabel } = useBuildingDisplayNames();
  const [suggestedIds, setSuggestedIds] = useState(new Set());
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSuggestedRooms(contractId)
      .then((r) => {
        if (r.success) {
          const { suggested = [], all = [] } = r.data;
          setSuggestedIds(new Set(suggested.map((s) => s.id)));
          setRooms(all);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [contractId]);

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    setError(null);
    try {
      const apiCall = mode === "transfer" ? transferRoom : assignRoom;
      const res = await apiCall(contractId, selected);
      if (res.success) onSuccess(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setAssigning(false);
    }
  };

  const getStudentTypeLabel = (priority, year) => {
    if (!priority && !year) return { label: "Sinh viên khóa cũ", cls: "bg-slate-100 text-slate-600" };
    const p = (priority || "").toLowerCase();
    if (p.includes("lưu học sinh") || p.includes("quốc tế") || p.includes("du học sinh"))
      return { label: "Lưu học sinh / Quốc tế", cls: "bg-purple-100 text-purple-700" };
    if (year === 1)
      return { label: "Tân sinh viên", cls: "bg-blue-100 text-blue-700" };
    return { label: "Sinh viên khóa cũ", cls: "bg-slate-100 text-slate-600" };
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {mode === "transfer" ? "Chuyển phòng cho sinh viên" : "Gán phòng cho sinh viên"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {rooms.length > 0 ? `${rooms.length} phòng phù hợp · ${suggestedIds.size} gợi ý tốt nhất` : "Danh sách phòng phù hợp"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 text-sm flex items-center gap-2">
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full mr-3" />
            Đang tìm phòng phù hợp...
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Không có phòng trống phù hợp</div>
        ) : (
          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            {rooms.map((room) => {
              const isSuggested = suggestedIds.has(room.id);
              const isCurrent = currentRoomId && room.id === currentRoomId;
              const isExpanded = expanded === room.id;
              const occupants = Array.isArray(room.occupants) ? room.occupants : [];
              return (
                <div
                  key={room.id}
                  className={`rounded-2xl border-2 transition-all relative ${
                    isCurrent
                      ? "border-slate-200 hover:border-slate-300"
                      : selected === room.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white z-10" title="Phòng hiện tại" />
                  )}
                  <button
                    onClick={() => setSelected(room.id)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isSuggested && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black flex items-center gap-1 shrink-0">
                            <Sparkles size={9} /> Gợi ý
                          </span>
                        )}
                        <div>
                          <p className="font-black text-slate-900">
                            {getRoomLabel(room.building, room.room_number)}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Tầng {room.floor} · {room.available_slots}/{room.capacity} chỗ trống
                            {room.same_year_count > 0 && <span className="ml-2 text-blue-600 font-bold">· {room.same_year_count} SV cùng khoá</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-emerald-700 text-sm">{Number(room.rent_price).toLocaleString("vi-VN")} VNĐ</p>
                          {room.same_year_faculty_count > 0 && (
                            <p className="text-[10px] text-amber-600 flex items-center gap-1 justify-end">
                              <Star size={9} className="fill-amber-400 text-amber-400" />
                              {room.same_year_faculty_count} SV cùng khoa & khoá
                            </p>
                          )}
                        </div>
                        {occupants.length > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : room.id); }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                            title="Xem sinh viên trong phòng"
                          >
                            <ChevronDown size={15} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && occupants.length > 0 && (
                    <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sinh viên trong phòng</p>
                      {occupants.map((oc, i) => {
                        const typeTag = getStudentTypeLabel(oc.priority, oc.year);
                        return (
                          <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 text-xs">
                            <span className="font-bold text-slate-800">{oc.name || "—"}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500">Năm {oc.year}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500">{oc.faculty || "—"}</span>
                            <span className="text-slate-300">·</span>
                            <span className={`font-black px-2 py-0.5 rounded-full ${typeTag.cls}`}>{typeTag.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            Huỷ
          </button>
          <button
            onClick={handleAssign}
            disabled={!selected || assigning}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {assigning ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Đang xử lý...
              </>
            ) : (
              mode === "transfer" ? "Xác nhận chuyển phòng" : "Xác nhận gán phòng"
            )}
          </button>
        </div>
      </div>
    </div>

  );
};

// ─── Main Detail Component ────────────────────────────────────────────────────
const StudentDetail = ({ contractId, onBack }) => {
  const { getBuildingLabel, getRoomLabel } = useBuildingDisplayNames();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [unassigning, setUnassigning] = useState(false);
  const [confirmUnassign, setConfirmUnassign] = useState(false);
  const [terminating, setTerminating] = useState(false);
  const [confirmTerminate, setConfirmTerminate] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getContractById(contractId);
      if (res.success) setContract(res.data);
      else setError(res.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAssignSuccess = (updated) => {
    setShowAssign(false);
    setShowTransfer(false);
    setContract(updated);
    setActionMsg("✅ Gán phòng thành công! Hợp đồng đã được kích hoạt.");
  };

  const handleUnassign = async () => {
    setUnassigning(true);
    setConfirmUnassign(false);
    try {
      const res = await unassignRoom(contractId);
      if (res.success) {
        setContract(res.data);
        setActionMsg("✅ Đã rút phòng. Hợp đồng về trạng thái chờ gán phòng.");
      }
    } catch (e) {
      setActionMsg(`❌ ${e.message}`);
    } finally {
      setUnassigning(false);
    }
  };

  const handleTerminate = async () => {
    setTerminating(true);
    setConfirmTerminate(false);
    try {
      const res = await terminateContract(contractId);
      if (res.success) {
        setContract(res.data);
        setActionMsg("Hợp đồng đã được chấm dứt.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setTerminating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-400">
        <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mr-3" />
        Đang tải...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-900 font-bold text-sm">
          <ArrowLeft size={16} className="mr-2" /> Quay lại
        </button>
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
          <AlertTriangle size={18} /> {error}
        </div>
      </div>
    );
  }

  if (!contract) return null;

  const statusCfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.Active;
  const isPending = contract.status === "Pending";
  const isActive = contract.status === "Active";

  // Merge snapshot fields to display student info
  const studentId = contract.snapshot_student_id || contract.rf_student_id || "—";
  const cccd = contract.snapshot_cccd || contract.rf_cccd || "—";
  const gender = contract.snapshot_gender || contract.rf_gender || "—";
  const year = contract.snapshot_year || contract.rf_year;
  const faculty = contract.snapshot_faculty || contract.rf_faculty || "—";
  const phone = contract.snapshot_phone || contract.student_phone || contract.rf_phone || "—";
  const gpa = contract.rf_gpa;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách
        </button>

        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors" title="Làm mới">
            <RefreshCw size={15} />
          </button>
          {isPending && (
            <button
              onClick={() => setShowAssign(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Home size={15} /> Gán phòng ngay
            </button>
          )}
          {isActive && (
            <>
              <button
                onClick={() => setShowTransfer(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
              >
                <RefreshCw size={15} /> Chuyển phòng
              </button>
              <button
                onClick={() => setConfirmUnassign(true)}
                disabled={unassigning}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                <Clock size={15} /> Rút về chờ gán
              </button>
              <button
                onClick={() => setConfirmTerminate(true)}
                disabled={terminating}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors"
              >
                <XCircle size={15} /> Chấm dứt HĐ
              </button>
            </>
          )}
        </div>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 size={15} /> {actionMsg}
        </div>
      )}

      {/* Pending banner */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800">
          <Clock size={18} className="flex-shrink-0 text-amber-500" />
          <div>
            <p className="font-bold text-sm">Hợp đồng đang chờ gán phòng</p>
            <p className="text-xs mt-0.5">Hồ sơ đã được phê duyệt. Hãy gán phòng để kích hoạt hợp đồng.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: student + contract */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile card */}
          <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-5">
              {contract.student_avatar ? (
                <img src={contract.student_avatar} className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100" alt="" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-black flex-shrink-0">
                  {contract.student_name
                    ? contract.student_name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(-2)
                        .join("")
                        .toUpperCase()
                    : "SV"}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-slate-900">{contract.student_name || "—"}</h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusCfg.cls}`}>
                    {statusCfg.icon} {statusCfg.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={14} className="text-slate-400" />
                    <span className="font-bold">{studentId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={14} className="text-slate-400" />
                    <span>{contract.student_email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={14} className="text-slate-400" />
                    <span>{phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 size={14} className="text-slate-400" />
                    <span>{faculty}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Student academic info */}
          <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="font-black text-slate-900 mb-5 flex items-center gap-2 uppercase tracking-widest text-xs">
              <User size={14} className="text-blue-500" /> Thông tin học vụ
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <InfoRow label="Mã SV" value={studentId} highlight />
              <InfoRow label="CCCD/CMND" value={cccd} />
              <InfoRow label="Giới tính" value={gender} />
              <InfoRow label="Năm học" value={year ? `Năm ${year}` : null} />
              <InfoRow label="Khoa/Ngành" value={faculty} />
              <InfoRow label="GPA" value={gpa ? Number(gpa).toFixed(2) : null} />
              {(() => {
                const p = (contract.rf_priority_reasons || "").toLowerCase();
                const yr = contract.snapshot_year || contract.rf_year;
                let label, cls;
                if (p.includes("lưu học sinh") || p.includes("quốc tế") || p.includes("du học sinh") || p.includes("lao") || p.includes("campuchia")) {
                  label = "Lưu học sinh / Quốc tế"; cls = "bg-purple-100 text-purple-700 border border-purple-200";
                } else if (p.includes("liệt sỹ") || p.includes("liet sy")) {
                  label = "Con liệt sỹ"; cls = "bg-red-100 text-red-700 border border-red-200";
                } else if (p.includes("thương binh")) {
                  label = "Con thương binh"; cls = "bg-orange-100 text-orange-700 border border-orange-200";
                } else if (p.includes("hộ nghèo") || p.includes("ho ngheo") || p.includes("cận nghèo")) {
                  label = "Hộ nghèo / Cận nghèo"; cls = "bg-yellow-100 text-yellow-700 border border-yellow-200";
                } else if (p.includes("khuyết tật") || p.includes("khuyet tat")) {
                  label = "Khuyết tật"; cls = "bg-blue-100 text-blue-700 border border-blue-200";
                } else if (p.includes("hoàn cảnh khó khăn") || p.includes("hoan canh")) {
                  label = "Hoàn cảnh khó khăn"; cls = "bg-amber-100 text-amber-700 border border-amber-200";
                } else if (p.includes("hải đảo") || p.includes("hai dao")) {
                  label = "Hải đảo"; cls = "bg-cyan-100 text-cyan-700 border border-cyan-200";
                } else if (p.includes("vùng sâu") || p.includes("vung sau")) {
                  label = "Vùng sâu vùng xa"; cls = "bg-green-100 text-green-700 border border-green-200";
                } else if (p && p.length > 0) {
                  label = "Diện chính sách"; cls = "bg-indigo-100 text-indigo-700 border border-indigo-200";
                } else if (Number(yr) === 1) {
                  label = "Tân sinh viên"; cls = "bg-blue-100 text-blue-700 border border-blue-200";
                } else {
                  label = "Sinh viên khóa cũ"; cls = "bg-slate-100 text-slate-600 border border-slate-200";
                }
                return (
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Đối tượng</p>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black ${cls}`}>{label}</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Contract details */}
          <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="font-black text-slate-900 mb-5 flex items-center gap-2 uppercase tracking-widest text-xs">
              <FileText size={14} className="text-blue-500" /> Chi tiết hợp đồng
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <InfoRow label="Số hợp đồng" value={contract.contract_number} highlight />
              <InfoRow label="Ngày ký" value={fmtDate(contract.signed_at)} />
              <InfoRow label="Ngày bắt đầu" value={fmtDate(contract.start_date)} />
              <InfoRow label="Ngày kết thúc" value={fmtDate(contract.end_date)} />
              <InfoRow label="Tiền thuê/tháng" value={fmtMoney(contract.rent_price)} />
              <InfoRow label="Tiền cọc" value={fmtMoney(contract.deposit_amount)} />
              <InfoRow label="Đã nộp cọc" value={contract.deposit_paid ? "Đã nộp" : "Chưa nộp"} />
              {contract.termination_reason && (
                <div className="col-span-3">
                  <InfoRow label="Lý do chấm dứt" value={contract.termination_reason} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: room card */}
        <div className="space-y-6">
          <div className={`p-7 rounded-3xl shadow-sm border ${isPending ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"}`}>
            <h4 className="font-black text-slate-900 mb-5 flex items-center gap-2 uppercase tracking-widest text-xs">
              <Home size={14} className="text-blue-500" /> Thông tin phòng
            </h4>
            {contract.room_number ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-blue-600 rounded-2xl">
                  <p className="text-[10px] text-blue-200 font-bold uppercase mb-1">Phòng</p>
                  <p className="text-4xl font-black text-white">{getRoomLabel(null, contract.room_number)}</p>
                  <p className="text-blue-200 text-sm mt-1">{getBuildingLabel(contract.building)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Tầng" value={contract.floor ? `Tầng ${contract.floor}` : null} />
                  <InfoRow label="Giá phòng" value={fmtMoney(contract.room_price)} />
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <Home size={32} className="text-amber-400 mx-auto mb-3" />
                <p className="font-bold text-amber-700">Chưa được gán phòng</p>
                <p className="text-xs text-amber-600 mt-1.5">Nhấn "Gán phòng ngay" để tiếp tục</p>
                <button
                  onClick={() => setShowAssign(true)}
                  className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 w-full"
                >
                  Gán phòng ngay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssign && <AssignRoomModal contractId={contractId} mode="assign" onSuccess={handleAssignSuccess} onClose={() => setShowAssign(false)} />}

      {/* Transfer Modal */}
      {showTransfer && <AssignRoomModal contractId={contractId} mode="transfer" currentRoomId={contract?.room_id} onSuccess={handleAssignSuccess} onClose={() => setShowTransfer(false)} />}

      {/* Confirm unassign overlay */}
      {confirmUnassign && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <AlertTriangle size={32} className="text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-black text-slate-900">Rút phòng về trạng thái chờ gán?</h3>
              <p className="text-sm text-slate-500 mt-2">Sinh viên sẽ bị rút khỏi phòng hiện tại và hợp đồng về trạng thái Pending.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmUnassign(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                Huỷ
              </button>
              <button onClick={handleUnassign} disabled={unassigning} className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 disabled:opacity-50">
                {unassigning ? "Đang xử lý..." : "Xác nhận rút phòng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm terminate overlay */}
      {confirmTerminate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <AlertTriangle size={32} className="text-rose-500 mx-auto mb-3" />
              <h3 className="text-lg font-black text-slate-900">Chấm dứt hợp đồng?</h3>
              <p className="text-sm text-slate-500 mt-2">Hành động này sẽ giải phóng chỗ ở và không thể hoàn tác.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmTerminate(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                Huỷ
              </button>
              <button onClick={handleTerminate} disabled={terminating} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 disabled:opacity-50">
                {terminating ? "Đang xử lý..." : "Chấm dứt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;

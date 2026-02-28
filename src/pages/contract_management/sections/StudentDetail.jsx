import React, { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Mail, Phone, FileText, User, Home, Building2, CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw, Sparkles, Star } from "lucide-react";
import { getContractById, getSuggestedRooms, assignRoom, terminateContract } from "../../../api/apiContract.js";

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
const AssignRoomModal = ({ contractId, onSuccess, onClose }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSuggestedRooms(contractId)
      .then((r) => {
        if (r.success) setRooms(r.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [contractId]);

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    setError(null);
    try {
      const res = await assignRoom(contractId, selected);
      if (res.success) onSuccess(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">Gán phòng cho sinh viên</h3>
            <p className="text-xs text-slate-500 mt-0.5">Top phòng gợi ý theo giới tính và cùng khoá học</p>
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
          <div className="space-y-3">
            {rooms.map((room, idx) => (
              <button
                key={room.id}
                onClick={() => setSelected(room.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  selected === room.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {idx === 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black flex items-center gap-1">
                        <Sparkles size={9} /> Gợi ý
                      </span>
                    )}
                    <div>
                      <p className="font-black text-slate-900">
                        Phòng {room.room_number}
                        <span className="text-slate-500 font-bold text-xs ml-2">({room.building})</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tầng {room.floor} · {room.available_slots}/{room.capacity} chỗ trống
                        {room.same_year_count > 0 && <span className="ml-2 text-blue-600 font-bold">· {room.same_year_count} SV cùng khoá</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700 text-sm">{Number(room.rent_price).toLocaleString("vi-VN")} VNĐ</p>
                    {room.year_match_score > 0 && (
                      <p className="text-[10px] text-amber-600 flex items-center gap-1 justify-end">
                        <Star size={9} className="fill-amber-400 text-amber-400" />
                        {room.year_match_score}% cùng khoá
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
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
                <div className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> Đang gán...
              </>
            ) : (
              "Xác nhận gán phòng"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Detail Component ────────────────────────────────────────────────────
const StudentDetail = ({ contractId, onBack }) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
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
    setContract(updated);
    setActionMsg("✅ Gán phòng thành công! Hợp đồng đã được kích hoạt.");
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
            <button
              onClick={() => setConfirmTerminate(true)}
              disabled={terminating}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors"
            >
              <XCircle size={15} /> Chấm dứt HĐ
            </button>
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
                  <p className="text-4xl font-black text-white">{contract.room_number}</p>
                  <p className="text-blue-200 text-sm mt-1">Tòa {contract.building}</p>
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
      {showAssign && <AssignRoomModal contractId={contractId} onSuccess={handleAssignSuccess} onClose={() => setShowAssign(false)} />}

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

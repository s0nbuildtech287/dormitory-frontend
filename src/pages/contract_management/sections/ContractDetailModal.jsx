import React, { useEffect, useState, useCallback } from "react";
import { X, Mail, Phone, FileText, User, Home, Building2, CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw, Sparkles, Star, FileX, FileCheck } from "lucide-react";
import { getContractById, getSuggestedRooms, assignRoom, terminateContract, updateContract } from "../../../api/apiContract.js";
import EmailComposeModal, { EMAIL_TEMPLATES } from "../../../components/common/EmailComposeModal.jsx";
import useBuildingDisplayNames from "../../../hooks/useBuildingDisplayNames.js";

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (v) => (v !== null && v !== undefined && v !== "" ? v : "—");
const fmtMoney = (v) => (v ? Number(v).toLocaleString("vi-VN") + " VNĐ" : "—");
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—");

const STATUS_CONFIG = {
  Pending: { label: "Chờ gán phòng", cls: "bg-amber-100 text-amber-700", icon: <Clock size={13} /> },
  Active: { label: "Đang nội trú", cls: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={13} /> },
  Expired: { label: "Hết hạn", cls: "bg-slate-100 text-slate-600", icon: <FileX size={13} /> },
  Terminated: { label: "Đã chấm dứt", cls: "bg-rose-100 text-rose-700", icon: <XCircle size={13} /> },
};

// ─── Room assign modal (inner) ───────────────────────────────────────────────
const AssignRoomModal = ({ contractId, onSuccess, onClose }) => {
  const { getBuildingLabel } = useBuildingDisplayNames();
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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
          <div className="space-y-3 max-h-[40vh] overflow-y-auto">
            {rooms.map((room, idx) => (
              <button
                key={room.id}
                onClick={() => setSelected(room.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selected === room.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
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
                        <span className="text-slate-500 font-bold text-xs ml-2">({getBuildingLabel(room.building)})</span>
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

// ─── Main Detail Modal ────────────────────────────────────────────────────────
const ContractDetailModal = ({ contractId, onClose, onRefresh }) => {
  const { getBuildingLabel } = useBuildingDisplayNames();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [terminating, setTerminating] = useState(false);
  const [confirmTerminate, setConfirmTerminate] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [flagSaving, setFlagSaving] = useState(null);
  const [composeEmail, setComposeEmail] = useState(null);
  const [sendEmailChecked, setSendEmailChecked] = useState(false);

  const toggleFlag = async (field, currentValue) => {
    setFlagSaving(field);
    try {
      const res = await updateContract(contractId, { [field]: !currentValue });
      if (res.success) {
        setContract((prev) => ({ ...prev, [field]: !currentValue }));
      }
    } catch (e) {
      console.warn("Toggle flag error:", e.message);
    } finally {
      setFlagSaving(null);
    }
  };

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
    if (onRefresh) onRefresh();
  };

  const handleTerminate = async () => {
    setTerminating(true);
    setConfirmTerminate(false);
    try {
      const res = await terminateContract(contractId);
      if (res.success) {
        setContract(res.data);
        setActionMsg("Hợp đồng đã được chấm dứt.");
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setTerminating(false);
    }
  };

  if (!contractId) return null;

  const statusCfg = contract ? STATUS_CONFIG[contract.status] || STATUS_CONFIG.Active : null;
  const isPending = contract?.status === "Pending";
  const isActive = contract?.status === "Active";

  // Student info fields
  const studentId = contract?.snapshot_student_id || contract?.rf_student_id || "—";
  const cccd = contract?.snapshot_cccd || contract?.rf_cccd || "—";
  const gender = contract?.snapshot_gender || contract?.rf_gender || "—";
  const year = contract?.snapshot_year || contract?.rf_year;
  const faculty = contract?.snapshot_faculty || contract?.rf_faculty || "—";
  const phone = contract?.snapshot_phone || contract?.student_phone || contract?.rf_phone || "—";
  const gpa = contract?.rf_gpa;

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in scale-in duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b border-blue-800 rounded-t-3xl z-10">
          <h3 className="text-white font-bold text-lg">Chi tiết hợp đồng sinh viên</h3>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all" title="Làm mới">
              <RefreshCw size={16} />
            </button>
            <button onClick={onClose} className="p-1 text-white hover:bg-white/20 rounded-lg transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mr-3" />
            Đang tải...
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
              <AlertTriangle size={18} /> {error}
            </div>
          </div>
        ) : contract ? (
          <div className="p-6 space-y-6">
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

            {/* ── Thông tin sinh viên ── */}
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                <User size={14} className="text-blue-500" /> Thông tin sinh viên
              </h4>
              <div className="flex items-center gap-5 mb-4">
                {contract.student_avatar ? (
                  <img src={contract.student_avatar} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100" alt="" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-black flex-shrink-0">
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
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-slate-900">{contract.student_name || "—"}</h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusCfg.cls}`}>
                      {statusCfg.icon} {statusCfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <User size={13} className="text-slate-400" /> {studentId}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail size={13} className="text-slate-400" /> {contract.student_email || "—"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Mã sinh viên</p>
                  <p className="text-slate-700 font-bold">{studentId}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">CCCD/CMND</p>
                  <p className="text-slate-700 font-bold">{cccd}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Giới tính</p>
                  <p className="text-slate-700 font-bold">{gender}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Số điện thoại</p>
                  <p className="text-slate-700 font-bold flex items-center gap-1">
                    <Phone size={13} className="text-slate-400" /> {phone}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Khoa/Ngành</p>
                  <p className="text-slate-700 font-bold flex items-center gap-1">
                    <Building2 size={13} className="text-slate-400" /> {faculty}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Năm học</p>
                  <p className="text-slate-700 font-bold">{year ? `Năm ${year}` : "—"}</p>
                </div>
                {gpa && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-slate-600 text-xs font-semibold mb-1">GPA</p>
                    <p className="text-slate-700 font-bold">{Number(gpa).toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Chi tiết hợp đồng ── */}
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} className="text-blue-500" /> Chi tiết hợp đồng
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Số hợp đồng</p>
                  <p className="text-blue-700 font-bold">{fmt(contract.contract_number)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Thời hạn hợp đồng</p>
                  <p className="text-slate-700 font-bold">6 tháng</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Ngày ký</p>
                  <p className="text-slate-700 font-bold">{fmtDate(contract.signed_at)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Ngày bắt đầu</p>
                  <p className="text-slate-700 font-bold">{fmtDate(contract.start_date)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Ngày kết thúc</p>
                  <p className="text-slate-700 font-bold">{fmtDate(contract.end_date)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Tiền thuê/tháng</p>
                  <p className="text-emerald-700 font-bold">{fmtMoney(contract.rent_price)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-slate-600 text-xs font-semibold mb-1">Tiền cọc</p>
                  <p className="text-slate-700 font-bold">{fmtMoney(contract.deposit_amount)}</p>
                </div>
                {contract.termination_reason && (
                  <div className="bg-rose-50 p-4 rounded-xl col-span-2">
                    <p className="text-slate-600 text-xs font-semibold mb-1">Lý do chấm dứt</p>
                    <p className="text-rose-700 font-bold">{contract.termination_reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Trạng thái hành chính ── */}
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                <FileCheck size={14} className="text-blue-500" /> Trạng thái hành chính
              </h4>
              <div className="flex gap-3">
                {/* CỌC */}
                <button
                  onClick={() => toggleFlag("deposit_paid", contract.deposit_paid)}
                  disabled={!!flagSaving}
                  className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${contract.deposit_paid ? "bg-slate-800 border-slate-800" : "border-slate-400"}`}>
                    {contract.deposit_paid && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <span className="text-xs text-slate-700 font-semibold whitespace-nowrap">Tiền cọc</span>
                  <span className={`ml-auto text-xs font-bold whitespace-nowrap ${contract.deposit_paid ? "text-emerald-600" : "text-slate-400"}`}>
                    {contract.deposit_paid ? "Đã cọc" : "Chưa cọc"}
                  </span>
                  {flagSaving === "deposit_paid" && <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin flex-shrink-0" />}
                </button>

                {/* BẢN CỨNG */}
                <button
                  onClick={() => toggleFlag("hard_copy_received", contract.hard_copy_received)}
                  disabled={!!flagSaving}
                  className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${contract.hard_copy_received ? "bg-slate-800 border-slate-800" : "border-slate-400"}`}>
                    {contract.hard_copy_received && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <span className="text-xs text-slate-700 font-semibold whitespace-nowrap">Bản cứng HĐ</span>
                  <span className={`ml-auto text-xs font-bold whitespace-nowrap ${contract.hard_copy_received ? "text-emerald-600" : "text-slate-400"}`}>
                    {contract.hard_copy_received ? "Đã nhận" : "Chưa nhận"}
                  </span>
                  {flagSaving === "hard_copy_received" && <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin flex-shrink-0" />}
                </button>
              </div>

              {/* Checkbox + nút gửi email – chỉ enable khi đủ 2 điều kiện */}
              <div className={`mt-3 flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                contract.deposit_paid && contract.hard_copy_received
                  ? "border-blue-200 bg-blue-50"
                  : "border-slate-200 bg-slate-50 opacity-60"
              }`}>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendEmailChecked}
                    onChange={e => setSendEmailChecked(e.target.checked)}
                    disabled={!contract.deposit_paid || !contract.hard_copy_received}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Gửi email thông báo hợp đồng cho sinh viên
                  </span>
                </label>
                <button
                  disabled={!sendEmailChecked || !contract.deposit_paid || !contract.hard_copy_received}
                  onClick={() => {
                    const tpl = EMAIL_TEMPLATES.CONTRACT_CREATED(contract);
                    setComposeEmail({
                      to: contract.student_email || "",
                      subject: tpl.subject,
                      body: tpl.body,
                    });
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                >
                  <Mail size={13} /> Gửi email
                </button>
              </div>
              {(!contract.deposit_paid || !contract.hard_copy_received) && (
                <p className="text-[11px] text-slate-400 mt-1.5 px-1">
                  Cần tích đủ "Đã cọc" và "Đã nhận bản cứng" trước khi gửi email.
                </p>
              )}
            </div>

            {/* ── Thông tin phòng & dịch vụ ── */}
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                <Home size={14} className="text-blue-500" /> Thông tin phòng & dịch vụ
              </h4>
              {contract.room_number ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
                      <p className="text-blue-500 text-xs font-semibold mb-1">Số phòng</p>
                      <p className="text-2xl font-black text-blue-700">{contract.room_number}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-slate-600 text-xs font-semibold mb-1">Tòa nhà</p>
                      <p className="text-slate-700 font-bold">{getBuildingLabel(contract.building)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-slate-600 text-xs font-semibold mb-1">Tầng</p>
                      <p className="text-slate-700 font-bold">{contract.floor ? `Tầng ${contract.floor}` : "—"}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-slate-600 text-xs font-semibold mb-1">Giá phòng</p>
                      <p className="text-emerald-700 font-bold">{fmtMoney(contract.room_price)}</p>
                    </div>
                  </div>

                  {/* Phí dịch vụ */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-slate-600 text-xs font-semibold mb-3 uppercase tracking-wider">Phí dịch vụ đi kèm</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-slate-100 text-center">
                        <p className="text-[10px] text-slate-500 mb-1">Tiền điện</p>
                        <p className="text-xs font-bold text-slate-700">3.500 VNĐ/kWh</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100 text-center">
                        <p className="text-[10px] text-slate-500 mb-1">Tiền nước</p>
                        <p className="text-xs font-bold text-slate-700">15.000 VNĐ/m³</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100 text-center">
                        <p className="text-[10px] text-slate-500 mb-1">Internet</p>
                        <p className="text-xs font-bold text-slate-700">{fmtMoney(contract.room_internet_fee || 50000)}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100 text-center">
                        <p className="text-[10px] text-slate-500 mb-1">Gửi xe</p>
                        <p className="text-xs font-bold text-slate-700">{fmtMoney(contract.room_parking_fee || 100000)}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100 text-center">
                        <p className="text-[10px] text-slate-500 mb-1">Rác</p>
                        <p className="text-xs font-bold text-slate-700">{fmtMoney(contract.room_garbage_fee || 20000)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                  <Home size={32} className="text-amber-400 mx-auto mb-3" />
                  <p className="font-bold text-amber-700">Chưa được gán phòng</p>
                  <p className="text-xs text-amber-600 mt-1.5">Nhấn "Gán phòng ngay" ở bên dưới để tiếp tục</p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        {contract && (
          <div className="sticky bottom-0 bg-slate-100 px-6 py-4 flex items-center justify-between gap-3 border-t border-slate-200 rounded-b-3xl">
            <div className="flex gap-2">
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
            <button onClick={onClose} className="px-4 py-2 text-slate-700 font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all">
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* Assign Room Modal */}
      {showAssign && <AssignRoomModal contractId={contractId} onSuccess={handleAssignSuccess} onClose={() => setShowAssign(false)} />}

      {/* Confirm terminate overlay */}
      {confirmTerminate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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

    {/* Email Compose Modal */}
    <EmailComposeModal
      isOpen={!!composeEmail}
      onClose={() => setComposeEmail(null)}
      defaultTo={composeEmail?.to}
      defaultSubject={composeEmail?.subject}
      defaultBody={composeEmail?.body}
      templates={[
        EMAIL_TEMPLATES.CONTRACT_CREATED(contract || {}),
      ]}
      onSend={() => {}}
    />
    </>
  );
};

export default ContractDetailModal;

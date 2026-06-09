import { useEffect, useState } from "react";
import {
  FileText, Home, Calendar, CreditCard, CheckCircle,
  Clock, AlertCircle, Building, Users, Layers, Ruler,
  Hash, Shield, X, QrCode, Copy, Building2, BadgeCheck, Info, ExternalLink, Printer
} from "lucide-react";
import { getStudentContracts } from "../../../api/apiStudent.js";
import { createVNPayPayment } from "../../../api/apiVNPay.js";
import ContractPrintView from "./ContractPrintView.jsx";
import useBuildingDisplayNames from "../../../hooks/useBuildingDisplayNames.js";

const fmt      = (v) => (v != null && v !== "" ? v : "—");
const fmtDate  = (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—");
const fmtMoney = (v) => (v != null ? `${Number(v).toLocaleString("vi-VN")} đ` : "—");

const STATUS_CFG = {
  Active:     { cls: "bg-emerald-100 text-emerald-700", label: "Đang hiệu lực", icon: CheckCircle },
  Pending:    { cls: "bg-amber-100 text-amber-700",     label: "Chờ gán phòng", icon: Clock },
  Expired:    { cls: "bg-slate-100 text-slate-500",     label: "Hết hạn",        icon: AlertCircle },
  Terminated: { cls: "bg-rose-100 text-rose-700",       label: "Đã chấm dứt",   icon: AlertCircle },
};

/* ── Dòng thông tin (giống InfoRow bên profile) ── */
const InfoRow = ({ icon: Icon, label, value, accent, mono }) => (
  <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className={`p-2 rounded-lg shrink-0 ${accent ? "bg-blue-50" : "bg-slate-50"}`}>
      <Icon size={14} className={accent ? "text-blue-500" : "text-slate-400"} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 truncate ${accent ? "text-blue-700" : "text-slate-800"} ${mono ? "font-mono" : ""}`}>
        {fmt(value)}
      </p>
    </div>
  </div>
);

/* ── Section card (giống bên profile) ── */
const Section = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
    <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
      <Icon size={14} className="text-slate-400" />
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{title}</p>
    </div>
    <div className="px-5 py-1">{children}</div>
  </div>
);

/* ── Thanh tiến trình ── */
const ContractProgress = ({ startDate, endDate }) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate).getTime();
  const end   = new Date(endDate).getTime();
  const now   = Date.now();
  const pct   = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  const daysLeft = Math.max(0, Math.round((end - now) / 86400000));
  return (
    <div className="px-5 py-4 border-b border-slate-100">
      <div className="flex justify-between text-xs text-slate-400 font-semibold mb-2">
        <span>{fmtDate(startDate)}</span>
        <span className={daysLeft <= 30 ? "text-rose-500 font-bold" : "text-slate-500"}>{daysLeft} ngày còn lại</span>
        <span>{fmtDate(endDate)}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${daysLeft <= 30 ? "bg-rose-400" : "bg-blue-500"}`}
          style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-slate-400 mt-1.5 text-right">{pct}% thời hạn đã qua</p>
    </div>
  );
};

const StudentContract = () => {
  const { getBuildingLabel, getRoomLabel } = useBuildingDisplayNames();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [selected, setSelected]   = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showPrint, setShowPrint]       = useState(false);
  const [copied, setCopied]            = useState(null);
  const [payLoading, setPayLoading]    = useState(false);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleVNPayDeposit = async () => {
    if (!c) return;
    setPayLoading(true);
    try {
      const { paymentUrl } = await createVNPayPayment({
        type: "deposit",
        id: c.id,
        amount: Number(c.deposit_amount),
        orderInfo: `Thanh toan tien coc hop dong ${c.contract_number}`,
      });
      window.location.href = paymentUrl;
    } catch (err) {
      alert(err.message || "Không thể tạo thanh toán");
    } finally {
      setPayLoading(false);
    }
  };

  const BANK_INFO = {
    bank: "Vietcombank",
    branch: "Chi nhánh Hà Nội",
    account: "1234567890",
    owner: "KTX TRƯỜNG ĐẠI HỌC THUỶ LỢI",
  };

  useEffect(() => {
    getStudentContracts()
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setContracts(list);
        const active = list.find(c => c.status === "Active") || list[0];
        if (active) setSelected(active);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center gap-2 py-20 text-rose-500">
      <AlertCircle size={36} /><p className="font-semibold">{error}</p>
    </div>
  );

  if (contracts.length === 0) return (
    <div className="flex flex-col items-center gap-3 py-24 text-slate-400">
      <FileText size={48} className="text-slate-200" strokeWidth={1.5} />
      <p className="font-bold text-slate-600">Chưa có hợp đồng nào</p>
      <p className="text-sm text-slate-400">Hợp đồng sẽ được tạo sau khi hồ sơ đăng ký được duyệt</p>
    </div>
  );

  const sorted = [...contracts].sort((a, b) => {
    const order = { Active: 0, Pending: 1, Expired: 2, Terminated: 3 };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  });

  const c = selected || sorted[0];
  const cfg = STATUS_CFG[c.status] || STATUS_CFG.Expired;
  const StatusIcon = cfg.icon;

  return (
    <div className="space-y-5">

      {/* ── Selector nếu có nhiều hợp đồng ── */}
      {sorted.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {sorted.map(ct => {
            const scfg = STATUS_CFG[ct.status] || STATUS_CFG.Expired;
            return (
              <button key={ct.id} onClick={() => setSelected(ct)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  selected?.id === ct.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}>
                {ct.contract_number || "Hợp đồng"} · <span className={selected?.id === ct.id ? "text-blue-200" : ""}>{scfg.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Hero banner hợp đồng ── */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 flex items-center gap-6 text-white shadow-lg">
        <div className="p-4 bg-white/10 rounded-2xl shrink-0">
          <FileText size={28} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Hợp đồng nội trú KTX</p>
          <h2 className="text-xl font-black truncate">{c.contract_number || "—"}</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {c.room_number ? getRoomLabel(c.building, c.room_number) : "Chưa gán phòng"}
            {c.start_date && ` · ${fmtDate(c.start_date)} → ${fmtDate(c.end_date)}`}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${cfg.cls}`}>
          <StatusIcon size={12} /> {cfg.label}
        </span>
        <button
          onClick={() => setShowPrint(true)}
          title="Xem & tải PDF hợp đồng"
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl transition-all border border-white/20"
        >
          <Printer size={14} /> Xuất PDF
        </button>
      </div>

      {/* ── Print view ── */}
      {showPrint && (
        <ContractPrintView contract={c} onClose={() => setShowPrint(false)} />
      )}

      {/* ── Thanh tiến trình (chỉ khi Active) ── */}
      {c.status === "Active" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <ContractProgress startDate={c.start_date} endDate={c.end_date} />
        </div>
      )}

      {/* ── 2 card ngang ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* Card thông tin hợp đồng */}
        <Section title="Thông tin hợp đồng" icon={FileText} className="h-full">
          <InfoRow icon={Hash}       label="Số hợp đồng"        value={c.contract_number} accent mono />
          <InfoRow icon={Calendar}   label="Ngày ký"             value={fmtDate(c.signed_at)} />
          <InfoRow icon={Calendar}   label="Ngày bắt đầu"        value={fmtDate(c.start_date)} />
          <InfoRow icon={Calendar}   label="Ngày kết thúc"       value={fmtDate(c.end_date)} />
          <InfoRow icon={CreditCard} label="Phí nội trú / tháng" value={fmtMoney(c.rent_price)} accent />
          <InfoRow icon={CreditCard} label="Tiền cọc"            value={fmtMoney(c.deposit_amount)} />
          <div className="flex items-center gap-3 py-3 border-b border-slate-100">
            <div className="p-2 bg-slate-50 rounded-lg shrink-0"><Shield size={14} className="text-slate-400" /></div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Đã đóng cọc</p>
              <p className={`text-sm font-semibold mt-0.5 ${c.deposit_paid ? "text-emerald-600" : "text-rose-500"}`}>
                {c.deposit_paid ? "✓ Đã đóng" : "✗ Chưa đóng"}
              </p>
            </div>
            {!c.deposit_paid && (
              <button
                onClick={() => setShowPayModal(true)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-200">
                <CreditCard size={12} /> Thanh toán
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="p-2 bg-slate-50 rounded-lg shrink-0"><FileText size={14} className="text-slate-400" /></div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Đã nhận bản cứng</p>
              <p className={`text-sm font-semibold mt-0.5 ${c.hard_copy_received ? "text-emerald-600" : "text-slate-400"}`}>
                {c.hard_copy_received ? "✓ Đã nhận" : "Chưa nhận"}
              </p>
            </div>
          </div>
          {c.terms_conditions && (
            <div className="py-3 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Điều khoản</p>
              <p className="text-xs text-slate-600 leading-relaxed">{c.terms_conditions}</p>
            </div>
          )}
        </Section>

        {/* Card thông tin phòng ở */}
        <Section title="Thông tin phòng ở" icon={Home} className="h-full">
          {c.room_number ? (
            <>
              <InfoRow icon={Home}     label="Số phòng"   value={getRoomLabel(c.building, c.room_number)} accent />
              <InfoRow icon={Building} label="Tòa nhà"    value={getBuildingLabel(c.building)} />
              <InfoRow icon={Layers}   label="Tầng"       value={`Tầng ${c.floor}`} />
              <InfoRow icon={Users}    label="Số người ở" value={`${c.current_occupancy}/${c.capacity} người`} />
              <InfoRow icon={Ruler}    label="Diện tích"  value={c.area ? `${c.area} m²` : null} />
              <div className="py-3 border-b border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Phí dịch vụ hàng tháng</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Tiền phòng/người", fmtMoney(c.rent_price)],
                    ["Internet",         fmtMoney(c.internet_fee)],
                    ["Rác",              fmtMoney(c.garbage_fee)],
                    ["Gửi xe",           fmtMoney(c.parking_fee)],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-slate-50 rounded-xl p-2.5">
                      <p className="text-[10px] text-slate-400 font-semibold">{l}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <InfoRow icon={Calendar} label="Kiểm tra gần nhất" value={fmtDate(c.last_inspection_date)} />
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Home size={32} className="text-slate-200" />
              <p className="text-sm font-medium">Chưa được gán phòng</p>
              <p className="text-xs text-slate-300">Ban quản lý sẽ sắp xếp phòng phù hợp</p>
            </div>
          )}
          {c.termination_reason && (
            <div className="py-3 border-t border-slate-100">
              <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                <p className="text-[10px] text-rose-500 uppercase font-black tracking-widest mb-2">Lý do chấm dứt</p>
                <p className="text-xs text-rose-700 leading-relaxed">{c.termination_reason}</p>
              </div>
            </div>
          )}
        </Section>
      </div>
      {/* Modal thanh toán tiền cọc */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-5 text-white">
              <button onClick={() => setShowPayModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-xl transition-colors">
                <X size={16} />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-white/20 rounded-xl"><CreditCard size={18} /></div>
                <div>
                  <p className="font-black text-base">Thanh toán tiền cọc</p>
                  <p className="text-blue-200 text-xs">{c.contract_number}</p>
                </div>
              </div>
              <div className="bg-white/15 rounded-2xl px-4 py-3 flex items-center justify-between">
                <span className="text-blue-100 text-sm font-semibold">Số tiền cọc</span>
                <span className="text-white font-black text-xl">{fmtMoney(c.deposit_amount)}</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* QR VietQR động */}
              <div className="flex flex-col items-center gap-2 py-3">
                <div className="w-40 h-40 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white flex items-center justify-center">
                  <img
                    src={`https://img.vietqr.io/image/VCB-1020914134-compact2.png?amount=${Math.round(c.deposit_amount || 0)}&addInfo=${encodeURIComponent(`COC ${c.contract_number || ""}`)}&accountName=${encodeURIComponent("KTX Truong DH Thuy Loi")}`}
                    alt="QR VietQR"
                    className="w-full h-full object-contain"
                    onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                  />
                  <div style={{ display: "none" }} className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-300">
                    <QrCode size={36} />
                    <p className="text-[10px] font-semibold">Không tải được QR</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">Quét mã để chuyển khoản nhanh</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">hoặc chuyển khoản thủ công</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Thông tin ngân hàng */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                {[
                  { label: "Ngân hàng",     value: BANK_INFO.bank,    key: "bank",    icon: Building2 },
                  { label: "Chi nhánh",     value: BANK_INFO.branch,  key: "branch",  icon: Building2 },
                  { label: "Số tài khoản",  value: BANK_INFO.account, key: "account", icon: CreditCard },
                  { label: "Chủ tài khoản", value: BANK_INFO.owner,   key: "owner",   icon: Users },
                ].map(({ label, value, key, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon size={13} className="text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-500 shrink-0">{label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-bold text-slate-800 truncate">{value}</span>
                      <button onClick={() => handleCopy(value, key)}
                        className="p-1 hover:bg-slate-200 rounded-lg transition-colors shrink-0">
                        {copied === key
                          ? <BadgeCheck size={13} className="text-emerald-500" />
                          : <Copy size={13} className="text-slate-400" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Nội dung chuyển khoản */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Nội dung chuyển khoản</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-blue-800 font-mono">COC {c.contract_number}</p>
                  <button onClick={() => handleCopy(`COC ${c.contract_number}`, "content")}
                    className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors shrink-0">
                    {copied === "content"
                      ? <BadgeCheck size={14} className="text-emerald-500" />
                      : <Copy size={14} className="text-blue-400" />}
                  </button>
                </div>
                <p className="text-[11px] text-blue-500 mt-1.5 flex items-center gap-1">
                  <Info size={10} /> Vui lòng ghi đúng nội dung để hệ thống xác nhận tự động.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleVNPayDeposit}
                  disabled={payLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-200">
                  {payLoading ? "Đang xử lý..." : <><ExternalLink size={14} /> Thanh toán qua VNPay</>}
                </button>
                <button onClick={() => setShowPayModal(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-sm transition-all">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentContract;

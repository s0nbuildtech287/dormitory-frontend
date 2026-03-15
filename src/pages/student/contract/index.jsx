import { useEffect, useState } from "react";
import { FileText, Home, Calendar, CreditCard, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { getStudentContracts } from "../../../api/apiStudent.js";

const fmt = (v) => (v != null && v !== "" ? v : "—");
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : "—");
const fmtMoney = (v) => (v != null ? `${Number(v).toLocaleString("vi-VN")} đ` : "—");

const STATUS_CFG = {
  Active:     { cls: "bg-emerald-100 text-emerald-700", label: "Đang hiệu lực" },
  Pending:    { cls: "bg-amber-100 text-amber-700",     label: "Chờ gán phòng" },
  Expired:    { cls: "bg-slate-100 text-slate-500",     label: "Hết hạn" },
  Terminated: { cls: "bg-rose-100 text-rose-700",       label: "Đã chấm dứt" },
};

const Row = ({ label, value, accent }) => (
  <div className="py-3.5 grid grid-cols-2 border-b border-slate-50 last:border-0">
    <span className="text-slate-500 font-medium text-sm">{label}</span>
    <span className={`font-bold text-sm text-right md:text-left ${accent ? "text-blue-700" : "text-slate-900"}`}>{fmt(value)}</span>
  </div>
);

const StudentContract = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStudentContracts()
      .then((res) => setContracts(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-rose-500">
        <AlertCircle size={36} />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
        <FileText size={40} className="text-slate-200" />
        <p className="font-semibold">Chưa có hợp đồng nào</p>
      </div>
    );
  }

  // Ưu tiên hiển thị hợp đồng Active trước
  const sorted = [...contracts].sort((a, b) => {
    const order = { Active: 0, Pending: 1, Expired: 2, Terminated: 3 };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {sorted.map((c) => {
        const cfg = STATUS_CFG[c.status] || { cls: "bg-slate-100 text-slate-600", label: c.status };
        return (
          <div key={c.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <FileText size={20} className="text-blue-600" />
                Hợp đồng nội trú KTX
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>
            </div>

            {/* Thông tin hợp đồng */}
            <div className="divide-y divide-slate-50">
              <Row label="Số hợp đồng"       value={c.contract_number} accent />
              <Row label="Phòng lưu trú"
                   value={c.room_number ? `${c.building}-${c.room_number}` : "Chưa gán phòng"}
                   accent={!!c.room_number} />
              <Row label="Ngày bắt đầu"       value={fmtDate(c.start_date)} />
              <Row label="Ngày kết thúc"       value={fmtDate(c.end_date)} />
              <Row label="Ngày ký"             value={fmtDate(c.signed_at)} />
              <Row label="Phí nội trú / tháng" value={fmtMoney(c.rent_price)} accent />
              <Row label="Tiền cọc"            value={fmtMoney(c.deposit_amount)} />
              <Row label="Đã đóng cọc"         value={c.deposit_paid ? "Đã đóng" : "Chưa đóng"} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentContract;

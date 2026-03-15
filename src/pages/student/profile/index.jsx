import { useEffect, useState } from "react";
import {
  User, Mail, Phone, MapPin, BookOpen, GraduationCap,
  Calendar, CreditCard, Home, Star, Shield, FileCheck,
  Hash, Users, Ruler, Award, ChevronRight
} from "lucide-react";
import { getRegistrations } from "../../../api/apiRegistration.js";
import { getContracts } from "../../../api/apiContract.js";

const fmt = (v) => v || "—";
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("vi-VN") : "—";
const fmtGPA = (v) => v != null ? Number(v).toFixed(2) : "—";

const InfoRow = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="p-1.5 bg-slate-100 rounded-lg shrink-0 mt-0.5">
      <Icon size={13} className="text-slate-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm font-semibold truncate ${highlight ? "text-blue-700" : "text-slate-800"}`}>{fmt(value)}</p>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</p>
    </div>
    <div className="px-5">{children}</div>
  </div>
);

const ScoreBadge = ({ score }) => {
  const s = Number(score ?? 100);
  const color = s >= 80 ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : s >= 60 ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-rose-700 bg-rose-50 border-rose-200";
  const label = s >= 80 ? "Tốt" : s >= 60 ? "Khá" : "Yếu";
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${color}`}>
      <Shield size={12} />
      {s} điểm — {label}
    </div>
  );
};

const StudentProfile = ({ user }) => {
  const [reg, setReg] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [regRes, contractRes] = await Promise.all([
          getRegistrations({ search: user?.email }),
          getContracts({ status: "Active" }),
        ]);
        const regs = Array.isArray(regRes?.data) ? regRes.data : [];
        const myReg = regs.find(r => r.student_email === user?.email) || regs[0] || null;
        setReg(myReg);

        const contracts = Array.isArray(contractRes?.data) ? contractRes.data : [];
        const myContract = contracts.find(c => c.user_id === user?.id || c.student_email === user?.email) || null;
        setContract(myContract);
      } catch {
        // fallback to user object only
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.email, user?.id]);

  const name = reg?.student_name || user?.full_name || user?.name || "—";
  const studentId = reg?.student_id || contract?.snapshot_student_id || contract?.rf_student_id || "—";
  const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff&size=128`;

  const statusCfg = {
    "Chấp nhận": "bg-emerald-100 text-emerald-700",
    "Từ chối":   "bg-rose-100 text-rose-700",
    "Chờ duyệt": "bg-amber-100 text-amber-700",
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[1,2,3,4,5].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

      {/* ── Cột trái: Avatar + tóm tắt ── */}
      <div className="flex flex-col gap-5">

        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center gap-4">
          <div className="relative">
            <img src={avatar} alt={name}
              className="w-24 h-24 rounded-2xl border-4 border-slate-100 shadow object-cover" />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 leading-tight">{name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{studentId}</p>
          </div>
          {reg?.status && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusCfg[reg.status] || "bg-slate-100 text-slate-600"}`}>
              Hồ sơ: {reg.status}
            </span>
          )}
          <ScoreBadge score={user?.conduct_score} />
        </div>

        {/* Phòng ở */}
        <Section title="Phòng ở hiện tại">
          {contract ? (
            <>
              <InfoRow icon={Home} label="Phòng" value={contract.room_number ? `${contract.building || ""}-${contract.room_number}` : null} highlight />
              <InfoRow icon={FileCheck} label="Số hợp đồng" value={contract.contract_number} />
              <InfoRow icon={Calendar} label="Bắt đầu" value={fmtDate(contract.start_date)} />
              <InfoRow icon={Calendar} label="Kết thúc" value={fmtDate(contract.end_date)} />
              <InfoRow icon={CreditCard} label="Tiền phòng" value={contract.rent_price ? `${Number(contract.rent_price).toLocaleString("vi-VN")} đ/tháng` : null} />
            </>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">Chưa có hợp đồng đang hoạt động</div>
          )}
        </Section>

      </div>

      {/* ── Cột phải (2/3): Chi tiết đầy đủ ── */}
      <div className="lg:col-span-2 flex flex-col gap-5">

        {/* Thông tin cá nhân */}
        <Section title="Thông tin cá nhân">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <InfoRow icon={User}     label="Họ và tên"       value={name} />
            <InfoRow icon={Hash}     label="Mã sinh viên"    value={studentId} highlight />
            <InfoRow icon={Mail}     label="Email"           value={reg?.student_email || user?.email} />
            <InfoRow icon={Phone}    label="Số điện thoại"   value={reg?.phone_number || contract?.snapshot_phone} />
            <InfoRow icon={Users}    label="Giới tính"       value={reg?.gender || contract?.snapshot_gender} />
            <InfoRow icon={Calendar} label="Ngày sinh"       value={fmtDate(reg?.dob)} />
            <InfoRow icon={CreditCard} label="CCCD"          value={reg?.cccd || contract?.snapshot_cccd} />
            <InfoRow icon={MapPin}   label="Địa chỉ"         value={reg?.address} />
          </div>
        </Section>

        {/* Thông tin học tập */}
        <Section title="Thông tin học tập">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <InfoRow icon={BookOpen}      label="Khoa"         value={reg?.faculty || contract?.snapshot_faculty} />
            <InfoRow icon={GraduationCap} label="Chuyên ngành" value={reg?.major} />
            <InfoRow icon={Hash}          label="Lớp"          value={reg?.class} />
            <InfoRow icon={Calendar}      label="Năm học"      value={reg?.year ? `Năm ${reg.year}` : (contract?.snapshot_year ? `Năm ${contract.snapshot_year}` : null)} />
            <InfoRow icon={Star}          label="GPA"          value={fmtGPA(reg?.gpa)} highlight />
            <InfoRow icon={Ruler}         label="Khoảng cách nhà-trường" value={reg?.distance ? `${reg.distance} km` : null} />
          </div>
        </Section>

        {/* Hồ sơ đăng ký */}
        {reg && (
          <Section title="Hồ sơ đăng ký KTX">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <InfoRow icon={FileCheck} label="Ngày nộp hồ sơ" value={fmtDate(reg.created_at)} />
              <InfoRow icon={Award}     label="Điểm AI"         value={reg.ai_score != null ? `${reg.ai_score} điểm` : null} highlight />
              <InfoRow icon={ChevronRight} label="Gợi ý AI"     value={reg.ai_suggestion} />
              <InfoRow icon={FileCheck} label="Ngày duyệt"      value={fmtDate(reg.reviewed_at)} />
            </div>
            {reg.priority_reasons && (
              <div className="py-3 border-b border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Lý do ưu tiên</p>
                <p className="text-sm text-slate-700 leading-relaxed">{reg.priority_reasons}</p>
              </div>
            )}
            {reg.note && (
              <div className="py-3">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Ghi chú từ ban quản lý</p>
                <p className="text-sm text-slate-600 leading-relaxed italic">{reg.note}</p>
              </div>
            )}
          </Section>
        )}

      </div>
    </div>
  );
};

export default StudentProfile;
